import { and, eq, gt } from "drizzle-orm";
import db from "@/drizzle/db";
import { steamGamesCache, steamGamesCacheItems } from "@/drizzle/schema";

export type SteamGame = {
  appid: number;
  name: string;
  playtime_forever: number;
  hardest_achievement_percent: number | string | null;
  player_unlocked_achievements: number;
  total_game_achievements: number;
  completion_percentage: number | null;
  completion_difficulty_rank: number | null;
  error: string | null;
};

export type SteamGamesResponse = {
  steam_id_64: string;
  total_games_found: number;
  total_games_processed: number;
  games: SteamGame[];
  message?: string;
  error?: string;
  meta?: {
    source: "cache" | "live";
    cached_at?: string;
    expires_at?: string;
    force_refresh?: boolean;
  };
};

export const STEAM_GAMES_CACHE_TTL_HOURS = 6;

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export async function getValidSteamGamesCache(
  steamId64: string,
): Promise<SteamGamesResponse | null> {
  const now = new Date();

  const [cache] = await db
    .select()
    .from(steamGamesCache)
    .where(
      and(
        eq(steamGamesCache.steamId64, steamId64),
        gt(steamGamesCache.expiresAt, now),
      ),
    )
    .limit(1);

  if (!cache) return null;

  const items = await db
    .select()
    .from(steamGamesCacheItems)
    .where(eq(steamGamesCacheItems.cacheId, cache.id))
    .orderBy(steamGamesCacheItems.completionDifficultyRank);

  return {
    steam_id_64: cache.steamId64,
    total_games_found: cache.totalGamesFound,
    total_games_processed: cache.totalGamesProcessed,
    games: items.map((item) => ({
      appid: item.appid,
      name: item.name,
      playtime_forever: item.playtimeForever,
      hardest_achievement_percent: item.hardestAchievementPercent,
      player_unlocked_achievements: item.playerUnlockedAchievements,
      total_game_achievements: item.totalGameAchievements,
      completion_percentage:
        item.completionPercentage === null
          ? null
          : Number(item.completionPercentage),
      completion_difficulty_rank: item.completionDifficultyRank,
      error: item.error,
    })),
    message: cache.message ?? undefined,
    meta: {
      source: "cache",
      cached_at: cache.cachedAt.toISOString(),
      expires_at: cache.expiresAt.toISOString(),
    },
  };
}

export async function saveSteamGamesCache(
  response: SteamGamesResponse,
): Promise<void> {
  const now = new Date();
  const expiresAt = addHours(now, STEAM_GAMES_CACHE_TTL_HOURS);

  await db.transaction(async (tx) => {
    const [cacheRow] = await tx
      .insert(steamGamesCache)
      .values({
        steamId64: response.steam_id_64,
        totalGamesFound: response.total_games_found,
        totalGamesProcessed: response.total_games_processed,
        message: response.message ?? null,
        source: "live",
        isStale: false,
        cachedAt: now,
        expiresAt,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: steamGamesCache.steamId64,
        set: {
          totalGamesFound: response.total_games_found,
          totalGamesProcessed: response.total_games_processed,
          message: response.message ?? null,
          source: "live",
          isStale: false,
          cachedAt: now,
          expiresAt,
          updatedAt: now,
        },
      })
      .returning();

    await tx
      .delete(steamGamesCacheItems)
      .where(eq(steamGamesCacheItems.cacheId, cacheRow.id));

    if (response.games.length > 0) {
      await tx.insert(steamGamesCacheItems).values(
        response.games.map((game) => ({
          cacheId: cacheRow.id,
          steamId64: response.steam_id_64,
          appid: game.appid,
          name: game.name,
          playtimeForever: game.playtime_forever,
          hardestAchievementPercent:
            game.hardest_achievement_percent === null
              ? null
              : String(game.hardest_achievement_percent),
          playerUnlockedAchievements: game.player_unlocked_achievements,
          totalGameAchievements: game.total_game_achievements,
          completionPercentage:
            game.completion_percentage === null
              ? null
              : String(game.completion_percentage),
          completionDifficultyRank: game.completion_difficulty_rank,
          error: game.error,
          raw: game,
          updatedAt: now,
        })),
      );
    }
  });
}

export function withLiveMeta(
  response: SteamGamesResponse,
  forceRefresh: boolean,
): SteamGamesResponse {
  const now = new Date();
  const expiresAt = addHours(now, STEAM_GAMES_CACHE_TTL_HOURS);

  return {
    ...response,
    meta: {
      source: "live",
      cached_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      force_refresh: forceRefresh,
    },
  };
}
