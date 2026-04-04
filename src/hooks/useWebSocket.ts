"use client";

import { useEffect, useCallback, useState } from "react";
import { wsClient } from "@/lib/ws";
import type { WsMessage } from "@/lib/types";
import { useAuth } from "./useAuth";

export function useWebSocket(onMessage?: (msg: WsMessage) => void) {
  const { isAuthenticated } = useAuth();
  const [lastMessage, setLastMessage] = useState<WsMessage | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      wsClient.connect();
    } else {
      wsClient.disconnect();
    }
    return () => wsClient.disconnect();
  }, [isAuthenticated]);

  useEffect(() => {
    return wsClient.subscribe((msg) => {
      setLastMessage(msg);
      onMessage?.(msg);
    });
  }, [onMessage]);

  return { lastMessage };
}
