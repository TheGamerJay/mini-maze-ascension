import React, { useState, useEffect, useCallback, useRef } from 'react';

const CANVAS_SIZE = 400;
const PLAYER_SIZE = 15;
const ASTEROID_COUNT = 8;

const AsteroidsGame = ({ onScore, highScore, soundEnabled }) => {
  const canvasRef = useRef(null);
  const [player, setPlayer] = useState({ x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2, angle: 0, vx: 0, vy: 0 });
  const [asteroids, setAsteroids] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const keysRef = useRef({});

  const initAsteroids = () => {
    return Array(ASTEROID_COUNT).fill(null).map(() => ({
      x: Math.random() * CANVAS_SIZE,
      y: Math.random() * CANVAS_SIZE,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: 30 + Math.random() * 20,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05
    }));
  };

  const startGame = () => {
    setPlayer({ x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2, angle: -Math.PI / 2, vx: 0, vy: 0 });
    setAsteroids(initAsteroids());
    setBullets([]);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameStarted(true);
  };

  const shoot = useCallback(() => {
    setBullets(prev => [...prev, {
      x: player.x + Math.cos(player.angle) * PLAYER_SIZE,
      y: player.y + Math.sin(player.angle) * PLAYER_SIZE,
      vx: Math.cos(player.angle) * 8,
      vy: Math.sin(player.angle) * 8,
      life: 50
    }]);
  }, [player]);

  const handleKeyDown = useCallback((e) => {
    keysRef.current[e.key] = true;
    if (e.key === ' ') {
      e.preventDefault();
      if (!gameStarted) startGame();
      else shoot();
    }
  }, [gameStarted, shoot]);

  const handleKeyUp = useCallback((e) => {
    keysRef.current[e.key] = false;
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      // Update player
      setPlayer(prev => {
        let { x, y, angle, vx, vy } = prev;
        
        if (keysRef.current['ArrowLeft']) angle -= 0.1;
        if (keysRef.current['ArrowRight']) angle += 0.1;
        if (keysRef.current['ArrowUp']) {
          vx += Math.cos(angle) * 0.2;
          vy += Math.sin(angle) * 0.2;
        }
        
        vx *= 0.99;
        vy *= 0.99;
        x = (x + vx + CANVAS_SIZE) % CANVAS_SIZE;
        y = (y + vy + CANVAS_SIZE) % CANVAS_SIZE;
        
        return { x, y, angle, vx, vy };
      });

      // Update asteroids
      setAsteroids(prev => prev.map(ast => ({
        ...ast,
        x: (ast.x + ast.vx + CANVAS_SIZE) % CANVAS_SIZE,
        y: (ast.y + ast.vy + CANVAS_SIZE) % CANVAS_SIZE,
        rotation: ast.rotation + ast.rotationSpeed
      })));

      // Update bullets
      setBullets(prev => prev
        .map(b => ({ ...b, x: b.x + b.vx, y: b.y + b.vy, life: b.life - 1 }))
        .filter(b => b.life > 0 && b.x >= 0 && b.x <= CANVAS_SIZE && b.y >= 0 && b.y <= CANVAS_SIZE)
      );

      // Check collisions
      setBullets(prevBullets => {
        let remainingBullets = [...prevBullets];
        
        setAsteroids(prevAsteroids => {
          return prevAsteroids.filter(ast => {
            const hitBullet = remainingBullets.findIndex(b => {
              const dist = Math.sqrt((b.x - ast.x) ** 2 + (b.y - ast.y) ** 2);
              return dist < ast.size / 2;
            });
            
            if (hitBullet !== -1) {
              remainingBullets.splice(hitBullet, 1);
              setScore(s => s + Math.round(100 / ast.size * 10));
              return false;
            }
            return true;
          });
        });
        
        return remainingBullets;
      });

      // Check player collision
      setAsteroids(prevAsteroids => {
        for (const ast of prevAsteroids) {
          const dist = Math.sqrt((player.x - ast.x) ** 2 + (player.y - ast.y) ** 2);
          if (dist < ast.size / 2 + PLAYER_SIZE / 2) {
            setLives(l => {
              if (l <= 1) {
                setGameOver(true);
                onScore(score);
                return 0;
              }
              setPlayer({ x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2, angle: -Math.PI / 2, vx: 0, vy: 0 });
              return l - 1;
            });
            break;
          }
        }
        
        // Spawn new asteroids if needed
        if (prevAsteroids.length < 3) {
          return [...prevAsteroids, ...initAsteroids().slice(0, 3)];
        }
        return prevAsteroids;
      });
    }, 20);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, player, score, onScore]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Stars
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 50; i++) {
      ctx.fillRect((i * 73) % CANVAS_SIZE, (i * 37) % CANVAS_SIZE, 1, 1);
    }

    // Draw asteroids
    asteroids.forEach(ast => {
      ctx.save();
      ctx.translate(ast.x, ast.y);
      ctx.rotate(ast.rotation);
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const r = ast.size / 2 * (0.8 + Math.sin(i * 3) * 0.2);
        if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
        else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    });

    // Draw bullets
    ctx.fillStyle = '#ffff00';
    bullets.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw player
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PLAYER_SIZE, 0);
    ctx.lineTo(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2);
    ctx.lineTo(-PLAYER_SIZE / 3, 0);
    ctx.lineTo(-PLAYER_SIZE / 2, PLAYER_SIZE / 2);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Draw lives
    for (let i = 0; i < lives; i++) {
      ctx.save();
      ctx.translate(20 + i * 25, 20);
      ctx.strokeStyle = '#00ffff';
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-4, -4);
      ctx.lineTo(-4, 4);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }, [player, asteroids, bullets, lives]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[400px] mb-4 text-xs">
        <div className="text-[#00ffff]">SCORE: {score}</div>
        <div className="text-[#ffff00]">HI: {highScore}</div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="border-4 border-[#00ffff] neon-box"
          style={{ color: '#00ffff' }}
        />

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#00ffff] text-sm mb-4 neon-text">☄️ ASTEROIDS ☄️</p>
            <p className="text-[#888] text-[10px] mb-4">DESTROY ALL ASTEROIDS</p>
            <button onClick={startGame} className="retro-btn text-[10px] text-[#00ffff]">
              START
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#ff0000] text-lg mb-2 neon-text">GAME OVER</p>
            <p className="text-[#00ffff] text-sm mb-4">SCORE: {score}</p>
            <button onClick={startGame} className="retro-btn text-[10px] text-[#00ffff]">
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      <p className="text-[8px] text-[#666] mt-4">← → ROTATE | ↑ THRUST | SPACE SHOOT</p>
    </div>
  );
};

export default AsteroidsGame;
