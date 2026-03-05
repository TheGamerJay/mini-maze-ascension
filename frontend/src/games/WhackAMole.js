import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 3;

const WhackAMole = ({ onScore, highScore, soundEnabled }) => {
  const [moles, setMoles] = useState(Array(GRID_SIZE * GRID_SIZE).fill(false));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [lastHit, setLastHit] = useState(null);

  const showMole = useCallback(() => {
    if (gameOver) return;
    
    const emptySpots = moles.map((m, i) => m ? -1 : i).filter(i => i !== -1);
    if (emptySpots.length === 0) return;
    
    const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
    
    setMoles(prev => {
      const newMoles = [...prev];
      newMoles[spot] = true;
      return newMoles;
    });

    // Hide mole after random time
    const hideTime = Math.max(400, 1000 - score * 5);
    setTimeout(() => {
      setMoles(prev => {
        const newMoles = [...prev];
        newMoles[spot] = false;
        return newMoles;
      });
      setCombo(0); // Reset combo on miss
    }, hideTime);
  }, [moles, gameOver, score]);

  const startGame = () => {
    setMoles(Array(GRID_SIZE * GRID_SIZE).fill(false));
    setScore(0);
    setTimeLeft(30);
    setGameStarted(true);
    setGameOver(false);
    setCombo(0);
  };

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameOver(true);
          onScore(score);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, score, onScore]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const spawnRate = Math.max(300, 800 - score * 10);
    const moleInterval = setInterval(showMole, spawnRate);

    return () => clearInterval(moleInterval);
  }, [gameStarted, gameOver, score, showMole]);

  const whackMole = (index) => {
    if (!moles[index] || gameOver) return;

    setMoles(prev => {
      const newMoles = [...prev];
      newMoles[index] = false;
      return newMoles;
    });

    const newCombo = combo + 1;
    setCombo(newCombo);
    
    const points = 10 * Math.min(newCombo, 5);
    setScore(s => s + points);
    setLastHit({ index, points });
    
    setTimeout(() => setLastHit(null), 300);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[320px] mb-4 text-xs">
        <div className="text-[#8B4513]">SCORE: {score}</div>
        <div className={`${timeLeft <= 10 ? 'text-[#ff0000] animate-pulse' : 'text-[#ffff00]'}`}>
          TIME: {timeLeft}s
        </div>
        <div className="text-[#ff00ff]">COMBO: x{Math.min(combo, 5)}</div>
      </div>

      <div className="relative">
        <div 
          className="grid gap-4 p-6 rounded-lg"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, 90px)`,
            backgroundColor: '#3d2817',
            border: '4px solid #2a1a0a'
          }}
        >
          {moles.map((hasMole, index) => (
            <button
              key={index}
              onClick={() => whackMole(index)}
              className="relative w-[90px] h-[90px] rounded-full transition-all"
              style={{
                backgroundColor: '#1a0f08',
                boxShadow: 'inset 0 5px 15px rgba(0,0,0,0.5)'
              }}
            >
              {/* Hole */}
              <div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-8 rounded-[50%]"
                style={{ backgroundColor: '#0d0705' }}
              />
              
              {/* Mole */}
              <div 
                className={`absolute left-1/2 -translate-x-1/2 transition-all duration-100 ${
                  hasMole ? 'bottom-4 opacity-100' : 'bottom-0 opacity-0'
                }`}
              >
                <div className="text-4xl">🐹</div>
              </div>

              {/* Hit effect */}
              {lastHit?.index === index && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[#ffff00] text-lg font-bold animate-ping">
                    +{lastHit.points}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <p className="text-[#8B4513] text-lg mb-4 neon-text">🔨 WHACK-A-MOLE 🐹</p>
            <p className="text-[#888] text-[10px] mb-4">TAP THE MOLES!</p>
            <button onClick={startGame} className="retro-btn text-[10px] text-[#8B4513]">
              START
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <p className="text-[#ffff00] text-lg mb-2 neon-text">TIME'S UP!</p>
            <p className="text-[#8B4513] text-sm mb-4">SCORE: {score}</p>
            {score >= highScore && score > 0 && (
              <p className="text-[#ffff00] text-xs mb-4 animate-pulse">NEW HIGH SCORE!</p>
            )}
            <button onClick={startGame} className="retro-btn text-[10px] text-[#8B4513]">
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      <p className="text-[8px] text-[#666] mt-4">TAP/CLICK THE MOLES BEFORE THEY HIDE!</p>
    </div>
  );
};

export default WhackAMole;
