"use client";

import {
  Activity,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";

const highlightCards = [
  {
    title: "Jogos para 100%",
    description:
      "Descubra títulos mais viáveis para completar conquistas e buscar o 100%.",
    icon: Trophy,
  },
  {
    title: "Perfil Steam",
    description:
      "Consulte dados públicos do jogador e visualize rapidamente informações importantes.",
    icon: ShieldCheck,
  },
  {
    title: "Status da aplicação",
    description:
      "Veja se a aplicação, rotas e integrações estão funcionando corretamente.",
    icon: Activity,
  },
];

const actionCards = [
  {
    href: "/steam_games",
    title: "Jogos Para 100%",
    description:
      "A principal rota para encontrar jogos mais viáveis de completar.",
    icon: Trophy,
    primary: true,
  },
  {
    href: "/users",
    title: "Ver usuários",
    description: "Vejo a lista de usuários salva no banco de dados.",
    icon: ShieldCheck,
  },
  {
    href: "/status",
    title: "Ver Status",
    description: "Cheque o funcionamento atual da aplicação.",
    icon: Activity,
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen w-full text-white">
      <section className="relative mx-auto flex min-h-screen w-full max-w-[1560px] flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8 2xl:px-10">
        <header className="relative grid gap-10 overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,28,39,0.94),rgba(11,20,29,0.965))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.26)] backdrop-blur-xl sm:p-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:shadow-[0_24px_90px_rgba(0,0,0,0.32)] lg:[perspective:1800px]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_24%,transparent_78%,rgba(125,211,252,0.04))]" />
          <div className="pointer-events-none absolute right-[-40px] top-[-40px] h-[160px] w-[160px] rounded-full bg-sky-400/8 blur-[60px] sm:h-[200px] sm:w-[200px] sm:blur-[80px] lg:right-[-80px] lg:top-[-80px] lg:h-[240px] lg:w-[240px] lg:blur-[100px]" />
          <div className="pointer-events-none absolute bottom-[-50px] left-[24%] h-[140px] w-[140px] rounded-full bg-blue-400/8 blur-[50px] sm:h-[170px] sm:w-[170px] sm:blur-[70px] lg:bottom-[-80px] lg:h-[200px] lg:w-[200px] lg:blur-[90px]" />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-300/15 bg-sky-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(34,119,180,0.14)]">
              <Sparkles className="h-4 w-4" />
              steam achievements
            </div>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-white/38">
              steam • biblioteca • 100%
            </p>

            <h1 className="max-w-4xl pb-1 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
              <span className="inline-block [text-shadow:0_10px_30px_rgba(0,0,0,0.35)]">
                Sua central para
              </span>
              <span className="block bg-[linear-gradient(180deg,#ffffff_0%,#d3ecff_36%,#7ed3ff_100%)] bg-clip-text text-transparent [text-shadow:0_14px_40px_rgba(77,177,255,0.16)]">
                Jogos, conquistas e 100%.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62 sm:text-base sm:leading-8">
              Explore perfis Steam, encontre jogos mais fáceis de completar e
              acompanhe o status da aplicação em uma interface inspirada na
              atmosfera da Steam da Valve.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/steam_games"
                className="group inline-flex h-14 items-center justify-center gap-3 rounded-md border border-sky-300/25 bg-[linear-gradient(180deg,#2379ad_0%,#184f73_100%)] px-6 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(10,31,48,0.42),inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110"
              >
                <span>Jogos Para 100%</span>
                <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/users"
                className="inline-flex h-14 items-center justify-center gap-3 rounded-md border border-white/8 bg-[#101923]/90 px-6 text-sm font-semibold text-white/88 shadow-[0_12px_32px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#152434]"
              >
                Ver Usuários
              </Link>

              <Link
                href="/status"
                className="inline-flex h-14 items-center justify-center gap-3 rounded-md border border-white/8 bg-[#101923]/90 px-6 text-sm font-semibold text-white/88 shadow-[0_12px_32px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#152434]"
              >
                Ver Status
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {highlightCards.map(({ title, description, icon: Icon }) => (
                <article
                  key={title}
                  className="group relative overflow-hidden rounded-xl border border-white/8 bg-[linear-gradient(180deg,rgba(18,28,39,0.94),rgba(12,20,28,0.98))] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-300 hover:-translate-y-1 hover:border-sky-300/15"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_35%,transparent_70%,rgba(125,211,252,0.03))]" />

                  <div className="relative flex h-11 w-11 items-center justify-center rounded-md border border-white/8 bg-[#152738] text-sky-100 shadow-[0_12px_30px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.03]">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h2 className="relative mt-4 text-lg font-medium tracking-[-0.04em] text-white">
                    {title}
                  </h2>

                  <p className="relative mt-2 text-sm leading-6 text-white/56">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-center lg:pl-4">
            <div className="relative w-full max-w-[420px]">
              <div className="pointer-events-none absolute -left-4 top-8 h-16 w-16 rounded-full bg-sky-300/8 blur-xl sm:-left-6 sm:h-20 sm:w-20 sm:blur-2xl lg:-left-10 lg:h-24 lg:w-24" />
              <div className="pointer-events-none absolute -right-4 bottom-10 h-16 w-16 rounded-full bg-cyan-200/8 blur-xl sm:-right-6 sm:h-20 sm:w-20 sm:blur-2xl lg:-right-10 lg:h-24 lg:w-24" />

              <div className="mb-3 flex justify-center lg:justify-start">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/15 bg-amber-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  Preview de resultado
                </div>
              </div>

              <div className="group relative w-full lg:[perspective:1800px]">
                <div className="pointer-events-none absolute inset-x-10 bottom-[-16px] h-10 rounded-full bg-black/35 blur-xl sm:inset-x-8 sm:bottom-[-20px] sm:h-12 sm:blur-2xl lg:bottom-[-24px] lg:h-14 lg:bg-black/50" />

                <div className="relative transition-transform duration-300 ease-out lg:[transform-style:preserve-3d] lg:duration-500 lg:group-hover:-translate-y-1 lg:group-hover:rotate-x-[3deg] lg:group-hover:rotate-y-[-7deg]">
                  <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[linear-gradient(135deg,rgba(125,211,252,0.08),transparent_25%,transparent_70%,rgba(255,255,255,0.03))] blur-md sm:blur-lg lg:blur-xl" />

                  <div className="relative overflow-hidden rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,27,37,0.95),rgba(12,20,28,0.985))] shadow-[0_18px_40px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.05)] lg:shadow-[0_28px_90px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.05)]">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_24%,transparent_72%,rgba(125,211,252,0.04))]" />

                    <div className="relative h-[190px] overflow-hidden">
                      <img
                        src="https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg"
                        alt="Elden Ring"
                        className="h-full w-full object-cover transition duration-500 lg:scale-[1.02] lg:duration-700 lg:group-hover:scale-[1.06]"
                        loading="eager"
                        decoding="async"
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
                            <span className="inline-flex items-center rounded-md border border-sky-300/15 bg-sky-300/10 px-2.5 py-1 text-xs font-semibold text-sky-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                              #21
                            </span>

                            <span className="inline-flex items-center rounded-md border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                              #1245620
                            </span>
                          </div>
                        </div>

                        <span className="inline-flex shrink-0 rounded-full border border-sky-400/15 bg-sky-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                          Fácil
                        </span>
                      </div>

                      <h3 className="min-h-[3rem] text-2xl font-semibold leading-8 tracking-[-0.04em] text-white [text-shadow:0_10px_30px_rgba(0,0,0,0.28)]">
                        ELDEN RING
                      </h3>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative flex min-h-[110px] flex-col justify-between overflow-hidden rounded-xl border border-white/8 bg-[linear-gradient(180deg,#0f1b26_0%,#0c1620_100%)] p-3.5 shadow-[0_10px_24px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.04)] lg:shadow-[0_14px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)] lg:transition lg:duration-300 lg:hover:border-sky-300/15">
                          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%,transparent_75%,rgba(125,211,252,0.03))]" />
                          <span className="relative min-h-[32px] text-[10px] uppercase leading-4 tracking-[0.16em] text-white/35">
                            Conquista mais difícil
                          </span>
                          <strong className="relative mt-4 block text-[1.35rem] font-semibold leading-none text-white">
                            10.30%
                          </strong>
                        </div>

                        <div className="relative flex min-h-[110px] flex-col justify-between overflow-hidden rounded-xl border border-white/8 bg-[linear-gradient(180deg,#0f1b26_0%,#0c1620_100%)] p-3.5 shadow-[0_10px_24px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.04)] lg:shadow-[0_14px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)] lg:transition lg:duration-300 lg:hover:border-sky-300/15">
                          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%,transparent_75%,rgba(125,211,252,0.03))]" />
                          <span className="relative min-h-[32px] text-[10px] uppercase leading-4 tracking-[0.16em] text-white/35">
                            Tempo jogado
                          </span>
                          <strong className="relative mt-4 block text-[1.35rem] font-semibold leading-none text-white">
                            149h 57min
                          </strong>
                        </div>

                        <div className="relative flex min-h-[110px] flex-col justify-between overflow-hidden rounded-xl border border-white/8 bg-[linear-gradient(180deg,#0f1b26_0%,#0c1620_100%)] p-3.5 shadow-[0_10px_24px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.04)] lg:shadow-[0_14px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)] lg:transition lg:duration-300 lg:hover:border-sky-300/15">
                          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%,transparent_75%,rgba(125,211,252,0.03))]" />
                          <span className="relative min-h-[32px] text-[10px] uppercase leading-4 tracking-[0.16em] text-white/35">
                            Conquistas totais
                          </span>
                          <strong className="relative mt-4 block text-[1.35rem] font-semibold leading-none text-white">
                            42
                          </strong>
                        </div>

                        <div className="relative flex min-h-[110px] flex-col justify-between overflow-hidden rounded-xl border border-white/8 bg-[linear-gradient(180deg,#0f1b26_0%,#0c1620_100%)] p-3.5 shadow-[0_10px_24px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.04)] lg:shadow-[0_14px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)] lg:transition lg:duration-300 lg:hover:border-sky-300/15">
                          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%,transparent_75%,rgba(125,211,252,0.03))]" />
                          <span className="relative min-h-[32px] text-[10px] uppercase leading-4 tracking-[0.16em] text-white/35">
                            Conquistas do jogador
                          </span>
                          <strong className="relative mt-4 block text-[1.35rem] font-semibold leading-none text-white">
                            42
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {actionCards.map(
            ({ href, title, description, icon: Icon, primary }) => (
              <Link
                key={title}
                href={href}
                className={`group relative overflow-hidden rounded-xl border p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 ${
                  primary
                    ? "border-sky-300/20 bg-[linear-gradient(180deg,#2379ad_0%,#184f73_100%)] text-white"
                    : "border-white/8 bg-[linear-gradient(180deg,rgba(17,27,37,0.94),rgba(12,20,28,0.96))] text-white hover:border-sky-300/15 hover:bg-[linear-gradient(180deg,rgba(21,34,47,0.98),rgba(14,23,32,0.98))]"
                }`}
              >
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_28%,transparent_72%,rgba(125,211,252,0.04))]" />

                <div className="relative flex h-12 w-12 items-center justify-center rounded-md border border-white/8 bg-[#152738] shadow-[0_12px_30px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.03]">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="relative mt-8">
                  <h3 className="text-xl font-medium tracking-[-0.04em]">
                    {title}
                  </h3>
                  <p
                    className={`mt-3 text-sm leading-7 ${
                      primary ? "text-white/84" : "text-white/56"
                    }`}
                  >
                    {description}
                  </p>
                </div>
              </Link>
            ),
          )}
        </section>
      </section>
    </main>
  );
}
