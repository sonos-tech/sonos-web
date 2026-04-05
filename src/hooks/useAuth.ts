"use client";

import { useDynamicContext, getAuthToken } from "@dynamic-labs/sdk-react-core";
import { useEffect } from "react";
import { setToken, clearToken, getToken } from "@/lib/auth";

export function useAuth() {
  const { user, primaryWallet } = useDynamicContext();

  useEffect(() => {
    if (user) {
      const jwt = getAuthToken();
      if (jwt) setToken(jwt);
    } else {
      clearToken();
    }
  }, [user]);

  return {
    isAuthenticated: !!user,
    user,
    wallet: primaryWallet,
    walletAddress: primaryWallet?.address ?? null,
    token: getToken(),
  };
}
