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
import { useTheme } from "@/providers/ThemeProvider";

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
  const { theme } = useTheme();
  return (
    <DynamicContextProvider
      theme={theme}
      settings={{
        environmentId: config.dynamicEnvId,
        walletConnectors: [EthereumWalletConnectors],
        logLevel: "WARN",
        overrides: {
          evmNetworks: () => [
            {
              blockExplorerUrls: ["https://sepolia.etherscan.io/"],
              chainId: 11155111,
              chainName: "Sepolia",
              iconUrls: ["https://app.dynamic.xyz/assets/networks/eth.svg"],
              name: "Sepolia",
              nativeCurrency: {
                decimals: 18,
                name: "Sepolia Ether",
                symbol: "ETH",
              },
              networkId: 11155111,
              rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
              vanityName: "Sepolia Testnet",
            },
          ],
        },
      }}
    >
      <AuthSync>{children}</AuthSync>
    </DynamicContextProvider>
  );
}
