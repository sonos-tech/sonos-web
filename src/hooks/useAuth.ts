"use client";

import { useDynamicContext, getAuthToken } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { setToken, clearToken, getToken } from "@/lib/auth";

export function useAuth() {
  const { user, primaryWallet } = useDynamicContext();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (user) {
      const jwt = getAuthToken();
      if (jwt) {
        setToken(jwt);
      }
      setIsReady(true);
    } else {
      clearToken();
      setIsReady(false);
    }
  }, [user]);

  return {
    isAuthenticated: !!user && isReady,
    user,
    wallet: primaryWallet,
    walletAddress: primaryWallet?.address ?? null,
    token: getToken(),
  };
}
