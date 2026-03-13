CREATE TABLE "steam_games_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"steam_id_64" varchar(17) NOT NULL,
	"total_games_found" integer DEFAULT 0 NOT NULL,
	"total_games_processed" integer DEFAULT 0 NOT NULL,
	"message" text,
	"source" text DEFAULT 'live' NOT NULL,
	"is_stale" boolean DEFAULT false NOT NULL,
	"cached_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "steam_games_cache_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"cache_id" integer NOT NULL,
	"steam_id_64" varchar(17) NOT NULL,
	"appid" integer NOT NULL,
	"name" text NOT NULL,
	"playtime_forever" integer DEFAULT 0 NOT NULL,
	"hardest_achievement_percent" text,
	"player_unlocked_achievements" integer DEFAULT 0 NOT NULL,
	"total_game_achievements" integer DEFAULT 0 NOT NULL,
	"completion_percentage" text,
	"completion_difficulty_rank" integer,
	"error" text,
	"raw" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "steam_games_cache_items" ADD CONSTRAINT "steam_games_cache_items_cache_id_steam_games_cache_id_fk" FOREIGN KEY ("cache_id") REFERENCES "public"."steam_games_cache"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "steam_games_cache_steam_id_64_uidx" ON "steam_games_cache" USING btree ("steam_id_64");--> statement-breakpoint
CREATE INDEX "steam_games_cache_expires_at_idx" ON "steam_games_cache" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "steam_games_cache_items_steam_id_64_idx" ON "steam_games_cache_items" USING btree ("steam_id_64");--> statement-breakpoint
CREATE INDEX "steam_games_cache_items_cache_id_idx" ON "steam_games_cache_items" USING btree ("cache_id");--> statement-breakpoint
CREATE UNIQUE INDEX "steam_games_cache_items_cache_id_appid_uidx" ON "steam_games_cache_items" USING btree ("cache_id","appid");