"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  CheckCircle2,
  Clock3,
  Crown,
  Gamepad2,
  ShieldAlert,
  Sparkles,
  Trophy,
  Trash2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserProfileResponse = {
  profile: {
    steam_id_64: string;
    personaname: string | null;
    avatarfull: string | null;
    total_games_found: number;
    total_games_processed: number;
    cached_at: string;
    expires_at: string;
    updated_at: string;
    message?: string | null;
  };
  games: {
    appid: number;
    name: string;
    playtime_forever: number;
    hardest_achievement_percent: number | null;
    player_unlocked_achievements: number;
    total_game_achievements: number;
    completion_percentage: number | null;
    completion_difficulty_rank: number | null;
    error: string | null;
  }[];
  error?: string;
};

type DifficultyFilter =
  | "Todas"
  | "Muito fácil"
  | "Fácil"
  | "Médio"
  | "Difícil"
  | "Muito difícil";

type PlatinumFilter = "Todos" | "Apenas platinados" | "Apenas não platinados";

type DecoratedProfileGame = UserProfileResponse["games"][number] & {
  difficultyLabel: Exclude<DifficultyFilter, "Todas"> | "Sem dados";
  platinum: boolean;
};

function formatPlaytime(minutes: number) {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) return `${hours}h`;

  return `${hours}h ${remainingMinutes}min`;
}

function formatPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) return "Sem dados";
  return `${value.toFixed(2)}%`;
}

function getDifficultyLabel(percent: number | null) {
  if (percent === null) return "Sem dados";
  if (percent >= 20) return "Muito fácil";
  if (percent >= 10) return "Fácil";
  if (percent >= 5) return "Médio";
  if (percent >= 1) return "Difícil";
  return "Muito difícil";
}

