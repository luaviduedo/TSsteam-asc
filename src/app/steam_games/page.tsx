"use client";

import { FormEvent, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  ChevronLeft,
  Gamepad2,
  Home as HomeIcon,
  RefreshCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";

type SteamGame = {
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

type SteamGamesResponse = {
  steam_id_64: string;
  total_games_found: number;
  total_games_processed: number;
  concurrency_limit?: number;
  games: SteamGame[];
  message?: string;
  error?: string;
  meta?: {
    source?: "cache" | "live";
    cached_at?: string;
    expires_at?: string;
    force_refresh?: boolean;
  };
};

function formatPlaytime(minutes: number) {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) return `${hours}h`;

  return `${hours}h ${remainingMinutes}min`;
}

function getDifficultyLabel(percent: number | string | null) {
  if (percent === null || percent === undefined) return "Sem dados";

  const numericPercent = Number(percent);

  if (Number.isNaN(numericPercent)) return "Sem dados";
  if (numericPercent >= 20) return "Muito fácil";
  if (numericPercent >= 10) return "Fácil";
  if (numericPercent >= 5) return "Médio";
  if (numericPercent >= 1) return "Difícil";

  return "Muito difícil";
}

function formatAchievementPercent(value: number | string | null) {
  if (value === null || value === undefined) return "Sem dados";

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) return "Sem dados";

  return `${numericValue.toFixed(2)}%`;
}

function getDifficultyStyles(percent: number | string | null) {
  const label = getDifficultyLabel(percent);

  switch (label) {
    case "Muito fácil":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
    case "Fácil":
      return "border-sky-400/20 bg-sky-400/10 text-sky-300";
    case "Médio":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";
    case "Difícil":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";
    case "Muito difícil":
      return "border-rose-400/20 bg-rose-400/10 text-rose-300";
    default:
      return "border-white/10 bg-white/5 text-white/65";
  }
}

function validateSteamInput(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return "Digite um SteamID64, vanity name ou URL do perfil Steam.";
  }

  return "";
}

