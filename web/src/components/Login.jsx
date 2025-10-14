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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // escolha de tema aleatória
  const themes = ["theme--purple", "theme--peach", "theme--cyan"];
  const randomTheme = themes[Math.floor(Math.random() * themes.length)];
  document.body.className = randomTheme;

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
          <input
            type="password"
            placeholder="Senha"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            disabled={loading}
            required
          />

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