// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import SteamBackground from "./components/ui/steam-background";
import SiteHeader from "./components/ui/site-header";

export const metadata: Metadata = {
  title: "Steam ASC",
  description: "Sua central para jogos, conquistas e 100% na Steam.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#0b141d] text-white antialiased">
        <div className="relative min-h-screen overflow-hidden">
          <SteamBackground />
          <div className="relative z-10">
            <SiteHeader />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
