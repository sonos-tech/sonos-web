"use client";

import { Header } from "./Header";
import { Player } from "@/components/Player";
import { PlayerProvider } from "@/providers/PlayerProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PlayerProvider>
      <div className="flex flex-col min-h-full">
        <Header />
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-28">
          {children}
        </main>
        <Player />
      </div>
    </PlayerProvider>
  );
}
