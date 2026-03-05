import React, { useState, useEffect, useCallback, useRef } from 'react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 200;
const DINO_WIDTH = 40;
const DINO_HEIGHT = 40;
const GROUND_HEIGHT = 20;
const GRAVITY = 0.8;
const JUMP_FORCE = -14;

const DinoRun = ({ onScore, highScore, soundEnabled }) => {
  const canvasRef = useRef(null);
  const [dino, setDino] = useState({ y: CANVAS_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT, vy: 0, jumping: false });
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [speed, setSpeed] = useState(5);

  const jump = useCallback(() => {
    if (gameOver) {
      return;
    }
    if (!gameStarted) {
      setGameStarted(true);
      return;
    }
    if (!dino.jumping) {
      setDino(prev => ({ ...prev, vy: JUMP_FORCE, jumping: true }));
    }
  }, [gameOver, gameStarted, dino.jumping]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === ' ' || e.key === 'ArrowUp') {
      e.preventDefault();
      jump();
    }
  }, [jump]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      // Update dino
      setDino(prev => {
        let newY = prev.y + prev.vy;
        let newVy = prev.vy + GRAVITY;
        let jumping = true;

        const ground = CANVAS_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT;
        if (newY >= ground) {
          newY = ground;
          newVy = 0;
          jumping = false;
        }

        return { y: newY, vy: newVy, jumping };
      });

      // Update obstacles
      setObstacles(prev => {
        let newObstacles = prev
          .map(obs => ({ ...obs, x: obs.x - speed }))
          .filter(obs => obs.x > -50);

        // Check collision
        const dinoX = 50;
        const dinoY = dino.y;
        
        for (const obs of newObstacles) {
          if (
            dinoX + DINO_WIDTH - 10 > obs.x &&
            dinoX + 10 < obs.x + obs.width &&
            dinoY + DINO_HEIGHT > CANVAS_HEIGHT - GROUND_HEIGHT - obs.height
          ) {
            setGameOver(true);
            onScore(score);
            return prev;
          }
        }

        return newObstacles;
      });

      // Update score
      setScore(s => {
        const newScore = s + 1;
        if (newScore % 100 === 0) {
          setSpeed(sp => Math.min(sp + 0.5, 15));
        }
        return newScore;
      });
    }, 20);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, dino.y, speed, score, onScore]);

  // Spawn obstacles
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const spawnInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        const height = Math.random() < 0.7 ? 30 : 50;
        setObstacles(prev => [...prev, {
          x: CANVAS_WIDTH,
          width: 20,
          height,
          type: height > 40 ? 'tall' : 'short'
        }]);
      }
    }, 1500);

    return () => clearInterval(spawnInterval);
  }, [gameStarted, gameOver]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Sky
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#0f0f1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Ground
    ctx.fillStyle = '#333';
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);

    // Ground pattern
    ctx.strokeStyle = '#444';
    for (let i = 0; i < CANVAS_WIDTH; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, CANVAS_HEIGHT - GROUND_HEIGHT);
      ctx.lineTo(i + 10, CANVAS_HEIGHT);
      ctx.stroke();
    }

    // T-REX
    const tx = 50;
    const ty = dino.y;
    ctx.fillStyle = '#00ff00';
    
    // Body
    ctx.fillRect(tx + 5, ty + 15, 25, 20);
    
    // Head
    ctx.beginPath();
    ctx.ellipse(tx + 30, ty + 12, 15, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Jaw/Mouth
    ctx.fillRect(tx + 35, ty + 8, 12, 8);
    
    // Eye
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(tx + 32, ty + 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(tx + 33, ty + 8, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Arms (tiny T-Rex arms!)
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(tx + 25, ty + 18, 6, 4);
    
    // Legs (animated)
    const legOffset = Math.sin(Date.now() / 50) * 3;
    ctx.fillStyle = '#00cc00';
    if (dino.jumping) {
      // Legs together when jumping
      ctx.fillRect(tx + 10, ty + 35, 8, 8);
      ctx.fillRect(tx + 20, ty + 35, 8, 8);
    } else {
      // Running animation
      ctx.fillRect(tx + 8, ty + 33, 8, 10 + legOffset);
      ctx.fillRect(tx + 22, ty + 33, 8, 10 - legOffset);
    }
    
    // Tail
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.moveTo(tx + 5, ty + 20);
    ctx.lineTo(tx - 15, ty + 28);
    ctx.lineTo(tx + 5, ty + 32);
    ctx.fill();

    // Obstacles
    obstacles.forEach(obs => {
      ctx.fillStyle = obs.type === 'tall' ? '#ff0000' : '#ff6600';
      ctx.fillRect(obs.x, CANVAS_HEIGHT - GROUND_HEIGHT - obs.height, obs.width, obs.height);
      
      // Spikes
      ctx.fillStyle = '#cc0000';
      ctx.beginPath();
      ctx.moveTo(obs.x, CANVAS_HEIGHT - GROUND_HEIGHT - obs.height);
      ctx.lineTo(obs.x + obs.width / 2, CANVAS_HEIGHT - GROUND_HEIGHT - obs.height - 10);
      ctx.lineTo(obs.x + obs.width, CANVAS_HEIGHT - GROUND_HEIGHT - obs.height);
      ctx.fill();
    });

    // Score
    ctx.fillStyle = '#fff';
    ctx.font = '16px "Press Start 2P"';
    ctx.fillText(score.toString().padStart(5, '0'), CANVAS_WIDTH - 100, 30);
  }, [dino, obstacles, score]);

  const resetGame = () => {
    setDino({ y: CANVAS_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT, vy: 0, jumping: false });
    setObstacles([]);
    setScore(0);
    setSpeed(5);
    setGameOver(false);
    setGameStarted(true);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[400px] mb-4 text-xs">
        <div className="text-[#00ff00]">SCORE: {score}</div>
        <div className="text-[#ffff00]">HI: {highScore}</div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-[#00ff00] rounded cursor-pointer"
          onClick={jump}
        />

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#00ff00] text-sm mb-4 neon-text">🦖 DINO RUN 🦖</p>
            <p className="text-[#888] text-[10px] mb-4">TAP OR SPACE TO JUMP</p>
            <button onClick={() => setGameStarted(true)} className="retro-btn text-[10px] text-[#00ff00]">
              START
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#ff0000] text-lg mb-2 neon-text">GAME OVER</p>
            <p className="text-[#00ff00] text-sm mb-4">SCORE: {score}</p>
            {score >= highScore && score > 0 && (
              <p className="text-[#ffff00] text-xs mb-4 animate-pulse">NEW HIGH SCORE!</p>
            )}
            <button onClick={resetGame} className="retro-btn text-[10px] text-[#00ff00]">
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      <p className="text-[8px] text-[#666] mt-4">SPACE / TAP TO JUMP OVER OBSTACLES</p>
    </div>
  );
};

export default DinoRun;
