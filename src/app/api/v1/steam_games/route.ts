import { NextRequest, NextResponse } from "next/server";

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

type SteamGameResponseItem = {
  appid: number;
  name: string;
  playtime_forever: number;
  hardest_achievement_percent: number | null;
  player_unlocked_achievements: number;
  total_game_achievements: number;
  completion_difficulty_rank: number | null;
  error: string | null;
};

const STEAM_API_KEYS: SteamApiKey[] = [
  { label: "STEAM_API_KEY_1", value: process.env.STEAM_API_KEY_1 || "" },
  { label: "STEAM_API_KEY_2", value: process.env.STEAM_API_KEY_2 || "" },
  { label: "STEAM_API_KEY_3", value: process.env.STEAM_API_KEY_3 || "" },
].filter((item) => item.value.trim() !== "");

const STEAM_ID64_REGEX = /^\d{17}$/;
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_CONCURRENCY = 5;

function isValidSteamId64(value: unknown): value is string {
  return typeof value === "string" && STEAM_ID64_REGEX.test(value.trim());
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
): Promise<PlayerAchievement[]> {
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

    return data.playerstats?.achievements ?? [];
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";

    const isPrivateProfileError =
      message.includes("HTTP 403") && message.includes("Profile is not public");

    if (isPrivateProfileError) {
      return [];
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

    let playerAchievements: PlayerAchievement[] = [];

    try {
      playerAchievements = await getPlayerAchievements(steamId64, game.appid);
    } catch {
      playerAchievements = [];
    }

    const hardestAchievementPercent = Number(
      Math.min(...globalPercents).toFixed(2),
    );

    const totalGameAchievements = globalAchievements.length;

    const playerUnlockedAchievements = playerAchievements.filter(
      (achievement) => achievement.achieved === 1,
    ).length;

    return {
      appid: game.appid,
      name: game.name?.trim() || `App ${game.appid}`,
      playtime_forever: game.playtime_forever ?? 0,
      hardest_achievement_percent: hardestAchievementPercent,
      player_unlocked_achievements: playerUnlockedAchievements,
      total_game_achievements: totalGameAchievements,
      completion_difficulty_rank: null,
      error: null,
    };
  } catch (error) {
    return {
      appid: game.appid,
      name: game.name?.trim() || `App ${game.appid}`,
      playtime_forever: game.playtime_forever ?? 0,
      hardest_achievement_percent: null,
      player_unlocked_achievements: 0,
      total_game_achievements: 0,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Body inválido. Envie um JSON válido." },
        { status: 400 },
      );
    }

    const steamId64 = body.req_steam_id_64;

    if (!isValidSteamId64(steamId64)) {
      return NextResponse.json(
        {
          error:
            "steamId64 inválido. Envie em req_steam_id_64 um SteamID64 com 17 dígitos.",
        },
        { status: 400 },
      );
    }

    const normalizedSteamId64 = steamId64.trim();
    const ownedGames = await getOwnedGames(normalizedSteamId64);

    if (!ownedGames.length) {
      return NextResponse.json(
        {
          steam_id_64: normalizedSteamId64,
          total_games_found: 0,
          total_games_processed: 0,
          concurrency_limit: MAX_CONCURRENCY,
          games: [],
          message: "Nenhum jogo encontrado para esse usuário.",
        },
        { status: 200 },
      );
    }

    const processedGames = await mapWithConcurrencyLimit(
      ownedGames,
      MAX_CONCURRENCY,
      (game) => analyzeGame(game, normalizedSteamId64),
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

    return NextResponse.json(
      {
        steam_id_64: normalizedSteamId64,
        total_games_found: ownedGames.length,
        total_games_processed: rankedGames.length,
        concurrency_limit: MAX_CONCURRENCY,
        games: rankedGames,
        message:
          "Jogos com dados de conquistas foram ordenados da maior para a menor porcentagem da conquista mais difícil. Jogos difíceis também são incluídos. (Se as conquistas do jogador aparecer '0' verifique se seus jogos não estão privados!)",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro interno ao buscar jogos da Steam.",
      },
      { status: 500 },
    );
  }
}
