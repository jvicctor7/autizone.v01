// src/components/MainScreen.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { activitiesApi } from "../services/api";
import { wordsApi, progressApi } from "../services/api";
import "./MainScreen.css";
import GameModal from "./GameModal";
import confetti from "canvas-confetti";
import logo from "../assets/Autizone.png";
import arvLogo from "../assets/arv.png";
import UserMenu from "./UserMenu";

// lista inicial (fallback)
const NIVEIS_INICIAIS = {
  1: ["pai", "ovo", "mae", "maçã", "casa", "carro", "teto", "lua", "sol"],
  2: ["cachorro", "futebol", "mesa", "lápis", "caneta"],
  3: ["avião", "zebra", "casamento", "bicicleta"],
};

export default function MainScreen({ logout }) {
  const navigate = useNavigate();
  const [niveis, setNiveis] = useState(NIVEIS_INICIAIS);

  // 👉 estados só pra recarregar palavras
  const [loadingNivel, setLoadingNivel] = useState({}); // {1: true, 2: false...}
  const [msgNivel, setMsgNivel] = useState({}); // {1: "Gerando...", 2: "Erro"...}

  // correçao botao sair
  const handleLogout = async () => {
    try {
      if (logout) await logout(); // caso o logout venha do contexto
    } finally {
      navigate("/login"); // redireciona mesmo se der erro no logout
    }
  };

  const [nivelSelecionado, setNivelSelecionado] = useState(null);
  const [palavraAtual, setPalavraAtual] = useState(null);
  const [fase, setFase] = useState(0);
  const [nivelCompleto, setNivelCompleto] = useState({});
  const [jogoDesbloqueado, setJogoDesbloqueado] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [xp, setXp] = useState(0);

  // ---- ArteZone ----
  const [artePalavra, setArtePalavra] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [roboStatus, setRoboStatus] = useState("normal");
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  // ---- Recompensas ----
  const [moedas, setMoedas] = useState(0);
  const [adesivos, setAdesivos] = useState([]);

  // ---- Desafio diário ----
  const [desafioDiario, setDesafioDiario] = useState("");

  useEffect(() => {
    const desafios = [
      "Hoje desenhe uma fruta!",
      "Tente desenhar algo amarelo!",
      "Faça um animal divertido!",
      "Desenhe sua casa!",
    ];
    const dia = new Date().getDay();
    setDesafioDiario(desafios[dia % desafios.length]);
  }, []);

  // pegar XP salvo no back
  useEffect(() => {
    (async () => {
      try {
        const data = await progressApi.getMyProgress();
        const xpServidor = data?.progress?.xp ?? 0;
        setXp(xpServidor);
      } catch (err) {
        console.warn("Não deu pra carregar XP do servidor:", err.message);
      }
    })();
  }, []);

  // ====== Voz ======
  const falar = (texto) => {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "pt-BR";
    speechSynthesis.speak(utterance);
  };

  // ====== Fases ======
  const iniciarNivel = (nivel) => {
    setNivelSelecionado(nivel);
    setPalavraAtual(null);
    setFase(0);
  };

  const escolherPalavra = (palavra) => {
    setPalavraAtual(palavra);
    setFase(0);
  };

  // ====== NOVAS PALAVRAS (com loading e mensagem) ======
  const recarregarNivel = async (nivel) => {
    // liga o loading desse nível
    setLoadingNivel((prev) => ({ ...prev, [nivel]: true }));
    setMsgNivel((prev) => ({ ...prev, [nivel]: "Gerando novas palavras..." }));

    try {
      const res = await fetch(`http://localhost:3333/api/words?level=${nivel}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();

      console.log("✨ Novas palavras recebidas:", data);

      if (data?.words?.length) {
        // atualiza lista
        setNiveis((prev) => ({
          ...prev,
          [nivel]: data.words,
        }));
        // mensagem de sucesso
        setMsgNivel((prev) => ({
          ...prev,
          [nivel]: "✅ Novas palavras geradas!",
        }));
        
        setTimeout(() => {
          setMsgNivel ((prev) => ({ ...prev, [nivel]: "" }));
        }, 4000);
      } else {
        // fallback: não veio nada
        setMsgNivel((prev) => ({
          ...prev,
          [nivel]: "⚠️ Não vieram palavras novas. Tente de novo.",
        }));
        console.warn("⚠️ Nenhuma palavra recebida do servidor. Usando fallback.");
      }
    } catch (err) {
      console.error("Erro ao recarregar palavras:", err);
      setMsgNivel((prev) => ({
        ...prev,
        [nivel]: "❌ Erro ao gerar palavras.",
      }));
    } finally {
      // desliga loading
      setLoadingNivel((prev) => ({ ...prev, [nivel]: false }));
    }
  };

  const proximo = async () => {
    // ainda está nas fases 0 e 1 -> só avança
    if (fase < 2) {
      setFase(fase + 1);
      return;
    }

    // chegou aqui = terminou a palavra atual
    if (nivelSelecionado && palavraAtual) {
      console.log("📤 enviando pro backend:", {
        level: nivelSelecionado,
        word: palavraAtual,
      });

      try {
        await activitiesApi.trackWord({
          level: nivelSelecionado,
          word: palavraAtual,
          correct: true,
        });
        console.log("✅ backend respondeu ok");
      } catch (err) {
        console.error("❌ Erro ao salvar progresso da palavra:", err);
        // mesmo com erro, o jogo continua
      }
    }

    // ---- resto igual ao seu ----
    const novoXp = xp + 10;
    setXp(novoXp);
    setPalavraAtual(null);

    const palavras = niveis[nivelSelecionado] || [];
    const todasFeitas = palavras.every((p) => p !== palavraAtual);
    if (todasFeitas && nivelSelecionado !== null) {
      setNivelCompleto({ ...nivelCompleto, [nivelSelecionado]: true });
      setNivelSelecionado(null);
    }

    if (novoXp >= 30) {
      setJogoDesbloqueado(true);
      confetti();
    }
  };

  const voltar = () => {
    if (fase > 0) {
      setFase(fase - 1);
    } else {
      setPalavraAtual(null);
    }
  };

  const renderFase = () => {
    if (!palavraAtual) return null;

    const fonemas = palavraAtual.split("");
    const silabas = palavraAtual.match(/.{1,2}/g) || [];

    let conteudo;
    if (fase === 0) {
      conteudo = (
        <div className="word-phase">
          <h3>🔤 Treinando Fonemas</h3>
          <div className="sound-buttons">
            {fonemas.map((f, i) => (
              <button key={i} className="sound-btn" onClick={() => falar(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>
      );
    } else if (fase === 1) {
      conteudo = (
        <div className="word-phase">
          <h3>📝 Montando Sílabas</h3>
          <div className="sound-buttons">
            {silabas.map((s, i) => (
              <button key={i} className="sound-btn" onClick={() => falar(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      );
    } else {
      conteudo = (
        <div className="word-phase">
          <h3>✅ Palavra Completa</h3>
          <button className="sound-btn highlight" onClick={() => falar(palavraAtual)}>
            {palavraAtual}
          </button>
        </div>
      );
    }

    return (
      <div className="fase-container">
        {conteudo}
        <div className="fase-controls">
          <button className="nav-phase-btn back" onClick={voltar}>
            ← Voltar
          </button>
          <button className="nav-phase-btn next" onClick={proximo}>
            Próximo →
          </button>
        </div>
      </div>
    );
  };

  // ====== ArteZone ======
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.lineCap = "round";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#333";
      ctxRef.current = ctx;
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const startDrawing = (e) => {
    if (!ctxRef.current || !canvasRef.current) return;
    setDrawing(true);
    ctxRef.current.beginPath();
    const x =
      e.nativeEvent?.offsetX ??
      (e.touches?.[0].clientX - canvasRef.current.offsetLeft);
    const y =
      e.nativeEvent?.offsetY ??
      (e.touches?.[0].clientY - canvasRef.current.offsetTop);
    ctxRef.current.moveTo(x, y);
  };

  const draw = (e) => {
    if (!drawing || !ctxRef.current || !canvasRef.current) return;
    const x =
      e.nativeEvent?.offsetX ??
      (e.touches?.[0].clientX - canvasRef.current.offsetLeft);
    const y =
      e.nativeEvent?.offsetY ??
      (e.touches?.[0].clientY - canvasRef.current.offsetTop);
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    setDrawing(false);
    if (ctxRef.current) ctxRef.current.beginPath();
  };

  const clearCanvas = () => {
    if (!ctxRef.current || !canvasRef.current) return;
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const submitDrawing = () => {
    if (artePalavra) {
      setMoedas(moedas + 5);
      setAdesivos([...adesivos, artePalavra]);
      falar(`Parabéns! Você desenhou uma ${artePalavra} incrível!`);
    } else {
      falar("Parabéns! Você fez uma obra de arte!");
    }
    setRoboStatus("feliz");
    setShowFeedback(true);
    confetti();
    setTimeout(() => {
      setShowFeedback(false);
      setRoboStatus("normal");
    }, 4000);
  };

  const palavrasSurpresa = ["Sol", "Lua", "Cachorro", "Flor", "Peixe"];
  const desafioSurpresa = () => {
    const randomWord =
      palavrasSurpresa[Math.floor(Math.random() * palavrasSurpresa.length)];
    setArtePalavra(randomWord);
  };

  const roboImgs = {
    normal: "https://cdn-icons-png.flaticon.com/512/4712/4712100.png",
    feliz: "https://cdn-icons-png.flaticon.com/512/4712/4712065.png",
    dancando: "https://cdn-icons-gif.flaticon.com/6172/6172531.gif",
  };

  return (
    <div className="main-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <img src={arvLogo} alt="Logo Arv" className="logo-img" />
          <h2 className="logo-text">AutiZone</h2>
        </div>

        <UserMenu
          onOpenAccount={() => navigate("/account")}
          onLogout={handleLogout}
        />
      </nav>

      {/* Dashboard */}
      <div className="xp-dashboard-block">
        <h3>🎮 Seu Progresso</h3>
        <p>Total de XP: <strong>{xp}</strong></p>
        <p>💰 Moedas: {moedas}</p>
        <div className="xp-bar-container">
          <div
            className="xp-bar"
            style={{ width: `${Math.min((xp / 30) * 100, 100)}%` }}
          ></div>
        </div>
        <p>{xp < 30 ? `Faltam ${30 - xp} XP para desbloquear o jogo` : "🎉 Jogo desbloqueado!"}</p>
      </div>

      <div className="levels-grid">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`level-card ${nivelCompleto[n] ? "completed" : ""} ${
              nivelSelecionado === n ? "selected" : ""
            }`}
          >
            <h3>🏆 Nível {n}</h3>

            {nivelSelecionado === n && (
              <span className="tag-atual">Nível atual</span>
            )}

            {/* --- Botões principais --- */}
            {!nivelSelecionado && (
              <div className="level-actions">
                <button className="select-btn" onClick={() => iniciarNivel(n)}>
                  Iniciar Nível
                </button>

                {/* 🔁 Botão para gerar novas palavras */}
                <button
                  className="refresh-btn"
                  onClick={() => recarregarNivel(n)}
                  title="Gerar novas palavras com IA"
                  disabled={!!loadingNivel[n]}
                >
                  {loadingNivel[n] ? "⏳ Gerando..." : "🔁 Novas palavras"}
                </button>
              </div>
            )}

            {/* mensagenzinha de resultado da geração */}
            {!nivelSelecionado && msgNivel[n] && (
              <p
                style={{
                  marginTop: "8px",
                  fontSize: "0.8rem",
                  color: "#4b1480",
                  fontWeight: 600,
                }}
              >
                {msgNivel[n]}
              </p>
            )}

            {/* --- Quando o nível está selecionado --- */}
            {nivelSelecionado === n && !palavraAtual && (
              <div className="word-selection">
                {niveis[n].map((p, i) => (
                  <button
                    key={i}
                    className="word-btn"
                    onClick={() => escolherPalavra(p)}
                  >
                    {p}
                  </button>
                ))}

                <button
                  className="cancel-btn"
                  onClick={() => setNivelSelecionado(null)}
                >
                  ❌ Voltar
                </button>
              </div>
            )}

            {nivelCompleto[n] && <span className="done-tag">✔ Concluído!</span>}
          </div>
        ))}
      </div>

      {renderFase()}

      {/* ===== Game Interag ===== */}
      <div
        className={`game-container ${
          jogoDesbloqueado ? "unlocked" : "locked"
        }`}
      >
        <h2>🌈 Game Interag</h2>
        <p>
          {jogoDesbloqueado
            ? "Agora você pode jogar e se divertir!"
            : "Ganhe XP para desbloquear este jogo divertido!"}
        </p>
        <button
          className="game-btn"
          disabled={!jogoDesbloqueado}
          onClick={() => setModalAberto(true)}
        >
          {jogoDesbloqueado ? "🎉 Jogar!" : "🔒 Bloqueado"}
        </button>
      </div>

      <GameModal isOpen={modalAberto} onClose={() => setModalAberto(false)} />

      {/* ===== ArteZone ===== */}
      <div className="artezone-container">
        <h2>🎨 ArteZone</h2>
        <p>Escolha uma palavra ou use o desafio surpresa!</p>
        <p className="desafio-diario">📌 {desafioDiario}</p>

        <div className="words-choice">
          {["Maçã", "Sol", "Casa", "Peixe", "Flor"].map((w) => (
            <button
              key={w}
              className="arte-btn"
              onClick={() => setArtePalavra(w)}
            >
              {w}
            </button>
          ))}
          <button className="surpresa-btn" onClick={desafioSurpresa}>
            🎲 Surpresa!
          </button>
        </div>

        {artePalavra && (
          <p>
            🖌 Você vai desenhar: <strong>{artePalavra}</strong>
          </p>
        )}

        <canvas
          ref={canvasRef}
          width={500}
          height={350}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        ></canvas>

        <div className="artezone-actions">
          <button className="artezone-btn" onClick={clearCanvas}>
            🧽 Limpar
          </button>
          <button className="artezone-btn" onClick={submitDrawing}>
            ✅ Entregar
          </button>
        </div>

        {showFeedback && (
          <div id="artezone-feedback">
            <img src={roboImgs[roboStatus]} alt="Robôzinho" />
            <p>🤖 Muito bom! Continue desenhando!</p>
          </div>
        )}
      </div>

      {/* Ranking */}
      <div className="ranking-container">
        <h3>📊 Ranking Pessoal</h3>
        <div className="ranking-stats">
          <div className="stat-card">
            <p>Total de desenhos feitos:</p>
            <strong>{adesivos.length}</strong>
          </div>
          <div className="stat-card">
            <p>Total de XP em desenhos:</p>
            <strong>{adesivos.length * 5}</strong>
          </div>
        </div>

        <h4>🏅 Sua Galeria</h4>
        <div className="galeria-grid">
          {adesivos.length === 0 ? (
            <p>Nenhum desenho ainda... desenhe para encher sua galeria! 🎨</p>
          ) : (
            adesivos.map((a, i) => (
              <span key={i} className="galeria-item">
                {a}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}