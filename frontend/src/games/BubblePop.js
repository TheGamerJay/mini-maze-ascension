import React, { useState, useEffect, useCallback } from 'react';

const BubblePop = ({ onScore, highScore }) => {
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [combo, setCombo] = useState(0);

  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800'];

  const spawnBubble = useCallback(() => {
    const newBubble = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10,
      y: 100,
      size: Math.random() * 30 + 30,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 2 + 1,
    };
    setBubbles(prev => [...prev, newBubble]);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const spawnInterval = setInterval(spawnBubble, 500);
    const moveInterval = setInterval(() => {
      setBubbles(prev => 
        prev.map(b => ({ ...b, y: b.y - b.speed }))
            .filter(b => b.y > -10)
      );
    }, 50);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, [isPlaying, spawnBubble]);

  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsPlaying(false);
          onScore(score);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, score, onScore]);

  const popBubble = (id, size) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    const points = Math.floor((60 - size) / 10) + 1 + combo;
    setScore(s => s + points);
    setCombo(c => c + 1);
    setTimeout(() => setCombo(0), 1000);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setBubbles([]);
    setCombo(0);
    setIsPlaying(true);
  };

  if (!isPlaying && timeLeft === 30) {
    return (
      <div className="flex flex-col items-center gap-6" data-testid="bubblepop-game">
        <h2 className="text-2xl text-[#00ffff] neon-text">BUBBLE POP</h2>
        <p className="text-[#888] text-sm">Pop as many bubbles as you can!</p>
        <p className="text-[#ffff00] text-xs">Smaller = More Points • Combos = Bonus!</p>
        <p className="text-[#00ff00] text-xs">BEST: {highScore}</p>
        <button onClick={startGame} className="retro-btn text-[#00ff00] px-8 py-3">
          START
        </button>
      </div>
    );
  }

  if (!isPlaying && timeLeft === 0) {
    return (
      <div className="flex flex-col items-center gap-6" data-testid="bubblepop-game">
        <h2 className="text-2xl text-[#ff00ff] neon-text">TIME'S UP!</h2>
        <p className="text-[#00ff00] text-3xl">{score} POINTS</p>
        {score > highScore && <p className="text-[#ffff00]">NEW HIGH SCORE!</p>}
        <button onClick={startGame} className="retro-btn text-[#00ff00] px-8 py-3">
          PLAY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2" data-testid="bubblepop-game">
      <div className="flex justify-between w-full max-w-sm text-xs">
        <span className="text-[#00ffff]">TIME: {timeLeft}s</span>
        <span className="text-[#ff00ff]">COMBO: x{combo + 1}</span>
        <span className="text-[#00ff00]">SCORE: {score}</span>
      </div>

      <div 
        className="relative w-80 h-96 bg-gradient-to-b from-[#001133] to-[#000022] rounded-lg border-2 border-[#00ffff] overflow-hidden"
      >
        {bubbles.map(bubble => (
          <button
            key={bubble.id}
            onClick={() => popBubble(bubble.id, bubble.size)}
            className="absolute rounded-full transition-transform hover:scale-110 cursor-pointer"
            style={{
              left: `${bubble.x}%`,
              bottom: `${bubble.y}%`,
              width: bubble.size,
              height: bubble.size,
              background: `radial-gradient(circle at 30% 30%, white, ${bubble.color})`,
              boxShadow: `0 0 10px ${bubble.color}`,
              transform: 'translate(-50%, 50%)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default BubblePop;
