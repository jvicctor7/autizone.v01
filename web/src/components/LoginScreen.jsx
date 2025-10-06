import React, { useState } from "react";
import "./LoginScreen.css";
import logo from "../assets/Autizone.png"; // importa a logo

export default function LoginScreen({ login }) {
  const [senha, setSenha] = useState("");

const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const email = import.meta.env.VITE_DEFAULT_EMAIL || 'admin@autizone.local';

    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: senha }),
    });

    if (!res.ok) {
      alert('Senha incorreta! Tente novamente.');
      return;
    }

    const data = await res.json();
    localStorage.setItem('token', data.token);
    login();
  } catch (err) {
    console.error(err);
    alert('Erro ao conectar à API. Tente novamente.');
  }
};


  return (
    <div className="login-container">
      {/* Logo fora do card */}
      <img src={logo} alt="AutiZone Logo" className="login-logo" />

      <div className="login-card">
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="login-input"
          />
          <button type="submit" className="login-btn">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
