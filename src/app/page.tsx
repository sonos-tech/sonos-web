"use client";

import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";

export default function Home() {
  const { user } = useDynamicContext();

  if (user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Welcome to SONOS</h1>
          <p className="text-zinc-500">Loading your experience...</p>
          <DynamicWidget />
        </div>
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