export default function Home() {
  const [steamInput, setSteamInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [result, setResult] = useState<SteamGamesResponse | null>(null);
  const [error, setError] = useState("");

  async function fetchGames(forceRefresh = false) {
    const normalizedSteamInput = steamInput.trim();
    const validationError = validateSteamInput(normalizedSteamInput);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setResult(null);
    }

    setError("");

    try {
      const response = await fetch("/api/v1/steam_games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          req_steam_id_64: normalizedSteamInput,
          force_refresh: forceRefresh,
        }),
      });

      const data: SteamGamesResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar jogos.");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await fetchGames(false);
  }

  async function handleForceRefresh() {
    await fetchGames(true);
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden text-white">
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1560px] flex-col px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 2xl:px-10">
        <header className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,28,39,0.96),rgba(11,20,29,0.965))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_24%,transparent_78%,rgba(125,211,252,0.04))]" />
          <div className="pointer-events-none absolute right-[-90px] top-[-90px] h-[220px] w-[220px] rounded-full bg-sky-400/8 blur-[100px]" />
          <div className="pointer-events-none absolute bottom-[-80px] left-[28%] h-[180px] w-[180px] rounded-full bg-blue-400/8 blur-[90px]" />

          <div className="relative mb-4 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <Sparkles className="h-4 w-4" />
            steam achievements
          </div>

          <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-white/38">
                steam • biblioteca • 100%
              </p>

              <h1 className="max-w-4xl pb-1 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                Ranking de jogos para
                <span className="block bg-[linear-gradient(180deg,#ffffff_0%,#d3ecff_36%,#7ed3ff_100%)] bg-clip-text text-transparent">
                  completar 100%.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62 sm:text-base">
                Cole seu SteamID64, vanity name ou a URL do perfil Steam para
                ranquear os jogos da biblioteca com base na dificuldade
                percebida das conquistas.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(20,33,46,0.96),rgba(14,23,32,0.98))] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-5">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_38%,transparent_74%,rgba(125,211,252,0.04))]" />

              <div className="relative flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-[#17324a] shadow-[0_12px_30px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <Trophy className="h-5 w-5 text-sky-100" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                    foco principal
                  </p>
                  <p className="text-base font-medium text-white sm:text-lg">
                    Jogos mais viáveis para 100%
                  </p>
                </div>
              </div>

              <div className="relative mt-3 space-y-1 text-sm leading-6 text-white/58">
                <p>Exemplos aceitos:</p>
                <p className="break-all text-white/48">
                  76561198145040749 •
                  steamcommunity.com/profiles/76561198145040749
                </p>
                <p className="break-all text-white/48">
                  steamcommunity.com/id/seu-usuario • seu-usuario
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-5 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,27,37,0.94),rgba(12,20,28,0.98))] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-5">
          <form
            onSubmit={handleSubmit}
            className="grid gap-3 lg:grid-cols-[1fr_auto_auto]"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type="text"
                value={steamInput}
                onChange={(event) => setSteamInput(event.target.value)}
                placeholder="Digite SteamID64, vanity name ou URL do perfil Steam"
                className="h-14 w-full rounded-xl border border-white/10 bg-[#0d1822] pl-11 pr-4 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition placeholder:text-white/30 focus:border-sky-300/30 focus:bg-[#112131]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || refreshing}
              className="inline-flex h-14 items-center justify-center gap-3 rounded-xl border border-sky-300/30 bg-[linear-gradient(180deg,#2379ad_0%,#184f73_100%)] px-6 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(10,31,48,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                "Buscando..."
              ) : (
                <>
                  Buscar jogos
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleForceRefresh}
              disabled={loading || refreshing}
              className="inline-flex h-14 items-center justify-center gap-3 rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,37,0.94),rgba(12,20,28,0.98))] px-6 text-sm font-semibold text-white/88 shadow-[0_18px_50px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:border-sky-300/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCcw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Atualizando..." : "Atualizar ranking"}
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200 shadow-[0_14px_34px_rgba(0,0,0,0.16)]">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </section>

        {result && (
          <>
            <section className="mt-5 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,28,39,0.96),rgba(11,20,29,0.965))] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-5">
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-white/8 bg-[#0d1822] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-5">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                    SteamID64 resolvido
                  </span>
                  <strong className="mt-2 block break-all text-lg font-semibold tracking-[-0.03em] text-white sm:text-xl">
                    {result.steam_id_64}
                  </strong>

                  {result.message && (
                    <p className="mt-3 text-sm leading-6 text-white/58">
                      {result.message}
                    </p>
                  )}

                  {result.meta && (
                    <p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/38">
                      origem:{" "}
                      {result.meta.source === "cache" ? "cache" : "live"}
                    </p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-[#0d1822] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <div className="flex items-center gap-2 text-white/38">
                      <Gamepad2 className="h-4 w-4" />
                      <span className="text-[11px] uppercase tracking-[0.16em]">
                        Jogos encontrados
                      </span>
                    </div>
                    <strong className="mt-2 block text-3xl font-semibold tracking-[-0.05em] text-white">
                      {result.total_games_found}
                    </strong>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-[#0d1822] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <div className="flex items-center gap-2 text-white/38">
                      <BarChart3 className="h-4 w-4" />
                      <span className="text-[11px] uppercase tracking-[0.16em]">
                        Jogos processados
                      </span>
                    </div>
                    <strong className="mt-2 block text-3xl font-semibold tracking-[-0.05em] text-white">
                      {result.total_games_processed}
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
              {result.games.map((game) => (
                <article
                  key={game.appid}
                  className="group relative overflow-hidden rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,27,37,0.95),rgba(12,20,28,0.985))] shadow-[0_28px_90px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.05)] transition duration-300 hover:-translate-y-1 hover:border-sky-300/15"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_24%,transparent_72%,rgba(125,211,252,0.04))]" />

                  <div className="relative bg-[#0d1822]">
                    <img
                      src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                      alt={game.name}
                      className="h-[180px] w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b141d] via-transparent to-transparent" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/8 to-transparent" />
                  </div>

                  <div className="space-y-5 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-2">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                          Rank
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-md border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-xs font-semibold text-sky-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                            #{game.completion_difficulty_rank ?? "-"}
                          </span>

                          <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                            #{game.appid}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${getDifficultyStyles(
                          game.hardest_achievement_percent,
                        )}`}
                      >
                        {getDifficultyLabel(game.hardest_achievement_percent)}
                      </span>
                    </div>

                    <h2 className="min-h-[3.25rem] text-xl font-semibold leading-7 tracking-[-0.04em] text-white">
                      {game.name}
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative flex min-h-[116px] flex-col justify-between overflow-hidden rounded-xl border border-white/8 bg-[linear-gradient(180deg,#0f1b26_0%,#0c1620_100%)] p-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%,transparent_75%,rgba(125,211,252,0.03))]" />
                        <span className="relative min-h-[32px] text-[10px] uppercase leading-4 tracking-[0.16em] text-white/35">
                          Conquista mais difícil
                        </span>
                        <strong className="relative mt-4 block text-[1.15rem] font-semibold leading-none text-white">
                          {formatAchievementPercent(
                            game.hardest_achievement_percent,
                          )}
                        </strong>
                      </div>

                      <div className="relative flex min-h-[116px] flex-col justify-between overflow-hidden rounded-xl border border-white/8 bg-[linear-gradient(180deg,#0f1b26_0%,#0c1620_100%)] p-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%,transparent_75%,rgba(125,211,252,0.03))]" />
                        <span className="relative min-h-[32px] text-[10px] uppercase leading-4 tracking-[0.16em] text-white/35">
                          Tempo jogado
                        </span>
                        <strong className="relative mt-4 block text-[1.15rem] font-semibold leading-none text-white">
                          {formatPlaytime(game.playtime_forever)}
                        </strong>
                      </div>

                      <div className="relative flex min-h-[116px] flex-col justify-between overflow-hidden rounded-xl border border-white/8 bg-[linear-gradient(180deg,#0f1b26_0%,#0c1620_100%)] p-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%,transparent_75%,rgba(125,211,252,0.03))]" />
                        <span className="relative min-h-[32px] text-[10px] uppercase leading-4 tracking-[0.16em] text-white/35">
                          Conquistas totais
                        </span>
                        <strong className="relative mt-4 block text-[1.15rem] font-semibold leading-none text-white">
                          {game.total_game_achievements}
                        </strong>
                      </div>

                      <div className="relative flex min-h-[116px] flex-col justify-between overflow-hidden rounded-xl border border-white/8 bg-[linear-gradient(180deg,#0f1b26_0%,#0c1620_100%)] p-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%,transparent_75%,rgba(125,211,252,0.03))]" />
                        <span className="relative min-h-[32px] text-[10px] uppercase leading-4 tracking-[0.16em] text-white/35">
                          Conquistas do jogador
                        </span>
                        <strong className="relative mt-4 block text-[1.15rem] font-semibold leading-none text-white">
                          {game.player_unlocked_achievements}
                        </strong>
                      </div>
                    </div>

                    {game.error && (
                      <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs leading-6 text-rose-200 shadow-[0_10px_24px_rgba(0,0,0,0.14)]">
                        <strong>Erro:</strong> {game.error}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </section>
    </main>
  );
}
