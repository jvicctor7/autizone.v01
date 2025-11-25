import React, { useEffect, useRef, useState } from 'react';

// Configuração dos jogos
const GAMES = {
  artezone: {
    name: '🎨 ArteZone',
    description: 'Desenhe e solte a criatividade!',
    component: ArteZoneGame
  },
  interag: {
    name: '🎮 Game Interag',
    description: 'Colete estrelas e evite obstáculos!',
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

export default function GameModal({ isOpen, onClose, gameType = 'interag', currentLevel, currentXP, availableWords = [] }) {
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
        maxWidth: '90%', maxHeight: '90%', overflow: 'auto'
      }}>
        <h2>{gameConfig.name}</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>{gameConfig.description}</p>
        
        <GameComponent 
          onClose={onClose} 
          currentLevel={currentLevel} 
          currentXP={currentXP}
          availableWords={availableWords}
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

// ===== JOGO 1: INTERAG (ORIGINAL) =====
function InteragGame({ onClose }) {
  const canvasRef = useRef(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'gameOver', 'levelComplete'

  const player = useRef({ x: 50, y: 50, size: 30 });
  const keys = useRef({ ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false });
  const stars = useRef([]);
  const obstacles = useRef([]);

  const canvasWidth = 400;
  const canvasHeight = 400;

  // ✅ FUNÇÃO PARA INICIAR/RESETAR O JOGO
  const initializeGame = () => {
    // Resetar estrelas
    stars.current = Array.from({ length: 3 + level }, () => ({
      x: Math.random() * (canvasWidth - 30) + 15,
      y: Math.random() * (canvasHeight - 30) + 15,
      size: 20,
      collected: false,
    }));

    // Resetar obstáculos (aumentam com o nível)
    obstacles.current = Array.from({ length: 2 + level }, () => ({
      x: Math.random() * (canvasWidth - 30) + 15,
      y: Math.random() * (canvasHeight - 30) + 15,
      size: 20,
    }));

    // Resetar posição do jogador
    player.current.x = 50;
    player.current.y = 50;
  };

  // ✅ FUNÇÃO PARA REINICIAR APÓS GAME OVER
  const restartGame = () => {
    setLives(3);
    setScore(0);
    setLevel(1);
    setGameState('playing');
    initializeGame();
  };

  // ✅ FUNÇÃO PARA PRÓXIMO NÍVEL
  const nextLevel = () => {
    setLevel(prev => prev + 1);
    setGameState('playing');
    initializeGame();
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    initializeGame();

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

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      if (gameState !== 'playing') return;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Desenhar fundo
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Mover jogador
      const speed = 4 + (level * 0.5); // ✅ Velocidade aumenta com nível
      if (keys.current.ArrowUp) player.current.y -= speed;
      if (keys.current.ArrowDown) player.current.y += speed;
      if (keys.current.ArrowLeft) player.current.x -= speed;
      if (keys.current.ArrowRight) player.current.x += speed;

      // Limites do canvas
      player.current.x = Math.max(0, Math.min(canvasWidth - player.current.size, player.current.x));
      player.current.y = Math.max(0, Math.min(canvasHeight - player.current.size, player.current.y));

      // Desenhar jogador
      ctx.font = `${player.current.size}px Arial`;
      ctx.fillText('😀', player.current.x, player.current.y + player.current.size);

      // Desenhar e verificar estrelas
      let starsCollected = 0;
      stars.current.forEach(star => {
        if (!star.collected) {
          ctx.font = `${star.size}px Arial`;
          ctx.fillText('⭐', star.x, star.y + star.size);
          
          // Colisão com jogador
          if (
            player.current.x < star.x + star.size &&
            player.current.x + player.current.size > star.x &&
            player.current.y < star.y + star.size &&
            player.current.y + player.current.size > star.y
          ) {
            star.collected = true;
            setScore(prev => prev + (10 * level)); // ✅ Mais pontos em níveis mais altos
            starsCollected++;
          }
        } else {
          starsCollected++;
        }
      });

      // Desenhar e verificar obstáculos
      obstacles.current.forEach(obs => {
        ctx.font = `${obs.size}px Arial`;
        ctx.fillText('❌', obs.x, obs.y + obs.size);
        
        // Colisão com jogador
        if (
          player.current.x < obs.x + obs.size &&
          player.current.x + player.current.size > obs.x &&
          player.current.y < obs.y + obs.size &&
          player.current.y + player.current.size > obs.y
        ) {
          setLives(prev => Math.max(0, prev - 1));
          // Resetar posição jogador com efeito visual
          player.current.x = 50;
          player.current.y = 50;
          
          // Piscar o jogador (feedback visual)
          setTimeout(() => {
            if (gameState === 'playing') {
              ctx.fillStyle = 'red';
              setTimeout(() => { ctx.fillStyle = 'black'; }, 100);
            }
          }, 10);
        }
      });

      // Verificar condições de vitória/derrota
      if (lives <= 0) {
        setGameState('gameOver');
      } else if (starsCollected === stars.current.length) {
        setGameState('levelComplete');
      } else {
        requestAnimationFrame(gameLoop);
      }
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, lives, level]);

  // ✅ RENDERIZAÇÃO CONDICIONAL
  const renderGameContent = () => {
    if (gameState === 'gameOver') {
      return (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#e74c3c', marginBottom: '20px' }}>💀 Game Over</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
            Pontuação Final: <strong>{score}</strong>
          </p>
          <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
            Nível Alcançado: <strong>{level}</strong>
          </p>
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
              marginBottom: '10px'
            }}
          >
            🔄 Jogar Novamente
          </button>
        </div>
      );
    }

    if (gameState === 'levelComplete') {
      return (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#27ae60', marginBottom: '20px' }}>🎉 Nível {level} Completo!</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
            Pontuação: <strong>{score}</strong>
          </p>
          <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
            Próximo nível: <strong>{level + 1}</strong>
          </p>
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
              marginBottom: '10px'
            }}
          >
            🚀 Próximo Nível
          </button>
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
          <div>
            <strong>❤️ Vidas:</strong> {lives}
          </div>
          <div>
            <strong>⭐ Pontos:</strong> {score}
          </div>
          <div>
            <strong>🎯 Nível:</strong> {level}
          </div>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
          Use as setas para mover • Colete {stars.current.length} estrelas
        </p>

        <canvas 
          ref={canvasRef} 
          width={canvasWidth} 
          height={canvasHeight} 
          style={{ 
            border: '2px solid #333', 
            borderRadius: '10px',
            background: '#87CEEB'
          }}
        ></canvas>

        <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#666' }}>
          <p>🎮 Dica: Mais obstáculos em níveis mais altos!</p>
        </div>
      </>
    );
  };

  return (
    <div style={{ textAlign: 'center', minWidth: '320px' }}>
      <h3>🎮 Game Interag</h3>
      {renderGameContent()}
      
      {(gameState === 'gameOver' || gameState === 'levelComplete') && (
        <button onClick={onClose} style={{
          marginTop: 15, padding: '10px 20px', borderRadius: 12,
          border: 'none', background: '#36d1dc', color: 'white', cursor: 'pointer'
        }}>Fechar</button>
      )}
    </div>
  );
}

