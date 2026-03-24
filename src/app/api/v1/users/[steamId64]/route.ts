import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import db from "@/drizzle/db";
import {
  steamGamesCache,
  steamGamesCacheItems,
  steamUsersCache,
} from "@/drizzle/schema";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { failure, success } from "@/lib/http";

const STEAM_ID64_REGEX = /^\d{17}$/;

function isValidSteamId64(value: string) {
  return STEAM_ID64_REGEX.test(value.trim());
}

interface RouteContext {
  params: Promise<{
    steamId64: string;
  }>;
}

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const { steamId64 } = await context.params;

    if (!isValidSteamId64(steamId64)) {
      throw new ValidationError("SteamID64 inválido.");
    }

    const [cache] = await db
      .select()
      .from(steamGamesCache)
      .where(eq(steamGamesCache.steamId64, steamId64))
      .limit(1);

    if (!cache) {
      throw new NotFoundError("Usuário não encontrado no banco de dados.");
    }

    const [userProfile] = await db
      .select()
      .from(steamUsersCache)
      .where(eq(steamUsersCache.steamId64, steamId64))
      .limit(1);

    const games = await db
      .select()
      .from(steamGamesCacheItems)
      .where(eq(steamGamesCacheItems.cacheId, cache.id))
      .orderBy(steamGamesCacheItems.completionDifficultyRank);

    return success(
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
      200,
    );
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { steamId64 } = await context.params;

    if (!isValidSteamId64(steamId64)) {
      throw new ValidationError("SteamID64 inválido.");
    }

    const result = await db.transaction(async (tx) => {
      const deletedUsers = await tx
        .delete(steamUsersCache)
        .where(eq(steamUsersCache.steamId64, steamId64))
        .returning({
          steamId64: steamUsersCache.steamId64,
        });

      const deletedCaches = await tx
        .delete(steamGamesCache)
        .where(eq(steamGamesCache.steamId64, steamId64))
        .returning({
          steamId64: steamGamesCache.steamId64,
        });

      return {
        deletedUsers,
        deletedCaches,
      };
    });

    const deletedAnything =
      result.deletedUsers.length > 0 || result.deletedCaches.length > 0;

    if (!deletedAnything) {
      throw new NotFoundError("Usuário não encontrado no banco.");
    }

    return success(
      {
        ok: true,
        message: "Usuário excluído com sucesso.",
        deletedSteamId64: steamId64,
      },
      200,
    );
  } catch (error) {
    return failure(error);
  }
}
