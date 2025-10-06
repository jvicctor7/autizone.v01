import { useEffect, useState } from "react";
import { api } from "../services/api";

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const me = await api("/auth/me", { token });
        setUser(me);
      } catch (e) {
        console.error(e);
        setToken(null);
        localStorage.removeItem("token");
      }
    })();
  }, [token]);

  function login(email, password) {
    return api("/auth/login", { method: "POST", body: { email, password } })
      .then(({ token }) => {
        localStorage.setItem("token", token);
        setToken(token);
        return token;
      });
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  return { token, user, login, logout };
}
