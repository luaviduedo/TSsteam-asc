"use client";

type LoadingScreenProps = {
  title?: string;
  description?: string;
  fullscreen?: boolean;
  showCards?: boolean;
  cardCount?: number;
  compact?: boolean;
  className?: string;
};

function buildCardIndexes(cardCount: number) {
  const indexes: number[] = [];

  for (let index = 0; index < cardCount; index += 1) {
    indexes.push(index);
  }

  return indexes;
}

export default function LoadingScreen({
  title = "Carregando",
  description = "Aguarde enquanto buscamos as informações.",
  fullscreen = false,
  showCards = true,
  cardCount = 4,
  compact = false,
  className = "",
}: LoadingScreenProps) {
  const safeCardCount = cardCount > 0 ? cardCount : 4;
  const cardIndexes = buildCardIndexes(safeCardCount);

  return (
    <section
      className={[
        "relative overflow-hidden rounded-[28px] border border-white/8",
        "bg-[linear-gradient(180deg,rgba(17,28,39,0.96),rgba(11,20,29,0.965))]",
        "shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl",
        fullscreen
          ? "flex min-h-screen w-full items-center justify-center px-4 py-8"
          : "w-full p-5 sm:p-6",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_24%,transparent_78%,rgba(125,211,252,0.04))]" />
      <div className="pointer-events-none absolute right-[-90px] top-[-90px] h-[220px] w-[220px] rounded-full bg-sky-400/8 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-80px] left-[28%] h-[180px] w-[180px] rounded-full bg-blue-400/8 blur-[90px]" />

      <div className="relative w-full">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute h-20 w-20 rounded-full border border-sky-300/10 bg-sky-300/5" />
            <div className="h-14 w-14 animate-spin rounded-full border-2 border-white/10 border-t-sky-300 shadow-[0_0_30px_rgba(125,211,252,0.18)]" />
            <div className="absolute h-3 w-3 rounded-full bg-sky-200 shadow-[0_0_18px_rgba(186,230,253,0.8)]" />
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-100">
            steam asc
          </div>

          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
            {title}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
            {description}
          </p>
        </div>

        {showCards && (
          <div
            className={[
              "mt-8 grid gap-5",
              compact
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1 md:grid-cols-2 2xl:grid-cols-4",
            ].join(" ")}
          >
            {cardIndexes.map((cardIndex) => (
              <article
                key={cardIndex}
                className="relative overflow-hidden rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,27,37,0.95),rgba(12,20,28,0.985))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)]"
              >
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_26%,transparent_74%,rgba(125,211,252,0.03))]" />

                <div className="relative">
                  <div className="h-[170px] animate-pulse rounded-xl bg-white/5" />

                  <div className="mt-5 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="h-6 w-24 animate-pulse rounded-md bg-white/5" />
                      <div className="h-6 w-20 animate-pulse rounded-full bg-sky-300/10" />
                    </div>

                    <div className="h-7 w-3/4 animate-pulse rounded-md bg-white/5" />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-24 animate-pulse rounded-xl bg-white/5" />
                      <div className="h-24 animate-pulse rounded-xl bg-white/5" />
                      <div className="h-24 animate-pulse rounded-xl bg-white/5" />
                      <div className="h-24 animate-pulse rounded-xl bg-white/5" />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
