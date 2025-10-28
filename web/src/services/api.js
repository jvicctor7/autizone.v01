// web/src/services/api.js

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333/api";

const getToken = () => localStorage.getItem("token");

// Função base HTTP
export async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Erro ${res.status}`);
  return data;
}

// ============ AUTH + USER ============
export const authApi = {
  // Login
  login: async (email, password) => {
    const data = await api("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    if (data?.token) localStorage.setItem("token", data.token);
    return data;
  },

  // Registro
  register: (name, email, password) =>
    api("/auth/register", {
      method: "POST",
      body: { name, email, password },
    }),

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Obter perfil atual
  me: () =>
    api("/users/me", {
      method: "GET",
      token: getToken(),
    }),

  // Atualizar nome e e-mail
  updateProfile: ({ name, email }) =>
    api("/users/me", {
      method: "PUT",
      body: { name, email },
      token: getToken(),
    }),

  // Alterar senha (corrigido para aceitar o formato esperado pelo backend)
  changePassword: ({ currentPassword, password, newPassword }) => {
    // alguns backends esperam 'password' em vez de 'currentPassword'
    const body = {
      password: password ?? currentPassword, // mapeia automaticamente
      newPassword,
    };
    return api("/users/me/password", {
      method: "PUT",
      body,
      token: getToken(),
    });
  },
};

// (Opcional) manter userApi para compatibilidade
export const userApi = {
  getMe: () =>
    api("/users/me", {
      method: "GET",
      token: getToken(),
    }),

  updateProfile: (payload) =>
    api("/users/me", {
      method: "PUT",
      body: payload,
      token: getToken(),
    }),

  changePassword: ({ currentPassword, password, newPassword }) => {
    const body = {
      password: password ?? currentPassword,
      newPassword,
    };
    return api("/users/me/password", {
      method: "PUT",
      body,
      token: getToken(),
    });
  },
};