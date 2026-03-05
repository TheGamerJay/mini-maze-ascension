import React, { useState, useEffect, useCallback } from 'react';

const PUZZLES = [
  // Easy puzzle
  [
    [5,3,0,0,7,0,0,0,0],
    [6,0,0,1,9,5,0,0,0],
    [0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],
    [4,0,0,8,0,3,0,0,1],
    [7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],
    [0,0,0,4,1,9,0,0,5],
    [0,0,0,0,8,0,0,7,9]
  ],
  // Medium puzzle
  [
    [0,0,0,2,6,0,7,0,1],
    [6,8,0,0,7,0,0,9,0],
    [1,9,0,0,0,4,5,0,0],
    [8,2,0,1,0,0,0,4,0],
    [0,0,4,6,0,2,9,0,0],
    [0,5,0,0,0,3,0,2,8],
    [0,0,9,3,0,0,0,7,4],
    [0,4,0,0,5,0,0,3,6],
    [7,0,3,0,1,8,0,0,0]
  ],
  // Hard puzzle
  [
    [0,2,0,6,0,8,0,0,0],
    [5,8,0,0,0,9,7,0,0],
    [0,0,0,0,4,0,0,0,0],
    [3,7,0,0,0,0,5,0,0],
    [6,0,0,0,0,0,0,0,4],
    [0,0,8,0,0,0,0,1,3],
    [0,0,0,0,2,0,0,0,0],
    [0,0,9,8,0,0,0,3,6],
    [0,0,0,3,0,6,0,9,0]
  ]
];

const SOLUTIONS = [
  [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9]
  ],
  [
    [4,3,5,2,6,9,7,8,1],
    [6,8,2,5,7,1,4,9,3],
    [1,9,7,8,3,4,5,6,2],
    [8,2,6,1,9,5,3,4,7],
    [3,7,4,6,8,2,9,1,5],
    [9,5,1,7,4,3,6,2,8],
    [5,1,9,3,2,6,8,7,4],
    [2,4,8,9,5,7,1,3,6],
    [7,6,3,4,1,8,2,5,9]
  ],
  [
    [1,2,3,6,7,8,9,4,5],
    [5,8,4,2,3,9,7,6,1],
    [9,6,7,1,4,5,3,2,8],
    [3,7,2,4,6,1,5,8,9],
    [6,9,1,5,8,3,2,7,4],
    [4,5,8,7,9,2,6,1,3],
    [8,3,6,9,2,4,1,5,7],
    [2,1,9,8,5,7,4,3,6],
    [7,4,5,3,1,6,8,9,2]
  ]
];

const SudokuGame = ({ onScore, highScore }) => {
  const [grid, setGrid] = useState([]);
  const [originalGrid, setOriginalGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [errors, setErrors] = useState([]);
  const [solved, setSolved] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const initGame = useCallback(() => {
    const puzzle = PUZZLES[puzzleIndex].map(row => [...row]);
    setGrid(puzzle);
    setOriginalGrid(PUZZLES[puzzleIndex]);
    setSelectedCell(null);
    setErrors([]);
    setSolved(false);
    setStartTime(Date.now());
    setElapsedTime(0);
  }, [puzzleIndex]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (solved) return;
    
    const timer = setInterval(() => {
      if (startTime) {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, solved]);

  const handleCellClick = (row, col) => {
    if (originalGrid[row][col] !== 0) return;
    setSelectedCell({ row, col });
  };

  const handleNumberInput = (num) => {
    if (!selectedCell || solved) return;
    
    const { row, col } = selectedCell;
    if (originalGrid[row][col] !== 0) return;

    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = num;
    setGrid(newGrid);

    // Check for errors
    const newErrors = [];
    if (num !== 0 && num !== SOLUTIONS[puzzleIndex][row][col]) {
      newErrors.push(`${row}-${col}`);
    }
    setErrors(newErrors);

    // Check if solved
    let isSolved = true;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (newGrid[r][c] !== SOLUTIONS[puzzleIndex][r][c]) {
          isSolved = false;
          break;
        }
      }
      if (!isSolved) break;
    }

    if (isSolved) {
      setSolved(true);
      const timeBonus = Math.max(0, 600 - elapsedTime);
      const difficultyBonus = (puzzleIndex + 1) * 50;
      const score = 100 + timeBonus + difficultyBonus;
      onScore(score);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBoxColor = (row, col) => {
    const boxRow = Math.floor(row / 3);
    const boxCol = Math.floor(col / 3);
    return (boxRow + boxCol) % 2 === 0 ? 'bg-[#1a1a2e]' : 'bg-[#0f0f1a]';
  };

  return (
    <div className="flex flex-col items-center gap-4" data-testid="sudoku-game">
      <div className="flex justify-between w-full max-w-sm text-xs">
        <span className="text-[#00ffff]">
          {puzzleIndex === 0 ? 'EASY' : puzzleIndex === 1 ? 'MEDIUM' : 'HARD'}
        </span>
        <span className="text-[#00ff00]">TIME: {formatTime(elapsedTime)}</span>
        <span className="text-[#ffff00]">BEST: {highScore}</span>
      </div>

      <div className="flex gap-2 mb-2">
        {[0, 1, 2].map(i => (
          <button
            key={i}
            onClick={() => setPuzzleIndex(i)}
            className={`retro-btn text-xs ${puzzleIndex === i ? 'text-[#00ff00]' : 'text-[#888]'}`}
          >
            {i === 0 ? 'EASY' : i === 1 ? 'MED' : 'HARD'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-9 gap-0 p-1 bg-[#ff00ff] rounded">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const isOriginal = originalGrid[rowIndex]?.[colIndex] !== 0;
            const hasError = errors.includes(`${rowIndex}-${colIndex}`);
            const borderRight = (colIndex + 1) % 3 === 0 && colIndex < 8 ? 'border-r-2 border-[#ff00ff]' : '';
            const borderBottom = (rowIndex + 1) % 3 === 0 && rowIndex < 8 ? 'border-b-2 border-[#ff00ff]' : '';

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`
                  w-8 h-8 flex items-center justify-center cursor-pointer
                  ${getBoxColor(rowIndex, colIndex)}
                  ${isSelected ? 'ring-2 ring-[#00ffff]' : ''}
                  ${borderRight} ${borderBottom}
                `}
              >
                <span className={`
                  text-sm font-bold
                  ${isOriginal ? 'text-[#888]' : hasError ? 'text-[#ff0000]' : 'text-[#00ffff]'}
                `}>
                  {cell !== 0 ? cell : ''}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {[1,2,3,4,5,6,7,8,9,0].map(num => (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            className="w-10 h-10 retro-btn text-[#00ffff] text-lg"
          >
            {num === 0 ? 'X' : num}
          </button>
        ))}
      </div>

      {solved && (
        <div className="text-center">
          <p className="text-[#00ff00] text-xl neon-text mb-2">SOLVED!</p>
          <p className="text-[#ffff00] text-sm">Time: {formatTime(elapsedTime)}</p>
        </div>
      )}

      <p className="text-[8px] text-[#888]">SELECT CELL • TAP NUMBER</p>
    </div>
  );
};

export default SudokuGame;
