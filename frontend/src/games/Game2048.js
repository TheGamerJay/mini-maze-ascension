import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 4;
const CELL_SIZE = 80;

const Game2048 = ({ onScore, highScore, soundEnabled }) => {
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const initGrid = () => {
    const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    addRandomTile(newGrid);
    addRandomTile(newGrid);
    return newGrid;
  };

  const addRandomTile = (g) => {
    const empty = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (g[i][j] === 0) empty.push({ i, j });
      }
    }
    if (empty.length > 0) {
      const { i, j } = empty[Math.floor(Math.random() * empty.length)];
      g[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const slide = (row) => {
    const filtered = row.filter(x => x !== 0);
    const missing = GRID_SIZE - filtered.length;
    return Array(missing).fill(0).concat(filtered);
  };

  const combine = (row) => {
    let points = 0;
    for (let i = GRID_SIZE - 1; i > 0; i--) {
      if (row[i] === row[i - 1] && row[i] !== 0) {
        row[i] *= 2;
        points += row[i];
        row[i - 1] = 0;
        if (row[i] === 2048) setGameWon(true);
      }
    }
    return { row, points };
  };

  const moveRight = (g) => {
    let totalPoints = 0;
    const newGrid = g.map(row => {
      const slid = slide(row);
      const { row: combined, points } = combine(slid);
      totalPoints += points;
      return slide(combined);
    });
    return { grid: newGrid, points: totalPoints };
  };

  const moveLeft = (g) => {
    const reversed = g.map(row => [...row].reverse());
    const { grid: moved, points } = moveRight(reversed);
    return { grid: moved.map(row => row.reverse()), points };
  };

  const moveDown = (g) => {
    const rotated = g[0].map((_, i) => g.map(row => row[i]));
    const { grid: moved, points } = moveRight(rotated);
    return { grid: moved[0].map((_, i) => moved.map(row => row[i])), points };
  };

  const moveUp = (g) => {
    const rotated = g[0].map((_, i) => g.map(row => row[i]));
    const { grid: moved, points } = moveLeft(rotated);
    return { grid: moved[0].map((_, i) => moved.map(row => row[i])), points };
  };

  const checkGameOver = (g) => {
    // Check for empty cells
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (g[i][j] === 0) return false;
      }
    }
    // Check for possible merges
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (j < GRID_SIZE - 1 && g[i][j] === g[i][j + 1]) return false;
        if (i < GRID_SIZE - 1 && g[i][j] === g[i + 1][j]) return false;
      }
    }
    return true;
  };

  const move = useCallback((direction) => {
    if (gameOver || gameWon) return;

    let result;
    const gridCopy = grid.map(row => [...row]);

    switch (direction) {
      case 'up': result = moveUp(gridCopy); break;
      case 'down': result = moveDown(gridCopy); break;
      case 'left': result = moveLeft(gridCopy); break;
      case 'right': result = moveRight(gridCopy); break;
      default: return;
    }

    // Check if anything moved
    const moved = JSON.stringify(result.grid) !== JSON.stringify(grid);
    
    if (moved) {
      addRandomTile(result.grid);
      setGrid(result.grid);
      setScore(s => s + result.points);

      if (checkGameOver(result.grid)) {
        setGameOver(true);
        onScore(score + result.points);
      }
    }
  }, [grid, gameOver, gameWon, score, onScore]);

  const handleKeyDown = useCallback((e) => {
    if (!gameStarted && !gameOver) {
      setGameStarted(true);
      setGrid(initGrid());
      return;
    }

    switch (e.key) {
      case 'ArrowUp': move('up'); break;
      case 'ArrowDown': move('down'); break;
      case 'ArrowLeft': move('left'); break;
      case 'ArrowRight': move('right'); break;
      default: break;
    }
  }, [gameStarted, gameOver, move]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Touch handling
  const [touchStart, setTouchStart] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    
    const deltaX = e.changedTouches[0].clientX - touchStart.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.y;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      move(deltaX > 0 ? 'right' : 'left');
    } else {
      move(deltaY > 0 ? 'down' : 'up');
    }
    setTouchStart(null);
  };

  const getCellColor = (value) => {
    const colors = {
      0: '#1a1a1a',
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e',
    };
    return colors[value] || '#3c3a32';
  };

  const getTextColor = (value) => {
    return value <= 4 ? '#776e65' : '#f9f6f2';
  };

  const resetGame = () => {
    setGrid(initGrid());
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setGameStarted(true);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[340px] mb-4 text-xs">
        <div className="text-[#ff6600]">SCORE: {score}</div>
        <div className="text-[#ffff00]">HI: {highScore}</div>
      </div>

      <div 
        className="relative bg-[#bbada0] p-2 rounded-lg"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="grid gap-2"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          }}
        >
          {grid.map((row, i) =>
            row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                className="flex items-center justify-center rounded font-bold transition-all duration-100"
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: getCellColor(cell),
                  color: getTextColor(cell),
                  fontSize: cell > 512 ? '16px' : cell > 64 ? '20px' : '24px',
                }}
              >
                {cell > 0 ? cell : ''}
              </div>
            ))
          )}
        </div>

        {!gameStarted && !gameOver && !gameWon && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <p className="text-[#ff6600] text-sm mb-4 neon-text">🔢 2048 🔢</p>
            <p className="text-[#888] text-[10px] mb-4">SWIPE OR USE ARROWS</p>
            <button onClick={resetGame} className="retro-btn text-[10px] text-[#ff6600]">
              START
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <p className="text-[#ff0000] text-lg mb-2 neon-text">GAME OVER</p>
            <p className="text-[#ff6600] text-sm mb-4">SCORE: {score}</p>
            <button onClick={resetGame} className="retro-btn text-[10px] text-[#ff6600]">
              PLAY AGAIN
            </button>
          </div>
        )}

        {gameWon && !gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <p className="text-[#00ff00] text-lg mb-2 neon-text">YOU WIN!</p>
            <p className="text-[#ff6600] text-sm mb-4">SCORE: {score}</p>
            <button onClick={() => setGameWon(false)} className="retro-btn text-[10px] text-[#00ff00] mr-2">
              KEEP PLAYING
            </button>
            <button onClick={resetGame} className="retro-btn text-[10px] text-[#ff6600] mt-2">
              NEW GAME
            </button>
          </div>
        )}
      </div>

      <p className="text-[8px] text-[#666] mt-4 text-center">
        SWIPE OR USE ARROW KEYS
      </p>
    </div>
  );
};

export default Game2048;
