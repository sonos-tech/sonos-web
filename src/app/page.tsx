"use client";

import { useState, useEffect } from "react";
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
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-28">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Listen Now</h1>
          <p className="text-sm text-muted mt-1">Every play rewards artists directly on-chain</p>
        </div>
        <SongList onPlay={play} />
      </div>
      <Player />
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[128px] pointer-events-none" />

        <main className="relative flex flex-1 w-full max-w-lg flex-col items-center justify-center gap-10 px-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Built on Hedera &amp; 0G Storage
            </div>
            <h1 className="text-6xl sm:text-7xl font-bold tracking-tighter gradient-text">
              SONOS
            </h1>
            <p className="text-lg text-muted max-w-sm mx-auto leading-relaxed">
              Decentralized music streaming.<br />
              <span className="text-foreground font-medium">Listen. Earn. Own.</span>
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <DynamicWidget />
          </div>

          <p className="text-sm text-muted/60 text-center max-w-xs leading-relaxed">
            Connect your wallet to start listening. Every play rewards artists directly on-chain.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {["Stream Music", "Earn Rewards", "Own Songs", "Zero Fees"].map((f) => (
              <span key={f} className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.04] border border-white/[0.06] text-muted">
                {f}
              </span>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <PlayerProvider>
      <AuthenticatedHome />
    </PlayerProvider>
  );
}
