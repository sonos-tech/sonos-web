"use client";

import { Header } from "./Header";
import { Player } from "@/components/Player";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full">
      <Header />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 pb-24">
        {children}
      </main>
      <Player />
    </div>
  );
}
