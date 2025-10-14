// web/src/hooks/useAuth.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // carregamos do localStorage ao iniciar
  const [token, setToken] = useState(() => {
    const raw = localStorage.getItem("auth");
    try {
      return raw ? JSON.parse(raw).token : null;
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("auth");
    try {
      return raw ? JSON.parse(raw).user : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!token;

  // helper para persistir de uma vez
  function persistAuth(next) {
    if (!next) {
      localStorage.removeItem("auth");
      setToken(null);
      setUser(null);
    } else {
      localStorage.setItem("auth", JSON.stringify(next));
      setToken(next.token);
      setUser(next.user);
    }
  }

  async function login(email, password) {
    const res = await authApi.login(email, password);
    // res = { token, user }
    persistAuth(res);
    return res;
  }

  function logout() {
    persistAuth(null);
  }

  const value = useMemo(
    () => ({ token, user, isAuthenticated, login, logout }),
    [token, user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}