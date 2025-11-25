// src/components/MainScreen.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { activitiesApi, wordsApi, progressApi } from "../services/api";
import "./MainScreen.css";
import GameModal from "./GameModal";
import confetti from "canvas-confetti";
import arvLogo from "../assets/arv.png";
import UserMenu from "./UserMenu";

// lista inicial (fallback)
const NIVEIS_INICIAIS = {
  1: ["pai", "ovo", "mae", "maçã", "casa", "carro", "teto", "lua", "sol"],
  2: ["cachorro", "futebol", "mesa", "lápis", "caneta"],
  3: ["avião", "zebra", "casamento", "bicicleta"],
};

// quanto cada palavra dá, por nível
const XP_BY_WORD = {
  1: 8,
  2: 12,
  3: 16,
};

// ✅ MELHOR ESPAÇAMENTO ENTRE NÍVEIS
const XP_LEVEL_STEPS = [0, 50, 100, 180, 280, 400, 550, 720, 900, 1100, 1300];

// ✅ CONFIGURAÇÃO DOS JOGOS COM ARTZONE
const GAMES_CONFIG = {
  artezone: {
    id: 'artezone',
    name: '🎨 ArteZone',
    description: 'Desenhe e solte a criatividade!',
    unlockLevel: 0,
    unlockXP: 0,
    color: '#FF9F43'
  },
  interag: {
    id: 'interag',
    name: '🎮 Game Interag',
    description: 'Colete os queijos e evite os gatos!',
    unlockLevel: 1,
    unlockXP: 50,
    color: '#FF6B6B'
  },
  soundExplorer: {
    id: 'soundExplorer', 
    name: '🎵 Sound Explorer',
    description: 'Descubra sons e fonemas!',
    unlockLevel: 2,
    unlockXP: 100,
    color: '#4ECDC4'
  },
  wordBuilder: {
    id: 'wordBuilder',
    name: '🧩 Word Builder',
    description: 'Monte palavras com sílabas!',
    unlockLevel: 3,
    unlockXP: 180,
    color: '#45B7D1'
  },
  speedChallenge: {
    id: 'speedChallenge',
    name: '🚀 Speed Challenge', 
    description: 'Desafio de velocidade com palavras!',
    unlockLevel: 4,
    unlockXP: 280,
    color: '#96CEB4'
  },
  masterQuest: {
    id: 'masterQuest',
    name: '🌟 Master Quest',
    description: 'Desafio final para mestres!',
    unlockLevel: 5,
    unlockXP: 400,
    color: '#FFEAA7'
  }
};

