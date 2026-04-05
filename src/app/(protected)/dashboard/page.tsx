"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/providers/ToastProvider";

export default function DashboardPage() {
  const { walletAddress } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState<{ balance: number; formatted: string } | null>(null);
  const [cashoutAmount, setCashoutAmount] = useState("");
  const [cashing, setCashing] = useState(false);

  useEffect(() => {
    api.getBalance().then(setBalance).catch(() => {});
  }, []);

  async function handleCashout(e: React.FormEvent) {
    e.preventDefault();
    setCashing(true);
    try {
      const resp = await api.cashout(parseInt(cashoutAmount, 10));
      toast(`Sent ${resp.eth_sent} ETH (tx: ${resp.tx_hash.slice(0, 10)}...)`, "success");
      setCashoutAmount("");
      api.getBalance().then(setBalance).catch(() => {});
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Cashout failed";
      if (msg.includes("INSUFFICIENT_TOKEN_BALANCE")) {
        toast("Insufficient SONOS balance to cash out");
      } else {
        toast(msg);
      }
    } finally {
      setCashing(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted mt-1">Manage your SONOS tokens and earnings</p>
      </div>

      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-transparent border border-violet-500/20 p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="text-sm text-muted font-medium mb-1">Total Balance</p>
          <p className="text-4xl font-bold tracking-tight">
            {balance ? (
              <>
                <span className="gradient-text">{balance.formatted}</span>
              </>
            ) : (
              <span className="inline-block w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            )}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span className="text-xs text-muted font-mono">
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "..."}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
          <p className="text-xs text-muted mb-1">Raw Balance</p>
          <p className="text-lg font-semibold tabular-nums">
            {balance ? balance.balance.toLocaleString() : "--"}
          </p>
          <p className="text-[10px] text-muted mt-0.5">internal units</p>
        </div>
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
          <p className="text-xs text-muted mb-1">ETH Value</p>
          <p className="text-lg font-semibold tabular-nums">
            {balance ? `~${(balance.balance / 10000000).toFixed(6)}` : "--"}
          </p>
          <p className="text-[10px] text-muted mt-0.5">estimated</p>
        </div>
      </div>

      {/* Cashout */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Cashout</h2>
            <p className="text-xs text-muted">Convert SONOS back to ETH (5% fee)</p>
          </div>
        </div>
        <form onSubmit={handleCashout} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="number"
              value={cashoutAmount}
              onChange={(e) => setCashoutAmount(e.target.value)}
              placeholder="Amount"
              required
              min="1"
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 pr-16 text-sm placeholder:text-muted/50 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">SONOS</span>
          </div>
          <button
            type="submit"
            disabled={cashing}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/10"
          >
            {cashing ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Cashout"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
