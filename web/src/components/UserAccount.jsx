// src/components/UserAccount.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api";
import "../components/LoginScreen.css"; // reaproveita estilos dos inputs/botões

export default function UserAccount() {
  const navigate = useNavigate();

  // perfil
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // troca de senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // mostrar/ocultar senhas
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);

  // estados de UI
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);
  const [msgOk, setMsgOk] = useState("");
  const [msgErr, setMsgErr] = useState("");

  // carregar dados do usuário
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await authApi.me();
        if (!mounted) return;
        setName(me?.name || "");
        setEmail(me?.email || "");
      } catch (e) {
        console.warn("Erro ao carregar perfil:", e.message);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ícone do olho
  function iconEye(open) {
    return open ? (
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke="currentColor" strokeWidth="2" fill="none"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M9.88 4.24A11.94 11.94 0 0121 12c-1.2 2.3-3.67 4.8-9 4.8-1.17 0-2.26-.14-3.27-.41M4.12 7.76A11.94 11.94 0 003 12c1.2 2.3 3.67 4.8 9 4.8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    );
  }

  // salvar nome e email
  async function saveProfile(e) {
    e.preventDefault();
    setMsgOk("");
    setMsgErr("");
    try {
      setLoadingProfile(true);
      await authApi.updateProfile({ name, email });
      const updated = await authApi.me();
      localStorage.setItem("user", JSON.stringify(updated));
      setMsgOk("Perfil atualizado com sucesso!");
    } catch (err) {
      setMsgErr(err?.message || "Não foi possível atualizar o perfil.");
    } finally {
      setLoadingProfile(false);
    }
  }

  // alterar senha
  async function changePassword(e) {
    e.preventDefault();
    setMsgOk("");
    setMsgErr("");

    if (!currentPassword || !newPassword) {
      setMsgErr("Informe a senha atual e a nova senha.");
      return;
    }
    if (newPassword.length < 6) {
      setMsgErr("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setMsgErr("As senhas não coincidem.");
      return;
    }

    try {
      setLoadingPass(true);
      await authApi.changePassword({ currentPassword, newPassword });
      setMsgOk("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setMsgErr(err?.message || "Não foi possível alterar a senha.");
    } finally {
      setLoadingPass(false);
    }
  }

  const mismatch =
    confirmNewPassword && newPassword && confirmNewPassword !== newPassword;

  return (
    <div className="login-container" style={{ paddingTop: 90 }}>
      <div className="login-card" style={{ maxWidth: 520 }}>
        <h2 className="text-center mb-2" style={{ marginTop: 8 }}>
          Informações do usuário
        </h2>

        {/* Perfil */}
        <form onSubmit={saveProfile} className="login-form" style={{ gap: 12 }}>
          <input
            className="login-input"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loadingProfile}
            required
          />
          <input
            className="login-input"
            placeholder="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loadingProfile}
            required
          />
          <button className="login-btn" type="submit" disabled={loadingProfile}>
            {loadingProfile ? "Salvando..." : "Salvar perfil"}
          </button>
        </form>

        <hr style={{ margin: "18px 0", opacity: 0.3 }} />

        {/* Trocar senha */}
        <form onSubmit={changePassword} className="login-form" style={{ gap: 12 }}>
          <div className="password-wrapper">
            <input
              type={showCur ? "text" : "password"}
              placeholder="Senha atual"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="login-input has-toggle"
              disabled={loadingPass}
              required
            />
            <button
              type="button"
              className="toggle-visibility"
              aria-label={showCur ? "Esconder senha" : "Mostrar senha"}
              onClick={() => setShowCur((v) => !v)}
            >
              {iconEye(showCur)}
            </button>
          </div>

          <div className="password-wrapper">
            <input
              type={showNew ? "text" : "password"}
              placeholder="Nova senha"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="login-input has-toggle"
              disabled={loadingPass}
              required
            />
            <button
              type="button"
              className="toggle-visibility"
              aria-label={showNew ? "Esconder senha" : "Mostrar senha"}
              onClick={() => setShowNew((v) => !v)}
            >
              {iconEye(showNew)}
            </button>
          </div>

          <div className="password-wrapper">
            <input
              type={showConf ? "text" : "password"}
              placeholder="Confirme a nova senha"
              autoComplete="new-password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className={`login-input has-toggle ${
                mismatch ? "input-error" : ""
              }`}
              disabled={loadingPass}
              required
            />
            <button
              type="button"
              className="toggle-visibility"
              aria-label={showConf ? "Esconder senha" : "Mostrar senha"}
              onClick={() => setShowConf((v) => !v)}
            >
              {iconEye(showConf)}
            </button>
          </div>

          {mismatch && <p className="hint-error">As senhas não coincidem.</p>}
          {msgErr && <p className="hint-error">{msgErr}</p>}
          {msgOk && <p className="hint-ok">{msgOk}</p>}

          <button className="login-btn" type="submit" disabled={loadingPass}>
            {loadingPass ? "Trocando..." : "Alterar senha"}
          </button>

          <button
            type="button"
            className="login-btn"
            style={{ background: "#9e9e9e" }}
            onClick={() => navigate(-1)}
          >
            Voltar
          </button>
        </form>
      </div>
    </div>
  );
}