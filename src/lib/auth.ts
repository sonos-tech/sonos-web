let token: string | null = null;

export function getToken(): string | null {
  return token;
}

export function setToken(jwt: string) {
  token = jwt;
}

export function clearToken() {
  token = null;
}
