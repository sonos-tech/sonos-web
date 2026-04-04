"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Song } from "@/lib/types";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatSonos(amount: number): string {
  return `${(amount / 100).toFixed(2)} SONOS`;
}

export function SongList({
  onPlay,
}: {
  onPlay?: (song: Song) => void;
}) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getSongs()
      .then(setSongs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-zinc-500">Loading songs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-zinc-500">No songs yet. Be the first to upload!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {songs.map((song) => (
        <div
          key={song.song_id}
          className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{song.title}</h3>
            <p className="text-sm text-zinc-500 truncate">
              {song.artist.slice(0, 6)}...{song.artist.slice(-4)}
              {song.genre && ` \u00B7 ${song.genre}`}
              {" \u00B7 "}
              {formatDuration(song.duration)}
            </p>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <span className="text-sm text-zinc-500">
              {formatSonos(song.buyout_price)}
            </span>
            <button
              type="button"
              onClick={() => onPlay?.(song)}
              className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-300"
            >
              Play
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
