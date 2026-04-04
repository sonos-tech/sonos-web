export interface Song {
  song_id: string;
  title: string;
  artist: string;
  genre: string | null;
  duration: number | null;
  buyout_price: number;
  created_at: string | null;
}

export interface Balance {
  balance: number;
  formatted: string;
}

export type PlayState =
  | "idle"
  | "staking"
  | "preview"
  | "confirming"
  | "full";

export interface WsMessage {
  type:
    | "playback_started"
    | "play_confirmed"
    | "balance_update"
    | "song_uploaded"
    | "buyout_completed"
    | "error";
  data: Record<string, unknown>;
}

export interface AuthUser {
  wallet_address: string;
  hedera_account_id: string | null;
}

export interface StakeResponse {
  stakeId: string;
  buyout: boolean;
}
