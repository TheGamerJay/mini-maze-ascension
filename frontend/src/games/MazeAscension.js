import React, { useState, useEffect, useCallback, useRef } from 'react';

const CELL_SIZE = 20;
const MAZE_WIDTH = 19;
const MAZE_HEIGHT = 15;

// 0 = wall, 1 = path, 2 = dot, 3 = power-up, 4 = exit
const MAZE_TEMPLATE = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,2,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,0],
  [0,2,0,0,2,0,0,0,2,0,2,0,0,0,2,0,0,2,0],
  [0,3,0,0,2,0,0,0,2,0,2,0,0,0,2,0,0,3,0],
  [0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0],
  [0,2,0,0,2,0,2,0,0,0,0,0,2,0,2,0,0,2,0],
  [0,2,2,2,2,0,2,2,2,0,2,2,2,0,2,2,2,2,0],
  [0,0,0,0,2,0,0,0,1,0,1,0,0,0,2,0,0,0,0],
  [0,2,2,2,2,0,2,2,2,2,2,2,2,0,2,2,2,2,0],
  [0,2,0,0,2,0,2,0,0,0,0,0,2,0,2,0,0,2,0],
  [0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0],
  [0,3,0,0,2,0,0,0,2,0,2,0,0,0,2,0,0,3,0],
  [0,2,0,0,2,0,0,0,2,0,2,0,0,0,2,0,0,2,0],
  [0,2,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,4,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const MazeAscension = ({ onScore, highScore }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('start'); // start, playing, won, dead
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [zombies, setZombies] = useState([]);
  const [maze, setMaze] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [powerUp, setPowerUp] = useState(false);
  const [powerTimer, setPowerTimer] = useState(0);
  const [dotsLeft, setDotsLeft] = useState(0);

  // Initialize game
  const initGame = useCallback((lvl = 1) => {
    const newMaze = MAZE_TEMPLATE.map(row => [...row]);
    let dots = 0;
    newMaze.forEach(row => row.forEach(cell => { if (cell === 2) dots++; }));
    
    setMaze(newMaze);
    setPlayer({ x: 1, y: 1 });
    setDotsLeft(dots);
    setPowerUp(false);
    setPowerTimer(0);
    
    // Spawn zombies based on level
    const zombieCount = Math.min(2 + lvl, 6);
    const newZombies = [];
    const zombiePositions = [
      { x: 9, y: 7 },
      { x: 17, y: 13 },
      { x: 1, y: 13 },
      { x: 17, y: 1 },
      { x: 9, y: 1 },
      { x: 9, y: 13 },
    ];
    
    for (let i = 0; i < zombieCount; i++) {
      newZombies.push({
        ...zombiePositions[i],
        dir: Math.floor(Math.random() * 4),
        scared: false,
      });
    }
    setZombies(newZombies);
    setLevel(lvl);
    setGameState('playing');
  }, []);

  // Handle keyboard input
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e) => {
      const dirs = {
        ArrowUp: { dx: 0, dy: -1 },
        ArrowDown: { dx: 0, dy: 1 },
        ArrowLeft: { dx: -1, dy: 0 },
        ArrowRight: { dx: 1, dy: 0 },
        w: { dx: 0, dy: -1 },
        s: { dx: 0, dy: 1 },
        a: { dx: -1, dy: 0 },
        d: { dx: 1, dy: 0 },
      };

      const dir = dirs[e.key];
      if (!dir) return;

      setPlayer(prev => {
        const newX = prev.x + dir.dx;
        const newY = prev.y + dir.dy;
        
        if (newX >= 0 && newX < MAZE_WIDTH && newY >= 0 && newY < MAZE_HEIGHT) {
          if (maze[newY][newX] !== 0) {
            // Collect dot
            if (maze[newY][newX] === 2) {
              const newMaze = [...maze];
              newMaze[newY][newX] = 1;
              setMaze(newMaze);
              setScore(s => s + 10);
              setDotsLeft(d => d - 1);
            }
            // Power-up
            if (maze[newY][newX] === 3) {
              const newMaze = [...maze];
              newMaze[newY][newX] = 1;
              setMaze(newMaze);
              setPowerUp(true);
              setPowerTimer(100);
              setZombies(zs => zs.map(z => ({ ...z, scared: true })));
            }
            // Exit
            if (maze[newY][newX] === 4 && dotsLeft <= 0) {
              setScore(s => {
                const newScore = s + level * 100;
                onScore(newScore);
                return newScore;
              });
              setGameState('won');
            }
            return { x: newX, y: newY };
          }
        }
        return prev;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, maze, dotsLeft, level, onScore]);

  // Move zombies
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      // Power-up timer
      if (powerTimer > 0) {
        setPowerTimer(t => t - 1);
        if (powerTimer === 1) {
          setPowerUp(false);
          setZombies(zs => zs.map(z => ({ ...z, scared: false })));
        }
      }

      setZombies(prevZombies => {
        return prevZombies.map(zombie => {
          const dirs = [
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 },
          ];

          // Chase player or run away if scared
          let bestDir = zombie.dir;
          if (Math.random() > 0.3) {
            const playerDist = (dx, dy) => 
              Math.abs(player.x - (zombie.x + dx)) + Math.abs(player.y - (zombie.y + dy));
            
            let bestDist = zombie.scared ? -Infinity : Infinity;
            dirs.forEach((dir, i) => {
              const newX = zombie.x + dir.dx;
              const newY = zombie.y + dir.dy;
              if (newX >= 0 && newX < MAZE_WIDTH && newY >= 0 && newY < MAZE_HEIGHT && maze[newY][newX] !== 0) {
                const dist = playerDist(dir.dx, dir.dy);
                if (zombie.scared ? dist > bestDist : dist < bestDist) {
                  bestDist = dist;
                  bestDir = i;
                }
              }
            });
          }

          // Try to move
          const dir = dirs[bestDir];
          let newX = zombie.x + dir.dx;
          let newY = zombie.y + dir.dy;

          if (newX < 0 || newX >= MAZE_WIDTH || newY < 0 || newY >= MAZE_HEIGHT || maze[newY][newX] === 0) {
            // Try random direction
            const validDirs = dirs.filter((d, i) => {
              const nx = zombie.x + d.dx;
              const ny = zombie.y + d.dy;
              return nx >= 0 && nx < MAZE_WIDTH && ny >= 0 && ny < MAZE_HEIGHT && maze[ny][nx] !== 0;
            });
            if (validDirs.length > 0) {
              const randomDir = validDirs[Math.floor(Math.random() * validDirs.length)];
              newX = zombie.x + randomDir.dx;
              newY = zombie.y + randomDir.dy;
            } else {
              newX = zombie.x;
              newY = zombie.y;
            }
          }

          return { ...zombie, x: newX, y: newY, dir: bestDir };
        });
      });
    }, 200 - level * 10);

    return () => clearInterval(interval);
  }, [gameState, maze, player, powerTimer, level]);

  // Check collision with zombies
  useEffect(() => {
    if (gameState !== 'playing') return;

    zombies.forEach((zombie, i) => {
      if (zombie.x === player.x && zombie.y === player.y) {
        if (powerUp) {
          // Eat zombie
          setScore(s => s + 200);
          setZombies(zs => zs.filter((_, idx) => idx !== i));
        } else {
          // Die
          setLives(l => {
            if (l <= 1) {
              setGameState('dead');
              onScore(score);
              return 0;
            }
            // Reset position
            setPlayer({ x: 1, y: 1 });
            return l - 1;
          });
        }
      }
    });
  }, [player, zombies, powerUp, gameState, score, onScore]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw maze
    maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        const px = x * CELL_SIZE;
        const py = y * CELL_SIZE;

        if (cell === 0) {
          ctx.fillStyle = '#1a1a3a';
          ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
          ctx.strokeStyle = '#2a2a5a';
          ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE);
        } else if (cell === 2) {
          ctx.fillStyle = '#ffff00';
          ctx.beginPath();
          ctx.arc(px + CELL_SIZE/2, py + CELL_SIZE/2, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (cell === 3) {
          ctx.fillStyle = '#ff00ff';
          ctx.beginPath();
          ctx.arc(px + CELL_SIZE/2, py + CELL_SIZE/2, 6, 0, Math.PI * 2);
          ctx.fill();
        } else if (cell === 4) {
          ctx.fillStyle = dotsLeft <= 0 ? '#00ff00' : '#333';
          ctx.fillRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);
          ctx.fillStyle = '#000';
          ctx.font = '10px Arial';
          ctx.fillText('EXIT', px + 1, py + 14);
        }
      });
    });

    // Draw zombies
    zombies.forEach(zombie => {
      const px = zombie.x * CELL_SIZE;
      const py = zombie.y * CELL_SIZE;
      ctx.fillStyle = zombie.scared ? '#0000ff' : '#00ff00';
      ctx.beginPath();
      ctx.arc(px + CELL_SIZE/2, py + CELL_SIZE/2, CELL_SIZE/2 - 2, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = zombie.scared ? '#fff' : '#ff0000';
      ctx.beginPath();
      ctx.arc(px + CELL_SIZE/3, py + CELL_SIZE/3, 2, 0, Math.PI * 2);
      ctx.arc(px + CELL_SIZE*2/3, py + CELL_SIZE/3, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw player
    const px = player.x * CELL_SIZE;
    const py = player.y * CELL_SIZE;
    ctx.fillStyle = powerUp ? '#ff00ff' : '#ffff00';
    ctx.beginPath();
    ctx.arc(px + CELL_SIZE/2, py + CELL_SIZE/2, CELL_SIZE/2 - 2, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.lineTo(px + CELL_SIZE/2, py + CELL_SIZE/2);
    ctx.fill();

  }, [maze, player, zombies, powerUp, dotsLeft]);

  if (gameState === 'start') {
    return (
      <div className="flex flex-col items-center gap-4" data-testid="maze-ascension">
        <h2 className="text-2xl text-[#00ff00] neon-text">MAZE ASCENSION</h2>
        <div className="text-6xl mb-4">🧟</div>
        <p className="text-[#888] text-sm text-center max-w-xs">
          Navigate the zombie-infested maze! Collect all dots and reach the exit.
        </p>
        <p className="text-[#ff00ff] text-xs">Power-ups let you eat zombies!</p>
        <p className="text-[#ffff00] text-xs">BEST: {highScore}</p>
        <button onClick={() => initGame(1)} className="retro-btn text-[#00ff00]">
          START GAME
        </button>
      </div>
    );
  }

  if (gameState === 'won') {
    return (
      <div className="flex flex-col items-center gap-4" data-testid="maze-ascension">
        <h2 className="text-2xl text-[#00ff00] neon-text">LEVEL {level} COMPLETE!</h2>
        <p className="text-[#ffff00] text-xl">{score} POINTS</p>
        <button onClick={() => initGame(level + 1)} className="retro-btn text-[#00ff00]">
          NEXT LEVEL
        </button>
      </div>
    );
  }

  if (gameState === 'dead') {
    return (
      <div className="flex flex-col items-center gap-4" data-testid="maze-ascension">
        <h2 className="text-2xl text-[#ff0000] neon-text">GAME OVER</h2>
        <p className="text-[#888]">The zombies got you!</p>
        <p className="text-[#ffff00] text-xl">{score} POINTS</p>
        <p className="text-[#888] text-sm">Level reached: {level}</p>
        <button onClick={() => { setScore(0); setLives(3); initGame(1); }} className="retro-btn text-[#00ff00]">
          TRY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2" data-testid="maze-ascension">
      <div className="flex justify-between w-full max-w-sm text-xs">
        <span className="text-[#00ffff]">LVL: {level}</span>
        <span className="text-[#ff0000]">{'❤️'.repeat(lives)}</span>
        <span className="text-[#00ff00]">SCORE: {score}</span>
      </div>
      
      <div className="flex justify-between w-full max-w-sm text-xs mb-1">
        <span className="text-[#ffff00]">DOTS: {dotsLeft}</span>
        {powerUp && <span className="text-[#ff00ff] animate-pulse">POWER UP!</span>}
        <span className="text-[#888]">BEST: {highScore}</span>
      </div>

      <canvas
        ref={canvasRef}
        width={MAZE_WIDTH * CELL_SIZE}
        height={MAZE_HEIGHT * CELL_SIZE}
        className="border-2 border-[#00ff00] rounded"
      />

      <p className="text-[8px] text-[#888]">ARROW KEYS OR WASD TO MOVE</p>
      
      {/* Mobile controls */}
      <div className="grid grid-cols-3 gap-1 mt-2">
        <div />
        <button 
          onTouchStart={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))}
          className="w-10 h-10 bg-[#333] rounded text-white"
        >↑</button>
        <div />
        <button 
          onTouchStart={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))}
          className="w-10 h-10 bg-[#333] rounded text-white"
        >←</button>
        <button 
          onTouchStart={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))}
          className="w-10 h-10 bg-[#333] rounded text-white"
        >↓</button>
        <button 
          onTouchStart={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))}
          className="w-10 h-10 bg-[#333] rounded text-white"
        >→</button>
      </div>
    </div>
  );
};

export default MazeAscension;
