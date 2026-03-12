// components/ui/site-header.tsx
"use client";

import { Trophy } from "lucide-react";
import Link from "next/link";

const navItems = [
  { href: "/", label: "Início" },
  { href: "/steam_games", label: "Jogos Para 100%" },
  { href: "/user", label: "Usuário" },
  { href: "/status", label: "Status" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[rgba(8,15,22,0.72)] backdrop-blur-2xl">
      <div className="mx-auto flex h-16 w-full max-w-[1560px] items-center justify-between px-4 sm:px-6 lg:px-8 2xl:px-10">
        <Link
          href="/"
          className="group inline-flex items-center gap-3 text-white transition hover:opacity-100"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-300/15 bg-[linear-gradient(180deg,#163246_0%,#101b25_100%)] shadow-[0_10px_24px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.05)]">
            <Trophy className="h-4 w-4 text-sky-200" />
          </div>

          <div className="leading-tight">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/35">
              Steam ASC
            </p>
            <p className="text-sm font-semibold tracking-[-0.03em] text-white/92">
              Jogos, conquistas e 100%
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex h-10 items-center rounded-lg border border-transparent px-4 text-sm font-medium text-white/68 transition hover:border-white/8 hover:bg-white/[0.04] hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="/steam_games"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-sky-300/20 bg-[linear-gradient(180deg,#2379ad_0%,#184f73_100%)] px-4 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(10,31,48,0.36),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:brightness-110"
        >
          Ver ranking
        </a>
      </div>
    </header>
  );
}
