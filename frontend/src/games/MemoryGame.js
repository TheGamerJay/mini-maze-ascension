import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 4;
const SYMBOLS = ['🎮', '👾', '🚀', '⭐', '🎯', '💎', '🔥', '⚡'];

const MemoryGame = ({ onScore, highScore, soundEnabled }) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);

  const initCards = () => {
    const pairs = SYMBOLS.slice(0, (GRID_SIZE * GRID_SIZE) / 2);
    const deck = [...pairs, ...pairs]
      .map((symbol, index) => ({ id: index, symbol, flipped: false }))
      .sort(() => Math.random() - 0.5);
    return deck;
  };

  const startGame = () => {
    setCards(initCards());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  const handleCardClick = (index) => {
    if (!gameStarted || gameOver) return;
    if (flipped.length === 2) return;
    if (flipped.includes(index)) return;
    if (matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      
      const [first, second] = newFlipped;
      if (cards[first].symbol === cards[second].symbol) {
        // Match!
        const newMatched = [...matched, first, second];
        setMatched(newMatched);
        setScore(s => s + 100);
        setFlipped([]);

        // Check win
        if (newMatched.length === cards.length) {
          const finalScore = Math.max(0, 1000 - moves * 10);
          setScore(s => s + finalScore);
          setGameOver(true);
          onScore(score + 100 + finalScore);
        }
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  const isFlipped = (index) => {
    return flipped.includes(index) || matched.includes(index);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[340px] mb-4 text-xs">
        <div className="text-[#9900ff]">SCORE: {score}</div>
        <div className="text-[#00ffff]">MOVES: {moves}</div>
        <div className="text-[#ffff00]">HI: {highScore}</div>
      </div>

      <div className="relative">
        <div 
          className="grid gap-2 p-4 bg-black/50 rounded-lg border-4 border-[#9900ff] neon-box"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, 70px)`,
            color: '#9900ff'
          }}
        >
          {cards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              className={`w-[70px] h-[70px] rounded-lg text-3xl flex items-center justify-center transition-all duration-300 transform ${
                isFlipped(index)
                  ? 'bg-[#1a1a2e] rotate-0 scale-100'
                  : 'bg-gradient-to-br from-[#9900ff] to-[#ff00ff] hover:scale-105'
              } ${matched.includes(index) ? 'opacity-60' : ''}`}
              disabled={matched.includes(index)}
            >
              {isFlipped(index) ? (
                <span className="animate-pulse">{card.symbol}</span>
              ) : (
                <span className="text-white text-xl">?</span>
              )}
            </button>
          ))}
        </div>

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <p className="text-[#9900ff] text-sm mb-4 neon-text">🧠 MEMORY 🧠</p>
            <p className="text-[#888] text-[10px] mb-4">MATCH ALL PAIRS</p>
            <button onClick={startGame} className="retro-btn text-[10px] text-[#9900ff]">
              START
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <p className="text-[#00ff00] text-lg mb-2 neon-text">YOU WIN!</p>
            <p className="text-[#9900ff] text-sm mb-2">SCORE: {score}</p>
            <p className="text-[#00ffff] text-xs mb-4">MOVES: {moves}</p>
            {score >= highScore && score > 0 && (
              <p className="text-[#ffff00] text-xs mb-4 animate-pulse">NEW HIGH SCORE!</p>
            )}
            <button onClick={startGame} className="retro-btn text-[10px] text-[#9900ff]">
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      <p className="text-[8px] text-[#666] mt-4 text-center">
        CLICK CARDS TO REVEAL & MATCH PAIRS
      </p>
    </div>
  );
};

export default MemoryGame;
