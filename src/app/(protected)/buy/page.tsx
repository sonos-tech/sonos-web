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

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();

    if (!primaryWallet) {
      toast("No wallet connected");
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