// ===== JOGO 2: SOUND EXPLORER CORRIGIDO =====
function SoundExplorerGame({ onClose, currentLevel, availableWords }) {
  const [score, setScore] = useState(0);
  const [currentSound, setCurrentSound] = useState('');
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [gameWords, setGameWords] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // ✅ CORREÇÃO: Estabilizar as palavras do jogo
  useEffect(() => {
    const words = availableWords.length > 0 
      ? availableWords 
      : ['a', 'e', 'i', 'o', 'u', 'ma', 'me', 'mi', 'mo', 'mu'];
    setGameWords(words);
    if (words.length > 0) {
      generateQuestion(words);
    }
  }, [availableWords]);

  const generateQuestion = (words) => {
    if (words.length === 0) {
      setFeedback('❌ Nenhuma palavra disponível');
      return;
    }

    const correctWord = words[Math.floor(Math.random() * words.length)];
    
    // ✅ CORREÇÃO: Criar opções estáveis a partir das palavras disponíveis
    const otherWords = words.filter(word => word !== correctWord);
    const wrongOptions = otherWords.length >= 3 
      ? otherWords.sort(() => Math.random() - 0.5).slice(0, 3)
      : ['ba', 'be', 'bi', 'bo', 'bu'].slice(0, 3 - otherWords.length);
    
    const allOptions = [correctWord, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    setCurrentSound(correctWord);
    setOptions(allOptions);
    setFeedback('');
    console.log(`🎵 Nova pergunta: "${correctWord}", Opções:`, allOptions);
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
    
    playSound(selectedSound);
    
    if (selectedSound === currentSound) {
      setScore(prev => prev + 1);
      setFeedback('✅ Correto!');
      setTimeout(() => {
        setFeedback('');
        generateQuestion(gameWords);
      }, 1500);
    } else {
      setFeedback('❌ Tente novamente!');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  return (
    <div style={{ textAlign: 'center', minWidth: '300px' }}>
      <h3>🎵 Qual é este som?</h3>
      <p>Pontuação: {score}</p>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        Palavras disponíveis: {gameWords.length}
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
            cursor: isPlaying ? 'not-allowed' : 'pointer',
            opacity: isPlaying ? 0.7 : 1
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
      }}>Fechar</button>
    </div>
  );
}

// ===== JOGO 3: WORD BUILDER CORRIGIDO =====
function WordBuilderGame({ onClose, currentLevel, availableWords }) {
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [syllables, setSyllables] = useState([]);
  const [selectedSyllables, setSelectedSyllables] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [gameWords, setGameWords] = useState([]);

  useEffect(() => {
    const words = availableWords.length > 0 
      ? availableWords 
      : ['casa', 'bola', 'gato', 'pato', 'vovo', 'lobo', 'pipa', 'cama', 'gelo', 'fogo', 'nome', 'sapo'];
    setGameWords(words);
    if (words.length > 0) {
      generateWord(words);
    }
  }, [availableWords]);

  const splitIntoSyllables = (word) => {
    if (word.length <= 2) return [word];
    const syllables = [];
    for (let i = 0; i < word.length; i += 2) {
      syllables.push(word.slice(i, i + 2));
    }
    return syllables;
  };

  const generateWrongSyllables = (level) => {
    const commonWrong = ['xi', 'zu', 'fa', 'ke', 'vo', 'pi', 'tu', 'ne', 'ma', 'pa'];
    return commonWrong.slice(0, 2);
  };

  const generateWord = (words) => {
    if (words.length === 0) {
      setFeedback('❌ Nenhuma palavra disponível');
      return;
    }

    const word = words[Math.floor(Math.random() * words.length)];
    const wordSyllables = splitIntoSyllables(word);
    
    // ✅ CORREÇÃO: Criar sílabas únicas com IDs para evitar conflitos
    const wordSyllablesWithId = wordSyllables.map((syllable, index) => ({
      id: `${syllable}_${index}`, // ID único para cada sílaba
      text: syllable
    }));

    const wrongSyllables = generateWrongSyllables(currentLevel).map((syllable, index) => ({
      id: `wrong_${syllable}_${index}`,
      text: syllable
    }));

    const allSyllables = [...wordSyllablesWithId, ...wrongSyllables].sort(() => Math.random() - 0.5);
    
    setCurrentWord(word);
    setSyllables(allSyllables);
    setSelectedSyllables([]);
    setFeedback('');
    
    console.log(`🧩 Nova palavra: "${word}", Sílabas: ${wordSyllables.join(', ')}`);
  };

  // ✅ CORREÇÃO: Usar IDs únicos em vez do texto da sílaba
  const handleSyllableClick = (syllable) => {
    if (selectedSyllables.find(s => s.id === syllable.id)) return;
    
    setSelectedSyllables(prev => [...prev, syllable]);
  };

  // ✅ CORREÇÃO: Verificar pela ordem correta das sílabas
  const checkWord = () => {
    const attemptedWord = selectedSyllables.map(s => s.text).join('');
    if (attemptedWord === currentWord) {
      setScore(prev => prev + 1);
      setFeedback('✅ Palavra correta!');
      setTimeout(() => {
        setFeedback('');
        generateWord(gameWords);
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

  // ✅ CORREÇÃO: Encontrar sílaba pelo ID único
  const isSyllableSelected = (syllable) => {
    return selectedSyllables.some(s => s.id === syllable.id);
  };

  return (
    <div style={{ textAlign: 'center', minWidth: '300px' }}>
      <h3>🧩 Monte a Palavra</h3>
      <p>Pontuação: {score}</p>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        Palavras disponíveis: {gameWords.length}
      </p>
      
      <div style={{ 
        background: '#f0f0f0', 
        padding: '15px', 
        borderRadius: '10px',
        margin: '15px 0',
        minHeight: '50px',
        border: '2px solid #3498db'
      }}>
        <div style={{ fontSize: '1.5rem', marginTop: '10px', fontWeight: 'bold', color: '#2c3e50' }}>
          {selectedSyllables.map(s => s.text).join('') || '______'}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', margin: '15px 0' }}>
        {syllables.map((syllable, index) => (
          <button
            key={syllable.id} // ✅ CORREÇÃO: Usar ID único como key
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
      }}>Fechar</button>
    </div>
  );
}

// ===== JOGO 4: SPEED CHALLENGE CORRIGIDO =====
function SpeedChallengeGame({ onClose, availableWords }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentWord, setCurrentWord] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [gameActive, setGameActive] = useState(true);
  const [gameWords, setGameWords] = useState([]);
  const [usedWords, setUsedWords] = useState(new Set());

  // ✅ CORREÇÃO: Estabilizar palavras
  useEffect(() => {
    const words = availableWords.length > 0 
      ? availableWords 
      : ['casa', 'bola', 'gato', 'mesa', 'pato', 'fogo', 'copo', 'lua', 'sol', 'pé', 'vela', 'zero', 'vaca', 'sono', 'sino', 'rosa'];
    setGameWords(words);
    if (words.length > 0 && gameActive) {
      nextWord(words);
    }
  }, [availableWords]);

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameActive(false);
    }
  }, [timeLeft, gameActive]);

  const nextWord = (words) => {
    if (words.length === 0) return;
    
    // ✅ CORREÇÃO: Evitar repetição de palavras
    const availableWords = words.filter(word => !usedWords.has(word));
    const wordPool = availableWords.length > 0 ? availableWords : words;
    
    const randomWord = wordPool[Math.floor(Math.random() * wordPool.length)];
    setCurrentWord(randomWord);
    setInputValue('');
    setUsedWords(prev => new Set([...prev, randomWord]));
  };

  const handleInputChange = (e) => {
    if (!gameActive) return;
    setInputValue(e.target.value);
  };

  const handleInputSubmit = (e) => {
    if (e.key === 'Enter' && gameActive && inputValue.trim()) {
      if (inputValue.toLowerCase() === currentWord.toLowerCase()) {
        setScore(prev => prev + 1);
        // ✅ CORREÇÃO: Delay para dar tempo de ver o acerto
        setTimeout(() => {
          nextWord(gameWords);
        }, 500);
      } else {
        setInputValue('');
      }
    }
  };

  const restartGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    setUsedWords(new Set());
    if (gameWords.length > 0) {
      nextWord(gameWords);
    }
  };

  return (
    <div style={{ textAlign: 'center', minWidth: '300px' }}>
      <h3>🚀 Speed Challenge</h3>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        Palavras disponíveis: {gameWords.length}
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ background: '#3498db', color: 'white', padding: '10px', borderRadius: '8px' }}>
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
            Pressione Enter para enviar
          </p>
        </>
      ) : (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <h2 style={{ color: '#e74c3c' }}>⏰ Tempo Esgotado!</h2>
          <p style={{ fontSize: '1.5rem' }}>Pontuação Final: {score}</p>
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
      }}>Fechar</button>
    </div>
  );
}

