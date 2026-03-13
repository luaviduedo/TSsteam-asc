import { NextRequest, NextResponse } from "next/server";
import { resolveSteamId64FromInput } from "@/lib/steam-resolver";
import db from "@/drizzle/db";
import { steamUsersCache } from "@/drizzle/schema";

type SteamApiKey = {
  label: string;
  value: string;
};

type SteamPlayer = {
  steamid?: string;
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

const REQUEST_TIMEOUT_MS = 10_000;

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Body inválido. Envie um JSON válido." },
        { status: 400 },
      );
    }

    const normalizedSteamId64 = await resolveSteamId64FromInput(
      body.req_steam_id_64,
    );

    const data = await fetchWithSteamApiKeys<PlayerSummariesApiResponse>(
      (apiKey) => {
        const url = new URL(
          "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/",
        );

        url.searchParams.set("key", apiKey);
        url.searchParams.set("steamids", normalizedSteamId64);

        return url.toString();
      },
    );

    const player = data.response?.players?.[0];

    if (!player?.personaname) {
      return NextResponse.json(
        { error: "Usuário Steam não encontrado." },
        { status: 404 },
      );
    }

    await db
      .insert(steamUsersCache)
      .values({
        steamId64: normalizedSteamId64,
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
      });

    return NextResponse.json(
      {
        STEAM: {
          steamid: normalizedSteamId64,
          personaname: player.personaname,
          avatarfull: player.avatarfull ?? "",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível buscar os dados da Steam.",
      },
      { status: 500 },
    );
  }
}
