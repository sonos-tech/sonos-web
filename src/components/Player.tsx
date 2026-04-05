"use client";

import { useRef, useEffect, useState } from "react";
import { usePlayerContext } from "@/providers/PlayerProvider";

export function Player() {
  const { state, currentSong, skip, pause, resume, audioRef } =
    usePlayerContext();
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Sync refs
  useEffect(() => {
    if (localAudioRef.current) {
      (audioRef as React.MutableRefObject<HTMLAudioElement | null>).current =
        localAudioRef.current;
    }
  }, [audioRef]);

  // Track progress
  useEffect(() => {
    const audio = localAudioRef.current;
    if (!audio) return;

    const onTime = () => setProgress(audio.currentTime);
    const onDur = () => setDuration(audio.duration || 0);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("durationchange", onDur);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("durationchange", onDur);
    };
  }, []);

  const stateLabel = {
    idle: "",
    staking: "Staking...",
    preview: "Preview",
    confirming: "Confirming...",
    full: "Full Quality",
  };

  if (state === "idle") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 text-white px-4 py-3 flex items-center gap-4 z-50">
      <audio ref={localAudioRef} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {currentSong?.title ?? "..."}
        </p>
        <p className="text-xs text-zinc-400">
          {stateLabel[state]}
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-white transition-all"
          style={{
            width: duration > 0 ? `${(progress / duration) * 100}%` : "0%",
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (localAudioRef.current?.paused) resume();
            else pause();
          }}
          className="rounded-full bg-white text-black w-8 h-8 flex items-center justify-center text-sm font-bold"
        >
          {localAudioRef.current?.paused ? "\u25B6" : "\u23F8"}
        </button>
        <button
          type="button"
          onClick={skip}
          className="rounded-full bg-zinc-700 text-white w-8 h-8 flex items-center justify-center text-sm"
        >
          \u23ED
        </button>
      </div>
    </div>
  );
}
