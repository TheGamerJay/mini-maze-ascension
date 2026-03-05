import React, { useState, useCallback } from 'react';

const DIFFICULTIES = {
  easy: { rows: 8, cols: 8, mines: 10 },
  medium: { rows: 12, cols: 12, mines: 25 },
  hard: { rows: 16, cols: 16, mines: 50 }
};

const Minesweeper = ({ onScore, highScore, soundEnabled }) => {
  const [difficulty, setDifficulty] = useState('easy');
  const [grid, setGrid] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [firstClick, setFirstClick] = useState(true);

  const { rows, cols, mines } = DIFFICULTIES[difficulty];

  const initGrid = (safeRow = -1, safeCol = -1) => {
    const newGrid = Array(rows).fill(null).map(() => Array(cols).fill(0));
    let placed = 0;
    
    while (placed < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      
      // Don't place mine on first click or adjacent cells
      const isSafe = Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1;
      
      if (newGrid[r][c] !== -1 && !isSafe) {
        newGrid[r][c] = -1;
        placed++;
      }
    }

    // Calculate numbers
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newGrid[r][c] === -1) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newGrid[nr][nc] === -1) {
              count++;
            }
          }
        }
        newGrid[r][c] = count;
      }
    }
    return newGrid;
  };

  const startGame = () => {
    setGrid([]);
    setRevealed(Array(rows).fill(null).map(() => Array(cols).fill(false)));
    setFlagged(Array(rows).fill(null).map(() => Array(cols).fill(false)));
    setGameOver(false);
    setGameWon(false);
    setGameStarted(true);
    setFirstClick(true);
  };

  const reveal = useCallback((r, c, currentGrid, currentRevealed) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return currentRevealed;
    if (currentRevealed[r][c]) return currentRevealed;
    if (flagged[r][c]) return currentRevealed;

    const newRevealed = currentRevealed.map(row => [...row]);
    newRevealed[r][c] = true;

    if (currentGrid[r][c] === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) {
            const result = reveal(r + dr, c + dc, currentGrid, newRevealed);
            for (let i = 0; i < rows; i++) {
              for (let j = 0; j < cols; j++) {
                newRevealed[i][j] = newRevealed[i][j] || result[i][j];
              }
            }
          }
        }
      }
    }
    return newRevealed;
  }, [rows, cols, flagged]);

  const handleClick = (r, c) => {
    if (gameOver || gameWon) return;
    if (flagged[r][c]) return;

    let currentGrid = grid;
    
    if (firstClick) {
      currentGrid = initGrid(r, c);
      setGrid(currentGrid);
      setFirstClick(false);
    }

    if (currentGrid[r][c] === -1) {
      // Hit mine
      const allRevealed = Array(rows).fill(null).map(() => Array(cols).fill(true));
      setRevealed(allRevealed);
      setGameOver(true);
      return;
    }

    const newRevealed = reveal(r, c, currentGrid, revealed);
    setRevealed(newRevealed);

    // Check win
    let unrevealedSafe = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!newRevealed[i][j] && currentGrid[i][j] !== -1) {
          unrevealedSafe++;
        }
      }
    }
    if (unrevealedSafe === 0) {
      setGameWon(true);
      const score = mines * 100;
      onScore(score);
    }
  };

  const handleRightClick = (e, r, c) => {
    e.preventDefault();
    if (gameOver || gameWon) return;
    if (revealed[r][c]) return;

    const newFlagged = flagged.map(row => [...row]);
    newFlagged[r][c] = !newFlagged[r][c];
    setFlagged(newFlagged);
  };

  const getCellContent = (r, c) => {
    if (!gameStarted) return '';
    if (flagged[r][c]) return '🚩';
    if (!revealed[r][c]) return '';
    if (grid[r][c] === -1) return '💣';
    if (grid[r][c] === 0) return '';
    return grid[r][c];
  };

  const getCellColor = (value) => {
    const colors = ['', '#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000000', '#808080'];
    return colors[value] || '#fff';
  };

  const cellSize = difficulty === 'hard' ? 22 : difficulty === 'medium' ? 28 : 32;

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-4 mb-4">
        {Object.keys(DIFFICULTIES).map(d => (
          <button
            key={d}
            onClick={() => { setDifficulty(d); setGameStarted(false); }}
            className={`retro-btn text-[8px] ${difficulty === d ? 'text-[#00ff00]' : 'text-[#888]'}`}
          >
            {d.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="text-xs text-[#ff0000] mb-2">
        💣 {mines - flagged.flat().filter(f => f).length}
      </div>

      <div className="relative">
        <div 
          className="grid gap-[1px] bg-[#333] p-1 border-4 border-[#666]"
          style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)` }}
        >
          {Array(rows).fill(null).map((_, r) =>
            Array(cols).fill(null).map((_, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleClick(r, c)}
                onContextMenu={(e) => handleRightClick(e, r, c)}
                className={`flex items-center justify-center font-bold transition-all ${
                  revealed[r][c] 
                    ? 'bg-[#bdbdbd]' 
                    : 'bg-[#c0c0c0] hover:bg-[#d0d0d0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080]'
                }`}
                style={{ 
                  width: cellSize, 
                  height: cellSize,
                  fontSize: cellSize * 0.5,
                  color: getCellColor(grid[r]?.[c])
                }}
              >
                {getCellContent(r, c)}
              </button>
            ))
          )}
        </div>

        {!gameStarted && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#ff0000] text-sm mb-4 neon-text">💣 MINESWEEPER 💣</p>
            <p className="text-[#888] text-[10px] mb-4">RIGHT-CLICK TO FLAG</p>
            <button onClick={startGame} className="retro-btn text-[10px] text-[#ff0000]">
              START
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#ff0000] text-lg mb-2 neon-text">💥 BOOM! 💥</p>
            <button onClick={startGame} className="retro-btn text-[10px] text-[#ff0000]">
              TRY AGAIN
            </button>
          </div>
        )}

        {gameWon && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#00ff00] text-lg mb-2 neon-text">YOU WIN!</p>
            <p className="text-[#ffff00] text-sm mb-4">+{mines * 100} PTS</p>
            <button onClick={startGame} className="retro-btn text-[10px] text-[#00ff00]">
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      <p className="text-[8px] text-[#666] mt-4">LEFT-CLICK REVEAL | RIGHT-CLICK FLAG</p>
    </div>
  );
};

export default Minesweeper;
