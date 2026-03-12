// components/ui/steam-background.tsx
"use client";

interface SteamBackgroundProps {
  animated?: boolean;
}

export default function SteamBackground({
  animated = true,
}: SteamBackgroundProps) {
  return (
    <>
      {animated ? (
        <style jsx>{`
          @keyframes steamFloatA {
            0% {
              transform: translate3d(0, 0, 0) scale(1);
            }
            50% {
              transform: translate3d(18px, -22px, 0) scale(1.06);
            }
            100% {
              transform: translate3d(0, 0, 0) scale(1);
            }
          }

          @keyframes steamFloatB {
            0% {
              transform: translate3d(0, 0, 0) scale(1);
            }
            50% {
              transform: translate3d(-22px, 18px, 0) scale(1.04);
            }
            100% {
              transform: translate3d(0, 0, 0) scale(1);
            }
          }

          @keyframes steamGridMove {
            0% {
              transform: translate3d(0, 0, 0);
            }
            100% {
              transform: translate3d(-52px, -52px, 0);
            }
          }

          @keyframes steamShine {
            0% {
              transform: translateX(-18%) translateY(0);
              opacity: 0.18;
            }
            50% {
              transform: translateX(8%) translateY(-1%);
              opacity: 0.28;
            }
            100% {
              transform: translateX(-18%) translateY(0);
              opacity: 0.18;
            }
          }
        `}</style>
      ) : null}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(25,84,122,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(85,182,255,0.10),transparent_30%),linear-gradient(180deg,#0b141d_0%,#0a1118_100%)]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.045]">
        <div
          className={`absolute -inset-[120px] [background-size:52px_52px] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] ${
            animated ? "[animation:steamGridMove_18s_linear_infinite]" : ""
          }`}
        />
      </div>

      <div
        className="pointer-events-none absolute left-[-140px] top-[80px] h-[360px] w-[360px] rounded-full bg-sky-400/10 blur-[130px]"
        style={
          animated
            ? { animation: "steamFloatA 16s ease-in-out infinite" }
            : undefined
        }
      />

      <div
        className="pointer-events-none absolute bottom-[-120px] right-[-60px] h-[320px] w-[320px] rounded-full bg-cyan-300/10 blur-[130px]"
        style={
          animated
            ? { animation: "steamFloatB 18s ease-in-out infinite" }
            : undefined
        }
      />

      <div
        className="pointer-events-none absolute left-[32%] top-[36%] h-[260px] w-[260px] rounded-full bg-blue-500/8 blur-[120px]"
        style={
          animated
            ? { animation: "steamFloatA 20s ease-in-out infinite" }
            : undefined
        }
      />

      <div
        className="pointer-events-none absolute inset-y-0 left-[-15%] w-[58%] bg-[linear-gradient(90deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02),transparent)] blur-2xl"
        style={
          animated
            ? { animation: "steamShine 12s ease-in-out infinite" }
            : undefined
        }
      />
    </>
  );
}
