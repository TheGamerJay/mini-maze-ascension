import React, { useState, useEffect, useCallback } from 'react';

const COLORS = ['red', 'green', 'blue', 'yellow'];
const COLOR_MAP = {
  red: '#ff0000',
  green: '#00ff00',
  blue: '#0000ff',
  yellow: '#ffff00'
};

const SimonGame = ({ onScore, highScore, soundEnabled }) => {
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeColor, setActiveColor] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [canClick, setCanClick] = useState(false);

  const playSequence = useCallback(async (seq) => {
    setCanClick(false);
    setIsPlaying(true);
    
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setActiveColor(seq[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveColor(null);
    }
    
    setIsPlaying(false);
    setCanClick(true);
  }, []);

  const addToSequence = useCallback(() => {
    const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newSequence = [...sequence, newColor];
    setSequence(newSequence);
    setPlayerSequence([]);
    playSequence(newSequence);
  }, [sequence, playSequence]);

  const startGame = () => {
    setSequence([]);
    setPlayerSequence([]);
    setGameOver(false);
    setScore(0);
    setGameStarted(true);
    
    setTimeout(() => {
      const firstColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      setSequence([firstColor]);
      playSequence([firstColor]);
    }, 500);
  };

  const handleColorClick = (color) => {
    if (!canClick || isPlaying || gameOver) return;

    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 200);

    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);

    const currentIndex = newPlayerSequence.length - 1;

    if (newPlayerSequence[currentIndex] !== sequence[currentIndex]) {
      setGameOver(true);
      setCanClick(false);
      onScore(score);
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      setScore(s => s + 10);
      setCanClick(false);
      setTimeout(addToSequence, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[300px] mb-4 text-xs">
        <div className="text-[#00ffff]">SCORE: {score}</div>
        <div className="text-[#ffff00]">LEVEL: {sequence.length}</div>
        <div className="text-[#ff00ff]">HI: {highScore}</div>
      </div>

      <div className="relative">
        <div className="grid grid-cols-2 gap-4 p-6 bg-black/50 rounded-full border-4 border-[#333]">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorClick(color)}
              disabled={!canClick || isPlaying}
              className={`w-24 h-24 rounded-full transition-all duration-100 ${
                activeColor === color ? 'scale-110 brightness-150' : 'brightness-75 hover:brightness-100'
              }`}
              style={{
                backgroundColor: COLOR_MAP[color],
                boxShadow: activeColor === color ? `0 0 30px ${COLOR_MAP[color]}` : 'none'
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-[#333] border-4 border-[#444] flex items-center justify-center">
            <span className="text-white text-xs font-bold">{sequence.length}</span>
          </div>
        </div>

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-full">
            <p className="text-[#ffff00] text-sm mb-4 neon-text">🎵 SIMON 🎵</p>
            <p className="text-[#888] text-[10px] mb-4">REPEAT THE PATTERN</p>
            <button onClick={startGame} className="retro-btn text-[10px] text-[#ffff00]">
              START
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-full">
            <p className="text-[#ff0000] text-lg mb-2 neon-text">WRONG!</p>
            <p className="text-[#00ffff] text-sm mb-4">LEVEL: {sequence.length}</p>
            {score >= highScore && score > 0 && (
              <p className="text-[#ffff00] text-xs mb-4 animate-pulse">NEW HIGH SCORE!</p>
            )}
            <button onClick={startGame} className="retro-btn text-[10px] text-[#ffff00]">
              TRY AGAIN
            </button>
          </div>
        )}
      </div>

      <p className="text-[8px] text-[#666] mt-6">WATCH THE PATTERN, THEN REPEAT IT</p>
    </div>
  );
};

export default SimonGame;
