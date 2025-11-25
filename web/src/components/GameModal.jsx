import React, { useEffect, useRef, useState, useCallback } from 'react';

// Configuração dos jogos
const GAMES = {
  artezone: {
    name: '🎨 ArteZone',
    description: 'Desenhe e solte a criatividade!',
    component: ArteZoneGame
  },
  interag: {
    name: '🐭 Rato & Queijo',
    description: '',
    component: InteragGame
  },
  soundExplorer: {
    name: '🎵 Sound Explorer',
    description: 'Encontre os sons corretos!',
    component: SoundExplorerGame
  },
  wordBuilder: {
    name: '🧩 Word Builder',
    description: 'Monte palavras com sílabas!',
    component: WordBuilderGame
  },
  speedChallenge: {
    name: '🚀 Speed Challenge',
    description: 'Rápido! Digite as palavras antes do tempo acabar!',
    component: SpeedChallengeGame
  },
  masterQuest: {
    name: '🌟 Master Quest',
    description: 'Desafio final com múltiplas habilidades!',
    component: MasterQuestGame
  }
};

// Fallback robusto para palavras
function getFallbackWords(difficulty) {
  const fallbacks = {
    facil: [
      'pai', 'mãe', 'sol', 'lua', 'mar', 'pé', 'mão', 'cão', 'gato', 'pato', 
      'boi', 'vaca', 'peixe', 'flor', 'casa', 'porta', 'mesa', 'cama', 'carro', 'bola',
      'ovo', 'ceu', 'rio', 'sal', 'pão', 'luz', 'ar', 'paz', 'réu', 'voz'
    ],
    medio: [
      'cachorro', 'gatinho', 'casinha', 'portão', 'janela', 'cadeira', 'caminhão', 
      'bicicleta', 'boneca', 'carrinho', 'livro', 'caderno', 'lápis', 'chuva', 
      'vento', 'fogo', 'água', 'leite', 'pão', 'bolo', 'escola', 'amigo', 'família',
      'brinquedo', 'parque', 'praia', 'floresta', 'montanha'
    ],
    dificil: [
      'brinquedo', 'amarelo', 'vermelho', 'azulinho', 'janelinha', 'desenho', 
      'caderno', 'parquinho', 'escolinha', 'professor', 'amiguinho', 'cachorrinho', 
      'gatinho', 'plantinha', 'floresta', 'montanha', 'rio', 'praia', 'oceano',
      'aventura', 'descoberta', 'aprendizado', 'criatividade', 'imaginação'
    ]
  };
  return fallbacks[difficulty] || fallbacks.facil;
}

// ✅ Função para embaralhar array
function shuffleArray(array) {
  if (!array || array.length === 0) return [];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Hook simplificado e robusto para carregar whitelists
function useMinigameWords(level, difficulty = 'facil') {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWords = async () => {
      try {
        setLoading(true);
        // Tenta carregar do arquivo TXT
        const response = await fetch(`/data/whitelist_minigames_${difficulty}.txt`);
        
        if (response.ok) {
          const text = await response.text();
          const loadedWords = text.split('\n')
            .map(word => word.trim())
            .filter(word => word && word.length > 0);
          
          if (loadedWords.length > 0) {
            setWords(shuffleArray(loadedWords));
          } else {
            throw new Error('Arquivo vazio');
          }
        } else {
          throw new Error('Arquivo não encontrado');
        }
      } catch (error) {
        console.warn(`Usando fallback para dificuldade ${difficulty}:`, error.message);
        // Fallback robusto
        setWords(shuffleArray(getFallbackWords(difficulty)));
      } finally {
        setLoading(false);
      }
    };

    loadWords();
  }, [level, difficulty]);

  return { words, loading };
}

export default function GameModal({ isOpen, onClose, gameType = 'interag', currentLevel = 1 }) {
  const gameConfig = GAMES[gameType] || GAMES.interag;
  const GameComponent = gameConfig.component;

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%',
      height: '100%', background: 'rgba(0,0,0,0.6)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 999
    }}>
      <div style={{
        background: '#fff', padding: 20, borderRadius: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        maxWidth: '90%', maxHeight: '90%', overflow: 'auto',
        minWidth: '300px'
      }}>
        <h2 style={{ margin: '0 0 10px 0' }}>{gameConfig.name}</h2>
        <p style={{ color: '#666', marginBottom: '1rem', textAlign: 'center' }}>
          {gameConfig.description}
        </p>
       
        <GameComponent
          onClose={onClose}
          currentLevel={currentLevel}
        />
      </div>
    </div>
  );
}

