import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import db from "@/drizzle/db";
import {
  getValidSteamGamesCache,
  saveSteamGamesCache,
  withLiveMeta,
  type SteamGamesResponse,
} from "@/lib/steam-games-cache";
import { resolveSteamId64FromInput } from "@/lib/steam-resolver";
import { steamUsersCache } from "@/drizzle/schema";
import {
  AppError,
  CachePersistenceError,
  SteamApiError,
  SteamProfilePrivateError,
  ValidationError,
} from "@/lib/errors";
import { failure, success } from "@/lib/http";

type SteamApiKey = {
  label: string;
  value: string;
};

type OwnedGame = {
  appid: number;
  name?: string;
  playtime_forever?: number;
};

type OwnedGamesApiResponse = {
  response?: {
    game_count?: number;
    games?: OwnedGame[];
  };
};

type GlobalAchievement = {
  name: string;
  percent: number;
};

type GlobalAchievementApiResponse = {
  achievementpercentages?: {
    achievements?: GlobalAchievement[];
  };
};

type PlayerAchievement = {
  apiname: string;
  achieved: number;
  unlocktime?: number;
};

type PlayerAchievementsApiResponse = {
  playerstats?: {
    steamID?: string;
    gameName?: string;
    achievements?: PlayerAchievement[];
    success?: boolean;
    error?: string;
  };
};

type PlayerSummary = {
  steamid: string;
  personaname?: string;
  avatarfull?: string;
};

type PlayerSummariesApiResponse = {
  response?: {
    players?: PlayerSummary[];
  };
};

type PlayerAchievementsResult = {
  achievements: PlayerAchievement[];
  isPrivateProfile: boolean;
};

type SteamGameResponseItem = {
  appid: number;
  name: string;
  playtime_forever: number;
  hardest_achievement_percent: number | null;
  player_unlocked_achievements: number;
  total_game_achievements: number;
  completion_percentage: number | null;
  completion_difficulty_rank: number | null;
  error: string | null;
};

type SerializedAppError = {
  code: string;
  message: string;
  details: unknown | null;
};

const STEAM_API_KEYS: SteamApiKey[] = [
  { label: "STEAM_API_KEY_1", value: process.env.STEAM_API_KEY_1 || "" },
  { label: "STEAM_API_KEY_2", value: process.env.STEAM_API_KEY_2 || "" },
  { label: "STEAM_API_KEY_3", value: process.env.STEAM_API_KEY_3 || "" },
].filter((item) => item.value.trim() !== "");

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_CONCURRENCY = 5;

function parseForceRefresh(value: unknown): boolean {
  return value === true;
}

function serializeAppErrors(errors: AppError[]): SerializedAppError[] {
  const serialized: SerializedAppError[] = [];

  for (const currentError of errors) {
    serialized.push({
      code: currentError.code,
      message: currentError.message,
      details: currentError.details ?? null,
    });
  }

  return serialized;
}

