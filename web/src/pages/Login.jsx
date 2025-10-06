import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      location.href = "/";
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto p-4 space-y-3">
      <h1 className="text-xl font-bold">Entrar</h1>
      <input className="border p-2 w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="border p-2 w-full" placeholder="Senha" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      {error && <p className="text-red-600">{error}</p>}
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Entrar</button>
    </form>
  );
}
