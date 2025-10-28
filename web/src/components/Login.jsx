// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/Autizone.png";
import "../components/LoginScreen.css"; // garante que o CSS certo está importado

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false); // 👈 estado para alternar a visibilidade
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Informe e-mail e senha.");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate("/activities"); // redireciona após login bem-sucedido
    } catch (err) {
      setError(err?.message || "Falha ao entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      {/* Logo fora do card */}
      <img src={logo} alt="AutiZone Logo" className="login-logo login-logo-login" />

      <div className="login-card">
        <form onSubmit={onSubmit} className="login-form">
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            disabled={loading}
            required
          />

          {/* Campo de senha com botão olho */}
          <div className="password-wrapper">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Senha"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input has-toggle"
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
                // Ícone olho fechado
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 4.24A11.94 11.94 0 0121 12c-1.2 2.3-3.67 4.8-9 4.8-1.17 0-2.26-.14-3.27-.41M4.12 7.76A11.94 11.94 0 003 12c1.2 2.3 3.67 4.8 9 4.8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </svg>
              ) : (
                // Ícone olho aberto
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              )}
            </button>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="login-link">
            Ainda não tem uma conta?{" "}
            <Link to="/register">Cadastre-se</Link>
          </p>
        </form>
      </div>
    </div>
  );
}