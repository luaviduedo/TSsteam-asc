"use client";

import useSWR from "swr";
import {
  Activity,
  Database,
  RefreshCcw,
  ServerCog,
  Sparkles,
} from "lucide-react";

async function fetchAPI(url: string) {
  const response = await fetch(url);
  const responseBody = await response.json();
  return responseBody;
}

type Health = "loading" | "ok" | "warn" | "down";

type StatusResponse = {
  dependencies?: {
    database?: {
      healthy?: boolean;
      status?: string;
      version?: string;
      max_connections?: number;
      opened_connections?: number;
    };
  };
  updated_at?: string;
};

function getDatabaseHealth(
  data: StatusResponse | undefined,
  isLoading: boolean,
): Health {
  if (isLoading) return "loading";
  if (!data) return "down";

  const database = data.dependencies?.database;

  if (!database) return "down";

  if (typeof database.healthy === "boolean") {
    return database.healthy ? "ok" : "down";
  }

  const status = String(database.status ?? "").toLowerCase();

  if (status.includes("degrad") || status.includes("warn")) return "warn";
  if (
    status.includes("down") ||
    status.includes("fail") ||
    status.includes("error")
  ) {
    return "down";
  }
  if (
    status.includes("up") ||
    status.includes("ok") ||
    status.includes("healthy")
  ) {
    return "ok";
  }

  if (database.version && typeof database.max_connections !== "undefined") {
    return "ok";
  }

  return "warn";
}

function getHealthLabel(health: Health) {
  switch (health) {
    case "ok":
      return "OK";
    case "warn":
      return "DEGRADADO";
    case "down":
      return "FORA DO AR";
    default:
      return "CARREGANDO";
  }
}

function getBadgeClasses(health: Health) {
  switch (health) {
    case "ok":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
    case "warn":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";
    case "down":
      return "border-rose-400/20 bg-rose-400/10 text-rose-300";
    default:
      return "border-white/10 bg-white/5 text-white/65";
  }
}

function getDotClasses(health: Health) {
  switch (health) {
    case "ok":
      return "bg-emerald-300";
    case "warn":
      return "bg-amber-300";
    case "down":
      return "bg-rose-300";
    default:
      return "bg-white/45";
  }
}

