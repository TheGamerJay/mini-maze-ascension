import React, { useState, useEffect, useRef } from 'react';

const WORDS = [
  "arcade", "retro", "pixel", "gaming", "neon", "cyber", "laser", "robot",
  "space", "alien", "rocket", "planet", "galaxy", "cosmic", "stellar",
  "matrix", "binary", "digital", "virtual", "quantum", "future", "chrome",
  "electric", "thunder", "plasma", "atomic", "turbo", "ultra", "mega", "super",
  "ninja", "samurai", "dragon", "phoenix", "titan", "legend", "hero", "quest"
];

const TypingGame = ({ onScore, highScore, soundEnabled }) => {
  const [currentWord, setCurrentWord] = useState('');
  const [typedWord, setTypedWord] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [wordsTyped, setWordsTyped] = useState(0);
  const [wpm, setWpm] = useState(0);
  const inputRef = useRef(null);

  const getRandomWord = () => {
    return WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();
  };

  const startGame = () => {
    setCurrentWord(getRandomWord());
    setTypedWord('');
    setScore(0);
    setTimeLeft(30);
    setGameStarted(true);
    setGameOver(false);
    setWordsTyped(0);
    setWpm(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameOver(true);
          const finalWpm = Math.round((wordsTyped / 30) * 60);
          setWpm(finalWpm);
          onScore(score);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, wordsTyped, score, onScore]);

  const handleInput = (e) => {
    const value = e.target.value.toUpperCase();
    setTypedWord(value);

    if (value === currentWord) {
      setScore(s => s + currentWord.length * 10);
      setWordsTyped(w => w + 1);
      setCurrentWord(getRandomWord());
      setTypedWord('');
    }
  };

  const getCharClass = (char, index) => {
    if (index >= typedWord.length) return 'text-[#666]';
    if (typedWord[index] === char) return 'text-[#00ff00]';
    return 'text-[#ff0000]';
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      <div className="flex justify-between w-full mb-4 text-xs">
        <div className="text-[#00ff00]">SCORE: {score}</div>
        <div className={`${timeLeft <= 10 ? 'text-[#ff0000] animate-pulse' : 'text-[#ffff00]'}`}>
          TIME: {timeLeft}s
        </div>
        <div className="text-[#00ffff]">WORDS: {wordsTyped}</div>
      </div>

      <div className="relative w-full bg-black/50 border-4 border-[#00ff00] rounded-lg p-8 neon-box" style={{ color: '#00ff00' }}>
        {!gameStarted && !gameOver && (
          <div className="text-center py-8">
            <p className="text-[#00ff00] text-lg mb-4 neon-text">⌨️ SPEED TYPE ⌨️</p>
            <p className="text-[#888] text-xs mb-6">TYPE AS FAST AS YOU CAN!</p>
            <button onClick={startGame} className="retro-btn text-[10px] text-[#00ff00]">
              START
            </button>
          </div>
        )}

        {gameStarted && !gameOver && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-4xl tracking-widest mb-4">
                {currentWord.split('').map((char, i) => (
                  <span key={i} className={getCharClass(char, i)}>{char}</span>
                ))}
              </p>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={typedWord}
              onChange={handleInput}
              className="w-full bg-black/50 border-2 border-[#00ff00]/50 text-[#00ff00] px-4 py-3 rounded text-center text-2xl font-mono uppercase focus:border-[#00ff00] outline-none tracking-widest"
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
            />

            <div className="flex justify-center gap-8 text-xs">
              <div className="text-center">
                <p className="text-[#888]">CURRENT</p>
                <p className="text-[#ffff00] text-lg">{Math.round((wordsTyped / (30 - timeLeft || 1)) * 60)} WPM</p>
              </div>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="text-center py-8">
            <p className="text-[#00ff00] text-lg mb-4 neon-text">TIME'S UP!</p>
            <div className="space-y-2 mb-4">
              <p className="text-[#00ffff] text-sm">WORDS: {wordsTyped}</p>
              <p className="text-[#ffff00] text-sm">WPM: {wpm}</p>
              <p className="text-[#ff00ff] text-sm">SCORE: {score}</p>
            </div>
            {score >= highScore && score > 0 && (
              <p className="text-[#ffff00] text-xs mb-4 animate-pulse">NEW HIGH SCORE!</p>
            )}
            <button onClick={startGame} className="retro-btn text-[10px] text-[#00ff00]">
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      <p className="text-[8px] text-[#666] mt-4">TYPE THE WORD AS FAST AS YOU CAN</p>
    </div>
  );
};

export default TypingGame;
