CREATE TABLE "steam_users_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"steam_id_64" varchar(17) NOT NULL,
	"personaname" text,
	"avatarfull" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "steam_users_cache_steam_id_64_uidx" ON "steam_users_cache" USING btree ("steam_id_64");--> statement-breakpoint
CREATE INDEX "steam_users_cache_personaname_idx" ON "steam_users_cache" USING btree ("personaname");