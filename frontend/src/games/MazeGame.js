import React, { useState, useEffect, useCallback } from 'react';

const MAZE_SIZE = 15;
const CELL_SIZE = 28;

const MazeGame = ({ onScore, highScore, soundEnabled }) => {
  const [maze, setMaze] = useState([]);
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [exit, setExit] = useState({ x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 });
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const generateMaze = () => {
    // Initialize with walls
    const newMaze = Array(MAZE_SIZE).fill(null).map(() => Array(MAZE_SIZE).fill(1));
    
    // Recursive backtracking
    const stack = [{ x: 1, y: 1 }];
    newMaze[1][1] = 0;

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = [];

      const directions = [
        { dx: 0, dy: -2 }, { dx: 0, dy: 2 },
        { dx: -2, dy: 0 }, { dx: 2, dy: 0 }
      ];

      for (const { dx, dy } of directions) {
        const nx = current.x + dx;
        const ny = current.y + dy;
        if (nx > 0 && nx < MAZE_SIZE - 1 && ny > 0 && ny < MAZE_SIZE - 1 && newMaze[ny][nx] === 1) {
          neighbors.push({ x: nx, y: ny, wx: current.x + dx / 2, wy: current.y + dy / 2 });
        }
      }

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        newMaze[next.wy][next.wx] = 0;
        newMaze[next.y][next.x] = 0;
        stack.push({ x: next.x, y: next.y });
      } else {
        stack.pop();
      }
    }

    // Ensure exit is accessible
    newMaze[MAZE_SIZE - 2][MAZE_SIZE - 2] = 0;
    newMaze[MAZE_SIZE - 3][MAZE_SIZE - 2] = 0;
    newMaze[MAZE_SIZE - 2][MAZE_SIZE - 3] = 0;

    return newMaze;
  };

  const startGame = () => {
    setMaze(generateMaze());
    setPlayer({ x: 1, y: 1 });
    setGameWon(false);
    setGameStarted(true);
    setMoves(0);
    setTimeLeft(60);
  };

  const movePlayer = useCallback((dx, dy) => {
    if (gameWon || !gameStarted) return;

    const newX = player.x + dx;
    const newY = player.y + dy;

    if (newX >= 0 && newX < MAZE_SIZE && newY >= 0 && newY < MAZE_SIZE && maze[newY][newX] === 0) {
      setPlayer({ x: newX, y: newY });
      setMoves(m => m + 1);

      if (newX === exit.x && newY === exit.y) {
        setGameWon(true);
        const score = Math.max(0, timeLeft * 10 + (100 - moves));
        onScore(score);
      }
    }
  }, [player, maze, gameWon, gameStarted, exit, timeLeft, moves, onScore]);

  const handleKeyDown = useCallback((e) => {
    if (!gameStarted && !gameWon) {
      startGame();
      return;
    }

    switch (e.key) {
      case 'ArrowUp': case 'w': movePlayer(0, -1); break;
      case 'ArrowDown': case 's': movePlayer(0, 1); break;
      case 'ArrowLeft': case 'a': movePlayer(-1, 0); break;
      case 'ArrowRight': case 'd': movePlayer(1, 0); break;
      default: break;
    }
  }, [gameStarted, gameWon, movePlayer]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameWon || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameWon(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameWon, timeLeft]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[420px] mb-4 text-xs">
        <div className="text-[#00ffff]">MOVES: {moves}</div>
        <div className={`${timeLeft <= 10 ? 'text-[#ff0000] animate-pulse' : 'text-[#ffff00]'}`}>
          TIME: {timeLeft}s
        </div>
      </div>

      <div className="relative">
        <div
          className="grid bg-[#1a1a2e] border-4 border-[#00ffff] neon-box"
          style={{ 
            gridTemplateColumns: `repeat(${MAZE_SIZE}, ${CELL_SIZE}px)`,
            color: '#00ffff'
          }}
        >
          {maze.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`flex items-center justify-center ${
                  cell === 1 ? 'bg-[#333366]' : 'bg-[#0a0a1a]'
                }`}
                style={{ width: CELL_SIZE, height: CELL_SIZE }}
              >
                {player.x === x && player.y === y && (
                  <span className="text-lg animate-pulse">😀</span>
                )}
                {exit.x === x && exit.y === y && player.x !== x && (
                  <span className="text-lg">🚪</span>
                )}
              </div>
            ))
          )}
        </div>

        {!gameStarted && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#00ffff] text-sm mb-4 neon-text">🔷 MAZE RUNNER 🔷</p>
            <p className="text-[#888] text-[10px] mb-4">FIND THE EXIT!</p>
            <button onClick={startGame} className="retro-btn text-[10px] text-[#00ffff]">
              START
            </button>
          </div>
        )}

        {gameWon && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#00ff00] text-lg mb-2 neon-text">ESCAPED!</p>
            <p className="text-[#00ffff] text-sm mb-4">TIME: {60 - timeLeft}s | MOVES: {moves}</p>
            <button onClick={startGame} className="retro-btn text-[10px] text-[#00ffff]">
              NEW MAZE
            </button>
          </div>
        )}

        {timeLeft === 0 && !gameWon && gameStarted && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#ff0000] text-lg mb-2 neon-text">TIME'S UP!</p>
            <button onClick={startGame} className="retro-btn text-[10px] text-[#ff0000]">
              TRY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Touch Controls */}
      <div className="mt-4 grid grid-cols-3 gap-1 md:hidden">
        <div></div>
        <button onClick={() => movePlayer(0, -1)} className="retro-btn text-lg p-2">↑</button>
        <div></div>
        <button onClick={() => movePlayer(-1, 0)} className="retro-btn text-lg p-2">←</button>
        <button onClick={() => movePlayer(0, 1)} className="retro-btn text-lg p-2">↓</button>
        <button onClick={() => movePlayer(1, 0)} className="retro-btn text-lg p-2">→</button>
      </div>

      <p className="text-[8px] text-[#666] mt-4">ARROW KEYS OR WASD TO MOVE</p>
    </div>
  );
};

export default MazeGame;
