import React, { useState } from 'react';

const RockPaperScissors = ({ onScore, highScore }) => {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [aiChoice, setAiChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  const choices = [
    { name: 'ROCK', emoji: '🪨', beats: 'SCISSORS' },
    { name: 'PAPER', emoji: '📄', beats: 'ROCK' },
    { name: 'SCISSORS', emoji: '✂️', beats: 'PAPER' },
  ];

  const play = (choice) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setPlayerChoice(choice);
    setAiChoice(null);
    setResult(null);

    // Animate AI choice
    let count = 0;
    const interval = setInterval(() => {
      setAiChoice(choices[count % 3]);
      count++;
      if (count > 10) {
        clearInterval(interval);
        const finalAi = choices[Math.floor(Math.random() * 3)];
        setAiChoice(finalAi);
        
        // Determine winner
        let gameResult;
        if (choice.name === finalAi.name) {
          gameResult = 'DRAW';
          setScore(s => ({ ...s, draws: s.draws + 1 }));
        } else if (choice.beats === finalAi.name) {
          gameResult = 'WIN';
          const newScore = { ...score, wins: score.wins + 1 };
          setScore(newScore);
          onScore(newScore.wins * 10);
        } else {
          gameResult = 'LOSE';
          setScore(s => ({ ...s, losses: s.losses + 1 }));
        }
        setResult(gameResult);
        setIsAnimating(false);
      }
    }, 100);
  };

  const totalGames = score.wins + score.losses + score.draws;
  const winRate = totalGames > 0 ? Math.round((score.wins / totalGames) * 100) : 0;

  return (
    <div className="flex flex-col items-center gap-6" data-testid="rps-game">
      <div className="flex justify-between w-full max-w-sm text-xs">
        <span className="text-[#00ff00]">W: {score.wins}</span>
        <span className="text-[#ffff00]">D: {score.draws}</span>
        <span className="text-[#ff0000]">L: {score.losses}</span>
        <span className="text-[#00ffff]">{winRate}%</span>
      </div>

      {/* Battle Arena */}
      <div className="flex items-center gap-8">
        {/* Player */}
        <div className="text-center">
          <p className="text-[#00ff00] text-xs mb-2">YOU</p>
          <div className={`w-24 h-24 rounded-lg border-2 border-[#00ff00] bg-black/50 flex items-center justify-center text-5xl
            ${result === 'WIN' ? 'animate-pulse shadow-[0_0_20px_#00ff00]' : ''}`}>
            {playerChoice?.emoji || '?'}
          </div>
        </div>

        {/* VS */}
        <div className="text-2xl text-[#ff00ff] neon-text">VS</div>

        {/* AI */}
        <div className="text-center">
          <p className="text-[#ff0000] text-xs mb-2">AI</p>
          <div className={`w-24 h-24 rounded-lg border-2 border-[#ff0000] bg-black/50 flex items-center justify-center text-5xl
            ${result === 'LOSE' ? 'animate-pulse shadow-[0_0_20px_#ff0000]' : ''}
            ${isAnimating ? 'animate-bounce' : ''}`}>
            {aiChoice?.emoji || '?'}
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <p className={`text-2xl neon-text ${
          result === 'WIN' ? 'text-[#00ff00]' : result === 'LOSE' ? 'text-[#ff0000]' : 'text-[#ffff00]'
        }`}>
          {result === 'WIN' ? 'YOU WIN!' : result === 'LOSE' ? 'YOU LOSE!' : 'DRAW!'}
        </p>
      )}

      {/* Choices */}
      <div className="flex gap-4">
        {choices.map(choice => (
          <button
            key={choice.name}
            onClick={() => play(choice)}
            disabled={isAnimating}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
              ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}
              ${playerChoice?.name === choice.name ? 'border-[#00ff00] bg-[#00ff00]/20' : 'border-[#333] bg-black/50'}`}
          >
            <span className="text-4xl">{choice.emoji}</span>
            <span className="text-[10px] text-[#888]">{choice.name}</span>
          </button>
        ))}
      </div>

      <p className="text-[8px] text-[#888]">BEST OF ∞ • BEST SCORE: {highScore}</p>
    </div>
  );
};

export default RockPaperScissors;