// ===== JOGO 0: ARTZONE =====
function ArteZoneGame({ onClose }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [artePalavra, setArtePalavra] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#333";
    ctxRef.current = ctx;
  }, []);

  const startDrawing = (e) => {
    if (!ctxRef.current || !canvasRef.current) return;
    setDrawing(true);
    ctxRef.current.beginPath();
    const x = e.nativeEvent?.offsetX ?? (e.touches?.[0].clientX - canvasRef.current.offsetLeft);
    const y = e.nativeEvent?.offsetY ?? (e.touches?.[0].clientY - canvasRef.current.offsetTop);
    ctxRef.current.moveTo(x, y);
  };

  const draw = (e) => {
    if (!drawing || !ctxRef.current || !canvasRef.current) return;
    const x = e.nativeEvent?.offsetX ?? (e.touches?.[0].clientX - canvasRef.current.offsetLeft);
    const y = e.nativeEvent?.offsetY ?? (e.touches?.[0].clientY - canvasRef.current.offsetTop);
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
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 3000);
  };

  const palavrasSurpresa = ["Sol", "Lua", "Cachorro", "Flor", "Peixe", "Casa", "Árvore"];
  const desafioSurpresa = () => {
    const randomWord = palavrasSurpresa[Math.floor(Math.random() * palavrasSurpresa.length)];
    setArtePalavra(randomWord);
  };

  return (
    <div style={{ textAlign: 'center', minWidth: '300px' }}>
      <h3>🎨 ArteZone</h3>
      <p>Desenhe livremente ou siga um desafio!</p>
      
      {artePalavra && (
        <div style={{ 
          background: '#f0f8ff', 
          padding: '10px', 
          borderRadius: '10px',
          margin: '10px 0',
          border: '2px dashed #4ECDC4'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>🎯 Desafio: Desenhe uma <strong>{artePalavra}</strong></p>
        </div>
      )}

      <div style={{ position: 'relative', margin: '15px 0' }}>
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={300}
          style={{ 
            border: '2px solid #333', 
            borderRadius: '10px',
            background: 'white',
            cursor: 'crosshair'
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        ></canvas>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '15px 0', flexWrap: 'wrap' }}>
        <button
          onClick={clearCanvas}
          style={{
            padding: '10px 15px',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🧹 Limpar
        </button>
        
        <button
          onClick={desafioSurpresa}
          style={{
            padding: '10px 15px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🎯 Novo Desafio
        </button>
        
        <button
          onClick={submitDrawing}
          style={{
            padding: '10px 15px',
            background: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          ✅ Finalizar
        </button>
      </div>

      {showFeedback && (
        <div style={{
          background: '#d4edda',
          color: '#155724',
          padding: '10px',
          borderRadius: '8px',
          margin: '10px 0',
          border: '1px solid #c3e6cb'
        }}>
          🎉 Obra de arte incrível! Continue praticando!
        </div>
      )}

      <button onClick={onClose} style={{
        marginTop: 15, padding: '10px 20px', borderRadius: 12,
        border: 'none', background: '#36d1dc', color: 'white', cursor: 'pointer'
      }}>Fechar</button>
    </div>
  );
}

// ===== JOGO 1: INTERAG CORRIGIDO - SEM INVENCIBILIDADE =====
function InteragGame({ onClose }) {
  const canvasRef = useRef(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState('menu');
  const [countdown, setCountdown] = useState(5); // ✅ Mantido 5s
  const [isMobile, setIsMobile] = useState(false);
  // ✅ INVENCIBILIDADE REMOVIDA

  const player = useRef({ x: 50, y: 50, size: 30 });
  const keys = useRef({ ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false });
  const cheeses = useRef([]);
  const cats = useRef([]);
  const touchControls = useRef({ up: false, down: false, left: false, right: false });
  const countdownRef = useRef(null);
  const animationRef = useRef(null);
  // ✅ REFERÊNCIA DE INVENCIBILIDADE REMOVIDA

  const canvasWidth = 400;
  const canvasHeight = 400;

  // ✅ CONFIGURAÇÕES DE DIFICULDADE POR NÍVEL (mantido igual)
  const LEVEL_CONFIG = {
    1: { cats: 1, catSpeed: 1.0 },
    2: { cats: 2, catSpeed: 1.2 },
    3: { cats: 2, catSpeed: 1.4 },
    4: { cats: 3, catSpeed: 1.6 },
    5: { cats: 3, catSpeed: 1.8 },
    6: { cats: 4, catSpeed: 2.0 },
    7: { cats: 4, catSpeed: 2.2 },
    8: { cats: 5, catSpeed: 2.4 },
    9: { cats: 5, catSpeed: 2.6 },
    10: { cats: 6, catSpeed: 2.8 }
  };

  // ✅ CARREGAR PROGRESSO SALVO (mantido igual)
  useEffect(() => {
    const savedProgress = localStorage.getItem('interagProgress');
    if (savedProgress) {
      const { level: savedLevel, score: savedScore } = JSON.parse(savedProgress);
      setLevel(savedLevel);
      setScore(savedScore);
    }
  }, []);

  // ✅ SALVAR PROGRESSO (mantido igual)
  const saveProgress = () => {
    localStorage.setItem('interagProgress', JSON.stringify({
      level: level,
      score: score
    }));
  };

  // ✅ DETECTAR SE É MOBILE (mantido igual)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // ✅ CORREÇÃO: Reset completo SEM invencibilidade
  const initializeGame = (resetLevel = false) => {
    // ✅ Limpar timers (mantido igual, sem invencibilidade)
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const currentLevel = resetLevel ? 1 : level;
    
    // ✅ Configurações baseadas no nível atual (mantido igual)
    const config = LEVEL_CONFIG[Math.min(currentLevel, 10)] || LEVEL_CONFIG[10];
    
    cheeses.current = Array.from({ length: 3 + currentLevel }, () => ({
      x: Math.random() * (canvasWidth - 30) + 15,
      y: Math.random() * (canvasHeight - 30) + 15,
      size: 25,
      collected: false,
    }));

    // ✅ CORREÇÃO: Velocidade FIXA por nível (mantido igual)
    cats.current = Array.from({ length: config.cats }, () => ({
      x: Math.random() * (canvasWidth - 30) + 15,
      y: Math.random() * (canvasHeight - 30) + 15,
      size: 28,
      speed: config.catSpeed,
    }));

    // ✅ Resetar posição do jogador e controles (mantido igual)
    player.current.x = 50;
    player.current.y = 50;
    
    keys.current = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
    touchControls.current = { up: false, down: false, left: false, right: false };
    
    // ✅ CORREÇÃO CRÍTICA: Sempre resetar para nível 1 quando resetLevel for true
    if (resetLevel) {
      setLevel(1);
      setScore(0);
      setLives(3); // ✅ IMPORTANTE: Resetar vidas também
      localStorage.removeItem('interagProgress');
    } else {
      saveProgress();
    }
  };

  const preventArrowKeyScroll = (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      if (gameState === 'playing' || gameState === 'countdown') {
        e.preventDefault();
      }
    }
  };

  // ✅ CONTROLES TOUCH MELHORADOS (mantido igual)
  const handleTouchStart = (direction) => {
    if (gameState !== 'playing') return;
    
    touchControls.current[direction] = true;
    
    switch(direction) {
      case 'up': keys.current.ArrowUp = true; break;
      case 'down': keys.current.ArrowDown = true; break;
      case 'left': keys.current.ArrowLeft = true; break;
      case 'right': keys.current.ArrowRight = true; break;
    }
  };

  const handleTouchEnd = (direction) => {
    touchControls.current[direction] = false;
    
    switch(direction) {
      case 'up': keys.current.ArrowUp = false; break;
      case 'down': keys.current.ArrowDown = false; break;
      case 'left': keys.current.ArrowLeft = false; break;
      case 'right': keys.current.ArrowRight = false; break;
    }
  };

  // ✅ CORREÇÃO: Countdown de 5s (MANTIDO IGUAL)
  const startCountdown = (afterGameOver = false) => {
    console.log('🔄 Iniciando countdown...');
    
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    // ✅ CORREÇÃO: Inicializar o jogo ANTES de setar o countdown
    if (afterGameOver) {
      initializeGame(true); // true = reset completo para nível 1
    } else {
      initializeGame(false);
    }

    setGameState('countdown');
    setCountdown(5);

    // ✅ Countdown mantido igual ao original
    setTimeout(() => {
      countdownRef.current = setInterval(() => {
        setCountdown((currentCountdown) => {
          console.log(`⏱️ Countdown: ${currentCountdown}`);
          
          if (currentCountdown <= 1) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
            setGameState('playing');
            console.log('🎮 Iniciando jogo!');
            return 5;
          }
          return currentCountdown - 1;
        });
      }, 1000);
    }, 50);
  };

  // ✅ CORREÇÃO: Restart game
  const restartGame = () => {
    startCountdown(true); // true = reset completo
  };

  // ✅ CORREÇÃO: Next level
  const nextLevel = () => {
    setLevel(prev => prev + 1);
    startCountdown(false);
  };

  // ✅ CORREÇÃO: Cleanup completo (sem invencibilidade)
  useEffect(() => {
    window.addEventListener('keydown', preventArrowKeyScroll);
    
    return () => {
      window.removeEventListener('keydown', preventArrowKeyScroll);
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [gameState]);

  // ✅ CORREÇÃO: Game loop SEM invencibilidade
  useEffect(() => {
    if (gameState !== 'playing') {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        keys.current[e.key] = true;
      }
    };
    
    const handleKeyUp = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        keys.current[e.key] = false;
      }
    };

    if (!isMobile) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }

    const gameLoop = () => {
      if (gameState !== 'playing') return;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Desenhar fundo (gramado)
      ctx.fillStyle = '#90EE90';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Movimento do jogador (mantido igual)
      const speed = 4 + (level * 0.3);
      if (keys.current.ArrowUp) player.current.y -= speed;
      if (keys.current.ArrowDown) player.current.y += speed;
      if (keys.current.ArrowLeft) player.current.x -= speed;
      if (keys.current.ArrowRight) player.current.x += speed;

      // Limites do canvas
      player.current.x = Math.max(0, Math.min(canvasWidth - player.current.size, player.current.x));
      player.current.y = Math.max(0, Math.min(canvasHeight - player.current.size, player.current.y));

      // ✅ Desenhar jogador SEM efeitos de invencibilidade
      ctx.font = `${player.current.size}px Arial`;
      ctx.fillText('🐀', player.current.x, player.current.y + player.current.size);

      // Desenhar e verificar queijos (mantido igual)
      let cheesesCollected = 0;
      cheeses.current.forEach(cheese => {
        if (!cheese.collected) {
          ctx.font = `${cheese.size}px Arial`;
          ctx.fillText('🧀', cheese.x, cheese.y + cheese.size);
         
          if (
            player.current.x < cheese.x + cheese.size &&
            player.current.x + player.current.size > cheese.x &&
            player.current.y < cheese.y + cheese.size &&
            player.current.y + player.current.size > cheese.y
          ) {
            cheese.collected = true;
            setScore(prev => prev + (10 * level));
            cheesesCollected++;
          }
        } else {
          cheesesCollected++;
        }
      });

      // Mover e desenhar gatos (mantido igual)
      cats.current.forEach(cat => {
        if (cat.x < player.current.x) cat.x += cat.speed;
        if (cat.x > player.current.x) cat.x -= cat.speed;
        if (cat.y < player.current.y) cat.y += cat.speed;
        if (cat.y > player.current.y) cat.y -= cat.speed;

        cat.x = Math.max(0, Math.min(canvasWidth - cat.size, cat.x));
        cat.y = Math.max(0, Math.min(canvasHeight - cat.size, cat.y));

        ctx.font = `${cat.size}px Arial`;
        ctx.fillText('🐈', cat.x, cat.y + cat.size);
       
        // ✅ CORREÇÃO: Verificação de colisão SEMPRE ativa (sem invencibilidade)
        if (player.current.x < cat.x + cat.size &&
            player.current.x + player.current.size > cat.x &&
            player.current.y < cat.y + cat.size &&
            player.current.y + player.current.size > cat.y
        ) {
          const newLives = lives - 1;
          setLives(newLives);
          
          // ✅ SEMPRE reposicionar jogador (sem ativar invencibilidade)
          player.current.x = 50;
          player.current.y = 50;
          
          if (newLives <= 0) {
            setGameState('gameOver');
            return;
          }
        }
      });

      if (cheesesCollected === cheeses.current.length) {
        setGameState('levelComplete');
      } else {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (!isMobile) {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [gameState, level, isMobile, lives]); // ✅ invincible removido das dependências

  // ✅ COMPONENTE DE CONTROLES TOUCH (mantido igual)
  const TouchControls = () => (
    <div style={{
      position: 'relative',
      marginTop: '20px',
      touchAction: 'none'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 60px)',
        gridTemplateRows: 'repeat(3, 60px)',
        gap: '8px',
        justifyContent: 'center',
        margin: '0 auto'
      }}>
        <div></div>
        <button
          onTouchStart={() => handleTouchStart('up')}
          onTouchEnd={() => handleTouchEnd('up')}
          style={{
            width: '60px',
            height: '60px',
            background: touchControls.current.up ? '#3498db' : '#95a5a6',
            border: 'none',
            borderRadius: '15px',
            fontSize: '1.8rem',
            color: 'white',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'all 0.1s ease'
          }}
        >
          ↑
        </button>
        <div></div>
        
        <button
          onTouchStart={() => handleTouchStart('left')}
          onTouchEnd={() => handleTouchEnd('left')}
          style={{
            width: '60px',
            height: '60px',
            background: touchControls.current.left ? '#3498db' : '#95a5a6',
            border: 'none',
            borderRadius: '15px',
            fontSize: '1.8rem',
            color: 'white',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'all 0.1s ease'
          }}
        >
          ←
        </button>
        <div style={{
          width: '60px',
          height: '60px',
          background: '#34495e',
          borderRadius: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '1rem'
        }}>
          🎮
        </div>
        <button
          onTouchStart={() => handleTouchStart('right')}
          onTouchEnd={() => handleTouchEnd('right')}
          style={{
            width: '60px',
            height: '60px',
            background: touchControls.current.right ? '#3498db' : '#95a5a6',
            border: 'none',
            borderRadius: '15px',
            fontSize: '1.8rem',
            color: 'white',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'all 0.1s ease'
          }}
        >
          →
        </button>
        
        <div></div>
        <button
          onTouchStart={() => handleTouchStart('down')}
          onTouchEnd={() => handleTouchEnd('down')}
          style={{
            width: '60px',
            height: '60px',
            background: touchControls.current.down ? '#3498db' : '#95a5a6',
            border: 'none',
            borderRadius: '15px',
            fontSize: '1.8rem',
            color: 'white',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'all 0.1s ease'
          }}
        >
          ↓
        </button>
        <div></div>
      </div>
    </div>
  );

  // ✅ RENDERIZAÇÃO (mantida igual, apenas removidos indicadores de invencibilidade)
  const renderGameContent = () => {
    if (gameState === 'menu') {
      return (
        <div style={{ textAlign: 'center' }}>
          <h3>🐭 Rato & Queijo</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Faça o rato pegar o queijo e evite o gato!
          </p>
          
          {level > 1 && (
            <div style={{
              background: '#e8f4fd',
              padding: '10px',
              borderRadius: '8px',
              margin: '10px 0',
              border: '2px solid #3498db'
            }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#2980b9' }}>
                ⚡ Progresso Salvo: Nível {level} • {score} pontos
              </p>
            </div>
          )}
          
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '10px',
            margin: '20px 0',
            border: '2px solid #FFD93D'
          }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>🎮 Como Jogar:</p>
            {isMobile ? (
              <>
                <p style={{ margin: '5px 0' }}>• Use os <strong>botões touch</strong> para mover o rato</p>
                <p style={{ margin: '5px 0' }}>• Toque e segure nas setas para se mover</p>
              </>
            ) : (
              <p style={{ margin: '5px 0' }}>• Use as <strong>setas do teclado</strong> para mover o rato</p>
            )}
            <p style={{ margin: '5px 0' }}>• Colete todos os <strong>queijos 🧀</strong></p>
            <p style={{ margin: '5px 0' }}>• Evite os <strong>gatos 🐈</strong></p>
            <p style={{ margin: '5px 0' }}>• <strong>🎯 Dificuldade:</strong> Mais gatos e velocidade por nível</p>
          </div>

          <button
            onClick={() => startCountdown(false)}
            style={{
              padding: '15px 30px',
              background: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginBottom: '15px'
            }}
          >
            {level > 1 ? `🎯 Continuar Nível ${level}` : '🎯 Começar Jogo'}
          </button>

          {level > 1 && (
            <button
              onClick={() => {
                // ✅ CORREÇÃO: Reset direto e completo para nível 1
                setLevel(1);
                setScore(0);
                setLives(3); // ✅ Resetar vidas também
                localStorage.removeItem('interagProgress');
                startCountdown(false);
              }}
              style={{
                padding: '10px 20px',
                background: '#e67e22',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                marginBottom: '15px',
                width: '100%'
              }}
            >
              🔄 Reiniciar do Nível 1
            </button>
          )}

          <button onClick={onClose} style={{
            padding: '10px 20px', 
            borderRadius: 8,
            border: 'none', 
            background: '#36d1dc', 
            color: 'white', 
            cursor: 'pointer',
            display: 'block',
            width: '100%'
          }}>
            Sair
          </button>
        </div>
      );
    }

    // ... (resto do código de renderização mantido EXATAMENTE igual)
    // Apenas removidos os elementos relacionados à invencibilidade

    if (gameState === 'countdown') {
      return (
        <>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '15px',
            background: 'rgba(255,255,255,0.9)',
            padding: '10px',
            borderRadius: '10px'
          }}>
            <div><strong>❤️ Vidas:</strong> {lives}</div>
            <div><strong>🧀 Pontos:</strong> {score}</div>
            <div><strong>🎯 Nível:</strong> {level}</div>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
            {isMobile ? 'Use os botões abaixo para mover' : 'Use as setas para mover'} • Colete {cheeses.current.length} queijos • Evite os gatos 🐈
          </p>

          <div style={{ position: 'relative' }}>
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              style={{
                border: '2px solid #333',
                borderRadius: '10px',
                background: '#90EE90',
                cursor: 'none',
                touchAction: 'none',
                opacity: 0.7
              }}
            ></canvas>
            
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '30px 40px',
              borderRadius: '20px',
              fontSize: '3rem',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              zIndex: 10
            }}>
              {countdown}
            </div>
          </div>

          {isMobile && <TouchControls />}

          <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#666' }}>
            <p>O jogo começa em {countdown} segundos...</p>
          </div>

          <button onClick={onClose} style={{
            marginTop: 15, padding: '10px 20px', borderRadius: 12,
            border: 'none', background: '#36d1dc', color: 'white', cursor: 'pointer',
            width: '100%'
          }}>
            Sair do Jogo
          </button>
        </>
      );
    }

    if (gameState === 'gameOver') {
      return (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#e74c3c', marginBottom: '20px' }}>💀 O gato pegou você!</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
            Queijos coletados: <strong>{score}</strong>
          </p>
          <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
            Nível Alcançado: <strong>{level}</strong>
          </p>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={restartGame}
              style={{
                padding: '12px 24px',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              🔄 Jogar Novamente
            </button>
            
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              🏠 Sair
            </button>
          </div>
        </div>
      );
    }

    if (gameState === 'levelComplete') {
      const nextConfig = LEVEL_CONFIG[Math.min(level + 1, 10)] || LEVEL_CONFIG[10];
      return (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#27ae60', marginBottom: '20px' }}>🎉 Nível {level} Completo!</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
            Queijos coletados: <strong>{score}</strong>
          </p>
          <div style={{
            background: '#f8f9fa',
            padding: '15px',
            borderRadius: '10px',
            margin: '15px 0',
            border: '2px solid #FFD93D'
          }}>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>🎯 Próximo Nível {level + 1}:</p>
            <p style={{ margin: '3px 0' }}>• <strong>{nextConfig.cats} gatos</strong> 🐈</p>
            <p style={{ margin: '3px 0' }}>• <strong>Velocidade: {nextConfig.catSpeed.toFixed(1)}x</strong></p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={nextLevel}
              style={{
                padding: '12px 24px',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              🚀 Próximo Nível
            </button>
            
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: '#36d1dc',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              🏠 Sair
            </button>
          </div>
        </div>
      );
    }

    // Jogo em andamento
    return (
      <>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '15px',
          background: 'rgba(255,255,255,0.9)',
          padding: '10px',
          borderRadius: '10px'
        }}>
          <div><strong>❤️ Vidas:</strong> {lives}</div>
          <div><strong>🧀 Pontos:</strong> {score}</div>
          <div><strong>🎯 Nível:</strong> {level}</div>
        </div>

        {/* ✅ INDICADOR DE INVENCIBILIDADE REMOVIDO */}

        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
          {isMobile ? 'Use os botões abaixo para mover' : 'Use as setas para mover'} • Colete {cheeses.current.length} queijos • Evite os gatos 🐈
        </p>

        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{
            border: '2px solid #333',
            borderRadius: '10px',
            background: '#90EE90',
            cursor: 'none',
            touchAction: 'none'
          }}
        ></canvas>

        {isMobile && <TouchControls />}

        <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#666' }}>
          <p>🎮 Dica: Mais gatos e velocidade em níveis mais altos!</p>
        </div>

        <button onClick={onClose} style={{
          marginTop: 15, padding: '10px 20px', borderRadius: 12,
          border: 'none', background: '#36d1dc', color: 'white', cursor: 'pointer',
          width: '100%'
        }}>
          Sair do Jogo
        </button>
      </>
    );
  };

  return (
    <div style={{ textAlign: 'center', minWidth: '320px' }}>
      {renderGameContent()}
    </div>
  );
}

// ===== JOGO 2: SOUND EXPLORER CORRIGIDO =====
function SoundExplorerGame({ onClose, currentLevel }) {
  const [score, setScore] = useState(0);
  const [currentSound, setCurrentSound] = useState('');
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [usedWords, setUsedWords] = useState(new Set());
  const [difficulty, setDifficulty] = useState('facil');
  
  const { words, loading } = useMinigameWords(currentLevel, difficulty);

  useEffect(() => {
    if (words.length > 0 && !loading) {
      generateQuestion();
    }
  }, [words, loading, difficulty]);

  const generateQuestion = () => {
    if (words.length === 0) {
      setFeedback('❌ Nenhuma palavra disponível');
      return;
    }

    const availableWords = words.filter(word => !usedWords.has(word));
    const wordPool = availableWords.length > 0 ? availableWords : words;
    
    const correctWord = wordPool[Math.floor(Math.random() * wordPool.length)];
    setUsedWords(prev => {
      const newUsed = new Set([...prev, correctWord]);
      if (newUsed.size > 8) {
        const array = Array.from(newUsed);
        return new Set(array.slice(1));
      }
      return newUsed;
    });
   
    const otherWords = words.filter(word => word !== correctWord);
    const wrongOptions = otherWords.length >= 3
      ? shuffleArray(otherWords).slice(0, 3)
      : shuffleArray(['ba', 'be', 'bi', 'bo', 'bu']).slice(0, 3);
   
    const allOptions = shuffleArray([correctWord, ...wrongOptions]);
   
    setCurrentSound(correctWord);
    setOptions(allOptions);
    setFeedback('');
  };

  const playSound = (sound) => {
    if (isPlaying) return;
   
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(sound);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.7;
    utterance.pitch = 1.0;
   
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
   
    speechSynthesis.speak(utterance);
  };

  const handleAnswer = (selectedSound) => {
    if (isPlaying) return;
   
    if (selectedSound !== currentSound) {
      playSound(selectedSound);
    }
   
    if (selectedSound === currentSound) {
      setScore(prev => prev + 1);
      setFeedback('✅ Correto!');
      setTimeout(() => {
        setFeedback('');
        generateQuestion();
      }, 1500);
    } else {
      setFeedback('❌ Tente novamente!');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h3>🎵 Sound Explorer</h3>
        <p>Carregando palavras...</p>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '10px auto'
        }}></div>
        <button onClick={onClose} style={{
          marginTop: 15, padding: '10px 20px', borderRadius: 12,
          border: 'none', background: '#36d1dc', color: 'white', cursor: 'pointer'
        }}>
          Fechar
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>🎵 Sound Explorer</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Dificuldade:</label>
        <select 
          value={difficulty} 
          onChange={(e) => setDifficulty(e.target.value)}
          style={{
            padding: '5px 10px',
            borderRadius: '5px',
            border: '2px solid #3498db'
          }}
        >
          <option value="facil">Fácil</option>
          <option value="medio">Médio</option>
          <option value="dificil">Difícil</option>
        </select>
      </div>

      <p>Pontuação: {score}</p>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        Palavras disponíveis: {words.length}
      </p>
     
      <div style={{ margin: '20px 0' }}>
        <button
          onClick={() => playSound(currentSound)}
          disabled={isPlaying || !currentSound}
          style={{
            padding: '15px 30px',
            fontSize: '1.5rem',
            background: isPlaying ? '#95a5a6' : '#4ECDC4',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: (isPlaying || !currentSound) ? 'not-allowed' : 'pointer',
            opacity: (isPlaying || !currentSound) ? 0.7 : 1
          }}
        >
          {isPlaying ? '🔊 Tocando...' : '🔈 Ouvir Som'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '10px', margin: '20px 0' }}>
        {options.map((sound, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(sound)}
            disabled={isPlaying}
            style={{
              padding: '12px',
              fontSize: '1.2rem',
              background: '#45B7D1',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: isPlaying ? 'not-allowed' : 'pointer',
              opacity: isPlaying ? 0.7 : 1
            }}
          >
            {sound}
          </button>
        ))}
      </div>

      {feedback && (
        <p style={{
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: feedback.includes('✅') ? 'green' : 'red',
          minHeight: '30px'
        }}>
          {feedback}
        </p>
      )}

      <button onClick={onClose} style={{
        marginTop: 15, padding: '10px 20px', borderRadius: 12,
        border: 'none', background: '#36d1dc', color: 'white', cursor: 'pointer'
      }}>
        Fechar
      </button>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ===== JOGO 3: WORD BUILDER CORRIGIDO =====
function WordBuilderGame({ onClose, currentLevel }) {
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [syllables, setSyllables] = useState([]);
  const [selectedSyllables, setSelectedSyllables] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [usedWords, setUsedWords] = useState(new Set());
  const [difficulty, setDifficulty] = useState('facil');
  
  const { words, loading } = useMinigameWords(currentLevel, difficulty);

  useEffect(() => {
    if (words.length > 0 && !loading) {
      generateWord();
    }
  }, [words, loading, difficulty]);

  const splitIntoSyllables = (word) => {
    if (!word || word.length <= 2) return [word];
    const syllables = [];
    for (let i = 0; i < word.length; i += 2) {
      syllables.push(word.slice(i, i + 2));
    }
    return syllables;
  };

  const generateWrongSyllables = () => {
    const commonWrong = ['xi', 'zu', 'fa', 'ke', 'vo', 'pi', 'tu', 'ne'];
    return shuffleArray(commonWrong).slice(0, 2);
  };

  const generateWord = () => {
    if (words.length === 0) {
      setFeedback('❌ Nenhuma palavra disponível');
      return;
    }

    const availableWords = words.filter(word => !usedWords.has(word));
    const wordPool = availableWords.length > 0 ? availableWords : words;
    
    const word = wordPool[Math.floor(Math.random() * wordPool.length)];
    setUsedWords(prev => {
      const newUsed = new Set([...prev, word]);
      if (newUsed.size > 6) {
        const array = Array.from(newUsed);
        return new Set(array.slice(1));
      }
      return newUsed;
    });

    const wordSyllables = splitIntoSyllables(word);
    const wordSyllablesWithId = wordSyllables.map((syllable, index) => ({
      id: `${syllable}_${index}`,
      text: syllable
    }));

    const wrongSyllables = generateWrongSyllables().map((syllable, index) => ({
      id: `wrong_${syllable}_${index}`,
      text: syllable
    }));

    const allSyllables = shuffleArray([...wordSyllablesWithId, ...wrongSyllables]);
   
    setCurrentWord(word);
    setSyllables(allSyllables);
    setSelectedSyllables([]);
    setFeedback('');
  };

  const handleSyllableClick = (syllable) => {
    if (selectedSyllables.find(s => s.id === syllable.id)) return;
    setSelectedSyllables(prev => [...prev, syllable]);
  };

  const checkWord = () => {
    const attemptedWord = selectedSyllables.map(s => s.text).join('');
    if (attemptedWord === currentWord) {
      setScore(prev => prev + 1);
      setFeedback('✅ Palavra correta!');
      setTimeout(() => {
        setFeedback('');
        generateWord();
      }, 1500);
    } else {
      setFeedback('❌ Tente novamente!');
      setTimeout(() => {
        setSelectedSyllables([]);
        setFeedback('');
      }, 1500);
    }
  };

  const resetSelection = () => {
    setSelectedSyllables([]);
    setFeedback('');
  };

  const isSyllableSelected = (syllable) => {
    return selectedSyllables.some(s => s.id === syllable.id);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h3>🧩 Word Builder</h3>
        <p>Carregando palavras...</p>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '10px auto'
        }}></div>
        <button onClick={onClose} style={{
          marginTop: 15, padding: '10px 20px', borderRadius: 12,
          border: 'none', background: '#36d1dc', color: 'white', cursor: 'pointer'
        }}>
          Fechar
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>🧩 Monte a Palavra</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Dificuldade:</label>
        <select 
          value={difficulty} 
          onChange={(e) => setDifficulty(e.target.value)}
          style={{
            padding: '5px 10px',
            borderRadius: '5px',
            border: '2px solid #3498db'
          }}
        >
          <option value="facil">Fácil</option>
          <option value="medio">Médio</option>
          <option value="dificil">Difícil</option>
        </select>
      </div>

      <p>Pontuação: {score}</p>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        Palavras disponíveis: {words.length}
      </p>
     
      <div style={{
        background: '#f0f0f0',
        padding: '15px',
        borderRadius: '10px',
        margin: '15px 0',
        minHeight: '50px',
        border: '2px solid #3498db',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
          {selectedSyllables.map(s => s.text).join('') || '______'}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', margin: '15px 0' }}>
        {syllables.map((syllable) => (
          <button
            key={syllable.id}
            onClick={() => handleSyllableClick(syllable)}
            disabled={isSyllableSelected(syllable)}
            style={{
              padding: '10px 15px',
              background: isSyllableSelected(syllable) ? '#95a5a6' : '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isSyllableSelected(syllable) ? 'not-allowed' : 'pointer',
              fontSize: '1.1rem',
              minWidth: '60px'
            }}
          >
            {syllable.text}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '15px 0' }}>
        <button
          onClick={checkWord}
          disabled={selectedSyllables.length === 0}
          style={{
            padding: '10px 20px',
            background: selectedSyllables.length === 0 ? '#bdc3c7' : '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: selectedSyllables.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          ✅ Verificar
        </button>
       
        <button
          onClick={resetSelection}
          style={{
            padding: '10px 20px',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🔄 Limpar
        </button>
      </div>

      {feedback && (
        <p style={{
          fontSize: '1.1rem',
          fontWeight: 'bold',
          color: feedback.includes('✅') ? 'green' : 'red',
          minHeight: '30px'
        }}>
          {feedback}
        </p>
      )}

      <button onClick={onClose} style={{
        marginTop: 15, padding: '10px 20px', borderRadius: 12,
        border: 'none', background: '#36d1dc', color: 'white', cursor: 'pointer'
      }}>
        Fechar
      </button>
    </div>
  );
}

// ===== JOGO 4: SPEED CHALLENGE CORRIGIDO =====
function SpeedChallengeGame({ onClose, currentLevel }) {
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [gameActive, setGameActive] = useState(false); // ✅ MUDADO para false inicial
  const [usedWords, setUsedWords] = useState(new Set());
  const [difficulty, setDifficulty] = useState('facil');
  const [feedback, setFeedback] = useState('');
  const [gameStarted, setGameStarted] = useState(false); // ✅ NOVO ESTADO
 
  const { words, loading } = useMinigameWords(currentLevel, difficulty);

  const DIFFICULTY_CONFIG = {
    facil: { time: 30, points: 10, timeBonus: 5 },
    medio: { time: 20, points: 15, timeBonus: 3 },
    dificil: { time: 15, points: 20, timeBonus: 2 }
  };

  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_CONFIG[difficulty].time);

  useEffect(() => {
    if (words.length > 0 && !loading && gameActive) {
      nextWord();
    }
  }, [words, loading, gameActive, difficulty]);

  useEffect(() => {
    if (gameActive) {
      setTimeLeft(DIFFICULTY_CONFIG[difficulty].time);
    }
  }, [difficulty, gameActive]);

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameActive(false);
    }
  }, [timeLeft, gameActive]);

  const nextWord = () => {
    if (words.length === 0) return;
   
    const availableWords = words.filter(word => !usedWords.has(word));
    const wordPool = availableWords.length > 0 ? availableWords : words;
   
    const randomWord = wordPool[Math.floor(Math.random() * wordPool.length)];
    setCurrentWord(randomWord);
    setInputValue('');
    setUsedWords(prev => {
      const newUsed = new Set([...prev, randomWord]);
      if (newUsed.size > 10) {
        const array = Array.from(newUsed);
        return new Set(array.slice(1));
      }
      return newUsed;
    });
    setFeedback('');
  };

  const handleInputChange = (e) => {
    if (!gameActive) return;
    setInputValue(e.target.value);
  };

  const handleInputSubmit = (e) => {
    if (e.key === 'Enter' && gameActive && inputValue.trim()) {
      if (inputValue.toLowerCase() === currentWord.toLowerCase()) {
        const points = DIFFICULTY_CONFIG[difficulty].points;
        const timeBonus = DIFFICULTY_CONFIG[difficulty].timeBonus;
        
        setScore(prev => prev + points);
        setTimeLeft(prev => prev + timeBonus);
        setFeedback(`✅ +${points} pontos! +${timeBonus}s`);
       
        setTimeout(() => {
          setFeedback('');
          nextWord();
        }, 800);
      } else {
        setFeedback('❌ Tente novamente!');
        setInputValue('');
        setTimeout(() => setFeedback(''), 1000);
      }
    }
  };

  // ✅ CORREÇÃO: Função para iniciar o jogo
  const startGame = () => {
    setGameStarted(true);
    setGameActive(true);
    setScore(0);
    setTimeLeft(DIFFICULTY_CONFIG[difficulty].time);
    setUsedWords(new Set());
    setFeedback('');
  };

  const restartGame = () => {
    setGameStarted(true);
    setGameActive(true);
    setScore(0);
    setTimeLeft(DIFFICULTY_CONFIG[difficulty].time);
    setUsedWords(new Set());
    setFeedback('');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h3>🚀 Speed Challenge</h3>
        <p>Carregando palavras...</p>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '10px auto'
        }}></div>
        <button onClick={onClose} style={{
          marginTop: 15, padding: '10px 20px', borderRadius: 12,
          border: 'none', background: '#36d1dc', color: 'white', cursor: 'pointer'
        }}>
          Fechar
        </button>
      </div>
    );
  }

  // ✅ CORREÇÃO: Tela de início para escolher dificuldade
  if (!gameStarted) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h3>🚀 Speed Challenge</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Digite as palavras o mais rápido que puder!
        </p>

        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '10px',
          margin: '20px 0',
          border: '2px solid #FFD93D'
        }}>
          <p style={{ fontWeight: 'bold', marginBottom: '15px' }}>🎯 Escolha a Dificuldade:</p>
          
          <div style={{ marginBottom: '15px' }}>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              style={{
                padding: '10px 15px',
                fontSize: '1.1rem',
                borderRadius: '8px',
                border: '2px solid #3498db',
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              <option value="facil">🟢 Fácil - 30s +5s/acerto</option>
              <option value="medio">🟡 Médio - 20s +3s/acerto</option>
              <option value="dificil">🔴 Difícil - 15s +2s/acerto</option>
            </select>
          </div>

          <div style={{
            background: '#e8f4fd',
            padding: '15px',
            borderRadius: '8px',
            margin: '15px 0',
            border: '1px solid #3498db'
          }}>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>📊 Configuração:</p>
            <p style={{ margin: '5px 0' }}>• Tempo inicial: <strong>{DIFFICULTY_CONFIG[difficulty].time}s</strong></p>
            <p style={{ margin: '5px 0' }}>• Bônus por acerto: <strong>+{DIFFICULTY_CONFIG[difficulty].timeBonus}s</strong></p>
            <p style={{ margin: '5px 0' }}>• Pontos por acerto: <strong>{DIFFICULTY_CONFIG[difficulty].points}pts</strong></p>
            <p style={{ margin: '5px 0' }}>• Palavras disponíveis: <strong>{words.length}</strong></p>
          </div>

          <button
            onClick={startGame}
            style={{
              padding: '15px 30px',
              background: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              width: '100%',
              marginTop: '10px'
            }}
          >
            🚀 Começar Jogo
          </button>
        </div>

        <button onClick={onClose} style={{
          padding: '10px 20px', 
          borderRadius: 8,
          border: 'none', 
          background: '#95a5a6', 
          color: 'white', 
          cursor: 'pointer',
          width: '100%'
        }}>
          Sair
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>🚀 Speed Challenge</h3>
     
      {/* ✅ CORREÇÃO: Seletor de dificuldade desabilitado durante o jogo */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Dificuldade:</label>
        <select
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value);
            if (!gameActive) {
              setTimeLeft(DIFFICULTY_CONFIG[e.target.value].time);
            }
          }}
          disabled={gameActive}
          style={{
            padding: '5px 10px',
            borderRadius: '5px',
            border: '2px solid #3498db',
            opacity: gameActive ? 0.6 : 1,
            fontWeight: 'bold'
          }}
        >
          <option value="facil">Fácil (30s +5s/acerto)</option>
          <option value="medio">Médio (20s +3s/acerto)</option>
          <option value="dificil">Difícil (15s +2s/acerto)</option>
        </select>
      </div>

      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
        {DIFFICULTY_CONFIG[difficulty].time} segundos iniciais • +{DIFFICULTY_CONFIG[difficulty].timeBonus}s por acerto
      </p>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        Palavras disponíveis: {words.length}
      </p>
     
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{
          background: timeLeft <= 5 ? '#e74c3c' : '#3498db',
          color: 'white',
          padding: '10px',
          borderRadius: '8px',
          transition: 'background-color 0.3s ease'
        }}>
          ⏱️ {timeLeft}s
        </div>
        <div style={{ background: '#27ae60', color: 'white', padding: '10px', borderRadius: '8px' }}>
          🎯 {score} pts
        </div>
      </div>

      {gameActive ? (
        <>
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '10px',
            margin: '20px 0',
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#2c3e50',
            minHeight: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {currentWord || 'Carregando...'}
          </div>

          {feedback && (
            <p style={{
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: feedback.includes('✅') ? 'green' : 'red',
              minHeight: '25px',
              margin: '10px 0',
              animation: feedback.includes('✅') ? 'pulse 0.5s ease-in-out' : 'none'
            }}>
              {feedback}
            </p>
          )}

          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleInputSubmit}
            placeholder="Digite a palavra..."
            style={{
              padding: '12px',
              fontSize: '1.2rem',
              width: '100%',
              border: '2px solid #3498db',
              borderRadius: '8px',
              textAlign: 'center'
            }}
            autoFocus
          />

          <p style={{ color: '#666', marginTop: '10px' }}>
            Pressione Enter para enviar • {DIFFICULTY_CONFIG[difficulty].points}pts + {DIFFICULTY_CONFIG[difficulty].timeBonus}s por acerto
          </p>
        </>
      ) : (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <h2 style={{ color: '#e74c3c' }}>⏰ Tempo Esgotado!</h2>
          <p style={{ fontSize: '1.5rem', margin: '15px 0' }}>
            Pontuação Final: <strong>{score}</strong>
          </p>
          <button
            onClick={restartGame}
            style={{
              padding: '12px 24px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              marginTop: '15px'
            }}
          >
            🔄 Jogar Novamente
          </button>
        </div>
      )}

      <button onClick={onClose} style={{
        marginTop: 15, padding: '10px 20px', borderRadius: 12,
        border: 'none', background: '#36d1dc', color: 'white', cursor: 'pointer'
      }}>
        Fechar
      </button>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}


