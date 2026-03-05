import React, { useState, useEffect, useCallback } from 'react';

const CatchGame = ({ onScore, highScore }) => {
  const [basketX, setBasketX] = useState(50);
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(1);

  const itemTypes = [
    { emoji: '⭐', points: 10, color: '#ffff00' },
    { emoji: '💎', points: 25, color: '#00ffff' },
    { emoji: '🍎', points: 5, color: '#ff0000' },
    { emoji: '💰', points: 50, color: '#00ff00' },
    { emoji: '💣', points: -20, color: '#ff00ff', isBomb: true },
  ];

  const spawnItem = useCallback(() => {
    const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    const newItem = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10,
      y: 0,
      speed: 1 + level * 0.3 + Math.random(),
      ...type,
    };
    setItems(prev => [...prev, newItem]);
  }, [level]);

  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') setBasketX(x => Math.max(10, x - 5));
      if (e.key === 'ArrowRight') setBasketX(x => Math.min(90, x + 5));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || lives <= 0) return;

    const spawnInterval = setInterval(spawnItem, 1000 - level * 50);
    const moveInterval = setInterval(() => {
      setItems(prev => {
        const updated = prev.map(item => ({ ...item, y: item.y + item.speed }));
        
        // Check catches and misses
        updated.forEach(item => {
          if (item.y >= 85 && item.y <= 95) {
            const caught = Math.abs(item.x - basketX) < 12;
            if (caught) {
              setScore(s => Math.max(0, s + item.points));
              if (item.isBomb) {
                setLives(l => l - 1);
              }
              item.caught = true;
            }
          }
          if (item.y > 100 && !item.caught && !item.isBomb) {
            setLives(l => l - 1);
            item.missed = true;
          }
        });

        return updated.filter(item => !item.caught && !item.missed && item.y <= 100);
      });
    }, 50);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, [isPlaying, lives, level, basketX, spawnItem]);

  useEffect(() => {
    if (lives <= 0 && isPlaying) {
      setIsPlaying(false);
      onScore(score);
    }
  }, [lives, isPlaying, score, onScore]);

  useEffect(() => {
    const newLevel = Math.floor(score / 100) + 1;
    if (newLevel !== level) setLevel(newLevel);
  }, [score, level]);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setItems([]);
    setLevel(1);
    setBasketX(50);
    setIsPlaying(true);
  };

  const handleTouch = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(10, Math.min(90, x)));
  };

  if (!isPlaying) {
    return (
      <div className="flex flex-col items-center gap-6" data-testid="catch-game">
        <h2 className="text-2xl text-[#ffff00] neon-text">CATCH GAME</h2>
        {lives <= 0 ? (
          <>
            <p className="text-[#ff0000] text-xl">GAME OVER!</p>
            <p className="text-[#00ff00] text-2xl">{score} POINTS</p>
            {score > highScore && <p className="text-[#ffff00]">NEW HIGH SCORE!</p>}
          </>
        ) : (
          <>
            <p className="text-[#888] text-sm">Catch items, avoid bombs!</p>
            <div className="text-xs text-center space-y-1">
              <p>⭐ = 10pts | 💎 = 25pts | 🍎 = 5pts</p>
              <p>💰 = 50pts | 💣 = -20pts & damage</p>
            </div>
          </>
        )}
        <p className="text-[#00ffff] text-xs">BEST: {highScore}</p>
        <button onClick={startGame} className="retro-btn text-[#00ff00] px-8 py-3">
          {lives <= 0 ? 'PLAY AGAIN' : 'START'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2" data-testid="catch-game">
      <div className="flex justify-between w-full max-w-sm text-xs">
        <span className="text-[#00ffff]">LVL: {level}</span>
        <span className="text-[#ff0000]">{'❤️'.repeat(lives)}</span>
        <span className="text-[#00ff00]">SCORE: {score}</span>
      </div>

      <div 
        className="relative w-80 h-96 bg-gradient-to-b from-[#000033] to-[#000011] rounded-lg border-2 border-[#ffff00] overflow-hidden touch-none"
        onTouchMove={handleTouch}
      >
        {/* Items */}
        {items.map(item => (
          <div
            key={item.id}
            className="absolute text-2xl transition-none"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: 'translate(-50%, -50%)',
              filter: `drop-shadow(0 0 5px ${item.color})`,
            }}
          >
            {item.emoji}
          </div>
        ))}

        {/* Basket */}
        <div
          className="absolute bottom-2 text-3xl transition-all duration-100"
          style={{ left: `${basketX}%`, transform: 'translateX(-50%)' }}
        >
          🧺
        </div>
      </div>

      <p className="text-[8px] text-[#888]">← → ARROW KEYS OR TOUCH TO MOVE</p>
    </div>
  );
};

export default CatchGame;
