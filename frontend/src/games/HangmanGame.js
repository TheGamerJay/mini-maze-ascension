import React, { useState, useEffect, useCallback } from 'react';

const WORD_CATEGORIES = {
  ANIMALS: ['ELEPHANT', 'GIRAFFE', 'PENGUIN', 'DOLPHIN', 'KANGAROO', 'BUTTERFLY', 'CROCODILE'],
  FOOD: ['HAMBURGER', 'SPAGHETTI', 'CHOCOLATE', 'PINEAPPLE', 'STRAWBERRY', 'PANCAKES'],
  COUNTRIES: ['AUSTRALIA', 'BRAZIL', 'CANADA', 'GERMANY', 'JAPAN', 'MEXICO', 'EGYPT'],
  SPORTS: ['BASKETBALL', 'FOOTBALL', 'SWIMMING', 'TENNIS', 'VOLLEYBALL', 'BASEBALL'],
  MOVIES: ['TITANIC', 'AVATAR', 'FROZEN', 'INCEPTION', 'MATRIX', 'GLADIATOR'],
};

const HangmanGame = ({ onScore, highScore }) => {
  const [word, setWord] = useState('');
  const [category, setCategory] = useState('');
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, won, lost

  const maxWrong = 6;

  const startNewGame = useCallback(() => {
    const categories = Object.keys(WORD_CATEGORIES);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const words = WORD_CATEGORIES[randomCategory];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    
    setCategory(randomCategory);
    setWord(randomWord);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameState('playing');
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const handleGuess = (letter) => {
    if (gameState !== 'playing' || guessedLetters.includes(letter)) return;

    const newGuessed = [...guessedLetters, letter];
    setGuessedLetters(newGuessed);

    if (!word.includes(letter)) {
      const newWrong = wrongGuesses + 1;
      setWrongGuesses(newWrong);
      
      if (newWrong >= maxWrong) {
        setGameState('lost');
        setStreak(0);
      }
    } else {
      // Check if won
      const isWon = word.split('').every(l => newGuessed.includes(l));
      if (isWon) {
        setGameState('won');
        const newStreak = streak + 1;
        setStreak(newStreak);
        const points = (maxWrong - wrongGuesses) * 10 + newStreak * 5;
        const newScore = score + points;
        setScore(newScore);
        onScore(newScore);
      }
    }
  };

  const renderHangman = () => {
    const parts = [
      // Head
      <circle key="head" cx="50" cy="25" r="10" stroke="#ff00ff" strokeWidth="2" fill="none" />,
      // Body
      <line key="body" x1="50" y1="35" x2="50" y2="60" stroke="#ff00ff" strokeWidth="2" />,
      // Left arm
      <line key="leftarm" x1="50" y1="45" x2="35" y2="55" stroke="#ff00ff" strokeWidth="2" />,
      // Right arm
      <line key="rightarm" x1="50" y1="45" x2="65" y2="55" stroke="#ff00ff" strokeWidth="2" />,
      // Left leg
      <line key="leftleg" x1="50" y1="60" x2="35" y2="80" stroke="#ff00ff" strokeWidth="2" />,
      // Right leg
      <line key="rightleg" x1="50" y1="60" x2="65" y2="80" stroke="#ff00ff" strokeWidth="2" />,
    ];

    return (
      <svg width="100" height="100" className="mx-auto">
        {/* Gallows */}
        <line x1="10" y1="95" x2="90" y2="95" stroke="#888" strokeWidth="2" />
        <line x1="30" y1="95" x2="30" y2="5" stroke="#888" strokeWidth="2" />
        <line x1="30" y1="5" x2="50" y2="5" stroke="#888" strokeWidth="2" />
        <line x1="50" y1="5" x2="50" y2="15" stroke="#888" strokeWidth="2" />
        {/* Body parts based on wrong guesses */}
        {parts.slice(0, wrongGuesses)}
      </svg>
    );
  };

  const renderWord = () => {
    return word.split('').map((letter, index) => (
      <span
        key={index}
        className={`
          inline-block w-8 h-10 mx-1 border-b-2 text-center text-xl font-bold
          ${guessedLetters.includes(letter) 
            ? 'text-[#00ff00] border-[#00ff00]' 
            : 'border-[#888]'
          }
        `}
      >
        {guessedLetters.includes(letter) ? letter : ''}
      </span>
    ));
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="flex flex-col items-center gap-4" data-testid="hangman-game">
      <div className="flex justify-between w-full max-w-sm text-xs">
        <span className="text-[#00ffff]">STREAK: {streak}</span>
        <span className="text-[#00ff00]">SCORE: {score}</span>
        <span className="text-[#ffff00]">BEST: {highScore}</span>
      </div>

      <div className="text-[#ff00ff] text-sm">
        Category: <span className="text-[#ffff00]">{category}</span>
      </div>

      <div className="bg-black/50 p-4 rounded-lg border-2 border-[#00ffff]">
        {renderHangman()}
      </div>

      <div className="text-sm text-[#888]">
        Wrong: {wrongGuesses}/{maxWrong}
      </div>

      <div className="flex flex-wrap justify-center max-w-sm">
        {renderWord()}
      </div>

      {gameState === 'playing' && (
        <div className="grid grid-cols-9 gap-1 max-w-sm">
          {alphabet.map(letter => {
            const isGuessed = guessedLetters.includes(letter);
            const isCorrect = isGuessed && word.includes(letter);
            const isWrong = isGuessed && !word.includes(letter);
            
            return (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={isGuessed}
                className={`
                  w-8 h-8 text-xs font-bold rounded transition-all
                  ${isCorrect 
                    ? 'bg-[#00ff00]/20 text-[#00ff00]' 
                    : isWrong 
                      ? 'bg-[#ff0000]/20 text-[#ff0000]' 
                      : 'bg-[#1a1a2e] text-[#00ffff] hover:bg-[#2a2a4e]'
                  }
                  ${isGuessed ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
              >
                {letter}
              </button>
            );
          })}
        </div>
      )}

      {gameState === 'won' && (
        <div className="text-center">
          <p className="text-[#00ff00] text-xl neon-text mb-2">YOU WON!</p>
          <p className="text-[#ffff00] text-sm">Streak: {streak}</p>
          <button
            onClick={startNewGame}
            className="retro-btn text-[#00ff00] mt-4"
            data-testid="next-word-btn"
          >
            NEXT WORD
          </button>
        </div>
      )}

      {gameState === 'lost' && (
        <div className="text-center">
          <p className="text-[#ff0000] text-xl neon-text mb-2">GAME OVER</p>
          <p className="text-[#888] text-sm">The word was: <span className="text-[#ffff00]">{word}</span></p>
          <button
            onClick={startNewGame}
            className="retro-btn text-[#00ff00] mt-4"
            data-testid="try-again-btn"
          >
            TRY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};

export default HangmanGame;
