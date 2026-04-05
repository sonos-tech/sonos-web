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
  const [duration, setDuration] = useState("");
  const [buyoutPrice, setBuyoutPrice] = useState("");
  const [uploading, setUploading] = useState(false);

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
    form.append("duration", duration);
    form.append("buyoutPrice", buyoutPrice);

    setUploading(true);
    try {
      await api.uploadSong(form);
      toast("Song uploaded successfully!", "success");
      router.push("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      if (msg.includes("INSUFFICIENT_TOKEN_BALANCE")) {
        toast("Insufficient SONOS tokens to upload (costs 10 SONOS)");
      } else {
        toast(msg);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Upload Song</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-1">Audio File</label>
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            className="block w-full text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Genre</label>
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Duration (seconds)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            min="1"
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Buyout Price (internal units, min 5000)
          </label>
          <input
            type="number"
            value={buyoutPrice}
            onChange={(e) => setBuyoutPrice(e.target.value)}
            required
            min="5000"
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="rounded bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-300"
        >
          {uploading ? "Uploading (this takes ~2 min)..." : "Upload"}
        </button>
      </form>
    </div>
  );
}