// ===== JOGO 5: MASTER QUEST COMPLETO E CORRIGIDO =====
function MasterQuestGame({ onClose, currentLevel }) {
  const [score, setScore] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('facil');
  const [audioPlaying, setAudioPlaying] = useState(false);

  const { words, loading: whitelistLoading } = useMinigameWords(currentLevel, difficulty);

  // Configurações por dificuldade
  const DIFFICULTY_CONFIG = {
    facil: {
      challenges: 3,
      timeMultiplier: 1.5,
      description: "3 desafios • Tempo generoso",
      points: 10
    },
    medio: {
      challenges: 4,
      timeMultiplier: 1.0,
      description: "4 desafios • Tempo normal",
      points: 15
    },
    dificil: {
      challenges: 5,
      timeMultiplier: 0.7,
      description: "5 desafios • Tempo reduzido",
      points: 20
    }
  };

  useEffect(() => {
    if (!whitelistLoading && words.length > 0) {
      generateChallenges();
    }
  }, [words, whitelistLoading, difficulty]);

  const splitWordIntoSyllables = (word) => {
    if (!word) return [];
    if (word.length <= 2) return [word];
    const syllables = [];
    for (let i = 0; i < word.length; i += 2) {
      syllables.push(word.slice(i, i + 2));
    }
    return syllables;
  };

  // ✅ FUNÇÃO PARA REPRODUZIR ÁUDIO
  const playWordSound = (word) => {
    if (audioPlaying) return;
    
    setAudioPlaying(true);
    
    // Usando a Web Speech API para síntese de voz
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        setAudioPlaying(false);
      };
      
      utterance.onerror = () => {
        setAudioPlaying(false);
      };
      
      speechSynthesis.speak(utterance);
    } else {
      // Fallback caso a API não esteja disponível
      alert(`🔊 Pronúncia: ${word}`);
      setAudioPlaying(false);
    }
  };

  const generateChallenges = () => {
    setIsLoading(true);
   
    const numChallenges = DIFFICULTY_CONFIG[difficulty].challenges;
    let finalWords = [];
   
    if (words.length >= numChallenges) {
      finalWords = shuffleArray(words).slice(0, numChallenges);
    } else {
      const fallback = ['casa', 'bola', 'gato', 'pato', 'vovo', 'mesa', 'porta', 'janela', 'livro', 'caderno'];
      finalWords = shuffleArray(fallback).slice(0, numChallenges);
    }

    const challengeTypes = ['sound', 'word', 'speed'];
    const newChallenges = [];

    for (let i = 0; i < numChallenges; i++) {
      const word = finalWords[i];
      const challengeType = challengeTypes[i % challengeTypes.length];
     
      let challenge;
     
      switch (challengeType) {
        case 'sound':
          challenge = {
            type: 'sound',
            question: '🔊 Qual palavra você ouviu?',
            word: word,
            options: generateSoundOptions(word, finalWords),
            correct: word
          };
          break;
         
        case 'word':
          challenge = {
            type: 'word',
            question: '🧩 Monte a palavra:',
            word: word,
            syllables: splitWordIntoSyllables(word),
            correct: splitWordIntoSyllables(word)
          };
          break;
         
        case 'speed':
          challenge = {
            type: 'speed',
            question: '🚀 Digite rápido:',
            word: word,
            answer: word,
            time: Math.max(5, Math.floor(10 * DIFFICULTY_CONFIG[difficulty].timeMultiplier))
          };
          break;
         
        default:
          challenge = {
            type: 'sound',
            question: '🔊 Qual palavra você ouviu?',
            word: word,
            options: generateSoundOptions(word, finalWords),
            correct: word
          };
      }
     
      newChallenges.push(challenge);
    }

    setChallenges(shuffleArray(newChallenges));
    setIsLoading(false);
  };

  const generateSoundOptions = (correctWord, allWords) => {
    const otherWords = allWords.filter(word => word !== correctWord);
    const wrongOptions = otherWords.length >= 3
      ? shuffleArray(otherWords).slice(0, 3)
      : shuffleArray(['pato', 'vovo', 'mesa', 'copo', 'lua', 'sol']).slice(0, 3 - otherWords.length);
   
    return shuffleArray([correctWord, ...wrongOptions]);
  };

  const handleChallengeComplete = () => {
    const points = DIFFICULTY_CONFIG[difficulty].points;
    const newScore = score + points;
    setScore(newScore);
   
    if (currentChallenge + 1 >= challenges.length) {
      setGameCompleted(true);
    } else {
      setCurrentChallenge(prev => prev + 1);
    }
  };

  const restartGame = () => {
    setScore(0);
    setCurrentChallenge(0);
    setGameCompleted(false);
    generateChallenges();
  };

  // ✅ COMPONENTE SoundChallenge CORRIGIDO
  const SoundChallenge = ({ challenge, onComplete }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [showResult, setShowResult] = useState(false);

    const handleOptionSelect = (option) => {
      if (showResult) return;
      
      setSelectedOption(option);
      setShowResult(true);
      
      setTimeout(() => {
        onComplete();
      }, 1500);
    };

    return (
      <div style={{ textAlign: 'center' }}>
        {/* ✅ CORREÇÃO: Botão para ouvir o som, SEM mostrar a palavra */}
        <button
          onClick={() => playWordSound(challenge.word)}
          disabled={audioPlaying}
          style={{
            padding: '15px 30px',
            fontSize: '1.5rem',
            background: audioPlaying ? '#95a5a6' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: audioPlaying ? 'not-allowed' : 'pointer',
            marginBottom: '20px',
            fontWeight: 'bold',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}
        >
          {audioPlaying ? '🔊 Ouvindo...' : '🎵 Ouvir Som'}
        </button>

        <p style={{ color: '#666', marginBottom: '15px', fontSize: '0.9rem' }}>
          Clique no botão para ouvir a palavra
        </p>

        <div style={{ display: 'grid', gap: '10px', marginTop: '20px' }}>
          {challenge.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              disabled={showResult}
              style={{
                padding: '12px 20px',
                fontSize: '1.1rem',
                background: 
                  showResult && option === challenge.correct ? '#27ae60' :
                  showResult && option === selectedOption && option !== challenge.correct ? '#e74c3c' :
                  selectedOption === option ? '#3498db' : '#ecf0f1',
                color: 
                  showResult && option === challenge.correct ? 'white' :
                  showResult && option === selectedOption && option !== challenge.correct ? 'white' :
                  selectedOption === option ? 'white' : '#2c3e50',
                border: '2px solid',
                borderColor: 
                  showResult && option === challenge.correct ? '#27ae60' :
                  showResult && option === selectedOption && option !== challenge.correct ? '#e74c3c' :
                  selectedOption === option ? '#3498db' : '#bdc3c7',
                borderRadius: '8px',
                cursor: showResult ? 'default' : 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              {option}
              {showResult && option === challenge.correct && ' ✅'}
              {showResult && option === selectedOption && option !== challenge.correct && ' ❌'}
            </button>
          ))}
        </div>

        {showResult && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            borderRadius: '8px',
            background: selectedOption === challenge.correct ? '#d4edda' : '#f8d7da',
            color: selectedOption === challenge.correct ? '#155724' : '#721c24',
            fontWeight: 'bold'
          }}>
            {selectedOption === challenge.correct ? '🎉 Correto! +10 pontos' : '❌ Tente novamente no próximo desafio'}
          </div>
        )}
      </div>
    );
  };

  // ✅ COMPONENTE WordChallenge (MANTIDO IGUAL)
  const WordChallenge = ({ challenge, onComplete }) => {
    const [selectedSyllables, setSelectedSyllables] = useState([]);
    const [availableSyllables, setAvailableSyllables] = useState(shuffleArray([...challenge.syllables]));

    const handleSyllableClick = (syllable, index) => {
      const newSelected = [...selectedSyllables, syllable];
      setSelectedSyllables(newSelected);
      
      const newAvailable = availableSyllables.filter((_, i) => i !== index);
      setAvailableSyllables(newAvailable);

      if (newSelected.join('') === challenge.word) {
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    };

    const handleSelectedSyllableClick = (syllable, index) => {
      const newSelected = selectedSyllables.filter((_, i) => i !== index);
      setSelectedSyllables(newSelected);
      setAvailableSyllables([...availableSyllables, syllable]);
    };

    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{
          background: '#34495e',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          margin: '15px 0',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {selectedSyllables.join('') || '?'}
        </div>

        <div style={{ margin: '15px 0' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#666' }}>Sílabas disponíveis:</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {availableSyllables.map((syllable, index) => (
              <button
                key={index}
                onClick={() => handleSyllableClick(syllable, index)}
                style={{
                  padding: '10px 15px',
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}
              >
                {syllable}
              </button>
            ))}
          </div>
        </div>

        {selectedSyllables.length > 0 && (
          <div style={{ margin: '15px 0' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#666' }}>Palavra montada:</p>
            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {selectedSyllables.map((syllable, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectedSyllableClick(syllable, index)}
                  style={{
                    padding: '8px 12px',
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {syllable} ×
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedSyllables.join('') === challenge.word && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: '#d4edda',
            color: '#155724',
            borderRadius: '8px',
            fontWeight: 'bold'
          }}>
            ✅ Correto! Palavra montada: {challenge.word}
          </div>
        )}
      </div>
    );
  };

  // ✅ COMPONENTE SpeedChallenge (MANTIDO IGUAL)
  const SpeedChallenge = ({ challenge, onComplete }) => {
    const [inputValue, setInputValue] = useState('');
    const [timeLeft, setTimeLeft] = useState(challenge.time);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
      if (timeLeft > 0 && !completed) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else if (timeLeft === 0 && !completed) {
        setCompleted(true);
        setTimeout(() => onComplete(), 1500);
      }
    }, [timeLeft, completed, onComplete]);

    const handleInputChange = (e) => {
      if (completed) return;
      setInputValue(e.target.value);
      
      if (e.target.value.toLowerCase() === challenge.word.toLowerCase()) {
        setCompleted(true);
        setTimeout(() => onComplete(), 1000);
      }
    };

    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          padding: '10px',
          background: timeLeft <= 5 ? '#e74c3c' : '#3498db',
          color: 'white',
          borderRadius: '8px',
          fontWeight: 'bold'
        }}>
          <span>⏱️ {timeLeft}s</span>
          <span>{challenge.word.length} letras</span>
        </div>

        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Digite a palavra aqui..."
          disabled={completed}
          style={{
            padding: '12px',
            fontSize: '1.2rem',
            width: '100%',
            border: `3px solid ${completed ? '#27ae60' : '#3498db'}`,
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}
          autoFocus
        />

        {completed && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: '#d4edda',
            color: '#155724',
            borderRadius: '8px',
            fontWeight: 'bold'
          }}>
            ✅ {timeLeft > 0 ? 'Tempo sobrando!' : 'Tempo esgotado!'}
          </div>
        )}

        {!completed && timeLeft > 0 && (
          <p style={{ color: '#666', marginTop: '10px', fontSize: '0.9rem' }}>
            Digite a palavra antes do tempo acabar!
          </p>
        )}
      </div>
    );
  };

  // ✅ FUNÇÃO AUXILIAR PARA EMBARALHAR ARRAY
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // ✅ TELA DE LOADING
  if (whitelistLoading || isLoading) {
    return (
      <div style={{ textAlign: 'center', minWidth: '300px' }}>
        <h3>🌟 Master Quest</h3>
        <p>Preparando desafios épicos...</p>
        <div style={{ margin: '20px 0' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
        <button onClick={onClose} style={{
          padding: '10px 20px',
          borderRadius: 12,
          border: 'none',
          background: '#36d1dc',
          color: 'white',
          cursor: 'pointer'
        }}>
          Fechar
        </button>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // ✅ TELA DE JOGO COMPLETADO
  if (gameCompleted) {
    const totalPossibleScore = challenges.length * DIFFICULTY_CONFIG[difficulty].points;
    const performance = score >= totalPossibleScore * 0.8 ? "🏆 Excelente!" :
                       score >= totalPossibleScore * 0.6 ? "⭐ Muito bom!" : "👍 Bom trabalho!";
   
    return (
      <div style={{ textAlign: 'center', minWidth: '300px' }}>
        <h2>{performance}</h2>
        <p style={{ fontSize: '1.5rem', color: '#27ae60', marginBottom: '10px' }}>
          Missão {difficulty.toUpperCase()} Concluída!
        </p>
        <p style={{ fontSize: '1.2rem', marginBottom: '5px' }}>
          Pontuação Final: <strong>{score}/{totalPossibleScore}</strong>
        </p>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Dificuldade: <strong>{difficulty.toUpperCase()}</strong>
        </p>
       
        <div style={{ margin: '20px 0' }}>
          <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '10px' }}>
            Palavras conquistadas:
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {challenges.map((challenge, index) => (
              <span key={index} style={{
                background: '#3498db',
                color: 'white',
                padding: '6px 10px',
                borderRadius: '15px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {challenge.word}
              </span>
            ))}
          </div>
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: '15px',
          borderRadius: '10px',
          margin: '15px 0',
          border: '2px solid #FFD93D'
        }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>📊 Resumo da Missão:</p>
          <p style={{ margin: '3px 0' }}>• Desafios completados: {challenges.length}</p>
          <p style={{ margin: '3px 0' }}>• Pontos por desafio: {DIFFICULTY_CONFIG[difficulty].points}</p>
          <p style={{ margin: '3px 0' }}>• Palavras únicas: {words.length}</p>
        </div>

        <div style={{ fontSize: '3rem', margin: '15px 0' }}>🎉</div>
       
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={restartGame}
            style={{
              padding: '10px 20px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔄 Nova Missão
          </button>
          <button onClick={onClose} style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: '#36d1dc',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            🏠 Fechar
          </button>
        </div>
      </div>
    );
  }

  const current = challenges[currentChallenge];

  // ✅ RENDERIZAÇÃO PRINCIPAL DO JOGO
  return (
    <div style={{ textAlign: 'center', minWidth: '300px' }}>
      <h3>🌟 Master Quest</h3>
     
      {/* Seletor de Dificuldade (só mostra no início) */}
      {currentChallenge === 0 && (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Dificuldade:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={{
              padding: '5px 10px',
              borderRadius: '5px',
              border: '2px solid #3498db',
              fontWeight: 'bold'
            }}
          >
            <option value="facil">Fácil 🟢</option>
            <option value="medio">Médio 🟡</option>
            <option value="dificil">Difícil 🔴</option>
          </select>
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
            {DIFFICULTY_CONFIG[difficulty].description}
          </p>
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '10px',
        margin: '10px 0',
        fontWeight: 'bold'
      }}>
        <div>Desafio {currentChallenge + 1}/{challenges.length}</div>
        <div>🎯 {score} pts</div>
      </div>

      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        margin: '15px 0',
        border: '3px solid #FFD93D',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}>
        <h4 style={{ color: '#2c3e50', marginBottom: '15px' }}>{current.question}</h4>
        
        {/* ✅ CORREÇÃO: Só mostra a palavra se NÃO for desafio de som */}
        {current.type !== 'sound' && (
          <p style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: '15px 0',
            color: '#e74c3c',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
          }}>
            {current.word}
          </p>
        )}
       
        {current.type === 'sound' && (
          <SoundChallenge
            challenge={current}
            onComplete={handleChallengeComplete}
          />
        )}
       
        {current.type === 'word' && (
          <WordChallenge
            challenge={current}
            onComplete={handleChallengeComplete}
          />
        )}
       
        {current.type === 'speed' && (
          <SpeedChallenge
            challenge={current}
            onComplete={handleChallengeComplete}
          />
        )}
      </div>

      <div style={{
        background: '#ecf0f1',
        padding: '10px',
        borderRadius: '8px',
        margin: '10px 0',
        fontSize: '0.9rem',
        color: '#7f8c8d'
      }}>
        ⚡ Próximo desafio: {DIFFICULTY_CONFIG[difficulty].points} pontos
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
        <button
          onClick={restartGame}
          style={{
            padding: '8px 16px',
            background: '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}
        >
          🔁 Reiniciar
        </button>
        <button onClick={onClose} style={{
          padding: '10px 20px',
          borderRadius: 12,
          border: 'none',
          background: '#36d1dc',
          color: 'white',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}>
          🏠 Fechar
        </button>
      </div>
    </div>
  );
}

// ===== COMPONENTES AUXILIARES PARA MASTER QUEST =====

function SoundChallenge({ challenge, onComplete }) {
  const [selected, setSelected] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState('');

  const playSound = (word) => {
    if (isPlaying) return;
   
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.7;
    utterance.pitch = 1.0;
   
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
   
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    playSound(challenge.word);
  }, []);

  const handleSelect = (option) => {
    if (selected) return;
    
    setSelected(option);
    if (option === challenge.correct) {
      setFeedback('✅ Correto!');
      setTimeout(() => {
        onComplete();
      }, 1200);
    } else {
      setFeedback('❌ Tente novamente!');
      playSound(option);
      setTimeout(() => {
        setFeedback('');
        setSelected('');
      }, 1500);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '10px', marginTop: '15px' }}>
      <button
        onClick={() => playSound(challenge.word)}
        disabled={isPlaying}
        style={{
          padding: '12px',
          background: isPlaying ? '#95a5a6' : '#4ECDC4',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isPlaying ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          fontSize: '1.1rem'
        }}
      >
        {isPlaying ? '🔊 Tocando...' : '🔈 Ouvir Novamente'}
      </button>
     
      {feedback && (
        <p style={{
          fontSize: '1.1rem',
          fontWeight: 'bold',
          color: feedback.includes('✅') ? '#27ae60' : '#e74c3c',
          margin: '5px 0'
        }}>
          {feedback}
        </p>
      )}
     
      {challenge.options.map((option, index) => (
        <button
          key={index}
          onClick={() => handleSelect(option)}
          disabled={selected !== ''}
          style={{
            padding: '12px',
            background: selected === option
              ? (option === challenge.correct ? '#27ae60' : '#e74c3c')
              : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: selected !== '' ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            transition: 'all 0.3s ease'
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function WordChallenge({ challenge, onComplete }) {
  const [selected, setSelected] = useState([]);

  const handleSyllableClick = (syllable) => {
    if (!selected.includes(syllable)) {
      const newSelected = [...selected, syllable];
      setSelected(newSelected);
     
      if (JSON.stringify(newSelected) === JSON.stringify(challenge.correct)) {
        setTimeout(onComplete, 1000);
      }
    }
  };

  return (
    <div>
      <div style={{
        background: '#f0f0f0',
        padding: '15px',
        borderRadius: '10px',
        margin: '15px 0',
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: '#2c3e50',
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {selected.join('') || '______'}
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {challenge.syllables.map((syllable, index) => (
          <button
            key={index}
            onClick={() => handleSyllableClick(syllable)}
            disabled={selected.includes(syllable)}
            style={{
              padding: '10px 15px',
              background: selected.includes(syllable)
                ? (challenge.correct.includes(syllable) ? '#27ae60' : '#e74c3c')
                : '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: selected.includes(syllable) ? 'not-allowed' : 'pointer',
              minWidth: '60px'
            }}
          >
            {syllable}
          </button>
        ))}
      </div>
    </div>
  );
}

function SpeedChallenge({ challenge, onComplete }) {
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(challenge.time);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (input.toLowerCase() === challenge.answer.toLowerCase()) {
      onComplete();
    }
  }, [input, challenge.answer, onComplete]);

  return (
    <div>
      <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#e74c3c' }}>
        ⏱️ Tempo: {timeLeft}s
      </p>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={`Digite: ${challenge.word}`}
        style={{
          padding: '12px',
          fontSize: '1.2rem',
          width: '100%',
          border: '2px solid #3498db',
          borderRadius: '8px',
          textAlign: 'center',
          marginTop: '10px'
        }}
        autoFocus
      />
      <p style={{ color: '#666', marginTop: '8px', fontSize: '0.9rem' }}>
        Digite a palavra e pressione qualquer tecla
      </p>
    </div>
  );
}