"use client";

import { FormEvent, useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  Search,
  ShieldAlert,
  Sparkles,
  UserRound,
} from "lucide-react";

interface SteamUserResult {
  STEAM: {
    personaname: string;
    avatarfull: string;
  };
}

type ApiErrorResponse = {
  error?: string;
};

export default function Home() {
  const [steamId64, setSteamId64] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SteamUserResult | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(formInput: FormEvent<HTMLFormElement>) {
    formInput.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/v1/steam_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          req_steam_id_64: steamId64.trim(),
        }),
      });

      const data = (await response.json()) as
        | SteamUserResult
        | ApiErrorResponse;

      if (!response.ok) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Não foi possível buscar os dados da Steam.",
        );
      }

      setResult(data as SteamUserResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível buscar os dados da Steam.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen w-full text-white">
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1560px] flex-col px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 2xl:px-10">
        <header className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,28,39,0.96),rgba(11,20,29,0.965))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_24%,transparent_78%,rgba(125,211,252,0.04))]" />
          <div className="pointer-events-none absolute right-[-90px] top-[-90px] h-[220px] w-[220px] rounded-full bg-sky-400/8 blur-[100px]" />
          <div className="pointer-events-none absolute bottom-[-80px] left-[28%] h-[180px] w-[180px] rounded-full bg-blue-400/8 blur-[90px]" />

          <div className="relative mb-4 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <Sparkles className="h-4 w-4" />
            steam profile
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-white/38">
                steam • perfil • jogador
              </p>

              <h1 className="max-w-4xl pb-1 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                Consulte um perfil
                <span className="block bg-[linear-gradient(180deg,#ffffff_0%,#d3ecff_36%,#7ed3ff_100%)] bg-clip-text text-transparent">
                  público da Steam.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62 sm:text-base">
                Busque rapidamente dados públicos do jogador usando o Steam ID
                64 e visualize o perfil em uma interface consistente com o
                visual do Steam ASC.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(20,33,46,0.96),rgba(14,23,32,0.98))] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-5">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_38%,transparent_74%,rgba(125,211,252,0.04))]" />

              <div className="relative flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-[#17324a] shadow-[0_12px_30px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <UserRound className="h-5 w-5 text-sky-100" />
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                    exemplo
                  </p>
                  <p className="text-base font-medium text-white sm:text-lg">
                    Steam ID 64 = 76561198145040749
                  </p>
                </div>
              </div>

              <p className="relative mt-3 text-sm leading-6 text-white/58">
                Informe um Steam ID 64 válido para buscar nome e avatar do
                jogador.
              </p>
            </div>
          </div>
        </header>

        <section className="mt-5 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,27,37,0.94),rgba(12,20,28,0.98))] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-5">
          <form
            onSubmit={handleSubmit}
            className="grid gap-3 lg:grid-cols-[1fr_auto]"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type="text"
                value={steamId64}
                onChange={(e) => setSteamId64(e.target.value)}
                placeholder="Digite o Steam ID 64"
                className="h-14 w-full rounded-xl border border-white/10 bg-[#0d1822] pl-11 pr-4 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition placeholder:text-white/30 focus:border-sky-300/30 focus:bg-[#112131]"
                required
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-14 items-center justify-center gap-3 rounded-xl border border-sky-300/30 bg-[linear-gradient(180deg,#2379ad_0%,#184f73_100%)] px-6 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(10,31,48,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              {loading ? (
                "Enviando..."
              ) : (
                <>
                  Buscar perfil
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200 shadow-[0_14px_34px_rgba(0,0,0,0.16)]">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </section>

        {result?.STEAM && (
          <section className="mt-6">
            <article className="relative overflow-hidden rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,27,37,0.95),rgba(12,20,28,0.985))] shadow-[0_28px_90px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_24%,transparent_72%,rgba(125,211,252,0.04))]" />

              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[auto_1fr] lg:items-center">
                <div className="relative mx-auto lg:mx-0">
                  <div className="absolute inset-0 rounded-full bg-sky-400/15 blur-2xl" />
                  <img
                    src={result.STEAM.avatarfull}
                    alt={`Avatar de ${result.STEAM.personaname}`}
                    className="relative h-28 w-28 rounded-full border border-white/10 object-cover shadow-[0_18px_40px_rgba(0,0,0,0.30)] sm:h-32 sm:w-32"
                  />
                </div>

                <div className="relative min-w-0 text-center lg:text-left">
                  <span className="inline-flex items-center rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200">
                    Usuário encontrado
                  </span>

                  <h2 className="mt-4 break-words text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                    {result.STEAM.personaname}
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
                    Perfil público retornado com sucesso pela rota
                    <span className="mx-1 text-white/38">
                      /api/v1/steam_user
                    </span>
                    do Steam ASC.
                  </p>
                </div>
              </div>
            </article>
          </section>
        )}

        <section className="mt-5">
          <a
            href="https://steamid.xyz"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,37,0.94),rgba(12,20,28,0.98))] px-5 text-sm font-semibold text-white/88 shadow-[0_14px_34px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:border-sky-300/15 hover:text-white"
          >
            Ver meu ID 64
            <ExternalLink className="h-4 w-4" />
          </a>
        </section>
      </section>
    </main>
  );
}
