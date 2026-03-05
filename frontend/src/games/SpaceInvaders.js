import React, { useState, useEffect, useCallback, useRef } from 'react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 20;
const INVADER_WIDTH = 30;
const INVADER_HEIGHT = 20;
const BULLET_SIZE = 4;
const INVADER_ROWS = 4;
const INVADER_COLS = 8;

const SpaceInvaders = ({ onScore, highScore, soundEnabled }) => {
  const canvasRef = useRef(null);
  const [player, setPlayer] = useState({ x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2 });
  const [bullets, setBullets] = useState([]);
  const [invaders, setInvaders] = useState([]);
  const [invaderBullets, setInvaderBullets] = useState([]);
  const [invaderDir, setInvaderDir] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const playerRef = useRef(player);

  const initInvaders = () => {
    const newInvaders = [];
    for (let row = 0; row < INVADER_ROWS; row++) {
      for (let col = 0; col < INVADER_COLS; col++) {
        newInvaders.push({
          x: 30 + col * (INVADER_WIDTH + 10),
          y: 50 + row * (INVADER_HEIGHT + 15),
          alive: true,
          type: row < 1 ? 'squid' : row < 2 ? 'crab' : 'octopus',
          points: row < 1 ? 30 : row < 2 ? 20 : 10
        });
      }
    }
    return newInvaders;
  };

  useEffect(() => {
    setInvaders(initInvaders());
  }, []);

  const shoot = useCallback(() => {
    if (bullets.length < 3) {
      setBullets(prev => [...prev, {
        x: playerRef.current.x + PLAYER_WIDTH / 2 - BULLET_SIZE / 2,
        y: CANVAS_HEIGHT - 50
      }]);
    }
  }, [bullets.length]);

  const handleKeyDown = useCallback((e) => {
    if (!gameStarted && !gameOver) {
      setGameStarted(true);
      return;
    }
    if (gameOver) return;

    const speed = 15;
    if (e.key === 'ArrowLeft') {
      setPlayer(p => {
        const newX = Math.max(0, p.x - speed);
        playerRef.current = { x: newX };
        return { x: newX };
      });
    } else if (e.key === 'ArrowRight') {
      setPlayer(p => {
        const newX = Math.min(CANVAS_WIDTH - PLAYER_WIDTH, p.x + speed);
        playerRef.current = { x: newX };
        return { x: newX };
      });
    } else if (e.key === ' ' || e.key === 'ArrowUp') {
      shoot();
    }
  }, [gameStarted, gameOver, shoot]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || gameWon) return;

    const gameLoop = setInterval(() => {
      // Move bullets
      setBullets(prev => prev
        .map(b => ({ ...b, y: b.y - 8 }))
        .filter(b => b.y > 0)
      );

      // Move invader bullets
      setInvaderBullets(prev => {
        const newBullets = prev
          .map(b => ({ ...b, y: b.y + 5 }))
          .filter(b => b.y < CANVAS_HEIGHT);

        // Check player hit
        newBullets.forEach(bullet => {
          if (
            bullet.x >= playerRef.current.x &&
            bullet.x <= playerRef.current.x + PLAYER_WIDTH &&
            bullet.y >= CANVAS_HEIGHT - 40 &&
            bullet.y <= CANVAS_HEIGHT - 20
          ) {
            setLives(l => {
              if (l <= 1) {
                setGameOver(true);
                onScore(score);
                return 0;
              }
              return l - 1;
            });
          }
        });

        return newBullets;
      });

      // Check bullet-invader collisions
      setBullets(prevBullets => {
        let remainingBullets = [...prevBullets];
        
        setInvaders(prevInvaders => {
          return prevInvaders.map(invader => {
            if (!invader.alive) return invader;

            const hitBullet = remainingBullets.findIndex(bullet =>
              bullet.x >= invader.x &&
              bullet.x <= invader.x + INVADER_WIDTH &&
              bullet.y >= invader.y &&
              bullet.y <= invader.y + INVADER_HEIGHT
            );

            if (hitBullet !== -1) {
              remainingBullets.splice(hitBullet, 1);
              setScore(s => s + invader.points);
              return { ...invader, alive: false };
            }
            return invader;
          });
        });

        return remainingBullets;
      });

      // Move invaders
      setInvaders(prevInvaders => {
        const aliveInvaders = prevInvaders.filter(i => i.alive);
        if (aliveInvaders.length === 0) {
          setGameWon(true);
          onScore(score);
          return prevInvaders;
        }

        const minX = Math.min(...aliveInvaders.map(i => i.x));
        const maxX = Math.max(...aliveInvaders.map(i => i.x + INVADER_WIDTH));
        
        let newDir = invaderDir;
        let moveDown = false;

        if (maxX >= CANVAS_WIDTH - 10 && invaderDir > 0) {
          newDir = -1;
          moveDown = true;
        } else if (minX <= 10 && invaderDir < 0) {
          newDir = 1;
          moveDown = true;
        }

        if (newDir !== invaderDir) {
          setInvaderDir(newDir);
        }

        return prevInvaders.map(invader => ({
          ...invader,
          x: invader.x + newDir * 2,
          y: moveDown ? invader.y + 10 : invader.y
        }));
      });

      // Random invader shooting
      if (Math.random() < 0.02) {
        setInvaders(prevInvaders => {
          const aliveInvaders = prevInvaders.filter(i => i.alive);
          if (aliveInvaders.length > 0) {
            const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
            setInvaderBullets(prev => [...prev, {
              x: shooter.x + INVADER_WIDTH / 2,
              y: shooter.y + INVADER_HEIGHT
            }]);
          }
          return prevInvaders;
        });
      }

      // Check if invaders reached bottom
      setInvaders(prevInvaders => {
        if (prevInvaders.some(i => i.alive && i.y + INVADER_HEIGHT > CANVAS_HEIGHT - 60)) {
          setGameOver(true);
          onScore(score);
        }
        return prevInvaders;
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, gameWon, invaderDir, score, onScore]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 50; i++) {
      const x = (i * 73) % CANVAS_WIDTH;
      const y = (i * 37) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 1, 1);
    }

    // Draw invaders
    invaders.forEach(invader => {
      if (!invader.alive) return;
      
      const colors = { squid: '#ff0000', crab: '#00ff00', octopus: '#ffff00' };
      ctx.fillStyle = colors[invader.type];
      
      // Simple pixel art invader
      ctx.fillRect(invader.x + 5, invader.y, 20, 5);
      ctx.fillRect(invader.x, invader.y + 5, 30, 10);
      ctx.fillRect(invader.x + 5, invader.y + 15, 5, 5);
      ctx.fillRect(invader.x + 20, invader.y + 15, 5, 5);
    });

    // Draw player
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x + 15, CANVAS_HEIGHT - 40, 10, 10);
    ctx.fillRect(player.x, CANVAS_HEIGHT - 30, 40, 10);

    // Draw bullets
    ctx.fillStyle = '#00ffff';
    bullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, BULLET_SIZE, 10);
    });

    // Draw invader bullets
    ctx.fillStyle = '#ff0000';
    invaderBullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, BULLET_SIZE, 10);
    });

    // Draw lives
    for (let i = 0; i < lives; i++) {
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(20 + i * 30, CANVAS_HEIGHT - 15, 20, 8);
    }
  }, [invaders, player, bullets, invaderBullets, lives]);

  const resetGame = () => {
    setInvaders(initInvaders());
    setPlayer({ x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2 });
    playerRef.current = { x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2 };
    setBullets([]);
    setInvaderBullets([]);
    setInvaderDir(1);
    setGameOver(false);
    setGameWon(false);
    setScore(0);
    setLives(3);
    setGameStarted(true);
  };

  // Touch controls
  const handleTouch = (dir) => {
    if (!gameStarted) {
      setGameStarted(true);
      return;
    }
    const speed = 20;
    if (dir === 'left') {
      setPlayer(p => {
        const newX = Math.max(0, p.x - speed);
        playerRef.current = { x: newX };
        return { x: newX };
      });
    } else if (dir === 'right') {
      setPlayer(p => {
        const newX = Math.min(CANVAS_WIDTH - PLAYER_WIDTH, p.x + speed);
        playerRef.current = { x: newX };
        return { x: newX };
      });
    } else if (dir === 'fire') {
      shoot();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[400px] mb-4 text-xs">
        <div className="text-[#ff0000]">SCORE: {score}</div>
        <div className="text-[#ffff00]">HI: {highScore}</div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-[#ff0000] neon-box"
          style={{ color: '#ff0000' }}
        />

        {!gameStarted && !gameOver && !gameWon && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#ff0000] text-sm mb-4 neon-text">👾 SPACE INVADERS 👾</p>
            <p className="text-[#888] text-[10px] mb-4">PRESS ANY KEY</p>
            <button onClick={() => setGameStarted(true)} className="retro-btn text-[10px] text-[#ff0000]">
              START
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#ff0000] text-lg mb-2 neon-text">GAME OVER</p>
            <p className="text-[#00ff00] text-sm mb-4">SCORE: {score}</p>
            <button onClick={resetGame} className="retro-btn text-[10px] text-[#ff0000]">
              PLAY AGAIN
            </button>
          </div>
        )}

        {gameWon && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#00ff00] text-lg mb-2 neon-text">VICTORY!</p>
            <p className="text-[#ff0000] text-sm mb-4">SCORE: {score}</p>
            <button onClick={resetGame} className="retro-btn text-[10px] text-[#ff0000]">
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Touch Controls */}
      <div className="mt-4 flex gap-4 md:hidden">
        <button onClick={() => handleTouch('left')} className="retro-btn text-xl px-6 py-3">←</button>
        <button onClick={() => handleTouch('fire')} className="retro-btn text-xl px-6 py-3 text-[#ff0000]">FIRE</button>
        <button onClick={() => handleTouch('right')} className="retro-btn text-xl px-6 py-3">→</button>
      </div>

      <p className="text-[8px] text-[#666] mt-4 text-center">
        ← → MOVE | SPACE FIRE
      </p>
    </div>
  );
};

export default SpaceInvaders;
