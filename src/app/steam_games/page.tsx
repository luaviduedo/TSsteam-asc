"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Crown,
  Gamepad2,
  RefreshCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import LoadingScreen from "@/app/components/ui/loading-screen";

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

type DifficultyLabel =
  | "Todas"
  | "Muito fácil"
  | "Fácil"
  | "Médio"
  | "Difícil"
  | "Muito difícil"
  | "Sem dados";

type PlatinumFilter = "Todos" | "Apenas platinados" | "Apenas não platinados";

type DecoratedSteamGame = SteamGame & {
  difficultyLabel: Exclude<DifficultyLabel, "Todas">;
  platinum: boolean;
};

function formatPlaytime(minutes: number) {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) return `${hours}h`;

  return `${hours}h ${remainingMinutes}min`;
}

function getDifficultyLabel(percent: number | string | null) {
  const numericPercent = Number(percent);

  if (percent === null || Number.isNaN(numericPercent)) return "Sem dados";
  if (numericPercent >= 20) return "Muito fácil";
  if (numericPercent >= 10) return "Fácil";
  if (numericPercent >= 5) return "Médio";
  if (numericPercent >= 1) return "Difícil";

  return "Muito difícil";
}

function formatAchievementPercent(value: number | string | null) {
  const numericValue = Number(value);

  if (value === null || Number.isNaN(numericValue)) {
    return "Sem dados";
  }

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

function getDifficultyButtonStyles(label: DifficultyLabel, selected: boolean) {
  if (label === "Todas" || label === "Sem dados") {
    return selected
      ? "border-sky-300/30 bg-sky-300/15 text-sky-100"
      : "border-white/10 bg-white/5 text-white/70 hover:border-sky-300/20 hover:bg-sky-300/10 hover:text-white";
  }

  const difficultyStyles = {
    "Muito fácil": selected
      ? "border-emerald-400/35 bg-emerald-400/18 text-emerald-200"
      : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:border-emerald-400/30 hover:bg-emerald-400/14",
    Fácil: selected
      ? "border-sky-400/35 bg-sky-400/18 text-sky-100"
      : "border-sky-400/20 bg-sky-400/10 text-sky-300 hover:border-sky-400/30 hover:bg-sky-400/14",
    Médio: selected
      ? "border-amber-400/35 bg-amber-400/18 text-amber-100"
      : "border-amber-400/20 bg-amber-400/10 text-amber-300 hover:border-amber-400/30 hover:bg-amber-400/14",
    Difícil: selected
      ? "border-orange-400/35 bg-orange-400/18 text-orange-100"
      : "border-orange-400/20 bg-orange-400/10 text-orange-300 hover:border-orange-400/30 hover:bg-orange-400/14",
    "Muito difícil": selected
      ? "border-rose-400/35 bg-rose-400/18 text-rose-100"
      : "border-rose-400/20 bg-rose-400/10 text-rose-300 hover:border-rose-400/30 hover:bg-rose-400/14",
  } satisfies Record<Exclude<DifficultyLabel, "Todas" | "Sem dados">, string>;

  return difficultyStyles[label];
}

function getPlatinumButtonStyles(filter: PlatinumFilter, selected: boolean) {
  if (filter === "Todos") {
    return selected
      ? "border-sky-300/30 bg-sky-300/15 text-sky-100"
      : "border-white/10 bg-white/5 text-white/70 hover:border-sky-300/20 hover:bg-sky-300/10 hover:text-white";
  }

  if (filter === "Apenas platinados") {
    return selected
      ? "border-sky-200/40 bg-[linear-gradient(180deg,rgba(186,230,253,0.20),rgba(96,165,250,0.12))] text-sky-50"
      : "border-sky-200/20 bg-[linear-gradient(180deg,rgba(186,230,253,0.10),rgba(96,165,250,0.05))] text-sky-200 hover:border-sky-200/35 hover:text-white";
  }

  return selected
    ? "border-white/20 bg-white/12 text-white"
    : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white";
}

function validateSteamInput(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return "Digite um SteamID64, vanity name ou URL do perfil Steam.";
  }

  return "";
}

function isPlatinumGame(game: SteamGame) {
  return (
    game.total_game_achievements > 0 &&
    game.player_unlocked_achievements === game.total_game_achievements
  );
}

