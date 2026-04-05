"use client";

import { useState, useRef } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/providers/ToastProvider";

export default function UploadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [buyoutPrice, setBuyoutPrice] = useState("5000");
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      if (audio.duration && Number.isFinite(audio.duration)) {
        setDuration(Math.round(audio.duration));
      }
      URL.revokeObjectURL(url);
    };
    audio.onerror = () => URL.revokeObjectURL(url);
    audio.src = url;
    if (!title) {
      const name = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      setTitle(name);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast("Please select an audio file");
      return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("title", title);
    if (genre) form.append("genre", genre);
    if (duration) form.append("duration", String(duration));
    form.append("buyoutPrice", buyoutPrice);

    setUploading(true);
    try {
      await api.uploadSong(form);
      toast("Song uploaded successfully!", "success");
      router.push("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      if (msg.includes("INSUFFICIENT") || msg.includes("balance") || msg.includes("allowance")) {
        toast("Insufficient SONOS tokens to upload (costs 10 SONOS)");
      } else if (msg.includes("Network error")) {
        toast("Could not reach server — check your connection");
      } else {
        toast(msg);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Upload Song</h1>
        <p className="text-sm text-muted mt-1">Share your music on-chain. Costs 10 SONOS.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* File drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          className="relative group cursor-pointer rounded-2xl border-2 border-dashed border-white/[0.08] hover:border-violet-500/30 bg-white/[0.02] hover:bg-violet-500/[0.03] transition-all p-8 text-center"
        >
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            {fileName ? (
              <>
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-violet-400">
                    <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">{fileName}</p>
                  {duration !== null && (
                    <p className="text-xs text-muted mt-1">
                      {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")} duration
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted">Click to change file</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center group-hover:bg-violet-500/10 transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted group-hover:text-violet-400 transition-colors">
                    <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0-12L8 8m4-4l4 4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Choose audio file</p>
                  <p className="text-xs text-muted mt-0.5">MP3, WAV, FLAC, OGG</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Song title"
            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm placeholder:text-muted/50 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all"
          />
        </div>

        {/* Genre */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Genre <span className="text-muted font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="e.g. Electronic, Hip-Hop, Jazz"
            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm placeholder:text-muted/50 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all"
          />
        </div>

        {/* Buyout Price */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Buyout Price</label>
          <div className="relative">
            <input
              type="number"
              value={buyoutPrice}
              onChange={(e) => setBuyoutPrice(e.target.value)}
              required
              min="5000"
              placeholder="5000"
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 pr-16 text-sm placeholder:text-muted/50 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted">SONOS</span>
          </div>
          <p className="text-xs text-muted">Min 5,000 units (50 SONOS). Listeners can buy exclusive access.</p>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading (this takes ~2 min)...
            </span>
          ) : (
            "Upload Song"
          )}
        </button>
      </form>
    </div>
  );
}
