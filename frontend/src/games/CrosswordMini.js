import React, { useState, useEffect } from 'react';

const PUZZLES = [
  {
    grid: [
      ['C', 'A', 'T', '#', '#'],
      ['A', '#', 'O', 'W', 'L'],
      ['R', 'U', 'N', '#', '#'],
      ['#', '#', '#', '#', '#'],
      ['#', '#', '#', '#', '#'],
    ],
    clues: {
      across: [
        { num: 1, clue: 'Meowing pet', answer: 'CAT', row: 0, col: 0 },
        { num: 4, clue: 'Wise bird', answer: 'OWL', row: 1, col: 2 },
        { num: 5, clue: 'Move fast', answer: 'RUN', row: 2, col: 0 },
      ],
      down: [
        { num: 1, clue: 'Automobile', answer: 'CAR', row: 0, col: 0 },
        { num: 2, clue: 'Digit on foot', answer: 'TON', row: 0, col: 2 },
      ]
    }
  },
  {
    grid: [
      ['S', 'U', 'N', '#', '#'],
      ['T', '#', 'E', 'A', 'T'],
      ['A', 'N', 'T', '#', '#'],
      ['R', '#', '#', '#', '#'],
      ['#', '#', '#', '#', '#'],
    ],
    clues: {
      across: [
        { num: 1, clue: 'Bright star', answer: 'SUN', row: 0, col: 0 },
        { num: 4, clue: 'Have food', answer: 'EAT', row: 1, col: 2 },
        { num: 5, clue: 'Small insect', answer: 'ANT', row: 2, col: 0 },
      ],
      down: [
        { num: 1, clue: 'Twinkles at night', answer: 'STAR', row: 0, col: 0 },
        { num: 2, clue: 'Fishing tool', answer: 'NET', row: 0, col: 2 },
      ]
    }
  },
  {
    grid: [
      ['B', 'E', 'D', '#', '#'],
      ['E', '#', 'O', 'N', 'E'],
      ['E', 'G', 'G', '#', '#'],
      ['#', '#', '#', '#', '#'],
      ['#', '#', '#', '#', '#'],
    ],
    clues: {
      across: [
        { num: 1, clue: 'Sleep on it', answer: 'BED', row: 0, col: 0 },
        { num: 4, clue: 'Single', answer: 'ONE', row: 1, col: 2 },
        { num: 5, clue: 'Comes from chicken', answer: 'EGG', row: 2, col: 0 },
      ],
      down: [
        { num: 1, clue: 'Insect that makes honey', answer: 'BEE', row: 0, col: 0 },
        { num: 2, clue: 'Pet animal', answer: 'DOG', row: 0, col: 2 },
      ]
    }
  }
];