export default function StatusPage() {
  const { data, isLoading, mutate } = useSWR<StatusResponse>(
    "/api/v1/status",
    fetchAPI,
    {
      refreshInterval: 3000,
    },
  );

  const databaseHealth = getDatabaseHealth(data, isLoading);

  const updatedAtText =
    !isLoading && data?.updated_at
      ? new Date(data.updated_at).toLocaleString("pt-BR")
      : "Carregando...";

  function handleRefresh() {
    mutate();
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
            steam asc
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-white/38">
                monitoramento • status • database
              </p>

              <h1 className="max-w-4xl pb-1 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                Acompanhe o status
                <span className="block bg-[linear-gradient(180deg,#ffffff_0%,#d3ecff_36%,#7ed3ff_100%)] bg-clip-text text-transparent">
                  da aplicação.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62 sm:text-base">
                Veja rapidamente a saúde do banco de dados, conexões abertas e o
                último momento em que a aplicação respondeu com sucesso.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(20,33,46,0.96),rgba(14,23,32,0.98))] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-5">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_38%,transparent_74%,rgba(125,211,252,0.04))]" />

              <div className="relative flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-[#17324a] shadow-[0_12px_30px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <ServerCog className="h-5 w-5 text-sky-100" />
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                    monitoramento
                  </p>
                  <p className="text-base font-medium text-white sm:text-lg">
                    Verificação automática a cada 3s
                  </p>
                </div>
              </div>

              <p className="relative mt-3 text-sm leading-6 text-white/58">
                O painel atualiza sozinho e também permite atualização manual
                para confirmar o estado atual da aplicação.
              </p>
            </div>
          </div>
        </header>

        <section className="mt-5 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,27,37,0.94),rgba(12,20,28,0.98))] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                  Última atualização
                </p>
                <strong className="mt-2 block text-lg font-semibold tracking-[-0.03em] text-white sm:text-xl">
                  {updatedAtText}
                </strong>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                title="Atualizar agora"
                className="inline-flex h-12 items-center justify-center gap-2 self-start rounded-xl border border-sky-300/30 bg-[linear-gradient(180deg,#2379ad_0%,#184f73_100%)] px-5 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(10,31,48,0.42),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:-translate-y-0.5 hover:brightness-110"
              >
                <RefreshCcw className="h-4 w-4" />
                Atualizar
              </button>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,27,37,0.94),rgba(12,20,28,0.98))] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-5">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${getBadgeClasses(
                  databaseHealth,
                )}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${getDotClasses(databaseHealth)}`}
                  aria-hidden="true"
                />
                {getHealthLabel(databaseHealth)}
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">
              Database
            </h2>

            <p className="mt-2 text-sm leading-7 text-white/58">
              Status consolidado da conexão principal usada pela aplicação.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,27,37,0.95),rgba(12,20,28,0.985))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-[#17324a] shadow-[0_12px_30px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)]">
              <Database className="h-5 w-5 text-sky-100" />
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                dependência monitorada
              </p>
              <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">
                Banco de dados
              </h3>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="min-h-[118px] animate-pulse rounded-xl border border-white/8 bg-[#0d1822]" />
              <div className="min-h-[118px] animate-pulse rounded-xl border border-white/8 bg-[#0d1822]" />
              <div className="min-h-[118px] animate-pulse rounded-xl border border-white/8 bg-[#0d1822]" />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="relative flex min-h-[118px] flex-col justify-between overflow-hidden rounded-xl border border-white/8 bg-[linear-gradient(180deg,#0f1b26_0%,#0c1620_100%)] p-4 shadow-[0_14px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%,transparent_75%,rgba(125,211,252,0.03))]" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/8 bg-[#152738] text-sky-100">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="relative mt-5">
                  <span className="min-h-[32px] text-[10px] uppercase leading-4 tracking-[0.16em] text-white/35">
                    Versão
                  </span>
                  <strong className="mt-3 block text-[1.2rem] font-semibold leading-none text-white">
                    {data?.dependencies?.database?.version ?? "—"}
                  </strong>
                </div>
              </div>

              <div className="relative flex min-h-[118px] flex-col justify-between overflow-hidden rounded-xl border border-white/8 bg-[linear-gradient(180deg,#0f1b26_0%,#0c1620_100%)] p-4 shadow-[0_14px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%,transparent_75%,rgba(125,211,252,0.03))]" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/8 bg-[#152738] text-sky-100">
                  <Database className="h-4 w-4" />
                </div>
                <div className="relative mt-5">
                  <span className="min-h-[32px] text-[10px] uppercase leading-4 tracking-[0.16em] text-white/35">
                    Conexões abertas
                  </span>
                  <strong className="mt-3 block text-[1.2rem] font-semibold leading-none text-white">
                    {data?.dependencies?.database?.opened_connections ?? "—"}
                  </strong>
                </div>
              </div>

              <div className="relative flex min-h-[118px] flex-col justify-between overflow-hidden rounded-xl border border-white/8 bg-[linear-gradient(180deg,#0f1b26_0%,#0c1620_100%)] p-4 shadow-[0_14px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%,transparent_75%,rgba(125,211,252,0.03))]" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/8 bg-[#152738] text-sky-100">
                  <ServerCog className="h-4 w-4" />
                </div>
                <div className="relative mt-5">
                  <span className="min-h-[32px] text-[10px] uppercase leading-4 tracking-[0.16em] text-white/35">
                    Conexões máximas
                  </span>
                  <strong className="mt-3 block text-[1.2rem] font-semibold leading-none text-white">
                    {data?.dependencies?.database?.max_connections ?? "—"}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
