// src/pages/Register.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authApi } from "../services/api";
import logo from "../assets/Autizone.png";
import "../components/LoginScreen.css";

export default function Register() {
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await authApi.register(name, email, password);
      await login(email, password);
      window.location.href = "/activities";
    } catch (err) {
      setError(err?.message || "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <img src={logo} alt="AutiZone logo" className="login-logo login-logo-register" />

      <div className="login-card">
        <form onSubmit={onSubmit} className="login-form">
          <input
            className="login-input"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
          />

          <input
            className="login-input"
            placeholder="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          {/* Senha */}
          <div className="password-wrapper">
            <input
              className="login-input has-toggle"
              placeholder="Senha"
              type={showPass ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />

            <button
              type="button"
              className="toggle-visibility"
              aria-label={showPass ? "Esconder senha" : "Mostrar senha"}
              onClick={() => setShowPass((v) => !v)}
            >
              {showPass ? (
                // olho com risco
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 4.24A11.94 11.94 0 0121 12c-1.2 2.3-3.67 4.8-9 4.8-1.17 0-2.26-.14-3.27-.41M4.12 7.76A11.94 11.94 0 003 12c1.2 2.3 3.67 4.8 9 4.8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </svg>
              ) : (
                // olho aberto
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              )}
            </button>
          </div>

          {/* Confirmar Senha */}
          <div className="password-wrapper">
            <input
              className="login-input has-toggle"
              placeholder="Confirme sua senha"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              required
            />

            <button
              type="button"
              className="toggle-visibility"
              aria-label={showConfirm ? "Esconder confirmação" : "Mostrar confirmação"}
              onClick={() => setShowConfirm((v) => !v)}
            >
              {showConfirm ? (
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 4.24A11.94 11.94 0 0121 12c-1.2 2.3-3.67 4.8-9 4.8-1.17 0-2.26-.14-3.27-.41M4.12 7.76A11.94 11.94 0 003 12c1.2 2.3 3.67 4.8 9 4.8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              )}
            </button>
          </div>

          {/* Aviso só se não coincidir */}
          {confirm && password !== confirm && (
            <p className="text-red-600 text-sm mt-1"> As senhas não coincidem</p>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button className="login-btn w-full disabled:opacity-60" type="submit" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>

          <p className="login-link">
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}