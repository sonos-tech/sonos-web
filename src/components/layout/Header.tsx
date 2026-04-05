"use client";

import Link from "next/link";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/providers/ThemeProvider";

export function Header() {
  const { isAuthenticated } = useAuth();
  const { theme, toggle } = useTheme();
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
      <div className="flex items-center gap-3">
        {balance && (
          <span className="text-sm font-medium text-zinc-500">{balance}</span>
        )}
        <button
          type="button"
          onClick={toggle}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          {theme === "dark" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
        <DynamicWidget />
      </div>
    </header>
  );
}
