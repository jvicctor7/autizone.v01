// src/components/UserMenu.jsx
import { useState, useRef, useEffect } from "react";

export default function UserMenu({ onOpenAccount, onLogout }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const popRef = useRef(null);

  useEffect(() => {
    function handleDocClick(e) {
      if (
        open &&
        popRef.current &&
        !popRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    function onEsc(e) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="nav-right">
      <button
        ref={btnRef}
        type="button"
        className="avatar-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        title="Menu do usuário"
      >
        👤
      </button>

      {open && (
        <div ref={popRef} className="user-menu-pop" role="menu">
          <button
            className="user-menu-item"
            role="menuitem"
            onClick={() => { setOpen(false); onOpenAccount?.(); }}
          >
            Informações do usuário
          </button>

          <button
            className="user-menu-item danger"
            role="menuitem"
            onClick={() => { setOpen(false); onLogout?.(); }}
          >
            Sair da conta
          </button>
        </div>
      )}
    </div>
  );
}