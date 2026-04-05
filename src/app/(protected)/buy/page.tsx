"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { api } from "@/lib/api";
import { config } from "@/lib/config";

export default function BuyPage() {
  const { primaryWallet } = useDynamicContext();
  const [ethAmount, setEthAmount] = useState("");
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!primaryWallet) {
      setError("No wallet connected");
      return;
    }

    setBuying(true);
    try {
      // Send ETH to platform address via wallet
      const walletClient = await (primaryWallet as any).getWalletClient();
      const txHash = await walletClient.sendTransaction({
        to: config.platformEthAddress as `0x${string}`,
        value: parseEther(ethAmount),
      });

      // Submit to backend for verification + SONOS minting
      const resp = await api.buySonos(txHash, ethAmount);
      setSuccess(`Received ${resp.sonos_minted / 100} SONOS!`);
      setEthAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed");
    } finally {
      setBuying(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Buy SONOS</h1>
      <p className="text-zinc-500">
        Send ETH from your wallet and receive SONOS tokens.
      </p>
      <form onSubmit={handleBuy} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-1">
            ETH Amount
          </label>
          <input
            type="text"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            placeholder="0.01"
            required
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={buying}
          className="rounded bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-300"
        >
          {buying ? "Processing..." : "Buy SONOS"}
        </button>
      </form>
    </div>
  );
}
