"use client";

import { useEffect } from "react";
import {
  DynamicContextProvider,
  useDynamicContext,
  getAuthToken,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { config } from "@/lib/config";
import { setToken, clearToken } from "@/lib/auth";

function AuthSync({ children }: { children: React.ReactNode }) {
  const { user } = useDynamicContext();

  useEffect(() => {
    if (user) {
      const jwt = getAuthToken();
      if (jwt) setToken(jwt);
    } else {
      clearToken();
    }
  }, [user]);

  return <>{children}</>;
}

export function DynamicProvider({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: config.dynamicEnvId,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <AuthSync>{children}</AuthSync>
    </DynamicContextProvider>
  );
}
