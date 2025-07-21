// client/src/hooks/useAuth.ts
import { useState } from "react";

const TOKEN_KEY = "jwt";

export function useAuth() {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  );
  const [error, setError] = useState<string | null>(null);

  async function login(username: string, password: string) {
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Login failed");
      }
      const { token: jwt } = await res.json();
      localStorage.setItem(TOKEN_KEY, jwt);
      setToken(jwt);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  return { token, error, login, logout };
}
