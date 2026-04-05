export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws",
  dynamicEnvId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID ?? "",
  platformEthAddress: process.env.NEXT_PUBLIC_PLATFORM_ETH_ADDRESS ?? "",
} as const;
