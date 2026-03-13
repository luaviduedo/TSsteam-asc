import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const steamUsersCache = pgTable(
  "steam_users_cache",
  {
    id: serial("id").primaryKey(),
    steamId64: varchar("steam_id_64", { length: 17 }).notNull(),
    personaname: text("personaname"),
    avatarfull: text("avatarfull"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    steamId64Unique: uniqueIndex("steam_users_cache_steam_id_64_uidx").on(
      table.steamId64,
    ),
    personanameIdx: index("steam_users_cache_personaname_idx").on(
      table.personaname,
    ),
  }),
);

export const steamGamesCache = pgTable(
  "steam_games_cache",
  {
    id: serial("id").primaryKey(),
    steamId64: varchar("steam_id_64", { length: 17 }).notNull(),
    totalGamesFound: integer("total_games_found").notNull().default(0),
    totalGamesProcessed: integer("total_games_processed").notNull().default(0),
    message: text("message"),
    source: text("source").notNull().default("live"),
    isStale: boolean("is_stale").notNull().default(false),
    cachedAt: timestamp("cached_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    steamId64Unique: uniqueIndex("steam_games_cache_steam_id_64_uidx").on(
      table.steamId64,
    ),
    expiresAtIdx: index("steam_games_cache_expires_at_idx").on(table.expiresAt),
  }),
);

export const steamGamesCacheItems = pgTable(
  "steam_games_cache_items",
  {
    id: serial("id").primaryKey(),
    cacheId: integer("cache_id")
      .notNull()
      .references(() => steamGamesCache.id, { onDelete: "cascade" }),
    steamId64: varchar("steam_id_64", { length: 17 }).notNull(),
    appid: integer("appid").notNull(),
    name: text("name").notNull(),
    playtimeForever: integer("playtime_forever").notNull().default(0),
    hardestAchievementPercent: text("hardest_achievement_percent"),
    playerUnlockedAchievements: integer("player_unlocked_achievements")
      .notNull()
      .default(0),
    totalGameAchievements: integer("total_game_achievements")
      .notNull()
      .default(0),
    completionPercentage: text("completion_percentage"),
    completionDifficultyRank: integer("completion_difficulty_rank"),
    error: text("error"),
    raw: jsonb("raw"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    steamId64Idx: index("steam_games_cache_items_steam_id_64_idx").on(
      table.steamId64,
    ),
    cacheIdIdx: index("steam_games_cache_items_cache_id_idx").on(table.cacheId),
    cacheGameUnique: uniqueIndex(
      "steam_games_cache_items_cache_id_appid_uidx",
    ).on(table.cacheId, table.appid),
  }),
);

export type SteamGamesCache = typeof steamGamesCache.$inferSelect;
export type NewSteamGamesCache = typeof steamGamesCache.$inferInsert;

export type SteamGamesCacheItem = typeof steamGamesCacheItems.$inferSelect;
export type NewSteamGamesCacheItem = typeof steamGamesCacheItems.$inferInsert;
