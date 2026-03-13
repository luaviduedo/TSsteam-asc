import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import db from "@/drizzle/db";
import {
  steamGamesCache,
  steamGamesCacheItems,
  steamUsersCache,
} from "@/drizzle/schema";

type SteamApiKey = {
  label: string;
  value: string;
};

type SteamPlayer = {
  personaname?: string;
  avatarfull?: string;
};

type PlayerSummariesApiResponse = {
  response?: {
    players?: SteamPlayer[];
  };
};

const STEAM_API_KEYS: SteamApiKey[] = [
  { label: "STEAM_API_KEY_1", value: process.env.STEAM_API_KEY_1 || "" },
  { label: "STEAM_API_KEY_2", value: process.env.STEAM_API_KEY_2 || "" },
  { label: "STEAM_API_KEY_3", value: process.env.STEAM_API_KEY_3 || "" },
].filter((item) => item.value.trim() !== "");

const STEAM_ID64_REGEX = /^\d{17}$/;
const REQUEST_TIMEOUT_MS = 10_000;

function isValidSteamId64(value: string) {
  return STEAM_ID64_REGEX.test(value.trim());
}

async function fetchJsonWithTimeout<T>(
  url: string,
  init?: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const responseText = await response.text().catch(() => "");
      throw new Error(
        `HTTP ${response.status} - ${response.statusText} - ${responseText.slice(0, 300)}`,
      );
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchWithSteamApiKeys<T>(
  buildUrl: (apiKey: string) => string,
): Promise<T> {
  if (STEAM_API_KEYS.length === 0) {
    throw new Error("Nenhuma chave da Steam API foi configurada.");
  }

  const errors: string[] = [];

  for (const apiKey of STEAM_API_KEYS) {
    try {
      return await fetchJsonWithTimeout<T>(buildUrl(apiKey.value));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      errors.push(`${apiKey.label}: ${message}`);
    }
  }

  throw new Error(
    `Falha ao consumir Steam API com todas as chaves. ${errors.join(" | ")}`,
  );
}

async function getOrCreateSteamUserProfile(steamId64: string) {
  const [cachedUser] = await db
    .select()
    .from(steamUsersCache)
    .where(eq(steamUsersCache.steamId64, steamId64))
    .limit(1);

  if (cachedUser) {
    return cachedUser;
  }

  const data = await fetchWithSteamApiKeys<PlayerSummariesApiResponse>(
    (apiKey) => {
      const url = new URL(
        "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/",
      );

      url.searchParams.set("key", apiKey);
      url.searchParams.set("steamids", steamId64);

      return url.toString();
    },
  );

  const player = data.response?.players?.[0];

  if (!player) {
    return null;
  }

  const [insertedUser] = await db
    .insert(steamUsersCache)
    .values({
      steamId64,
      personaname: player.personaname ?? null,
      avatarfull: player.avatarfull ?? null,
    })
    .onConflictDoUpdate({
      target: steamUsersCache.steamId64,
      set: {
        personaname: player.personaname ?? null,
        avatarfull: player.avatarfull ?? null,
        updatedAt: new Date(),
      },
    })
    .returning();

  return insertedUser;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ steamId64: string }> },
) {
  try {
    const { steamId64 } = await context.params;

    if (!isValidSteamId64(steamId64)) {
      return NextResponse.json(
        { error: "SteamID64 inválido." },
        { status: 400 },
      );
    }

    const [cache] = await db
      .select()
      .from(steamGamesCache)
      .where(eq(steamGamesCache.steamId64, steamId64))
      .limit(1);

    if (!cache) {
      return NextResponse.json(
        { error: "Usuário não encontrado no banco de dados." },
        { status: 404 },
      );
    }

    const userProfile = await getOrCreateSteamUserProfile(steamId64);

    const games = await db
      .select()
      .from(steamGamesCacheItems)
      .where(eq(steamGamesCacheItems.cacheId, cache.id))
      .orderBy(steamGamesCacheItems.completionDifficultyRank);

    return NextResponse.json(
      {
        profile: {
          steam_id_64: steamId64,
          personaname: userProfile?.personaname ?? null,
          avatarfull: userProfile?.avatarfull ?? null,
          total_games_found: cache.totalGamesFound,
          total_games_processed: cache.totalGamesProcessed,
          cached_at: cache.cachedAt,
          expires_at: cache.expiresAt,
          updated_at: cache.updatedAt,
          message: cache.message,
        },
        games: games.map((game) => ({
          appid: game.appid,
          name: game.name,
          playtime_forever: game.playtimeForever,
          hardest_achievement_percent:
            game.hardestAchievementPercent === null
              ? null
              : Number(game.hardestAchievementPercent),
          player_unlocked_achievements: game.playerUnlockedAchievements,
          total_game_achievements: game.totalGameAchievements,
          completion_percentage:
            game.completionPercentage === null
              ? null
              : Number(game.completionPercentage),
          completion_difficulty_rank: game.completionDifficultyRank,
          error: game.error,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao carregar perfil do usuário.",
      },
      { status: 500 },
    );
  }
}
