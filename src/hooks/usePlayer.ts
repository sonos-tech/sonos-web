"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { Song, PlayState } from "@/lib/types";
import { useToast } from "@/providers/ToastProvider";

function friendlyError(msg: string): string {
  if (msg.includes("INSUFFICIENT_TOKEN_BALANCE"))
    return "Insufficient SONOS tokens to play. Buy SONOS first!";
  if (msg.includes("Unauthorized"))
    return "Session expired — please reconnect your wallet.";
  if (msg.includes("not onboarded"))
    return "Wallet not yet set up. Please wait a moment and try again.";
  if (msg.includes("allowance"))
    return "Token allowance too low. Please try again shortly.";
  return msg;
}

export function usePlayer() {
  const [state, setState] = useState<PlayState>("idle");
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [stakeId, setStakeId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const { toast } = useToast();

  // Cleanup blob URL
  const revokeBlobUrl = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    revokeBlobUrl();
    setState("idle");
    setCurrentSong(null);
    setStakeId(null);
    setConfirmed(false);
  }, [revokeBlobUrl]);

  const play = useCallback(
    async (song: Song) => {
      stop();
      setCurrentSong(song);
      setState("staking");

      try {
        // Stake
        const resp = await api.stake(song.song_id);
        setStakeId(resp.stakeId);

        if (resp.buyout) {
          // Owned song — go straight to full
          setState("full");
          const fullResp = await api.getFullSong(song.song_id);
          const blob = await fullResp.blob();
          revokeBlobUrl();
          const url = URL.createObjectURL(blob);
          blobUrlRef.current = url;
          if (audioRef.current) {
            audioRef.current.src = url;
            audioRef.current.play();
          }
          return;
        }

        // Load preview
        setState("preview");
        const previewResp = await api.getPreview(song.song_id);
        const previewBlob = await previewResp.blob();
        revokeBlobUrl();
        const previewUrl = URL.createObjectURL(previewBlob);
        blobUrlRef.current = previewUrl;
        if (audioRef.current) {
          audioRef.current.src = previewUrl;
          audioRef.current.play();
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Playback failed";
        toast(friendlyError(msg));
        stop();
      }
    },
    [stop, revokeBlobUrl, toast],
  );

  const skip = useCallback(async () => {
    if (stakeId && !confirmed) {
      // Refund the stake
      api.refundPlay(stakeId).catch(console.error);
    }
    stop();
  }, [stakeId, confirmed, stop]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play();
  }, []);

  // Handle timeupdate for confirm at 20s and switch to full at 30s
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = async () => {
      if (!currentSong || state !== "preview") return;

      const t = audio.currentTime;

      // Confirm at 20s
      if (t >= 20 && !confirmed && stakeId) {
        setConfirmed(true);
        setState("confirming");
        api.confirmPlay(stakeId).catch(console.error);
      }

      // Switch to full at 30s
      if (t >= 30 && confirmed) {
        setState("full");
        try {
          const resp = await api.getFullSong(currentSong.song_id);
          const blob = await resp.blob();
          revokeBlobUrl();
          const url = URL.createObjectURL(blob);
          blobUrlRef.current = url;
          const currentTime = audio.currentTime;
          audio.src = url;
          audio.currentTime = currentTime;
          audio.play();
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Full song load failed";
          toast(friendlyError(msg));
        }
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, [currentSong, state, confirmed, stakeId, revokeBlobUrl, toast]);

  return {
    state,
    currentSong,
    play,
    skip,
    pause,
    resume,
    audioRef,
  };
}
