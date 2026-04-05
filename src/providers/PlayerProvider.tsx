"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import type { Song, PlayState } from "@/lib/types";

type PlayerContextType = {
  state: PlayState;
  currentSong: Song | null;
  play: (song: Song) => Promise<void>;
  skip: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const player = usePlayer();
  return (
    <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>
  );
}

export function usePlayerContext(): PlayerContextType {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayerContext must be used within PlayerProvider");
  return ctx;
}