function areAllPrivateProfileErrors(errors: AppError[]): boolean {
  if (errors.length === 0) {
    return false;
  }

  for (const currentError of errors) {
    if (!(currentError instanceof SteamProfilePrivateError)) {
      return false;
    }
  }

  return true;
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

      if (
        response.status === 403 &&
        responseText.includes("Profile is not public")
      ) {
        throw new SteamProfilePrivateError(
          "O perfil ou os jogos da Steam não estão públicos.",
        );
      }

      throw new SteamApiError(
        `Falha ao consultar Steam API: HTTP ${response.status} - ${response.statusText}`,
        responseText.slice(0, 300),
      );
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new SteamApiError(
        "Tempo limite excedido ao consultar a Steam API.",
      );
    }

    throw new SteamApiError(
      "Erro inesperado ao consultar a Steam API.",
      error instanceof Error ? error.message : error,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchWithSteamApiKeys<T>(
  buildUrl: (apiKey: string) => string,
): Promise<T> {
  if (STEAM_API_KEYS.length === 0) {
    throw new ValidationError("Nenhuma chave da Steam API foi configurada.");
  }

  const collectedErrors: AppError[] = [];

  for (const apiKey of STEAM_API_KEYS) {
    try {
      return await fetchJsonWithTimeout<T>(buildUrl(apiKey.value));
    } catch (error: unknown) {
      if (error instanceof AppError) {
        collectedErrors.push(error);
      } else {
        collectedErrors.push(
          new SteamApiError(
            "Erro desconhecido ao consultar Steam API.",
            error instanceof Error ? error.message : error,
          ),
        );
      }
    }
  }

  if (areAllPrivateProfileErrors(collectedErrors)) {
    throw new SteamProfilePrivateError(
      "O perfil ou os jogos da Steam não estão públicos.",
    );
  }

  const serializedErrors = serializeAppErrors(collectedErrors);

  throw new SteamApiError(
    "Falha ao consumir Steam API com todas as chaves.",
    serializedErrors,
  );
}

async function getSteamProfile(
  steamId64: string,
): Promise<PlayerSummary | null> {
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

  return data.response?.players?.[0] ?? null;
}

async function upsertSteamUserProfile(steamId64: string): Promise<void> {
  const profile = await getSteamProfile(steamId64);

  if (!profile) {
    return;
  }

  const existingUser = await db.query.steamUsersCache.findFirst({
    where: eq(steamUsersCache.steamId64, steamId64),
  });

  if (existingUser) {
    await db
      .update(steamUsersCache)
      .set({
        personaname: profile.personaname?.trim() || null,
        avatarfull: profile.avatarfull?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(steamUsersCache.steamId64, steamId64));

    return;
  }

  await db.insert(steamUsersCache).values({
    steamId64,
    personaname: profile.personaname?.trim() || null,
    avatarfull: profile.avatarfull?.trim() || null,
  });
}

async function trySaveSteamUserProfile(steamId64: string): Promise<void> {
  try {
    await upsertSteamUserProfile(steamId64);
  } catch (error: unknown) {
    console.error("Falha não bloqueante ao salvar perfil do usuário:", error);
  }
}

async function getOwnedGames(steamId64: string): Promise<OwnedGame[]> {
  const data = await fetchWithSteamApiKeys<OwnedGamesApiResponse>((apiKey) => {
    const url = new URL(
      "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/",
    );

    url.searchParams.set("key", apiKey);
    url.searchParams.set("steamid", steamId64);
    url.searchParams.set("include_appinfo", "true");
    url.searchParams.set("include_played_free_games", "true");
    url.searchParams.set("format", "json");

    return url.toString();
  });

  return data.response?.games ?? [];
}

async function getGlobalAchievements(
  appid: number,
): Promise<GlobalAchievement[]> {
  const url = new URL(
    "https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/",
  );

  url.searchParams.set("gameid", String(appid));

  const data = await fetchJsonWithTimeout<GlobalAchievementApiResponse>(
    url.toString(),
  );

  return data.achievementpercentages?.achievements ?? [];
}

async function getPlayerAchievements(
  steamId64: string,
  appid: number,
): Promise<PlayerAchievementsResult> {
  try {
    const data = await fetchWithSteamApiKeys<PlayerAchievementsApiResponse>(
      (apiKey) => {
        const url = new URL(
          "https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/",
        );

        url.searchParams.set("key", apiKey);
        url.searchParams.set("steamid", steamId64);
        url.searchParams.set("appid", String(appid));
        url.searchParams.set("format", "json");

        return url.toString();
      },
    );

    return {
      achievements: data.playerstats?.achievements ?? [],
      isPrivateProfile: false,
    };
  } catch (error: unknown) {
    if (error instanceof SteamProfilePrivateError) {
      return {
        achievements: [],
        isPrivateProfile: true,
      };
    }

    throw error;
  }
}

async function analyzeGame(
  game: OwnedGame,
  steamId64: string,
): Promise<SteamGameResponseItem | null> {
  try {
    const globalAchievements = await getGlobalAchievements(game.appid);

    const globalPercents = globalAchievements
      .map((achievement) => Number(achievement.percent))
      .filter((percent) => Number.isFinite(percent));

    if (!globalPercents.length || globalAchievements.length === 0) {
      return null;
    }

    const playerAchievementResult = await getPlayerAchievements(
      steamId64,
      game.appid,
    );

    const hardestAchievementPercent = Number(
      Math.min(...globalPercents).toFixed(2),
    );

    const totalGameAchievements = globalAchievements.length;

    const playerUnlockedAchievements =
      playerAchievementResult.achievements.filter(
        (achievement) => achievement.achieved === 1,
      ).length;

    const completionPercentage =
      totalGameAchievements > 0
        ? Number(
            (
              (playerUnlockedAchievements / totalGameAchievements) *
              100
            ).toFixed(2),
          )
        : null;

    return {
      appid: game.appid,
      name: game.name?.trim() || `App ${game.appid}`,
      playtime_forever: game.playtime_forever ?? 0,
      hardest_achievement_percent: hardestAchievementPercent,
      player_unlocked_achievements: playerUnlockedAchievements,
      total_game_achievements: totalGameAchievements,
      completion_percentage: completionPercentage,
      completion_difficulty_rank: null,
      error: playerAchievementResult.isPrivateProfile
        ? "Conquistas do jogador indisponíveis porque o perfil ou os jogos estão privados."
        : null,
    };
  } catch (error: unknown) {
    return {
      appid: game.appid,
      name: game.name?.trim() || `App ${game.appid}`,
      playtime_forever: game.playtime_forever ?? 0,
      hardest_achievement_percent: null,
      player_unlocked_achievements: 0,
      total_game_achievements: 0,
      completion_percentage: null,
      completion_difficulty_rank: null,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

async function mapWithConcurrencyLimit<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex]);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    runWorker(),
  );

  await Promise.all(workers);

  return results;
}

async function buildFreshSteamGamesResponse(
  steamId64: string,
): Promise<SteamGamesResponse> {
  const ownedGames = await getOwnedGames(steamId64);

  if (!ownedGames.length) {
    return {
      steam_id_64: steamId64,
      total_games_found: 0,
      total_games_processed: 0,
      games: [],
      message: "Nenhum jogo encontrado para esse usuário.",
    };
  }

  const processedGames = await mapWithConcurrencyLimit(
    ownedGames,
    MAX_CONCURRENCY,
    (game) => analyzeGame(game, steamId64),
  );

  const rankedGames = processedGames
    .filter(
      (game): game is SteamGameResponseItem =>
        game !== null &&
        game.hardest_achievement_percent !== null &&
        game.total_game_achievements > 0,
    )
    .sort((a, b) => {
      const aPercent = a.hardest_achievement_percent ?? -1;
      const bPercent = b.hardest_achievement_percent ?? -1;

      if (bPercent !== aPercent) {
        return bPercent - aPercent;
      }

      return a.total_game_achievements - b.total_game_achievements;
    })
    .map((game, index) => ({
      ...game,
      completion_difficulty_rank: index + 1,
    }));

  return {
    steam_id_64: steamId64,
    total_games_found: ownedGames.length,
    total_games_processed: rankedGames.length,
    games: rankedGames,
    message:
      "Jogos com dados de conquistas foram ordenados da maior para a menor porcentagem da conquista mais difícil. Jogos difíceis também são incluídos. (Se as conquistas do jogador aparecer '0' verifique se seus jogos não estão privados!)",
  };
}

async function processSteamGamesRequest(
  steamId64: string,
  forceRefresh: boolean,
) {
  await trySaveSteamUserProfile(steamId64);

  if (!forceRefresh) {
    const cachedResponse = await getValidSteamGamesCache(steamId64);

    if (cachedResponse) {
      return {
        ...cachedResponse,
        concurrency_limit: MAX_CONCURRENCY,
      };
    }
  }

  const freshResponse = await buildFreshSteamGamesResponse(steamId64);
  const responseWithMeta = withLiveMeta(freshResponse, forceRefresh);

  try {
    await saveSteamGamesCache(responseWithMeta);
  } catch (error: unknown) {
    throw new CachePersistenceError(
      "Falha ao salvar cache de jogos no banco de dados.",
      error instanceof Error ? error.message : error,
    );
  }

  await trySaveSteamUserProfile(steamId64);

  return {
    ...responseWithMeta,
    concurrency_limit: MAX_CONCURRENCY,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new ValidationError("Body inválido. Envie um JSON válido.");
    }

    const normalizedSteamId64 = await resolveSteamId64FromInput(
      body.req_steam_id_64,
    );
    const forceRefresh = parseForceRefresh(body.force_refresh);

    const result = await processSteamGamesRequest(
      normalizedSteamId64,
      forceRefresh,
    );

    return success(result, 200);
  } catch (error: unknown) {
    return failure(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const rawInput =
      request.nextUrl.searchParams.get("steam_id_64")?.trim() ??
      request.nextUrl.searchParams.get("input")?.trim() ??
      "";

    if (!rawInput) {
      throw new ValidationError(
        "Informe um SteamID64, vanity name ou URL do perfil Steam.",
      );
    }

    const normalizedSteamId64 = await resolveSteamId64FromInput(rawInput);
    const forceRefresh =
      request.nextUrl.searchParams.get("force_refresh") === "true";

    const result = await processSteamGamesRequest(
      normalizedSteamId64,
      forceRefresh,
    );

    return success(result, 200);
  } catch (error: unknown) {
    return failure(error);
  }
}
