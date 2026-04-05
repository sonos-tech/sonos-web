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
      <div className="flex items-center justify-center py-16">
        <span className="inline-block w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-zinc-500 text-sm">Loading songs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <p className="text-red-400 text-sm">Failed to load songs</p>
        <p className="text-zinc-500 text-xs">{error}</p>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <p className="text-zinc-400 text-lg">No songs yet</p>
        <p className="text-zinc-500 text-sm">Be the first to upload!</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {songs.map((song) => {
        const isActive = currentSong?.song_id === song.song_id;
        const isPlaying = isActive && state !== "idle";

        return (
          <button
            key={song.song_id}
            type="button"
            onClick={() => onPlay?.(song)}
            className={`w-full text-left flex items-center gap-4 rounded-lg px-4 py-3 transition-colors ${
              isActive
                ? "bg-zinc-100 dark:bg-zinc-800/80"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
            }`}
          >
            {/* Play indicator / number */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-zinc-900 dark:bg-white">
              {isPlaying ? (
                <div className="flex items-end gap-[2px] h-3">
                  <span className="w-[3px] bg-white dark:bg-black rounded-full animate-pulse h-2" style={{ animationDelay: "0ms" }} />
                  <span className="w-[3px] bg-white dark:bg-black rounded-full animate-pulse h-3" style={{ animationDelay: "150ms" }} />
                  <span className="w-[3px] bg-white dark:bg-black rounded-full animate-pulse h-1.5" style={{ animationDelay: "300ms" }} />
                </div>
              ) : (
                <svg width="12" height="14" viewBox="0 0 12 14" className="ml-0.5 fill-white dark:fill-black">
                  <path d="M0 0L12 7L0 14V0Z" />
                </svg>
              )}
            </div>

            {/* Song info */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isActive ? "text-black dark:text-white" : ""}`}>
                {song.title}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                {truncateAddress(song.artist)}
                {song.genre && <span className="text-zinc-400"> / {song.genre}</span>}
              </p>
            </div>

            {/* Duration */}
            <span className="text-xs text-zinc-500 tabular-nums">
              {formatDuration(song.duration)}
            </span>

            {/* Buyout price */}
            <span className="text-xs text-zinc-400 tabular-nums w-16 text-right">
              {formatSonos(song.buyout_price)} S
            </span>
          </button>
        );
      })}
    </div>
  );
}
