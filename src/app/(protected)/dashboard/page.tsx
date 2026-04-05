"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { walletAddress } = useAuth();
  const [balance, setBalance] = useState<{ balance: number; formatted: string } | null>(null);
  const [cashoutAmount, setCashoutAmount] = useState("");
  const [cashing, setCashing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getBalance().then(setBalance).catch(() => {});
  }, []);

  async function handleCashout(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setCashing(true);
    try {
      const resp = await api.cashout(parseInt(cashoutAmount, 10));
      setMessage(`Sent ${resp.eth_sent} ETH (tx: ${resp.tx_hash.slice(0, 10)}...)`);
      setCashoutAmount("");
      // Refresh balance
      api.getBalance().then(setBalance).catch(() => {});
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Cashout failed");
    } finally {
      setCashing(false);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-lg font-semibold mb-2">Balance</h2>
        <p className="text-3xl font-bold">
          {balance ? balance.formatted : "Loading..."}
        </p>
        <p className="text-sm text-zinc-500 mt-1">
          Wallet: {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "..."}
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-lg font-semibold mb-4">Cashout SONOS</h2>
        <form onSubmit={handleCashout} className="flex gap-3">
          <input
            type="number"
            value={cashoutAmount}
            onChange={(e) => setCashoutAmount(e.target.value)}
            placeholder="Amount (internal units)"
            required
            min="1"
            className="flex-1 rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            disabled={cashing}
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-300"
          >
            {cashing ? "..." : "Cashout"}
          </button>
        </form>
        {message && <p className="text-sm mt-2 text-zinc-500">{message}</p>}
      </div>
    </div>
  );
}
