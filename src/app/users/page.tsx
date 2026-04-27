"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Search, ShieldAlert, Sparkles, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LoadingScreen from "@/app/components/ui/loading-screen";

type UserListItem = {
  steam_id_64: string;
  personaname: string | null;
  avatarfull: string | null;
  total_games_found: number;
  total_games_processed: number;
  total_cached_items: number;
  cached_at: string;
  updated_at: string;
};

type UsersResponse = {
  total: number;
  users: UserListItem[];
  error?: string;
};

const FALLBACK_STEAM_AVATAR =
  "https://avatars.cloudflare.steamstatic.com/0000000000000000000000000000000000000000_full.jpg";

async function fetchUsers(query = ""): Promise<UsersResponse> {
  const url = new URL("/api/v1/users", window.location.origin);

  if (query.trim()) {
    url.searchParams.set("q", query.trim());
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as UsersResponse;

  if (!response.ok) {
    throw new Error(data.error || "Erro ao buscar usuários.");
  }

  return data;
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [error, setError] = useState("");

  async function loadUsers(query = "") {
    try {
      setError("");
      const data = await fetchUsers(query);
      setUsers(data.users);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar usuários.",
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    await loadUsers(search);
  }

  const showLoadingState = loading || submitting;

  return (
    <main className="relative min-h-screen w-full text-white">
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1560px] flex-col px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 2xl:px-10">
        <header className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,28,39,0.96),rgba(11,20,29,0.965))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_24%,transparent_78%,rgba(125,211,252,0.04))]" />
          <div className="pointer-events-none absolute right-[-90px] top-[-90px] h-[220px] w-[220px] rounded-full bg-sky-400/8 blur-[100px]" />

          <div className="relative mb-4 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">
            <Sparkles className="h-4 w-4" />
            usuários
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-white/38">
                steam asc • banco de dados • perfis
              </p>

              <h1 className="max-w-4xl pb-1 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                Usuários cadastrados
                <span className="block bg-[linear-gradient(180deg,#ffffff_0%,#d3ecff_36%,#7ed3ff_100%)] bg-clip-text text-transparent">
                  no banco do projeto.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62 sm:text-base">
                Busque por SteamID64 ou nome e abra um perfil completo com os
                jogos armazenados no banco de dados.
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(20,33,46,0.96),rgba(14,23,32,0.98))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-[#17324a]">
                  <Users className="h-5 w-5 text-sky-100" />
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                    total carregado
                  </p>
                  <p className="text-base font-medium text-white sm:text-lg">
                    {showLoadingState
                      ? "Carregando..."
                      : `${users.length} usuários`}
                  </p>
                </div>
              </div>
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
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por SteamID64 ou nome do usuário"
                className="h-14 w-full rounded-xl border border-white/10 bg-[#0d1822] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-sky-300/30 focus:bg-[#112131]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-14 items-center justify-center gap-3 rounded-xl border border-sky-300/30 bg-[linear-gradient(180deg,#2379ad_0%,#184f73_100%)] px-6 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(10,31,48,0.45)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-70"
            >
              {submitting ? "Buscando..." : "Buscar usuários"}
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </section>

        {showLoadingState ? (
          <LoadingScreen
            title="Carregando usuários"
            description="Estamos consultando os perfis salvos no banco de dados."
            showCards
            cardCount={8}
          />
        ) : (
          <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
            {users.map((user) => {
              const avatarSrc = user.avatarfull || FALLBACK_STEAM_AVATAR;
              const avatarAlt = user.personaname || user.steam_id_64;

              return (
                <Link
                  key={user.steam_id_64}
                  href={`/users/${user.steam_id_64}`}
                  className="group relative overflow-hidden rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,27,37,0.95),rgba(12,20,28,0.985))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.30)] transition duration-300 hover:-translate-y-1 hover:border-sky-300/15"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_24%,transparent_72%,rgba(125,211,252,0.04))]" />

                  <div className="relative flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-white/10 bg-[#0d1822]">
                      <Image
                        src={avatarSrc}
                        alt={avatarAlt}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold tracking-[-0.03em] text-white">
                        {user.personaname || "Usuário sem nome em cache"}
                      </p>
                    </div>
                  </div>

                  <div className="relative mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/8 bg-[#0d1822] p-3.5">
                      <span className="min-h-[32px] text-[10px] uppercase tracking-[0.16em] text-white/35">
                        Jogos encontrados
                      </span>
                      <strong className="mt-3 block text-[1.15rem] font-semibold text-white">
                        {user.total_games_found}
                      </strong>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-[#0d1822] p-3.5">
                      <span className="min-h-[32px] text-[10px] uppercase tracking-[0.16em] text-white/35">
                        Jogos processados
                      </span>
                      <strong className="mt-3 block text-[1.15rem] font-semibold text-white">
                        {user.total_games_processed}
                      </strong>
                    </div>
                  </div>

                  <div className="relative mt-5 inline-flex items-center gap-2 text-sm font-medium text-sky-200">
                    Abrir perfil
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </section>
    </main>
  );
}
