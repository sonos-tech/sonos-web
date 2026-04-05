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
  idle: { label: "", color: "", glow: "" },
  staking: { label: "Staking", color: "text-amber-400", glow: "bg-amber-400" },
  preview: { label: "Preview", color: "text-blue-400", glow: "bg-blue-400" },
  confirming: { label: "Confirming", color: "text-amber-400", glow: "bg-amber-400" },
  full: { label: "Full Quality", color: "text-emerald-400", glow: "bg-emerald-400" },
} as const;

export function Player() {
  const { state, currentSong, skip, pause, resume, audioRef } =
    usePlayerContext();
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(true);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (localAudioRef.current) {
      (audioRef as React.MutableRefObject<HTMLAudioElement | null>).current =
        localAudioRef.current;
    }
  }, [audioRef]);

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

  const isLoading = state === "staking" || state === "confirming";
  const cfg = STATE_CONFIG[state];
  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <>
      <audio ref={localAudioRef} />

      {state !== "idle" && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-fade-in-up">
          {/* Progress bar */}
          <div
            ref={progressBarRef}
            onClick={handleSeek}
            className="h-1 bg-white/[0.06] cursor-pointer group relative"
          >
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-[width] duration-200 relative"
              style={{ width: `${pct}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-violet-500/30" />
            </div>
          </div>

          <div className="bg-background/90 backdrop-blur-xl border-t border-white/[0.06] px-4 sm:px-6 py-3 flex items-center gap-4">
            {/* Song info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {currentSong?.title ?? "..."}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {isLoading && (
                  <span className="inline-block w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                )}
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${cfg.glow} ${state === "full" ? "" : "animate-pulse"}`} />
                  <span className={`text-xs font-medium ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
                {state === "preview" && (
                  <span className="text-[10px] text-muted px-1.5 py-0.5 rounded bg-white/[0.04]">
                    free until 0:20
                  </span>
                )}
              </div>
            </div>

            {/* Time */}
            <span className="hidden sm:block text-xs text-muted tabular-nums w-24 text-right font-mono">
              {formatTime(progress)} / {formatTime(duration)}
            </span>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => (paused ? resume() : pause())}
                disabled={isLoading}
                className="rounded-full bg-white text-black w-10 h-10 flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-white/10"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                ) : paused ? (
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor" className="ml-0.5">
                    <path d="M0 0L14 8L0 16V0Z" />
                  </svg>
                ) : (
                  <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
                    <rect width="4" height="14" rx="1" />
                    <rect x="8" width="4" height="14" rx="1" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={skip}
                title="Stop"
                className="rounded-full bg-white/[0.06] text-muted w-10 h-10 flex items-center justify-center hover:bg-white/[0.1] hover:text-foreground transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1.7 1.7L12.3 12.3M12.3 1.7L1.7 12.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
