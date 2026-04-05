import type { WsMessage } from "./types";
import { getToken } from "./auth";
import { config } from "./config";

type Handler = (msg: WsMessage) => void;

class WSClient {
  private ws: WebSocket | null = null;
  private handlers: Set<Handler> = new Set();
  private reconnectDelay = 1000;
  private maxDelay = 30000;
  private shouldConnect = false;

  connect() {
    this.shouldConnect = true;
    this.tryConnect();
  }

  disconnect() {
    this.shouldConnect = false;
    this.ws?.close();
    this.ws = null;
  }

  subscribe(handler: Handler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  private tryConnect() {
    if (!this.shouldConnect) return;

    const token = getToken();
    const url = `${config.wsUrl}${token ? `?token=${token}` : ""}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectDelay = 1000;
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WsMessage;
          for (const handler of this.handlers) handler(msg);
        } catch {
          // ignore malformed messages
        }
      };

      this.ws.onclose = () => {
        if (this.shouldConnect) {
          setTimeout(() => this.tryConnect(), this.reconnectDelay);
          this.reconnectDelay = Math.min(
            this.reconnectDelay * 2,
            this.maxDelay,
          );
        }
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      if (this.shouldConnect) {
        setTimeout(() => this.tryConnect(), this.reconnectDelay);
      }
    }
  }
}

export const wsClient = new WSClient();