function calcPlayerLevel(totalXp) {
  let level = 1;
  for (let i = 0; i < XP_LEVEL_STEPS.length; i++) {
    if (totalXp >= XP_LEVEL_STEPS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return Math.min(level, 10);
}

export default function MainScreen({ logout }) {
  const navigate = useNavigate();
  const [niveis, setNiveis] = useState(NIVEIS_INICIAIS);

  // loading + mensagens de geração
  const [loadingNivel, setLoadingNivel] = useState({});
  const [msgNivel, setMsgNivel] = useState({});

  // salvar palavras já geradas / feitas pelo usuário
  const [savedWordsByLevel, setSavedWordsByLevel] = useState({});

  // UI / jogo
  const [nivelSelecionado, setNivelSelecionado] = useState(null);
  const [palavraAtual, setPalavraAtual] = useState(null);
  const [fase, setFase] = useState(0);
  const [nivelCompleto, setNivelCompleto] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [xp, setXp] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);

  // ✅ SISTEMA DE JOGOS
  const [selectedGame, setSelectedGame] = useState(null);
  const [availableGameWords, setAvailableGameWords] = useState([]);

  // modal de lista salva
  const [savedModalOpen, setSavedModalOpen] = useState(false);
  const [modalLevelViewing, setModalLevelViewing] = useState(null);

  // artezone / drawing
  const [artePalavra, setArtePalavra] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [roboStatus, setRoboStatus] = useState("normal");
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  // recompensas
  const [moedas, setMoedas] = useState(0);
  const [adesivos, setAdesivos] = useState([]);

  // desafio diário
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

  // pegar XP salvo no back e palavras salvas
  useEffect(() => {
    (async () => {
      try {
        const data = await progressApi.getMyProgress();
        const xpServidor = data?.progress?.xp ?? 0;
        setXp(xpServidor);
        setPlayerLevel(calcPlayerLevel(xpServidor));

        // ✅ CORREÇÃO: Buscar palavras salvas corretamente
        try {
          const savedResp = await wordsApi.getSaved();
          console.log('📦 Resposta da API de palavras salvas:', savedResp);
          
          const savedWords = savedResp?.words ?? [];
          console.log('🔍 Palavras recebidas:', savedWords);
          
          const grouped = {};
          for (const wordData of savedWords) {
            const word = wordData.word || wordData;
            const level = wordData.level || 1;
            
            const lvl =
              typeof level === "string"
                ? { INICIAL: 1, BASICO: 2, INTERMEDIARIO: 3, AVANCADO: 4 }[level] ?? 1
                : Number(level) || 1;
                
            grouped[lvl] = grouped[lvl] || new Set();
            grouped[lvl].add(String(word).toLowerCase());
          }
          
          console.log('🗂️ Palavras agrupadas por nível:', grouped);
          setSavedWordsByLevel(grouped);
          
        } catch (e) {
          console.warn("Não foi possível carregar palavras salvas:", e.message);
        }
      } catch (err) {
        console.warn("Não deu pra carregar XP do servidor:", err.message);
      }
    })();
  }, []);

  // ✅ Debug para palavras salvas
  useEffect(() => {
    console.log('🔄 savedWordsByLevel atualizado:', savedWordsByLevel);
  }, [savedWordsByLevel]);

  // trava o scroll do body quando modal de palavras salvas está aberto
  useEffect(() => {
    if (savedModalOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [savedModalOpen]);

  // ====== Voz ======
  const falar = (texto) => {
    try {
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = "pt-BR";
      speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Falar falhou:", e.message);
    }
  };

  // iniciadores e escolha
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
    setLoadingNivel((prev) => ({ ...prev, [nivel]: true }));
    setMsgNivel((prev) => ({ ...prev, [nivel]: "Gerando novas palavras..." }));

    try {
      const data = await wordsApi.getByLevel(nivel);
      let serverWords = data?.words ?? [];
      serverWords = serverWords.map((w) => (w || "").toLowerCase());

      const savedSet = savedWordsByLevel[nivel] ?? new Set();
      const filtered = serverWords.filter((w) => !savedSet.has(w));
      const unique = [...new Set(filtered)];
      const finalWords = unique.length ? unique : [...new Set(serverWords)];

      setNiveis((prev) => ({ ...prev, [nivel]: finalWords }));

      setMsgNivel((prev) => ({
        ...prev,
        [nivel]: `✅ Novas palavras geradas! (${finalWords.length})`,
      }));

      setTimeout(() => {
        setMsgNivel((prev) => ({ ...prev, [nivel]: "" }));
      }, 4000);
    } catch (err) {
      console.error("Erro ao recarregar palavras:", err);
      setMsgNivel((prev) => ({
        ...prev,
        [nivel]: "❌ Erro ao gerar palavras.",
      }));
    } finally {
      setLoadingNivel((prev) => ({ ...prev, [nivel]: false }));
    }
  };

  // ===== Mostrar modal de palavras salvas do nível
  const openSavedModalForLevel = (level) => {
    setSavedModalOpen(true);
    setModalLevelViewing(level);
  };

  // ====== Próximo (avança fases / finaliza palavra) ======
  const proximo = async () => {
    if (fase < 2) {
      setFase((prev) => prev + 1);
      return;
    }

    if (!nivelSelecionado || !palavraAtual) {
      setPalavraAtual(null);
      return;
    }

    const ganho = XP_BY_WORD[nivelSelecionado] ?? 8;

    try {
      const res = await activitiesApi.trackWord({
        level: nivelSelecionado,
        word: palavraAtual,
        correct: true,
        xpGain: ganho,
      });

      if (res && typeof res.xp === "number") {
        setXp(res.xp);
        setPlayerLevel(calcPlayerLevel(res.xp));
      } else {
        setXp((prev) => {
          const novo = prev + ganho;
          setPlayerLevel(calcPlayerLevel(novo));
          return novo;
        });
      }

      setSavedWordsByLevel((prev) => {
        const copy = { ...prev };
        copy[nivelSelecionado] = new Set(copy[nivelSelecionado] || []);
        copy[nivelSelecionado].add(palavraAtual.toLowerCase());
        return copy;
      });
    } catch (err) {
      console.error("❌ Erro ao salvar progresso da palavra:", err);
      setXp((prev) => {
        const novo = prev + ganho;
        setPlayerLevel(calcPlayerLevel(novo));
        return novo;
      });
      setSavedWordsByLevel((prev) => {
        const copy = { ...prev };
        copy[nivelSelecionado] = new Set(copy[nivelSelecionado] || []);
        copy[nivelSelecionado].add(palavraAtual.toLowerCase());
        return copy;
      });
    } finally {
      const palavraJustCompleted = palavraAtual;
      setPalavraAtual(null);

      const palavras = niveis[nivelSelecionado] || [];
      const todasFeitas = palavras.every(
        (p) => (p || "").toLowerCase() === (palavraJustCompleted || "").toLowerCase()
      );

      if (todasFeitas) {
        setNivelCompleto((prev) => ({ ...prev, [nivelSelecionado]: true }));
        setNivelSelecionado(null);
      }
    }
  };

  const voltar = () => {
    if (fase > 0) {
      setFase((prev) => prev - 1);
    } else {
      setPalavraAtual(null);
    }
  };

  // ✅ HANDLER PARA ABRIR JOGOS
  const handleGameClick = (gameId) => {
    const currentLevelWords = niveis[playerLevel] || [];
    const userDoneWords = savedWordsByLevel[playerLevel] || new Set();
    
    const availableGameWords = currentLevelWords.filter(word => 
      !userDoneWords.has(word.toLowerCase())
    );

    const finalGameWords = availableGameWords.length > 0 
      ? availableGameWords 
      : Array.from(userDoneWords).slice(0, 6);

    console.log(`🎮 Preparando jogo ${gameId} com palavras:`, finalGameWords);
    
    setSelectedGame(gameId);
    setAvailableGameWords(finalGameWords);
    setModalAberto(true);
  };

  // ✅ VERIFICAR JOGOS DESBLOQUEADOS
  const unlockedGames = Object.values(GAMES_CONFIG).filter(game => 
    playerLevel >= game.unlockLevel
  );

  // ✅ PRÓXIMO JOGO A DESBLOQUEAR
  const nextGameToUnlock = Object.values(GAMES_CONFIG).find(game => 
    playerLevel < game.unlockLevel
  );

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

  // ===== ArteZone =====
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
      setMoedas((m) => m + 5);
      setAdesivos((a) => [...a, artePalavra]);
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

  // helper pra checar se palavra foi salva
  const isWordDone = (level, word) => {
    const s = savedWordsByLevel[level];
    return s ? s.has((word || "").toLowerCase()) : false;
  };

  // função para abrir lista de palavras salvas (botão)
  const handleOpenSavedList = (level) => {
    setModalLevelViewing(level);
    setSavedModalOpen(true);
  };

  return (
    <div className="main-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <img src={arvLogo} alt="Logo Arv" className="logo-img" />
          <h2 className="logo-text">AlphaZone</h2>
        </div>

        <UserMenu
          onOpenAccount={() => navigate("/account")}
          onLogout={async () => {
            try {
              if (logout) await logout();
            } finally {
              navigate("/login");
            }
          }}
        />
      </nav>

      {/* Dashboard Principal */}
      <div className="xp-dashboard-block">
        <h3>🎮 Seu Progresso</h3>
        <p>Nível atual: <strong>{playerLevel}</strong></p>
        <p>Total de XP: <strong>{xp}</strong></p>
        <div className="xp-bar-container">
          <div
            className="xp-bar"
            style={{ width: `${Math.min((xp / (nextGameToUnlock?.unlockXP || 400)) * 100, 100)}%` }}
          ></div>
        </div>
        {nextGameToUnlock ? (
          <p>Faltam {nextGameToUnlock.unlockXP - xp} XP para {nextGameToUnlock.name}</p>
        ) : (
          <p>🎉 Todos os jogos desbloqueados!</p>
        )}
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

                <button
                  className="refresh-btn"
                  onClick={() => recarregarNivel(n)}
                  title="Gerar novas palavras com IA"
                  disabled={!!loadingNivel[n]}
                >
                  {loadingNivel[n] ? "⏳ Gerando..." : "🔁 Novas palavras"}
                </button>

                <button
                  className="history-btn"
                  onClick={() => handleOpenSavedList(n)}
                  title="Ver palavras feitas anteriormente"
                >
                  📚 Lista de palavras feitas
                </button>
              </div>
            )}

            {!nivelSelecionado && msgNivel[n] && (
              <p
                style={{
                  marginTop: "8px",
                  fontSize: "0.9rem",
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
                {/* ===== WRAPPER COM SCROLLER (preserva layout) ===== */}
                <div className="word-selection-list">
                  { (niveis[n] || []).map((p, i) => {
                    const done = isWordDone(n, p);
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          className={`word-btn ${done ? "done" : ""}`}
                          onClick={() => escolherPalavra(p)}
                        >
                          {p}
                        </button>
                        {done && <span style={{ color: "#2e7d32", fontSize: 20 }}>✓</span>}
                      </div>
                    );
                  })}
                </div>

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

      {/* ===== SEÇÃO DE JOGOS CORRIGIDA ===== */}
      <div className="games-section">
        <h2>🎮 Jogos Interativos</h2>
        
        {/* ✅ DASHBOARD SIMPLES E LIMPO */}
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '15px', 
          borderRadius: '10px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '1.1rem' }}>
            <strong>Nível {playerLevel}</strong> • <strong>{xp} XP</strong> • 
            <strong> {unlockedGames.length}/{Object.values(GAMES_CONFIG).length} jogos</strong>
          </p>
          {nextGameToUnlock && (
            <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
              🔼 {nextGameToUnlock.unlockXP - xp} XP para {nextGameToUnlock.name}
            </p>
          )}
        </div>

        {/* Grid de Jogos */}
        <div className="games-grid">
          {Object.values(GAMES_CONFIG).map(game => {
            const isUnlocked = playerLevel >= game.unlockLevel;
            const isNextToUnlock = nextGameToUnlock?.id === game.id;
            
            return (
              <div
                key={game.id}
                className={`game-card ${isUnlocked ? 'unlocked' : 'locked'} ${
                  isNextToUnlock ? 'next-unlock' : ''
                }`}
                style={{ borderLeft: `4px solid ${game.color}` }}
              >
                <h3>{game.name}</h3>
                <p>{game.description}</p>
                
                <div className="game-info">
                  <span className="level-badge">Nv. {game.unlockLevel}</span>
                  <span className="xp-badge">{game.unlockXP} XP</span>
                </div>

                <button
                  className="game-btn"
                  disabled={!isUnlocked}
                  onClick={() => handleGameClick(game.id)}
                >
                  {isUnlocked ? '🎉 Jogar!' : '🔒 Bloqueado'}
                </button>

                {isNextToUnlock && (
                  <div className="next-unlock-indicator">
                    ⭐ Próximo a desbloquear!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de palavras salvas */}
      {savedModalOpen && (
        <div className="saved-modal-backdrop" onClick={() => setSavedModalOpen(false)}>
          <div className="saved-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Palavras geradas — Nível {modalLevelViewing}</h3>
            <div className="saved-list">
              {Array.from(savedWordsByLevel[modalLevelViewing] || []).length === 0 ? (
                <p>Nenhuma palavra salva ainda.</p>
              ) : (
                /* ===== WRAPPER COM SCROLLER NO MODAL ===== */
                <div className="saved-list-scroll" role="list" aria-label="Palavras geradas">
                  <ul>
                    {Array.from(savedWordsByLevel[modalLevelViewing] || []).map((w, i) => (
                      <li key={i}>
                        <button
                          className="small-word-btn"
                          onClick={() => {
                            setSavedModalOpen(false);
                            setNivelSelecionado(modalLevelViewing);
                            setPalavraAtual(w);
                            setFase(0);
                          }}
                        >
                          {w}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <button onClick={() => setSavedModalOpen(false)} className="cancel-btn">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal do Jogo */}
      <GameModal 
        isOpen={modalAberto} 
        onClose={() => {
          setModalAberto(false);
          setSelectedGame(null);
        }}
        gameType={selectedGame}
        currentLevel={playerLevel}
        currentXP={xp}
        availableWords={availableGameWords}
      />
    </div>
  );
}
