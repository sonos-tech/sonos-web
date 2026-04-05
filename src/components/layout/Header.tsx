"use client";

import Link from "next/link";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { isAuthenticated } = useAuth();
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    // Small delay to let wallet onboarding complete on first login
    const timer = setTimeout(() => {
      api.getBalance().then((b) => setBalance(b.formatted)).catch(() => {});
    }, 2000);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  // Refresh balance periodically
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      api.getBalance().then((b) => setBalance(b.formatted)).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-bold">
          SONOS
        </Link>
        {isAuthenticated && (
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/upload" className="hover:underline">
              Upload
            </Link>
            <Link href="/buy" className="hover:underline">
              Buy SONOS
            </Link>
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
          </nav>
        )}
      </div>
      <div className="flex items-center gap-4">
        {balance && (
          <span className="text-sm font-medium text-zinc-500">{balance}</span>
        )}
        <DynamicWidget />
      </div>
    </header>
  );
}
