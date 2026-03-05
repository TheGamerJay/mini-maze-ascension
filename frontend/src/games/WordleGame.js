import React, { useState, useEffect } from 'react';

const WORDS = [
  "PIXEL", "RETRO", "ARCADE", "LASER", "ROBOT", "SPACE", "CYBER", "NEON",
  "GHOST", "ALIEN", "QUEST", "MAGIC", "STORM", "BLAZE", "SPARK", "ULTRA",
  "TURBO", "NITRO", "POWER", "SPEED", "FLASH", "CRASH", "BLAST", "NINJA"
];

const WordleGame = ({ onScore, highScore, soundEnabled }) => {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [shake, setShake] = useState(false);

  const startGame = () => {
    setTargetWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setGameWon(false);
    setGameStarted(true);
  };

  const handleKeyPress = (key) => {
    if (gameOver || gameWon) return;

    if (key === 'ENTER') {
      if (currentGuess.length !== 5) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }

      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      
      if (currentGuess === targetWord) {
        setGameWon(true);
        const score = (6 - newGuesses.length) * 100 + 100;
        onScore(score);
      } else if (newGuesses.length >= 6) {
        setGameOver(true);
      }
      
      setCurrentGuess('');
    } else if (key === 'BACK') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
      setCurrentGuess(prev => prev + key);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted) {
        startGame();
        return;
      }

      if (e.key === 'Enter') {
        handleKeyPress('ENTER');
      } else if (e.key === 'Backspace') {
        handleKeyPress('BACK');
      } else {
        const key = e.key.toUpperCase();
        if (/^[A-Z]$/.test(key)) {
          handleKeyPress(key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, currentGuess, guesses, gameOver, gameWon]);

  const getLetterStatus = (letter, index, guess) => {
    if (targetWord[index] === letter) return 'correct';
    if (targetWord.includes(letter)) return 'present';
    return 'absent';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'correct': return 'bg-[#00ff00] text-black';
      case 'present': return 'bg-[#ffff00] text-black';
      case 'absent': return 'bg-[#333] text-white';
      default: return 'bg-[#222] text-white border-2 border-[#444]';
    }
  };

  const keyboard = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
  ];

  const getKeyStatus = (key) => {
    for (const guess of guesses) {
      for (let i = 0; i < 5; i++) {
        if (guess[i] === key) {
          const status = getLetterStatus(key, i, guess);
          if (status === 'correct') return 'correct';
        }
      }
    }
    for (const guess of guesses) {
      if (guess.includes(key) && targetWord.includes(key)) return 'present';
    }
    for (const guess of guesses) {
      if (guess.includes(key)) return 'absent';
    }
    return 'unused';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-sm">
        {/* Grid */}
        <div className="grid gap-1 mb-4">
          {[...Array(6)].map((_, rowIndex) => {
            const guess = guesses[rowIndex] || (rowIndex === guesses.length ? currentGuess : '');
            const isCurrentRow = rowIndex === guesses.length;
            
            return (
              <div 
                key={rowIndex} 
                className={`grid grid-cols-5 gap-1 ${isCurrentRow && shake ? 'animate-pulse' : ''}`}
              >
                {[...Array(5)].map((_, colIndex) => {
                  const letter = guess[colIndex] || '';
                  const status = rowIndex < guesses.length 
                    ? getLetterStatus(letter, colIndex, guess)
                    : 'empty';
                  
                  return (
                    <div
                      key={colIndex}
                      className={`w-12 h-12 flex items-center justify-center text-xl font-bold rounded transition-all ${
                        getStatusColor(status)
                      } ${letter && rowIndex >= guesses.length ? 'scale-105' : ''}`}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Keyboard */}
        <div className="space-y-1">
          {keyboard.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1">
              {row.map(key => {
                const status = getKeyStatus(key);
                return (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className={`${
                      key.length > 1 ? 'px-2 text-[8px]' : 'w-8'
                    } h-10 rounded font-bold transition-all ${
                      status === 'correct' ? 'bg-[#00ff00] text-black' :
                      status === 'present' ? 'bg-[#ffff00] text-black' :
                      status === 'absent' ? 'bg-[#333] text-[#666]' :
                      'bg-[#444] text-white hover:bg-[#555]'
                    }`}
                  >
                    {key === 'BACK' ? '⌫' : key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {!gameStarted && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center rounded-lg">
            <p className="text-[#00ff00] text-lg mb-4 neon-text">📝 WORDLE 📝</p>
            <p className="text-[#888] text-[10px] mb-4">GUESS THE 5-LETTER WORD</p>
            <button onClick={startGame} className="retro-btn text-[10px] text-[#00ff00]">
              START
            </button>
          </div>
        )}

        {(gameOver || gameWon) && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center rounded-lg">
            <p className={`text-lg mb-2 neon-text ${gameWon ? 'text-[#00ff00]' : 'text-[#ff0000]'}`}>
              {gameWon ? 'BRILLIANT!' : 'GAME OVER'}
            </p>
            <p className="text-[#ffff00] text-sm mb-4">
              {gameWon ? `SOLVED IN ${guesses.length}/6` : `WORD: ${targetWord}`}
            </p>
            <button onClick={startGame} className="retro-btn text-[10px] text-[#00ff00]">
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      <p className="text-[8px] text-[#666] mt-4">🟩 CORRECT | 🟨 WRONG SPOT | ⬛ NOT IN WORD</p>
    </div>
  );
};

export default WordleGame;
