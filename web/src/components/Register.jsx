import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { authApi } from "../services/api";
import logo from "../assets/Autizone.png";
import "../components/LoginScreen.css";

export default function Register() {
  const { login } = useAuth(); // auto-login após cadastro
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.register(name, email, password);
      await login(email, password);
      window.location.href = "/activities"; // ajusta destino se quiser
    } catch (err) {
      setError(err?.message || "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      {/* LOGO específica do REGISTER */}
      <img
        src={logo}
        alt="AutiZone logo"
        className="login-logo login-logo-register"
      />

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

          <input
            className="login-input"
            placeholder="Senha"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            className="login-btn w-full disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>

          <p className="text-center text-sm text-gray-700">
            Já tem conta?{" "}
            <a href="/login" className="underline hover:opacity-80">
              Entrar
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}