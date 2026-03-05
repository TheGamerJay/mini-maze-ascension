import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 5;
const TARGET_SCORE = 50;

const ReactionGame = ({ onScore, highScore, soundEnabled }) => {
  const [targetCell, setTargetCell] = useState(null);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [showTime, setShowTime] = useState(0);
  const [lastReaction, setLastReaction] = useState(null);

  const showNewTarget = useCallback(() => {
    const newTarget = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE);
    setTargetCell(newTarget);
    setShowTime(Date.now());
  }, []);

  const startGame = () => {
    setScore(0);
    setMisses(0);
    setReactionTimes([]);
    setGameOver(false);
    setGameStarted(true);
    setLastReaction(null);
    setTimeout(showNewTarget, 1000);
  };

  const handleCellClick = (index) => {
    if (!gameStarted || gameOver) return;

    if (index === targetCell) {
      const reaction = Date.now() - showTime;
      setReactionTimes(prev => [...prev, reaction]);
      setLastReaction(reaction);
      setScore(s => {
        const newScore = s + 1;
        if (newScore >= TARGET_SCORE) {
          setGameOver(true);
          const avgReaction = [...reactionTimes, reaction].reduce((a, b) => a + b, 0) / (reactionTimes.length + 1);
          onScore(Math.round(10000 / avgReaction * 100));
        }
        return newScore;
      });
      setTargetCell(null);
      setTimeout(showNewTarget, 300 + Math.random() * 700);
    } else if (targetCell !== null) {
      setMisses(m => m + 1);
      if (misses >= 4) {
        setGameOver(true);
        onScore(score * 10);
      }
    }
  };

  const avgReaction = reactionTimes.length > 0 
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) 
    : 0;

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[350px] mb-4 text-xs">
        <div className="text-[#00ff00]">{score}/{TARGET_SCORE}</div>
        <div className="text-[#00ffff]">AVG: {avgReaction}ms</div>
        <div className="text-[#ff0000]">MISS: {misses}/5</div>
      </div>

      {lastReaction && (
        <div className={`mb-2 text-sm ${lastReaction < 300 ? 'text-[#00ff00]' : lastReaction < 500 ? 'text-[#ffff00]' : 'text-[#ff8800]'}`}>
          {lastReaction}ms {lastReaction < 250 ? '⚡ LIGHTNING!' : lastReaction < 400 ? '🔥 FAST!' : ''}
        </div>
      )}

      <div className="relative">
        <div 
          className="grid gap-2 p-4 bg-black/50 border-4 border-[#ff00ff] rounded-lg neon-box"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, 50px)`,
            color: '#ff00ff'
          }}
        >
          {Array(GRID_SIZE * GRID_SIZE).fill(null).map((_, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              className={`w-[50px] h-[50px] rounded-lg transition-all duration-100 ${
                targetCell === index 
                  ? 'bg-[#ff00ff] scale-110 shadow-[0_0_20px_#ff00ff]' 
                  : 'bg-[#222] hover:bg-[#333]'
              }`}
            />
          ))}
        </div>

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <p className="text-[#ff00ff] text-sm mb-4 neon-text">⚡ REACTION ⚡</p>
            <p className="text-[#888] text-[10px] mb-4">TAP THE LIT SQUARE!</p>
            <button onClick={startGame} className="retro-btn text-[10px] text-[#ff00ff]">
              START
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <p className={`text-lg mb-2 neon-text ${score >= TARGET_SCORE ? 'text-[#00ff00]' : 'text-[#ff0000]'}`}>
              {score >= TARGET_SCORE ? 'COMPLETE!' : 'TOO SLOW!'}
            </p>
            <p className="text-[#00ffff] text-sm mb-2">AVG: {avgReaction}ms</p>
            <p className="text-[#ffff00] text-xs mb-4">
              {avgReaction < 300 ? '⚡ SUPERHUMAN!' : avgReaction < 400 ? '🔥 FAST!' : avgReaction < 500 ? '👍 GOOD' : '🐢 SLOW'}
            </p>
            <button onClick={startGame} className="retro-btn text-[10px] text-[#ff00ff]">
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      <p className="text-[8px] text-[#666] mt-4">TAP THE GLOWING CELL AS FAST AS YOU CAN</p>
    </div>
  );
};

export default ReactionGame;