export default function Home() {
  const [steamInput, setSteamInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [result, setResult] = useState<SteamGamesResponse | null>(null);
  const [error, setError] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyLabel>("Todas");
  const [selectedPlatinumFilter, setSelectedPlatinumFilter] =
    useState<PlatinumFilter>("Todos");

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
    setSelectedDifficulty("Todas");
    setSelectedPlatinumFilter("Todos");

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

      const data = (await response.json()) as SteamGamesResponse;

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

  const difficultyOptions: DifficultyLabel[] = [
    "Todas",
    "Muito fácil",
    "Fácil",
    "Médio",
    "Difícil",
    "Muito difícil",
    "Sem dados",
  ];

  const platinumOptions: PlatinumFilter[] = [
    "Todos",
    "Apenas platinados",
    "Apenas não platinados",
  ];

  const decoratedGames = useMemo(() => {
    if (!result) return [];

    const games: DecoratedSteamGame[] = [];

    for (const game of result.games) {
      games.push({
        ...game,
        difficultyLabel: getDifficultyLabel(game.hardest_achievement_percent),
        platinum: isPlatinumGame(game),
      });
    }

    return games;
  }, [result]);

  const difficultyCounts = useMemo(() => {
    const counts: Record<DifficultyLabel, number> = {
      Todas: decoratedGames.length,
      "Muito fácil": 0,
      Fácil: 0,
      Médio: 0,
      Difícil: 0,
      "Muito difícil": 0,
      "Sem dados": 0,
    };

    for (const game of decoratedGames) {
      counts[game.difficultyLabel] += 1;
    }

    return counts;
  }, [decoratedGames]);

  const platinumCounts = useMemo(() => {
    const counts: Record<PlatinumFilter, number> = {
      Todos: decoratedGames.length,
      "Apenas platinados": 0,
      "Apenas não platinados": 0,
    };

    for (const game of decoratedGames) {
      if (game.platinum) {
        counts["Apenas platinados"] += 1;
      } else {
        counts["Apenas não platinados"] += 1;
      }
    }

    return counts;
  }, [decoratedGames]);

  const filteredGames = useMemo(() => {
    const games: DecoratedSteamGame[] = [];

    for (const game of decoratedGames) {
      const matchesDifficulty =
        selectedDifficulty === "Todas" ||
        game.difficultyLabel === selectedDifficulty;

      const matchesPlatinum =
        selectedPlatinumFilter === "Todos" ||
        (selectedPlatinumFilter === "Apenas platinados" && game.platinum) ||
        (selectedPlatinumFilter === "Apenas não platinados" && !game.platinum);

      if (matchesDifficulty && matchesPlatinum) {
        games.push(game);
      }
    }

    return games;
  }, [decoratedGames, selectedDifficulty, selectedPlatinumFilter]);

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
                Cole seu SteamID64, Nickname ou a URL do perfil Steam para
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
                placeholder="Digite SteamID64, Nickname ou URL do perfil Steam"
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

        {loading && (
          <LoadingScreen
            title="Buscando jogos da Steam"
            description="Estamos consultando perfil, conquistas e preparando o ranking para você."
            showCards
            cardCount={4}
          />
        )}

        {!loading && result && (
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

            <section className="mt-5 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,27,37,0.94),rgba(12,20,28,0.98))] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.20)] backdrop-blur-xl sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/35">
                    Filtros
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-white">
                    Filtre por dificuldade e por status de platinado
                  </h2>
                </div>

                <div className="rounded-xl border border-white/8 bg-[#0d1822] px-4 py-3 text-sm text-white/62 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  Exibindo{" "}
                  <span className="font-semibold text-white">
                    {filteredGames.length}
                  </span>{" "}
                  de{" "}
                  <span className="font-semibold text-white">
                    {decoratedGames.length}
                  </span>{" "}
                  jogos
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/38">
                  Dificuldade
                </p>

                <div className="flex flex-wrap gap-3">
                  {difficultyOptions.map((difficulty) => {
                    const isSelected = selectedDifficulty === difficulty;

                    return (
                      <button
                        key={difficulty}
                        type="button"
                        onClick={() => setSelectedDifficulty(difficulty)}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${getDifficultyButtonStyles(
                          difficulty,
                          isSelected,
                        )}`}
                      >
                        <span>{difficulty}</span>
                        <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] text-white/90">
                          {difficultyCounts[difficulty]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/38">
                  Platinado
                </p>

                <div className="flex flex-wrap gap-3">
                  {platinumOptions.map((option) => {
                    const isSelected = selectedPlatinumFilter === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSelectedPlatinumFilter(option)}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${getPlatinumButtonStyles(
                          option,
                          isSelected,
                        )}`}
                      >
                        {option === "Apenas platinados" && (
                          <Crown className="h-3.5 w-3.5" />
                        )}
                        {option === "Apenas não platinados" && (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        <span>{option}</span>
                        <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] text-white/90">
                          {platinumCounts[option]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
              {filteredGames.map((game) => (
                <article
                  key={game.appid}
                  className={`group relative overflow-hidden rounded-[24px] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:scale-[1.015] ${
                    game.platinum
                      ? "border border-sky-100/45 bg-[linear-gradient(180deg,rgba(24,42,58,0.98),rgba(11,20,29,0.99))] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_30px_95px_rgba(0,0,0,0.38),0_0_40px_rgba(125,211,252,0.18),0_0_120px_rgba(191,219,254,0.06)] hover:border-sky-50/70 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_36px_110px_rgba(0,0,0,0.42),0_0_54px_rgba(125,211,252,0.24),0_0_130px_rgba(191,219,254,0.08)]"
                      : "border border-white/8 bg-[linear-gradient(180deg,rgba(17,27,37,0.95),rgba(12,20,28,0.985))] shadow-[0_28px_90px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-sky-300/15 hover:shadow-[0_36px_110px_rgba(0,0,0,0.34)]"
                  }`}
                >
                  {game.platinum && (
                    <>
                      <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-[linear-gradient(135deg,rgba(240,249,255,0.18),rgba(125,211,252,0.14)_18%,transparent_36%,transparent_62%,rgba(191,219,254,0.10)_82%,rgba(255,255,255,0.14))]" />
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,transparent,rgba(224,242,254,0.95),transparent)]" />
                      <div className="pointer-events-none absolute left-[-28px] top-[-18px] h-28 w-28 rounded-full bg-sky-200/18 blur-3xl" />
                      <div className="pointer-events-none absolute bottom-[-26px] right-[-20px] h-32 w-32 rounded-full bg-cyan-200/12 blur-3xl" />
                      <div className="pointer-events-none absolute -right-20 top-8 h-44 w-24 rotate-12 bg-[linear-gradient(180deg,transparent,rgba(224,242,254,0.18),transparent)] blur-xl" />
                    </>
                  )}

                  {!game.platinum && (
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_24%,transparent_72%,rgba(125,211,252,0.04))]" />
                  )}

                  <div className="relative overflow-hidden bg-[#0d1822]">
                    <div className="relative h-[180px] w-full overflow-hidden">
                      <Image
                        src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                        alt={game.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 25vw"
                        className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${
                          game.platinum
                            ? "brightness-[1.06] saturate-[1.03]"
                            : ""
                        }`}
                      />
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 translate-y-[1px] bg-gradient-to-t from-[#0b141d] via-[#0b141d]/50 to-transparent will-change-transform" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/8 to-transparent" />

                    {game.platinum && (
                      <>
                        <div className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-sky-100/55 bg-[linear-gradient(180deg,rgba(240,249,255,0.98),rgba(147,197,253,0.90))] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#102132] shadow-[0_14px_32px_rgba(0,0,0,0.30)]">
                          <Crown className="h-3.5 w-3.5" />
                          PLATINADO
                        </div>

                        <div className="absolute right-4 top-4 z-20 inline-flex items-center gap-1 rounded-full border border-sky-100/20 bg-slate-950/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-100 backdrop-blur-md">
                          <Sparkles className="h-3 w-3" />
                          100%
                        </div>
                      </>
                    )}
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
                        {game.difficultyLabel}
                      </span>
                    </div>

                    <h2
                      className={`min-h-[3.25rem] text-xl font-semibold leading-7 tracking-[-0.04em] ${
                        game.platinum ? "text-sky-50" : "text-white"
                      }`}
                    >
                      {game.name}
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className={`relative flex min-h-[116px] flex-col justify-between overflow-hidden rounded-xl border p-3.5 ${
                          game.platinum
                            ? "border-sky-100/15 bg-[linear-gradient(180deg,rgba(23,40,55,0.98),rgba(15,24,34,0.98))] shadow-[0_10px_28px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.05)]"
                            : "border-white/8 bg-[linear-gradient(180deg,#0f1b26_0%,#0c1620_100%)] shadow-[0_14px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]"
                        }`}
                      >
                        <div
                          className={`pointer-events-none absolute inset-0 ${
                            game.platinum
                              ? "bg-[linear-gradient(135deg,rgba(240,249,255,0.08),transparent_52%,rgba(125,211,252,0.06))]"
                              : "bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%,transparent_75%,rgba(125,211,252,0.03))]"
                          }`}
                        />
                        <span className="relative min-h-[32px] text-[10px] uppercase leading-4 tracking-[0.16em] text-white/35">
                          Conquista mais difícil
                        </span>
                        <strong className="relative mt-4 block text-[1.15rem] font-semibold leading-none text-white">
                          {formatAchievementPercent(
                            game.hardest_achievement_percent,
                          )}
                        </strong>
                      </div>

                      <div
                        className={`relative flex min-h-[116px] flex-col justify-between overflow-hidden rounded-xl border p-3.5 ${
                          game.platinum
                            ? "border-sky-100/15 bg-[linear-gradient(180deg,rgba(23,40,55,0.98),rgba(15,24,34,0.98))] shadow-[0_10px_28px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.05)]"
                            : "border-white/8 bg-[linear-gradient(180deg,#0f1b26_0%,#0c1620_100%)] shadow-[0_14px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]"
                        }`}
                      >
                        <div
                          className={`pointer-events-none absolute inset-0 ${
                            game.platinum
                              ? "bg-[linear-gradient(135deg,rgba(240,249,255,0.08),transparent_52%,rgba(125,211,252,0.06))]"
                              : "bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%,transparent_75%,rgba(125,211,252,0.03))]"
                          }`}
                        />
                        <span className="relative min-h-[32px] text-[10px] uppercase leading-4 tracking-[0.16em] text-white/35">
                          Tempo jogado
                        </span>
                        <strong className="relative mt-4 block text-[1.15rem] font-semibold leading-none text-white">
                          {formatPlaytime(game.playtime_forever)}
                        </strong>
                      </div>

                      <div
                        className={`relative flex min-h-[116px] flex-col justify-between overflow-hidden rounded-xl border p-3.5 ${
                          game.platinum
                            ? "border-sky-100/25 bg-[linear-gradient(180deg,rgba(39,62,84,0.98),rgba(17,29,41,0.98))] shadow-[0_12px_32px_rgba(0,0,0,0.26),0_0_20px_rgba(125,211,252,0.10),inset_0_1px_0_rgba(255,255,255,0.06)]"
                            : "border-white/8 bg-[linear-gradient(180deg,#0f1b26_0%,#0c1620_100%)] shadow-[0_14px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]"
                        }`}
                      >
                        <div
                          className={`pointer-events-none absolute inset-0 ${
                            game.platinum
                              ? "bg-[linear-gradient(135deg,rgba(240,249,255,0.12),transparent_46%,rgba(125,211,252,0.10))]"
                              : "bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%,transparent_75%,rgba(125,211,252,0.03))]"
                          }`}
                        />
                        <span className="relative min-h-[32px] text-[10px] uppercase leading-4 tracking-[0.16em] text-white/35">
                          Conquistas totais
                        </span>
                        <strong
                          className={`relative mt-4 block text-[1.15rem] font-semibold leading-none ${
                            game.platinum ? "text-sky-50" : "text-white"
                          }`}
                        >
                          {game.total_game_achievements}
                        </strong>
                      </div>

                      <div
                        className={`relative flex min-h-[116px] flex-col justify-between overflow-hidden rounded-xl border p-3.5 ${
                          game.platinum
                            ? "border-sky-100/25 bg-[linear-gradient(180deg,rgba(39,62,84,0.98),rgba(17,29,41,0.98))] shadow-[0_12px_32px_rgba(0,0,0,0.26),0_0_20px_rgba(125,211,252,0.10),inset_0_1px_0_rgba(255,255,255,0.06)]"
                            : "border-white/8 bg-[linear-gradient(180deg,#0f1b26_0%,#0c1620_100%)] shadow-[0_14px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]"
                        }`}
                      >
                        <div
                          className={`pointer-events-none absolute inset-0 ${
                            game.platinum
                              ? "bg-[linear-gradient(135deg,rgba(240,249,255,0.12),transparent_46%,rgba(125,211,252,0.10))]"
                              : "bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%,transparent_75%,rgba(125,211,252,0.03))]"
                          }`}
                        />
                        <span className="relative min-h-[32px] text-[10px] uppercase leading-4 tracking-[0.16em] text-white/35">
                          Conquistas do jogador
                        </span>
                        <strong
                          className={`relative mt-4 block text-[1.15rem] font-semibold leading-none ${
                            game.platinum ? "text-sky-50" : "text-white"
                          }`}
                        >
                          {game.player_unlocked_achievements}
                        </strong>
                      </div>
                    </div>

                    {game.platinum && (
                      <div className="relative overflow-hidden rounded-xl border border-sky-100/25 bg-[linear-gradient(180deg,rgba(224,242,254,0.16),rgba(96,165,250,0.10))] px-3 py-2.5 text-xs font-semibold text-sky-50 shadow-[0_12px_26px_rgba(0,0,0,0.18)]">
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)]" />
                        <div className="relative flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-sky-100" />
                          Este jogo já foi concluído em 100% nesta conta.
                        </div>
                      </div>
                    )}

                    {game.error && (
                      <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs leading-6 text-rose-200 shadow-[0_10px_24px_rgba(0,0,0,0.14)]">
                        <strong>Erro:</strong> {game.error}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </section>

            {filteredGames.length === 0 && (
              <section className="mt-6 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,27,37,0.94),rgba(12,20,28,0.98))] p-6 text-center shadow-[0_22px_60px_rgba(0,0,0,0.20)] backdrop-blur-xl">
                <p className="text-sm text-white/60">
                  Nenhum jogo encontrado com os filtros selecionados.
                </p>
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}
