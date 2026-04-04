import { getToken, clearToken } from "./auth";
import type { Song, AuthUser } from "./types";

function createApiClient(baseUrl: string) {
  async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
      ...(opts.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // Don't set Content-Type for FormData (browser sets boundary)
    if (!(opts.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${baseUrl}${path}`, { ...opts, headers });
    if (res.status === 401) {
      clearToken();
      throw new Error("Unauthorized");
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(body.error || res.statusText);
    }
    return res.json();
  }

  async function requestRaw(
    path: string,
    opts: RequestInit = {},
  ): Promise<Response> {
    const token = getToken();
    const headers: Record<string, string> = {
      ...(opts.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${baseUrl}${path}`, { ...opts, headers });
    if (res.status === 401) {
      clearToken();
      throw new Error("Unauthorized");
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(body.error || res.statusText);
    }
    return res;
  }

  return {
    getMe: () => request<AuthUser>("/api/auth/me"),
    getSongs: () => request<Song[]>("/api/songs"),
    getSong: (id: string) => request<Song>(`/api/songs/${id}`),
    getPreview: (id: string) => requestRaw(`/api/songs/${id}/preview`),

    stake: (songId: string) =>
      request<{ stakeId: string; buyout: boolean }>("/api/play/stake", {
        method: "POST",
        body: JSON.stringify({ song_id: songId }),
      }),
    confirmPlay: (stakeId: string) =>
      request<{ txId: string }>("/api/play/confirm", {
        method: "POST",
        body: JSON.stringify({ stakeId }),
      }),
    refundPlay: (stakeId: string) =>
      request<{ status: string }>("/api/play/refund", {
        method: "POST",
        body: JSON.stringify({ stakeId }),
      }),

    getBalance: () => request<{ balance: number; formatted: string }>("/api/balance"),

    uploadSong: (form: FormData) =>
      request<{ song_id: string }>("/api/upload", {
        method: "POST",
        body: form,
      }),

    buyout: (songId: string) =>
      request<{ txId: string }>(`/api/songs/${songId}/buyout`, {
        method: "POST",
      }),
    donate: (artistAddress: string, amount: number) =>
      request<{ txId: string }>("/api/donate", {
        method: "POST",
        body: JSON.stringify({ artist_address: artistAddress, amount }),
      }),

    buySonos: (txHash: string, ethAmount: string) =>
      request<{ sonos_minted: number }>("/api/swap/eth-to-sonos", {
        method: "POST",
        body: JSON.stringify({ tx_hash: txHash, eth_amount: ethAmount }),
      }),
    cashout: (sonosAmount: number) =>
      request<{ eth_sent: string; tx_hash: string }>("/api/swap/sonos-to-eth", {
        method: "POST",
        body: JSON.stringify({ sonos_amount: sonosAmount }),
      }),

    getFullSong: (id: string) => requestRaw(`/api/songs/${id}/full`),

    completeAd: () =>
      request<{ reward: number }>("/api/ads/complete", { method: "POST" }),
  };
}

import { config } from "./config";
export const api = createApiClient(config.apiUrl);
