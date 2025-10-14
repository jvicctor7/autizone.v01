export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333/api";

// função base http
export async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Erro ${res.status}`);
  return data;
}

// funções específicas do sistema (login e registro)
export const authApi = {
  login: (email, password) =>
    api("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  register: (name, email, password) =>
    api("/auth/register", {
      method: "POST",
      body: { name, email, password },
    }),
};