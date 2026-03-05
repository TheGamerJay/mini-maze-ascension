import React, { useState, useEffect, useCallback } from 'react';

const WORDS = [
  ['CAT', 'DOG', 'BIRD', 'FISH'],
  ['APPLE', 'GRAPE', 'PEACH', 'BERRY'],
  ['RED', 'BLUE', 'GREEN', 'PINK'],
  ['SUN', 'MOON', 'STAR', 'MARS'],
  ['ROCK', 'JAZZ', 'FUNK', 'SOUL'],
  ['CAKE', 'PIE', 'TART', 'BUN'],
];

const WordSearchGame = ({ onScore, highScore }) => {
  const [grid, setGrid] = useState([]);
  const [words, setWords] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameWon, setGameWon] = useState(false);

  const generateGrid = useCallback(() => {
    const size = 8;
    const wordSet = WORDS[(level - 1) % WORDS.length];
    const newGrid = Array(size).fill(null).map(() => 
      Array(size).fill(null).map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
    );
    
    // Place words
    wordSet.forEach(word => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        const direction = Math.floor(Math.random() * 3); // 0: horizontal, 1: vertical, 2: diagonal
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        
        let canPlace = true;
        const positions = [];
        
        for (let i = 0; i < word.length; i++) {
          let r = row, c = col;
          if (direction === 0) c += i;
          else if (direction === 1) r += i;
          else { r += i; c += i; }
          
          if (r >= size || c >= size) {
            canPlace = false;
            break;
          }
          positions.push({ r, c, letter: word[i] });
        }
        
        if (canPlace) {
          positions.forEach(({ r, c, letter }) => {
            newGrid[r][c] = letter;
          });
          placed = true;
        }
        attempts++;
      }
    });
    
    setGrid(newGrid);
    setWords(wordSet);
    setFoundWords([]);
    setSelectedCells([]);
  }, [level]);

  useEffect(() => {
    generateGrid();
  }, [generateGrid]);

  const getCellKey = (row, col) => `${row}-${col}`;

  const handleCellInteraction = (row, col, isStart) => {
    if (gameWon) return;
    
    if (isStart) {
      setIsSelecting(true);
      setSelectedCells([{ row, col }]);
    } else if (isSelecting) {
      const last = selectedCells[selectedCells.length - 1];
      const isAdjacent = Math.abs(row - last.row) <= 1 && Math.abs(col - last.col) <= 1;
      const isAlreadySelected = selectedCells.some(c => c.row === row && c.col === col);
      
      if (isAdjacent && !isAlreadySelected) {
        setSelectedCells([...selectedCells, { row, col }]);
      }
    }
  };

  const handleSelectionEnd = () => {
    if (!isSelecting) return;
    setIsSelecting(false);
    
    const selectedWord = selectedCells.map(c => grid[c.row][c.col]).join('');
    const reversedWord = selectedWord.split('').reverse().join('');
    
    if ((words.includes(selectedWord) || words.includes(reversedWord)) && 
        !foundWords.includes(selectedWord) && !foundWords.includes(reversedWord)) {
      const found = words.includes(selectedWord) ? selectedWord : reversedWord;
      setFoundWords([...foundWords, found]);
      const newScore = score + found.length * 10;
      setScore(newScore);
      onScore(newScore);
      
      if (foundWords.length + 1 === words.length) {
        setGameWon(true);
      }
    }
    
    setSelectedCells([]);
  };

  const nextLevel = () => {
    setLevel(l => l + 1);
    setGameWon(false);
  };

  const isSelected = (row, col) => selectedCells.some(c => c.row === row && c.col === col);

  return (
    <div className="flex flex-col items-center gap-4" data-testid="wordsearch-game">
      <div className="flex justify-between w-full max-w-sm text-xs">
        <span className="text-[#00ffff]">LEVEL: {level}</span>
        <span className="text-[#00ff00]">SCORE: {score}</span>
        <span className="text-[#ffff00]">BEST: {highScore}</span>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-2">
        {words.map(word => (
          <span 
            key={word}
            className={`text-xs px-2 py-1 rounded ${
              foundWords.includes(word) 
                ? 'bg-[#00ff00]/20 text-[#00ff00] line-through' 
                : 'bg-[#ff00ff]/20 text-[#ff00ff]'
            }`}
          >
            {word}
          </span>
        ))}
      </div>

      <div 
        className="grid gap-1 p-4 bg-black/50 rounded-lg border-2 border-[#00ffff] select-none"
        style={{ gridTemplateColumns: `repeat(8, 1fr)` }}
        onMouseUp={handleSelectionEnd}
        onMouseLeave={handleSelectionEnd}
        onTouchEnd={handleSelectionEnd}
      >
        {grid.map((row, rowIndex) =>
          row.map((letter, colIndex) => (
            <div
              key={getCellKey(rowIndex, colIndex)}
              className={`w-8 h-8 flex items-center justify-center text-sm font-bold cursor-pointer
                transition-all duration-150 rounded
                ${isSelected(rowIndex, colIndex) 
                  ? 'bg-[#ff00ff] text-black scale-110' 
                  : 'bg-[#1a1a2e] text-[#00ffff] hover:bg-[#2a2a4e]'
                }`}
              onMouseDown={() => handleCellInteraction(rowIndex, colIndex, true)}
              onMouseEnter={() => handleCellInteraction(rowIndex, colIndex, false)}
              onTouchStart={() => handleCellInteraction(rowIndex, colIndex, true)}
              onTouchMove={(e) => {
                const touch = e.touches[0];
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                if (element?.dataset?.row && element?.dataset?.col) {
                  handleCellInteraction(parseInt(element.dataset.row), parseInt(element.dataset.col), false);
                }
              }}
              data-row={rowIndex}
              data-col={colIndex}
            >
              {letter}
            </div>
          ))
        )}
      </div>

      {gameWon && (
        <div className="text-center">
          <p className="text-[#00ff00] text-xl neon-text mb-4">LEVEL COMPLETE!</p>
          <button
            onClick={nextLevel}
            className="retro-btn text-[#00ffff]"
            data-testid="next-level-btn"
          >
            NEXT LEVEL
          </button>
        </div>
      )}

      <p className="text-[8px] text-[#888]">DRAG TO SELECT WORDS</p>
    </div>
  );
};

export default WordSearchGame;