function getDifficultyStyles(percent: number | null) {
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

function getFilterButtonStyles(
  difficulty: DifficultyFilter,
  isSelected: boolean,
) {
  const variants: Record<DifficultyFilter, string> = {
    Todas: isSelected
      ? "border-sky-300/30 bg-sky-300/15 text-sky-100"
      : "border-white/10 bg-white/5 text-white/70 hover:border-sky-300/20 hover:bg-sky-300/10 hover:text-white",
    "Muito fácil": isSelected
      ? "border-emerald-400/35 bg-emerald-400/18 text-emerald-200"
      : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:border-emerald-400/30 hover:bg-emerald-400/14",
    Fácil: isSelected
      ? "border-sky-400/35 bg-sky-400/18 text-sky-100"
      : "border-sky-400/20 bg-sky-400/10 text-sky-300 hover:border-sky-400/30 hover:bg-sky-400/14",
    Médio: isSelected
      ? "border-amber-400/35 bg-amber-400/18 text-amber-100"
      : "border-amber-400/20 bg-amber-400/10 text-amber-300 hover:border-amber-400/30 hover:bg-amber-400/14",
    Difícil: isSelected
      ? "border-orange-400/35 bg-orange-400/18 text-orange-100"
      : "border-orange-400/20 bg-orange-400/10 text-orange-300 hover:border-orange-400/30 hover:bg-orange-400/14",
    "Muito difícil": isSelected
      ? "border-rose-400/35 bg-rose-400/18 text-rose-100"
      : "border-rose-400/20 bg-rose-400/10 text-rose-300 hover:border-rose-400/30 hover:bg-rose-400/14",
  };

  return variants[difficulty];
}

function getPlatinumButtonStyles(filter: PlatinumFilter, isSelected: boolean) {
  if (filter === "Todos") {
    return isSelected
      ? "border-sky-300/30 bg-sky-300/15 text-sky-100"
      : "border-white/10 bg-white/5 text-white/70 hover:border-sky-300/20 hover:bg-sky-300/10 hover:text-white";
  }

  if (filter === "Apenas platinados") {
    return isSelected
      ? "border-sky-200/40 bg-[linear-gradient(180deg,rgba(186,230,253,0.20),rgba(96,165,250,0.12))] text-sky-50"
      : "border-sky-200/20 bg-[linear-gradient(180deg,rgba(186,230,253,0.10),rgba(96,165,250,0.05))] text-sky-200 hover:border-sky-200/35 hover:text-white";
  }

  return isSelected
    ? "border-white/20 bg-white/12 text-white"
    : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white";
}

function isPlatinumGame(game: UserProfileResponse["games"][number]) {
  return (
    game.total_game_achievements > 0 &&
    game.player_unlocked_achievements === game.total_game_achievements
  );
}

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ steamId64: string }>;
}) {
  const router = useRouter();

  const [steamId64, setSteamId64] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [result, setResult] = useState<UserProfileResponse | null>(null);
  const [error, setError] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyFilter>("Todas");
  const [selectedPlatinumFilter, setSelectedPlatinumFilter] =
    useState<PlatinumFilter>("Todos");

  useEffect(() => {
    async function loadProfile() {
      try {
        const resolvedParams = await params;
        setSteamId64(resolvedParams.steamId64);
        setSelectedDifficulty("Todas");
        setSelectedPlatinumFilter("Todos");

        const response = await fetch(
          `/api/v1/users/${resolvedParams.steamId64}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data = (await response.json()) as UserProfileResponse;

        if (!response.ok) {
          throw new Error(data.error || "Erro ao carregar perfil.");
        }

        setResult(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar perfil.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [params]);

  async function handleDeleteUser() {
    if (!steamId64 || isDeleting) return;

    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este usuário do banco de dados?",
    );

    if (!confirmed) return;

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/v1/users/${steamId64}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Erro ao excluir usuário.");
      }

      router.push("/users");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir usuário.");
      setIsDeleting(false);
    }
  }

  const difficultyOptions: DifficultyFilter[] = [
    "Todas",
    "Muito fácil",
    "Fácil",
    "Médio",
    "Difícil",
    "Muito difícil",
  ];

  const platinumOptions: PlatinumFilter[] = [
    "Todos",
    "Apenas platinados",
    "Apenas não platinados",
  ];

  const decoratedGames = useMemo(() => {
    if (!result) return [];

    const games: DecoratedProfileGame[] = [];

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
    const counts: Record<DifficultyFilter, number> = {
      Todas: decoratedGames.length,
      "Muito fácil": 0,
      Fácil: 0,
      Médio: 0,
      Difícil: 0,
      "Muito difícil": 0,
    };

    for (const game of decoratedGames) {
      if (game.difficultyLabel === "Sem dados") {
        continue;
      }

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
    const filtered: DecoratedProfileGame[] = [];

    for (const game of decoratedGames) {
      const matchesDifficulty =
        selectedDifficulty === "Todas" ||
        game.difficultyLabel === selectedDifficulty;

      const matchesPlatinum =
        selectedPlatinumFilter === "Todos" ||
        (selectedPlatinumFilter === "Apenas platinados" && game.platinum) ||
        (selectedPlatinumFilter === "Apenas não platinados" && !game.platinum);

      if (matchesDifficulty && matchesPlatinum) {
        filtered.push(game);
      }
    }

    return filtered;
  }, [decoratedGames, selectedDifficulty, selectedPlatinumFilter]);

  return (
    <main className="relative min-h-screen w-full text-white">
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1560px] flex-col px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 2xl:px-10">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/users"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/[0.08]"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar para usuários
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid gap-5">
            <div className="h-[240px] animate-pulse rounded-[24px] bg-white/[0.04]" />
            <div className="h-[180px] animate-pulse rounded-[24px] bg-white/[0.04]" />
          </div>
        ) : null}

        {result && (
          <>
            <header className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,28,39,0.96),rgba(11,20,29,0.965))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_24%,transparent_78%,rgba(125,211,252,0.04))]" />

              <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
                <div className="relative mx-auto lg:mx-0">
                  <div className="absolute inset-0 rounded-full bg-sky-400/15 blur-2xl" />
                  <img
                    src={
                      result.profile.avatarfull ||
                      "https://avatars.cloudflare.steamstatic.com/0000000000000000000000000000000000000000_full.jpg"
                    }
                    alt={
                      result.profile.personaname || result.profile.steam_id_64
                    }
                    className="relative h-28 w-28 rounded-full border border-white/10 object-cover shadow-[0_18px_40px_rgba(0,0,0,0.30)] sm:h-32 sm:w-32"
                  />
                </div>

                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">
                    <UserRound className="h-4 w-4" />
                    perfil salvo
                  </div>

                  <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <h1 className="break-words pb-1 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl">
                        {result.profile.personaname ||
                          "Usuário sem nome em cache"}
                      </h1>

                      {result.profile.message && (
                        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/58">
                          {result.profile.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleDeleteUser}
                      disabled={isDeleting || !steamId64}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:border-rose-300/30 hover:bg-rose-400/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      {isDeleting ? "Excluindo..." : "Excluir do banco"}
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(18,28,39,0.94),rgba(12,20,28,0.98))] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-[#152738] text-sky-100">
                  <Gamepad2 className="h-5 w-5" />
                </div>
                <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-white/35">
                  Jogos encontrados
                </p>
                <strong className="mt-3 block text-3xl font-semibold text-white">
                  {result.profile.total_games_found}
                </strong>
              </div>

              <div className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(18,28,39,0.94),rgba(12,20,28,0.98))] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-[#152738] text-sky-100">
                  <Trophy className="h-5 w-5" />
                </div>
                <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-white/35">
                  Jogos processados
                </p>
                <strong className="mt-3 block text-3xl font-semibold text-white">
                  {result.profile.total_games_processed}
                </strong>
              </div>

              <div className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(18,28,39,0.94),rgba(12,20,28,0.98))] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-[#152738] text-sky-100">
                  <Clock3 className="h-5 w-5" />
                </div>
                <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-white/35">
                  Cache atualizado
                </p>
                <strong className="mt-3 block text-base font-semibold text-white">
                  {new Date(result.profile.updated_at).toLocaleString("pt-BR")}
                </strong>
              </div>

              <div className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(18,28,39,0.94),rgba(12,20,28,0.98))] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-[#152738] text-sky-100">
                  <Clock3 className="h-5 w-5" />
                </div>
                <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-white/35">
                  Expira em
                </p>
                <strong className="mt-3 block text-base font-semibold text-white">
                  {new Date(result.profile.expires_at).toLocaleString("pt-BR")}
                </strong>
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

                <div className="rounded-xl border border-white/8 bg-[#0d1822] px-4 py-3 text-sm text-white/62">
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
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${getFilterButtonStyles(
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
                  className={`group relative overflow-hidden rounded-[24px] transition duration-300 hover:-translate-y-1 ${
                    game.platinum
                      ? "border border-sky-100/45 bg-[linear-gradient(180deg,rgba(24,42,58,0.98),rgba(11,20,29,0.99))] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_30px_95px_rgba(0,0,0,0.38),0_0_40px_rgba(125,211,252,0.18),0_0_120px_rgba(191,219,254,0.06)] hover:border-sky-50/70 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_30px_95px_rgba(0,0,0,0.42),0_0_54px_rgba(125,211,252,0.24),0_0_130px_rgba(191,219,254,0.08)]"
                      : "border border-white/8 bg-[linear-gradient(180deg,rgba(17,27,37,0.95),rgba(12,20,28,0.985))] shadow-[0_28px_90px_rgba(0,0,0,0.30)] hover:border-sky-300/15"
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

                  <div className="relative bg-[#0d1822]">
                    <img
                      src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                      alt={game.name}
                      className={`h-[180px] w-full object-cover transition duration-700 group-hover:scale-[1.04] ${
                        game.platinum ? "brightness-[1.06] saturate-[1.03]" : ""
                      }`}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b141d] via-transparent to-transparent" />

                    {game.platinum && (
                      <>
                        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-sky-100/55 bg-[linear-gradient(180deg,rgba(240,249,255,0.98),rgba(147,197,253,0.90))] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#102132] shadow-[0_14px_32px_rgba(0,0,0,0.30)]">
                          <Crown className="h-3.5 w-3.5" />
                          PLATINADO
                        </div>

                        <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-sky-100/20 bg-slate-950/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-100 backdrop-blur-md">
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
                          <span className="inline-flex items-center rounded-md border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-xs font-semibold text-sky-200">
                            #{game.completion_difficulty_rank ?? "-"}
                          </span>

                          <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/55">
                            #{game.appid}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${getDifficultyStyles(
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
                            : "border-white/8 bg-[#0d1822]"
                        }`}
                      >
                        {game.platinum && (
                          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(240,249,255,0.08),transparent_52%,rgba(125,211,252,0.06))]" />
                        )}
                        <span className="min-h-[32px] text-[10px] uppercase leading-4 tracking-[0.16em] text-white/35">
                          Conquista mais difícil
                        </span>
                        <strong className="mt-4 block text-[1.15rem] font-semibold leading-none text-white">
                          {formatPercent(game.hardest_achievement_percent)}
                        </strong>
                      </div>

                      <div
                        className={`relative flex min-h-[116px] flex-col justify-between overflow-hidden rounded-xl border p-3.5 ${
                          game.platinum
                            ? "border-sky-100/15 bg-[linear-gradient(180deg,rgba(23,40,55,0.98),rgba(15,24,34,0.98))] shadow-[0_10px_28px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.05)]"
                            : "border-white/8 bg-[#0d1822]"
                        }`}
                      >
                        {game.platinum && (
                          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(240,249,255,0.08),transparent_52%,rgba(125,211,252,0.06))]" />
                        )}
                        <span className="min-h-[32px] text-[10px] uppercase leading-4 tracking-[0.16em] text-white/35">
                          Tempo jogado
                        </span>
                        <strong className="mt-4 block text-[1.15rem] font-semibold leading-none text-white">
                          {formatPlaytime(game.playtime_forever)}
                        </strong>
                      </div>

                      <div
                        className={`relative flex min-h-[116px] flex-col justify-between overflow-hidden rounded-xl border p-3.5 ${
                          game.platinum
                            ? "border-sky-100/25 bg-[linear-gradient(180deg,rgba(39,62,84,0.98),rgba(17,29,41,0.98))] shadow-[0_12px_32px_rgba(0,0,0,0.26),0_0_20px_rgba(125,211,252,0.10),inset_0_1px_0_rgba(255,255,255,0.06)]"
                            : "border-white/8 bg-[#0d1822]"
                        }`}
                      >
                        {game.platinum && (
                          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(240,249,255,0.12),transparent_46%,rgba(125,211,252,0.10))]" />
                        )}
                        <span className="min-h-[32px] text-[10px] uppercase leading-4 tracking-[0.16em] text-white/35">
                          Conquistas totais
                        </span>
                        <strong
                          className={`mt-4 block text-[1.15rem] font-semibold leading-none ${
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
                            : "border-white/8 bg-[#0d1822]"
                        }`}
                      >
                        {game.platinum && (
                          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(240,249,255,0.12),transparent_46%,rgba(125,211,252,0.10))]" />
                        )}
                        <span className="min-h-[32px] text-[10px] uppercase leading-4 tracking-[0.16em] text-white/35">
                          Conquistas do jogador
                        </span>
                        <strong
                          className={`mt-4 block text-[1.15rem] font-semibold leading-none ${
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
                      <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs leading-6 text-rose-200">
                        <strong>Erro:</strong> {game.error}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </section>

            {filteredGames.length === 0 && (
              <section className="mt-6 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,27,37,0.94),rgba(12,20,28,0.98))] p-6 text-center">
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
