import React, { useState, useEffect } from 'react';

const ColorMatchGame = ({ onScore, highScore, soundEnabled }) => {
  const [currentColor, setCurrentColor] = useState({ name: '', color: '' });
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3);
  const [feedback, setFeedback] = useState('');

  const COLORS = [
    { name: 'RED', color: '#ff0000' },
    { name: 'BLUE', color: '#0000ff' },
    { name: 'GREEN', color: '#00ff00' },
    { name: 'YELLOW', color: '#ffff00' },
    { name: 'PURPLE', color: '#ff00ff' },
    { name: 'ORANGE', color: '#ff8800' },
    { name: 'CYAN', color: '#00ffff' },
    { name: 'PINK', color: '#ff69b4' },
  ];

  const generateRound = () => {
    const shuffled = [...COLORS].sort(() => Math.random() - 0.5);
    const correctColor = shuffled[0];
    const displayColor = shuffled[Math.floor(Math.random() * shuffled.length)];
    
    setCurrentColor({
      name: correctColor.name,
      color: displayColor.color // The text shows one name but in another color
    });
    
    const wrongOptions = shuffled.slice(1, 4).map(c => c.name);
    const allOptions = [correctColor.name, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setTimeLeft(3);
  };

  const startGame = () => {
    setScore(0);
    setLives(3);
    setStreak(0);
    setGameOver(false);
    setGameStarted(true);
    setFeedback('');
    generateRound();
  };

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0.1) {
          handleAnswer(null);
          return 3;
        }
        return t - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  const handleAnswer = (answer) => {
    const correct = answer === currentColor.name;
    
    if (correct) {
      const points = 10 + streak * 5 + Math.round(timeLeft * 10);
      setScore(s => s + points);
      setStreak(s => s + 1);
      setFeedback(`+${points}`);
    } else {
      setLives(l => {
        if (l <= 1) {
          setGameOver(true);
          onScore(score);
          return 0;
        }
        return l - 1;
      });
      setStreak(0);
      setFeedback(answer ? 'WRONG!' : 'TIME!');
    }

    setTimeout(() => {
      setFeedback('');
      if (!gameOver && lives > (correct ? 0 : 1)) {
        generateRound();
      }
    }, 500);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[350px] mb-4 text-xs">
        <div className="text-[#00ff00]">SCORE: {score}</div>
        <div className="text-[#ff00ff]">STREAK: {streak}</div>
        <div className="text-[#ff0000]">❤️ {lives}</div>
      </div>

      <div className="relative w-full max-w-[350px]">
        {/* Timer bar */}
        {gameStarted && !gameOver && (
          <div className="w-full h-2 bg-[#333] rounded mb-4">
            <div 
              className="h-full bg-gradient-to-r from-[#ff0000] to-[#00ff00] rounded transition-all"
              style={{ width: `${(timeLeft / 3) * 100}%` }}
            />
          </div>
        )}

        <div className="bg-black/50 border-4 border-[#ff00ff] rounded-lg p-8 neon-box text-center" style={{ color: '#ff00ff' }}>
          {!gameStarted && !gameOver && (
            <div className="py-8">
              <p className="text-[#ff00ff] text-lg mb-4 neon-text">🎨 COLOR MATCH 🎨</p>
              <p className="text-[#888] text-[10px] mb-2">MATCH THE COLOR NAME</p>
              <p className="text-[#888] text-[10px] mb-6">NOT THE TEXT COLOR!</p>
              <button onClick={startGame} className="retro-btn text-[10px] text-[#ff00ff]">
                START
              </button>
            </div>
          )}

          {gameStarted && !gameOver && (
            <div className="space-y-6">
              <div className="relative">
                <p 
                  className="text-5xl font-bold mb-2"
                  style={{ color: currentColor.color }}
                >
                  {currentColor.name}
                </p>
                {feedback && (
                  <p className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm ${
                    feedback.startsWith('+') ? 'text-[#00ff00]' : 'text-[#ff0000]'
                  } animate-pulse`}>
                    {feedback}
                  </p>
                )}
              </div>

              <p className="text-[#888] text-[10px]">WHAT COLOR NAME IS THIS?</p>

              <div className="grid grid-cols-2 gap-3">
                {options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    className="retro-btn text-[10px] py-3"
                    style={{ color: COLORS.find(c => c.name === opt)?.color }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameOver && (
            <div className="py-8">
              <p className="text-[#ff0000] text-lg mb-2 neon-text">GAME OVER</p>
              <p className="text-[#00ff00] text-sm mb-2">SCORE: {score}</p>
              <p className="text-[#ff00ff] text-xs mb-4">MAX STREAK: {streak}</p>
              {score >= highScore && score > 0 && (
                <p className="text-[#ffff00] text-xs mb-4 animate-pulse">NEW HIGH SCORE!</p>
              )}
              <button onClick={startGame} className="retro-btn text-[10px] text-[#ff00ff]">
                PLAY AGAIN
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-[8px] text-[#666] mt-4">READ THE WORD, IGNORE THE COLOR</p>
    </div>
  );
};

export default ColorMatchGame;
