import React, { useState } from 'react';

const RIDDLES = [
  { q: "What has keys but no locks?", a: "piano", hints: ["It makes music", "You press them"] },
  { q: "What has hands but can't clap?", a: "clock", hints: ["It tells time", "Tick tock"] },
  { q: "What has a head and tail but no body?", a: "coin", hints: ["Money", "Flip it"] },
  { q: "What gets wetter the more it dries?", a: "towel", hints: ["Bathroom item", "After shower"] },
  { q: "What can you catch but not throw?", a: "cold", hints: ["Sickness", "Achoo!"] },
  { q: "What has teeth but cannot bite?", a: "comb", hints: ["Hair styling", "Grooming tool"] },
  { q: "What runs but never walks?", a: "water", hints: ["Liquid", "Rivers have it"] },
  { q: "What has an eye but cannot see?", a: "needle", hints: ["Sewing", "Thread goes through"] },
  { q: "What can travel around the world while staying in a corner?", a: "stamp", hints: ["Mail", "Postage"] },
  { q: "What building has the most stories?", a: "library", hints: ["Books", "Reading place"] },
  { q: "What has 4 wheels and flies?", a: "garbage truck", hints: ["Vehicle", "Smelly"] },
  { q: "What word is spelled incorrectly in every dictionary?", a: "incorrectly", hints: ["Think literally", "Read again"] },
  { q: "What gets bigger the more you take away?", a: "hole", hints: ["Empty space", "Dig"] },
  { q: "What can fill a room but takes no space?", a: "light", hints: ["Turn it on", "Sun gives it"] },
  { q: "What has a ring but no finger?", a: "phone", hints: ["Communication", "Call me"] },
];

const RiddleGame = ({ onScore, highScore, soundEnabled }) => {
  const [currentRiddle, setCurrentRiddle] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [shuffledRiddles, setShuffledRiddles] = useState([]);

  const startGame = () => {
    const shuffled = [...RIDDLES].sort(() => Math.random() - 0.5).slice(0, 10);
    setShuffledRiddles(shuffled);
    setCurrentRiddle(0);
    setAnswer('');
    setScore(0);
    setHintsUsed(0);
    setShowHint(false);
    setFeedback('');
    setGameStarted(true);
    setGameOver(false);
  };

  const checkAnswer = () => {
    const correct = shuffledRiddles[currentRiddle].a.toLowerCase();
    const userAnswer = answer.toLowerCase().trim();

    if (userAnswer === correct || correct.includes(userAnswer)) {
      const points = showHint ? 50 : 100;
      setScore(s => s + points);
      setFeedback('✓ CORRECT!');
      
      setTimeout(() => {
        if (currentRiddle < shuffledRiddles.length - 1) {
          setCurrentRiddle(c => c + 1);
          setAnswer('');
          setShowHint(false);
          setFeedback('');
        } else {
          setGameOver(true);
          onScore(score + points);
        }
      }, 1000);
    } else {
      setFeedback('✗ TRY AGAIN');
      setTimeout(() => setFeedback(''), 1000);
    }
  };

  const useHint = () => {
    if (!showHint) {
      setShowHint(true);
      setHintsUsed(h => h + 1);
    }
  };

  const skipRiddle = () => {
    if (currentRiddle < shuffledRiddles.length - 1) {
      setCurrentRiddle(c => c + 1);
      setAnswer('');
      setShowHint(false);
      setFeedback('');
    } else {
      setGameOver(true);
      onScore(score);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      <div className="flex justify-between w-full mb-4 text-xs">
        <div className="text-[#ff00ff]">SCORE: {score}</div>
        <div className="text-[#00ffff]">{currentRiddle + 1}/{shuffledRiddles.length || 10}</div>
        <div className="text-[#ffff00]">HINTS: {hintsUsed}</div>
      </div>

      <div className="relative w-full bg-black/50 border-4 border-[#ff00ff] rounded-lg p-6 neon-box" style={{ color: '#ff00ff' }}>
        {!gameStarted && !gameOver && (
          <div className="text-center py-8">
            <p className="text-[#ff00ff] text-lg mb-4 neon-text">🧩 RIDDLE ME THIS 🧩</p>
            <p className="text-[#888] text-xs mb-6">SOLVE 10 RIDDLES</p>
            <button onClick={startGame} className="retro-btn text-[10px] text-[#ff00ff]">
              START
            </button>
          </div>
        )}

        {gameStarted && !gameOver && shuffledRiddles[currentRiddle] && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-[#ffff00] text-xs mb-2">RIDDLE #{currentRiddle + 1}</p>
              <p className="text-white text-sm leading-relaxed">
                {shuffledRiddles[currentRiddle].q}
              </p>
            </div>

            {showHint && (
              <div className="bg-[#ff00ff]/20 border border-[#ff00ff]/50 rounded p-3">
                <p className="text-[#ff00ff] text-[10px]">💡 HINTS:</p>
                <p className="text-[#ffaaff] text-xs mt-1">
                  {shuffledRiddles[currentRiddle].hints.join(' • ')}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                placeholder="TYPE YOUR ANSWER..."
                className="w-full bg-black/50 border-2 border-[#ff00ff]/50 text-white px-4 py-3 rounded text-sm font-mono uppercase focus:border-[#ff00ff] outline-none"
              />

              {feedback && (
                <p className={`text-center text-sm ${feedback.includes('✓') ? 'text-[#00ff00]' : 'text-[#ff0000]'} neon-text`}>
                  {feedback}
                </p>
              )}

              <div className="flex gap-2">
                <button onClick={checkAnswer} className="flex-1 retro-btn text-[10px] text-[#00ff00]">
                  SUBMIT
                </button>
                <button onClick={useHint} disabled={showHint} className="retro-btn text-[10px] text-[#ffff00] disabled:opacity-50">
                  HINT
                </button>
                <button onClick={skipRiddle} className="retro-btn text-[10px] text-[#ff0000]">
                  SKIP
                </button>
              </div>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="text-center py-8">
            <p className="text-[#00ff00] text-lg mb-2 neon-text">COMPLETE!</p>
            <p className="text-[#ff00ff] text-sm mb-2">FINAL SCORE: {score}</p>
            <p className="text-[#888] text-xs mb-4">HINTS USED: {hintsUsed}</p>
            {score >= highScore && score > 0 && (
              <p className="text-[#ffff00] text-xs mb-4 animate-pulse">NEW HIGH SCORE!</p>
            )}
            <button onClick={startGame} className="retro-btn text-[10px] text-[#ff00ff]">
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      <p className="text-[8px] text-[#666] mt-4">TYPE ANSWER & PRESS ENTER</p>
    </div>
  );
};

export default RiddleGame;
