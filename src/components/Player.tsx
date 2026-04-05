"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { usePlayerContext } from "@/providers/PlayerProvider";

function formatTime(s: number): string {
  if (!s || !Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const STATE_CONFIG = {
  idle: { label: "", color: "", icon: "" },
  staking: { label: "Staking", color: "text-amber-400", icon: "" },
  preview: { label: "Preview", color: "text-blue-400", icon: "" },
  confirming: { label: "Confirming payment", color: "text-amber-400", icon: "" },
  full: { label: "Full quality", color: "text-emerald-400", icon: "" },
} as const;

export function Player() {
  const { state, currentSong, skip, pause, resume, audioRef } =
    usePlayerContext();
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(true);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Sync refs
  useEffect(() => {
    if (localAudioRef.current) {
      (audioRef as React.MutableRefObject<HTMLAudioElement | null>).current =
        localAudioRef.current;
    }
  }, [audioRef]);

  // Track progress + play state
  useEffect(() => {
    const audio = localAudioRef.current;
    if (!audio) return;

    const onTime = () => setProgress(audio.currentTime);
    const onDur = () => setDuration(audio.duration || 0);
    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("durationchange", onDur);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("durationchange", onDur);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressBarRef.current;
      const audio = localAudioRef.current;
      if (!bar || !audio || !duration) return;
      const rect = bar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.currentTime = pct * duration;
    },
    [duration],
  );

  if (state === "idle") return null;

  const isLoading = state === "staking" || state === "confirming";
  const cfg = STATE_CONFIG[state];
  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Progress bar — clickable, sits on top edge */}
      <div
        ref={progressBarRef}
        onClick={handleSeek}
        className="h-1.5 bg-zinc-800 cursor-pointer group relative"
      >
        <div
          className="h-full bg-white/90 transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
        {/* Hover thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${pct}%`, marginLeft: "-6px" }}
        />
      </div>

      <div className="bg-zinc-950 text-white px-4 py-3 flex items-center gap-4">
        <audio ref={localAudioRef} />

        {/* Song info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {currentSong?.title ?? "..."}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {isLoading && (
              <span className="inline-block w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            )}
            <span className={`text-xs font-medium ${cfg.color}`}>
              {cfg.label}
            </span>
            {state === "preview" && (
              <span className="text-xs text-zinc-500">
                (free until 0:20)
              </span>
            )}
          </div>
        </div>

        {/* Time */}
        <span className="text-xs text-zinc-500 tabular-nums w-20 text-right">
          {formatTime(progress)} / {formatTime(duration)}
        </span>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => (paused ? resume() : pause())}
            disabled={isLoading}
            className="rounded-full bg-white text-black w-9 h-9 flex items-center justify-center hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
            ) : paused ? (
              <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
                <path d="M0 0L14 8L0 16V0Z" />
              </svg>
            ) : (
              <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
                <rect width="4" height="14" />
                <rect x="8" width="4" height="14" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={skip}
            title="Stop"
            className="rounded-full bg-zinc-800 text-zinc-400 w-9 h-9 flex items-center justify-center hover:bg-zinc-700 hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M1.7 1.7L12.3 12.3M12.3 1.7L1.7 12.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
