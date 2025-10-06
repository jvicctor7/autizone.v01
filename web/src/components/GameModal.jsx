import React, { useEffect, useRef, useState } from 'react';

export default function GameModal({ isOpen, onClose }) {
  const canvasRef = useRef(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);

  const player = useRef({ x: 50, y: 50, size: 30 });
  const keys = useRef({ ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false });
  const stars = useRef([]);
  const obstacles = useRef([]);

  const canvasWidth = 400;
  const canvasHeight = 400;

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Criar estrelas e obstáculos
    stars.current = Array.from({ length: 5 }, () => ({
      x: Math.random() * (canvasWidth - 20) + 10,
      y: Math.random() * (canvasHeight - 20) + 10,
      size: 20,
      collected: false,
    }));

    obstacles.current = Array.from({ length: 5 }, () => ({
      x: Math.random() * (canvasWidth - 20) + 10,
      y: Math.random() * (canvasHeight - 20) + 10,
      size: 20,
    }));

    const handleKeyDown = (e) => { keys.current[e.key] = true; };
    const handleKeyUp = (e) => { keys.current[e.key] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Mover jogador
      const speed = 4;
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

      // Desenhar estrelas
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
            setScore(prev => prev + 1);
          }
        }
      });

      // Desenhar obstáculos
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
          // Resetar posição jogador
          player.current.x = 50;
          player.current.y = 50;
        }
      });

      if (lives > 0) {
        requestAnimationFrame(gameLoop);
      } else {
        ctx.fillStyle = 'red';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over', canvasWidth / 2 - 70, canvasHeight / 2);
      }
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, lives]);

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
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <h2>Game Interag</h2>
        <p>Vidas: {lives} | Pontuação: {score}</p>
        <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} style={{ border: '2px solid #333', borderRadius: '10px' }}></canvas>
        <button onClick={onClose} style={{
          marginTop: 15, padding: '10px 20px', borderRadius: 12,
          border: 'none', background: '#36d1dc', color: 'white', cursor: 'pointer'
        }}>Fechar</button>
      </div>
    </div>
  );
}
