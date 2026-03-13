import { desc, ilike, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import db from "@/drizzle/db";
import {
  steamGamesCache,
  steamGamesCacheItems,
  steamUsersCache,
} from "@/drizzle/schema";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

    const users = await db
      .select({
        steam_id_64: steamGamesCache.steamId64,
        personaname: steamUsersCache.personaname,
        avatarfull: steamUsersCache.avatarfull,
        total_games_found: steamGamesCache.totalGamesFound,
        total_games_processed: steamGamesCache.totalGamesProcessed,
        cached_at: steamGamesCache.cachedAt,
        updated_at: steamGamesCache.updatedAt,
        total_cached_items: sql<number>`count(${steamGamesCacheItems.id})::int`,
      })
      .from(steamGamesCache)
      .leftJoin(
        steamUsersCache,
        sql`${steamUsersCache.steamId64} = ${steamGamesCache.steamId64}`,
      )
      .leftJoin(
        steamGamesCacheItems,
        sql`${steamGamesCacheItems.cacheId} = ${steamGamesCache.id}`,
      )
      .where(
        query
          ? or(
              ilike(steamGamesCache.steamId64, `%${query}%`),
              ilike(steamUsersCache.personaname, `%${query}%`),
            )
          : undefined,
      )
      .groupBy(
        steamGamesCache.id,
        steamGamesCache.steamId64,
        steamUsersCache.personaname,
        steamUsersCache.avatarfull,
        steamGamesCache.totalGamesFound,
        steamGamesCache.totalGamesProcessed,
        steamGamesCache.cachedAt,
        steamGamesCache.updatedAt,
      )
      .orderBy(desc(steamGamesCache.updatedAt));

    return NextResponse.json(
      {
        total: users.length,
        users,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao listar usuários.",
      },
      { status: 500 },
    );
  }
}
