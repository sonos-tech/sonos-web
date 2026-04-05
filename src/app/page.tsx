"use client";

import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { SongList } from "@/components/SongList";
import { Player } from "@/components/Player";
import { Header } from "@/components/layout/Header";
import { PlayerProvider, usePlayerContext } from "@/providers/PlayerProvider";

function AuthenticatedHome() {
  const { play } = usePlayerContext();
  useWebSocket();

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 pb-24">
        <SongList onPlay={play} />
      </div>
      <Player />
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <PlayerProvider>
        <AuthenticatedHome />
      </PlayerProvider>
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