// ===== JOGO 5: MASTER QUEST =====
function MasterQuestGame({ onClose, currentLevel, availableWords }) {
  const [score, setScore] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ CORREÇÃO: useEffect simplificado e mais confiável
  useEffect(() => {
    console.log('🎯 Master Quest - availableWords:', availableWords);
    generateChallenges();
  }, []); // ✅ Remove a dependência de availableWords

  const splitWordIntoSyllables = (word) => {
    if (!word) return [];
    if (word.length <= 2) return [word];
    const syllables = [];
    for (let i = 0; i < word.length; i += 2) {
      syllables.push(word.slice(i, i + 2));
    }
    return syllables;
  };

  const generateChallenges = () => {
    setIsLoading(true);
    
    // ✅ CORREÇÃO: Lógica mais robusta para seleção de palavras
    let finalWords = [];
    
    if (availableWords && availableWords.length >= 3) {
      // Usar palavras disponíveis
      const shuffled = [...availableWords].sort(() => Math.random() - 0.5).slice(0, 3);
      finalWords = shuffled;
    } else if (availableWords && availableWords.length > 0) {
      // Completar com fallback se necessário
      const fallback = ['casa', 'bola', 'gato', 'pato', 'vovo'];
      const available = [...availableWords];
      while (available.length < 3) {
        const randomWord = fallback[Math.floor(Math.random() * fallback.length)];
        if (!available.includes(randomWord)) {
          available.push(randomWord);
        }
      }
      finalWords = available.slice(0, 3);
    } else {
      // Usar apenas fallback
      finalWords = ['casa', 'bola', 'gato', 'rubi', 'pote', 'onze', 'foto', 'doce'].sort(() => Math.random() - 0.5);
    }

    console.log('🎯 Master Quest - Palavras selecionadas:', finalWords);

    const newChallenges = [
      {
        type: 'sound',
        question: '🔊 Qual é o som desta palavra?',
        word: finalWords[0],
        options: generateSoundOptions(finalWords[0], finalWords),
        correct: finalWords[0]
      },
      {
        type: 'word', 
        question: '🧩 Monte a palavra:',
        word: finalWords[1],
        syllables: splitWordIntoSyllables(finalWords[1]),
        correct: splitWordIntoSyllables(finalWords[1])
      },
      {
        type: 'speed',
        question: '🚀 Digite rápido:',
        word: finalWords[2],
        answer: finalWords[2],
        time: 10
      }
    ];

    setChallenges(newChallenges);
    setIsLoading(false);
  };

  const generateSoundOptions = (correctWord, allWords) => {
    const otherWords = allWords.filter(word => word !== correctWord);
    const wrongOptions = otherWords.length >= 3 
      ? otherWords.slice(0, 3)
      : [...otherWords, ...['pato', 'vovo', 'mesa']].slice(0, 3 - otherWords.length);
    
    return [correctWord, ...wrongOptions].sort(() => Math.random() - 0.5);
  };

  const handleChallengeComplete = () => {
    const newScore = score + 1;
    setScore(newScore);
    
    if (newScore >= challenges.length) {
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

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', minWidth: '300px' }}>
        <h3>🌟 Master Quest</h3>
        <p>Preparando desafios...</p>
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
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <div style={{ textAlign: 'center', minWidth: '300px' }}>
        <h2>🏆 Missão Completa!</h2>
        <p style={{ fontSize: '1.5rem', color: '#27ae60' }}>
          Você concluiu todos os desafios!
        </p>
        <p>Pontuação Final: {score}/{challenges.length}</p>
        
        <div style={{ margin: '20px 0' }}>
          <p style={{ fontSize: '1.1rem', color: '#666' }}>
            Palavras usadas:
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {challenges.map((challenge, index) => (
              <span key={index} style={{
                background: '#3498db',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '20px',
                fontSize: '0.9rem'
              }}>
                {challenge.word}
              </span>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '4rem', margin: '20px 0' }}>🎉</div>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={restartGame}
            style={{
              padding: '10px 20px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🔄 Jogar Novamente
          </button>
          <button onClick={onClose} style={{
            padding: '10px 20px', borderRadius: 8,
            border: 'none', background: '#36d1dc', color: 'white', cursor: 'pointer'
          }}>Fechar</button>
        </div>
      </div>
    );
  }

  const current = challenges[currentChallenge];

  return (
    <div style={{ textAlign: 'center', minWidth: '300px' }}>
      <h3>🌟 Master Quest</h3>
      <p>Desafio {currentChallenge + 1} de {challenges.length}</p>
      <p>Pontuação: {score}</p>
      
      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        margin: '20px 0',
        border: '2px solid #FFD93D'
      }}>
        <h4>{current.question}</h4>
        <p style={{ 
          fontSize: '1.8rem', 
          fontWeight: 'bold', 
          margin: '15px 0', 
          color: '#2c3e50'
        }}>
          {current.word}
        </p>
        
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

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={restartGame}
          style={{
            padding: '8px 16px',
            background: '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          🔁 Reiniciar
        </button>
        <button onClick={onClose} style={{
          padding: '10px 20px', borderRadius: 12,
          border: 'none', background: '#36d1dc', color: 'white', cursor: 'pointer'
        }}>Fechar</button>
      </div>
    </div>
  );
}

// ===== COMPONENTES AUXILIARES PARA MASTER QUEST =====

function SoundChallenge({ challenge, onComplete }) {
  const [selected, setSelected] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

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
    setSelected(option);
    if (option === challenge.correct) {
      setTimeout(onComplete, 1000);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '10px', marginTop: '15px' }}>
      <button 
        onClick={() => playSound(challenge.word)}
        disabled={isPlaying}
        style={{
          padding: '10px',
          background: isPlaying ? '#95a5a6' : '#4ECDC4',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isPlaying ? 'not-allowed' : 'pointer'
        }}
      >
        {isPlaying ? '🔊 Tocando...' : '🔈 Ouvir Novamente'}
      </button>
      
      {challenge.options.map((option, index) => (
        <button
          key={index}
          onClick={() => handleSelect(option)}
          style={{
            padding: '12px',
            background: selected === option 
              ? (option === challenge.correct ? '#27ae60' : '#e74c3c')
              : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
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

// Componentes auxiliares para Master Quest (mantenha iguais)
// ... [os mesmos componentes SoundChallenge, WordChallenge, SpeedChallenge do código anterior]