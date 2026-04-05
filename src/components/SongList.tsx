"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Song } from "@/lib/types";
import { usePlayerContext } from "@/providers/PlayerProvider";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatSonos(amount: number): string {
  return `${(amount / 100).toFixed(0)}`;
}

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function SongList({
  onPlay,
}: {
  onPlay?: (song: Song) => void;
}) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentSong, state } = usePlayerContext();

  useEffect(() => {
    api
      .getSongs()
      .then(setSongs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <span className="inline-block w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-muted text-sm">Loading songs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <p className="text-red-400 text-sm font-medium">Failed to load songs</p>
        <p className="text-muted text-xs">{error}</p>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
            <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-foreground font-medium">No songs yet</p>
          <p className="text-muted text-sm mt-1">Be the first to upload!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Column headers */}
      <div className="flex items-center gap-4 px-4 py-2 text-xs text-muted uppercase tracking-wider">
        <span className="w-10 text-center">#</span>
        <span className="flex-1">Title</span>
        <span className="hidden sm:block w-20 text-right">Duration</span>
        <span className="w-20 text-right">Price</span>
      </div>
      <div className="h-px bg-white/[0.06] mx-4" />

      {songs.map((song, idx) => {
        const isActive = currentSong?.song_id === song.song_id;
        const isPlaying = isActive && state !== "idle";

        return (
          <button
            key={song.song_id}
            type="button"
            onClick={() => onPlay?.(song)}
            className={`group w-full text-left flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200 ${
              isActive
                ? "bg-violet-500/10 border border-violet-500/20"
                : "hover:bg-white/[0.04] border border-transparent"
            }`}
            style={{ animationDelay: `${idx * 30}ms` }}
          >
            {/* Index / Play indicator */}
            <div className="w-10 flex items-center justify-center flex-shrink-0">
              {isPlaying ? (
                <div className="flex items-end gap-[3px] h-4">
                  <span className="w-[3px] bg-violet-400 rounded-full eq-bar-1" style={{ height: "30%" }} />
                  <span className="w-[3px] bg-violet-400 rounded-full eq-bar-2" style={{ height: "100%" }} />
                  <span className="w-[3px] bg-violet-400 rounded-full eq-bar-3" style={{ height: "60%" }} />
                </div>
              ) : (
                <>
                  <span className="text-sm text-muted tabular-nums group-hover:hidden">
                    {idx + 1}
                  </span>
                  <svg width="14" height="16" viewBox="0 0 14 16" className="hidden group-hover:block fill-foreground ml-0.5">
                    <path d="M0 0L14 8L0 16V0Z" />
                  </svg>
                </>
              )}
            </div>

            {/* Song info */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isActive ? "text-violet-400" : "text-foreground"}`}>
                {song.title}
              </p>
              <p className="text-xs text-muted truncate mt-0.5">
                {truncateAddress(song.artist)}
                {song.genre && (
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-white/[0.04] text-muted/70 text-[10px] uppercase tracking-wider">
                    {song.genre}
                  </span>
                )}
              </p>
            </div>

            {/* Duration */}
            <span className="hidden sm:block text-xs text-muted tabular-nums w-20 text-right">
              {formatDuration(song.duration)}
            </span>

            {/* Buyout price */}
            <span className="text-xs tabular-nums w-20 text-right">
              <span className="text-muted">{formatSonos(song.buyout_price)}</span>
              <span className="text-violet-400/60 ml-0.5">S</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
