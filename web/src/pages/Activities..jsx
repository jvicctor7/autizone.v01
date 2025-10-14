import React, { useState, useRef, useEffect } from "react";
import "./MainScreen.css";
import GameModal from "./GameModal";
import confetti from "canvas-confetti";
import logo from "../assets/Autizone.png"; // Logo
import arvLogo from "../assets/arv.png";

const niveis = {
  1: ["pai", "ovo", "mae", "maçã", "casa", "carro", "teto", "lua", "sol"],
  2: ["cachorro", "futebol", "mesa", "lápis", "caneta"],
  3: ["avião", "zebra", "casamento", "bicicleta"],
};

export default function MainScreen({ logout }) {
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

  const proximo = () => {
    if (fase < 2) {
      setFase(fase + 1);
    } else {
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
        <button className="next-phase-btn" onClick={proximo}>
          Próximo ➡
        </button>
      </div>
    );
  };

  // ====== ArteZone ======
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#333";
    ctxRef.current = ctx;
  }, []);

  const startDrawing = (e) => {
    setDrawing(true);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(
      e.nativeEvent.offsetX || e.touches?.[0].clientX - canvasRef.current.offsetLeft,
      e.nativeEvent.offsetY || e.touches?.[0].clientY - canvasRef.current.offsetTop
    );
  };

  const draw = (e) => {
    if (!drawing) return;
    const x = e.nativeEvent.offsetX || e.touches?.[0].clientX - canvasRef.current.offsetLeft;
    const y = e.nativeEvent.offsetY || e.touches?.[0].clientY - canvasRef.current.offsetTop;
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    setDrawing(false);
    ctxRef.current.beginPath();
  };

  const clearCanvas = () => {
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
    const randomWord = palavrasSurpresa[Math.floor(Math.random() * palavrasSurpresa.length)];
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
        <button className="logout-btn" onClick={logout}>🚪 Sair</button>
      </nav>

      {/* Dashboard */}
      <div className="xp-dashboard-block">
        <h3>🎮 Seu Progresso</h3>
        <p>Total de XP: <strong>{xp}</strong></p>
        <p>💰 Moedas: {moedas}</p>
        <div className="xp-bar-container">
          <div className="xp-bar" style={{ width: `${Math.min((xp / 30) * 100, 100)}%` }}></div>
        </div>
        <p>{xp < 30 ? `Faltam ${30 - xp} XP para desbloquear o jogo` : "🎉 Jogo desbloqueado!"}</p>
      </div>

      {/* Níveis */}
      <div className="levels-grid">
        {[1, 2, 3].map((n) => (
          <div key={n} className={`level-card ${nivelCompleto[n] ? "completed" : ""}`}>
            <h3>🏆 Nível {n}</h3>
            {!nivelSelecionado && (
              <button className="select-btn" onClick={() => iniciarNivel(n)}>
                Iniciar Nível
              </button>
            )}
            {nivelSelecionado === n && !palavraAtual && (
              <div className="word-selection">
                {niveis[n].map((p, i) => (
                  <button key={i} className="word-btn" onClick={() => escolherPalavra(p)}>
                    {p}
                  </button>
                ))}
                <button className="cancel-btn" onClick={() => setNivelSelecionado(null)}>❌ Voltar</button>
              </div>
            )}
            {nivelCompleto[n] && <span className="done-tag">✔ Concluído!</span>}
          </div>
        ))}
      </div>

      {renderFase()}

      {/* ===== Game Interag ===== */}
      <div className={`game-container ${jogoDesbloqueado ? "unlocked" : "locked"}`}>
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

      {/* Modal do Jogo */}
      <GameModal isOpen={modalAberto} onClose={() => setModalAberto(false)} />

      {/* ===== ArteZone ===== */}
      <div className="artezone-container">
        <h2>🎨 ArteZone</h2>
        <p>Escolha uma palavra ou use o desafio surpresa!</p>
        <p className="desafio-diario">📌 {desafioDiario}</p>

        <div className="words-choice">
          {["Maçã", "Sol", "Casa", "Peixe", "Flor"].map((w) => (
            <button key={w} className="arte-btn" onClick={() => setArtePalavra(w)}>{w}</button>
          ))}
          <button className="surpresa-btn" onClick={desafioSurpresa}>🎲 Surpresa!</button>
        </div>

        {artePalavra && <p>🖌 Você vai desenhar: <strong>{artePalavra}</strong></p>}

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
          <button className="artezone-btn" onClick={clearCanvas}>🧽 Limpar</button>
          <button className="artezone-btn" onClick={submitDrawing}>✅ Entregar</button>
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
              <span key={i} className="galeria-item">{a}</span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
