type SteamApiKey = {
  label: string;
  value: string;
};

type ResolveVanityUrlApiResponse = {
  response?: {
    success?: number;
    steamid?: string;
    message?: string;
  };
};

const STEAM_API_KEYS: SteamApiKey[] = [
  { label: "STEAM_API_KEY_1", value: process.env.STEAM_API_KEY_1 || "" },
  { label: "STEAM_API_KEY_2", value: process.env.STEAM_API_KEY_2 || "" },
  { label: "STEAM_API_KEY_3", value: process.env.STEAM_API_KEY_3 || "" },
].filter((item) => item.value.trim() !== "");

const STEAM_ID64_REGEX = /^\d{17}$/;
const REQUEST_TIMEOUT_MS = 10_000;

export function isValidSteamId64(value: unknown): value is string {
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

function normalizeSteamInput(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

function extractSteamId64FromProfilesUrl(input: string): string | null {
  const match = input.match(
    /^https?:\/\/steamcommunity\.com\/profiles\/(\d{17})(?:\/)?(?:\?.*)?$/i,
  );

  return match?.[1] ?? null;
}

function extractVanityFromIdUrl(input: string): string | null {
  const match = input.match(
    /^https?:\/\/steamcommunity\.com\/id\/([^/?#]+)(?:\/)?(?:\?.*)?$/i,
  );

  return match?.[1] ?? null;
}

function extractVanityCandidate(input: unknown): string | null {
  if (typeof input !== "string") return null;

  const normalizedInput = input.trim();

  if (!normalizedInput) return null;
  if (isValidSteamId64(normalizedInput)) return null;
  if (/steamcommunity\.com/i.test(normalizedInput)) return null;
  if (!/^[a-zA-Z0-9_-]{2,100}$/.test(normalizedInput)) return null;

  return normalizedInput;
}

async function resolveVanityToSteamId64(vanity: string): Promise<string> {
  const data = await fetchWithSteamApiKeys<ResolveVanityUrlApiResponse>(
    (apiKey) => {
      const url = new URL(
        "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/",
      );

      url.searchParams.set("key", apiKey);
      url.searchParams.set("vanityurl", vanity);
      url.searchParams.set("url_type", "1");

      return url.toString();
    },
  );

  const steamId64 = data.response?.steamid;
  const success = data.response?.success;

  if (success !== 1 || !steamId64 || !isValidSteamId64(steamId64)) {
    throw new Error("Não foi possível resolver a URL personalizada da Steam.");
  }

  return steamId64;
}

export async function resolveSteamId64FromInput(
  input: unknown,
): Promise<string> {
  const normalized = normalizeSteamInput(input);

  if (!normalized) {
    throw new Error(
      "Informe um SteamID64, vanity name ou URL do perfil Steam.",
    );
  }

  if (isValidSteamId64(normalized)) {
    return normalized;
  }

  const steamIdFromProfilesUrl = extractSteamId64FromProfilesUrl(normalized);
  if (steamIdFromProfilesUrl) {
    return steamIdFromProfilesUrl;
  }

  const vanityFromUrl = extractVanityFromIdUrl(normalized);
  if (vanityFromUrl) {
    return await resolveVanityToSteamId64(vanityFromUrl);
  }

  const vanityCandidate = extractVanityCandidate(normalized);
  if (vanityCandidate) {
    return await resolveVanityToSteamId64(vanityCandidate);
  }

  throw new Error(
    "Entrada inválida. Envie um SteamID64, uma URL /profiles/, uma URL /id/ ou um vanity name.",
  );
}
