"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { api } from "@/lib/api";
import { config } from "@/lib/config";
import { useToast } from "@/providers/ToastProvider";

export default function BuyPage() {
  const { primaryWallet } = useDynamicContext();
  const { toast } = useToast();
  const [ethAmount, setEthAmount] = useState("");
  const [buying, setBuying] = useState(false);

  const sonosEstimate = ethAmount ? (parseFloat(ethAmount) * 10000000 / 100).toFixed(0) : null;

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();

    if (!primaryWallet) {
      toast("No wallet connected");
      return;
    }

    setBuying(true);
    try {
      const walletClient = await (primaryWallet as any).getWalletClient();
      const txHash = await walletClient.sendTransaction({
        to: config.platformEthAddress as `0x${string}`,
        value: parseEther(ethAmount),
      });

      const resp = await api.buySonos(txHash, ethAmount);
      toast(`Received ${resp.sonos_minted / 100} SONOS!`, "success");
      setEthAmount("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Purchase failed";
      if (msg.includes("insufficient funds")) {
        toast("Insufficient ETH in your wallet");
      } else if (msg.includes("User rejected")) {
        toast("Transaction cancelled", "info");
      } else {
        toast(msg);
      }
    } finally {
      setBuying(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Buy SONOS</h1>
        <p className="text-sm text-muted mt-1">Swap ETH for SONOS tokens to stream and own music</p>
      </div>

      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 space-y-6">
        <form onSubmit={handleBuy} className="space-y-5">
          {/* ETH Input */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm">
              <span className="font-medium">You pay</span>
              <span className="text-muted text-xs">Sepolia ETH</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                placeholder="0.01"
                required
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-lg font-medium placeholder:text-muted/30 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.06]">
                <div className="w-4 h-4 rounded-full bg-blue-400/20 flex items-center justify-center">
                  <svg width="8" height="12" viewBox="0 0 8 14" fill="currentColor" className="text-blue-400">
                    <path d="M4 0L0 7.1L4 9.6L8 7.1L4 0ZM0 7.9L4 14L8 7.9L4 10.4L0 7.9Z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">ETH</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
            </div>
          </div>

          {/* SONOS Output */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm">
              <span className="font-medium">You receive</span>
              <span className="text-muted text-xs">SONOS tokens</span>
            </label>
            <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 flex items-center justify-between">
              <span className={`text-lg font-medium ${sonosEstimate ? "text-foreground" : "text-muted/30"}`}>
                {sonosEstimate ?? "0"}
              </span>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-violet-500/10">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                <span className="text-sm font-medium text-violet-400">SONOS</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={buying}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
          >
            {buying ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              "Swap ETH for SONOS"
            )}
          </button>
        </form>

        {/* Info */}
        <div className="pt-4 border-t border-white/[0.06] space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted">Rate</span>
            <span>1 ETH = 100,000 SONOS</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted">Network</span>
            <span>Sepolia Testnet</span>
          </div>
        </div>
      </div>
    </div>
  );
}
