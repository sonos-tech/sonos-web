"use client";

import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useAuth } from "@/hooks/useAuth";
import { SongList } from "@/components/SongList";

export default function Home() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="flex flex-col flex-1 w-full max-w-3xl mx-auto px-4 py-8 gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">SONOS</h1>
          <DynamicWidget />
        </div>
        <SongList />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-1 w-full max-w-lg flex-col items-center justify-center gap-8 px-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold tracking-tight">SONOS</h1>
          <p className="text-lg text-zinc-500">
            Decentralized music streaming. Listen, earn, own.
          </p>
        </div>
        <DynamicWidget />
        <p className="text-sm text-zinc-400 text-center max-w-sm">
          Connect your wallet to start listening. Every play rewards artists
          directly on-chain.
        </p>
      </main>
    </div>
  );
}
