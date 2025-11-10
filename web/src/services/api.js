// web/src/services/api.js

// endereço base da API
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3333/api";

// pega o token salvo
const getToken = () => localStorage.getItem("token");

// função base HTTP
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

  // Obter usuário logado
  me: () =>
    api("/users/me", {
      method: "GET",
      token: getToken(),
    }),

  // Atualizar nome/e-mail
  updateProfile: ({ name, email }) =>
    api("/users/me", {
      method: "PUT",
      body: { name, email },
      token: getToken(),
    }),

  // Alterar senha -> BACK espera { currentPassword, newPassword }
  changePassword: ({ currentPassword, newPassword }) =>
    api("/users/me/password", {
      method: "PUT",
      body: { currentPassword, newPassword },
      token: getToken(),
    }),
};

// ============ USER (compat) ============
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

  changePassword: ({ currentPassword, newPassword }) =>
    api("/users/me/password", {
      method: "PUT",
      body: { currentPassword, newPassword },
      token: getToken(),
    }),
};

// ============ ACTIVITIES / PROGRESS ============
export const activitiesApi = {
  // manda para o back: "o usuário fez a palavra X do nível Y"
  trackWord: ({ level, word, correct = true, xpGain  }) =>
    api("/activities/track-word", {
      method: "POST",
      body: { level, word, correct, xpGain },
      token: getToken(),
    }),
};

// para buscar o que está salvo no banco
export const progressApi = {
  getMyProgress: () =>
    api("/progress/me", {
      method: "GET",
      token: getToken(),
    }),
};

// ============ WORDS (dinâmicas) ============
export const wordsApi = {
  getByLevel: (level) =>
    api(`/words?level=${level}`, {
      method: "GET",
      token: getToken(),
    }),
};