const CrosswordMini = ({ onScore, highScore }) => {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [userGrid, setUserGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(false);
  const [direction, setDirection] = useState('across');

  const puzzle = PUZZLES[puzzleIndex];

  useEffect(() => {
    // Initialize empty user grid
    const emptyGrid = puzzle.grid.map(row => 
      row.map(cell => cell === '#' ? '#' : '')
    );
    setUserGrid(emptyGrid);
    setSolved(false);
  }, [puzzleIndex]);

  const handleCellClick = (row, col) => {
    if (puzzle.grid[row][col] === '#') return;
    
    if (selectedCell?.row === row && selectedCell?.col === col) {
      setDirection(d => d === 'across' ? 'down' : 'across');
    }
    setSelectedCell({ row, col });
  };

  const handleKeyPress = (e) => {
    if (!selectedCell || solved) return;
    
    const { row, col } = selectedCell;
    
    if (e.key.match(/^[a-zA-Z]$/)) {
      const newGrid = [...userGrid];
      newGrid[row][col] = e.key.toUpperCase();
      setUserGrid(newGrid);
      
      // Move to next cell
      if (direction === 'across' && col < 4 && puzzle.grid[row][col + 1] !== '#') {
        setSelectedCell({ row, col: col + 1 });
      } else if (direction === 'down' && row < 4 && puzzle.grid[row + 1]?.[col] !== '#') {
        setSelectedCell({ row: row + 1, col });
      }
      
      checkSolved(newGrid);
    } else if (e.key === 'Backspace') {
      const newGrid = [...userGrid];
      newGrid[row][col] = '';
      setUserGrid(newGrid);
    } else if (e.key === 'ArrowRight' && col < 4) {
      setSelectedCell({ row, col: col + 1 });
    } else if (e.key === 'ArrowLeft' && col > 0) {
      setSelectedCell({ row, col: col - 1 });
    } else if (e.key === 'ArrowDown' && row < 4) {
      setSelectedCell({ row: row + 1, col });
    } else if (e.key === 'ArrowUp' && row > 0) {
      setSelectedCell({ row: row - 1, col });
    }
  };

  const checkSolved = (grid) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (puzzle.grid[r][c] !== '#' && grid[r][c] !== puzzle.grid[r][c]) {
          return;
        }
      }
    }
    setSolved(true);
    const newScore = score + 100;
    setScore(newScore);
    onScore(newScore);
  };

  const nextPuzzle = () => {
    setPuzzleIndex((puzzleIndex + 1) % PUZZLES.length);
  };

  const getCellNumber = (row, col) => {
    const acrossClue = puzzle.clues.across.find(c => c.row === row && c.col === col);
    const downClue = puzzle.clues.down.find(c => c.row === row && c.col === col);
    return acrossClue?.num || downClue?.num || null;
  };

  return (
    <div 
      className="flex flex-col items-center gap-4" 
      data-testid="crossword-game"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      <div className="flex justify-between w-full max-w-sm text-xs">
        <span className="text-[#00ffff]">PUZZLE: {puzzleIndex + 1}/{PUZZLES.length}</span>
        <span className="text-[#00ff00]">SCORE: {score}</span>
        <span className="text-[#ffff00]">BEST: {highScore}</span>
      </div>

      <div className="grid grid-cols-5 gap-0.5 p-2 bg-black rounded-lg border-2 border-[#ff00ff]">
        {userGrid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isBlocked = puzzle.grid[rowIndex][colIndex] === '#';
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const cellNum = getCellNumber(rowIndex, colIndex);
            const isCorrect = cell === puzzle.grid[rowIndex][colIndex] && cell !== '';

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`
                  w-10 h-10 flex items-center justify-center relative cursor-pointer
                  ${isBlocked 
                    ? 'bg-[#1a1a2e]' 
                    : isSelected 
                      ? 'bg-[#ff00ff]/30 border-2 border-[#ff00ff]' 
                      : 'bg-[#0a0a0a] border border-[#333]'
                  }
                `}
              >
                {cellNum && (
                  <span className="absolute top-0 left-0.5 text-[8px] text-[#888]">
                    {cellNum}
                  </span>
                )}
                {!isBlocked && (
                  <span className={`text-lg font-bold ${isCorrect ? 'text-[#00ff00]' : 'text-[#00ffff]'}`}>
                    {cell}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setDirection('across')}
          className={`retro-btn text-xs ${direction === 'across' ? 'text-[#00ff00]' : 'text-[#888]'}`}
        >
          ACROSS
        </button>
        <button
          onClick={() => setDirection('down')}
          className={`retro-btn text-xs ${direction === 'down' ? 'text-[#00ff00]' : 'text-[#888]'}`}
        >
          DOWN
        </button>
      </div>

      <div className="w-full max-w-sm bg-black/50 p-3 rounded-lg border border-[#333]">
        <h3 className="text-[#ffff00] text-xs mb-2">ACROSS</h3>
        {puzzle.clues.across.map(clue => (
          <p key={`a${clue.num}`} className="text-[10px] text-[#888] mb-1">
            {clue.num}. {clue.clue}
          </p>
        ))}
        <h3 className="text-[#ffff00] text-xs mb-2 mt-3">DOWN</h3>
        {puzzle.clues.down.map(clue => (
          <p key={`d${clue.num}`} className="text-[10px] text-[#888] mb-1">
            {clue.num}. {clue.clue}
          </p>
        ))}
      </div>

      {solved && (
        <div className="text-center">
          <p className="text-[#00ff00] text-xl neon-text mb-2">SOLVED!</p>
          <button
            onClick={nextPuzzle}
            className="retro-btn text-[#00ffff]"
            data-testid="next-puzzle-btn"
          >
            NEXT PUZZLE
          </button>
        </div>
      )}

      <p className="text-[8px] text-[#888]">CLICK CELL & TYPE • ARROWS TO MOVE</p>
    </div>
  );
};

export default CrosswordMini;
