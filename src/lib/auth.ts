import { getAuthToken } from "@dynamic-labs/sdk-react-core";

let token: string | null = null;

export function getToken(): string | null {
  // Try cached token first, fall back to reading directly from Dynamic SDK.
  // This avoids the race condition where useEffect hasn't cached it yet.
  return token ?? getAuthToken() ?? null;
}

export function setToken(jwt: string) {
  token = jwt;
}

export function clearToken() {
  token = null;
}
