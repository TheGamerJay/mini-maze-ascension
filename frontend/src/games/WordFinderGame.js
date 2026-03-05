import React, { useState, useEffect, useCallback } from 'react';

const WORD_SETS = [
  { scrambled: 'PPLEA', answer: 'APPLE', hint: 'A fruit' },
  { scrambled: 'OSUHE', answer: 'HOUSE', hint: 'You live here' },
  { scrambled: 'UMCIS', answer: 'MUSIC', hint: 'Melodies' },
  { scrambled: 'ECANO', answer: 'OCEAN', hint: 'Big water' },
  { scrambled: 'TGIHLN', answer: 'NIGHT', hint: 'After sunset' },
  { scrambled: 'DROLW', answer: 'WORLD', hint: 'Planet Earth' },
  { scrambled: 'TIHGFL', answer: 'FLIGHT', hint: 'Plane does this' },
  { scrambled: 'AECBH', answer: 'BEACH', hint: 'Sand and waves' },
  { scrambled: 'NIDACG', answer: 'DANCING', hint: 'Moving to music' },
  { scrambled: 'GMAER', answer: 'GAMER', hint: 'Plays games' },
  { scrambled: 'ZLEPUZ', answer: 'PUZZLE', hint: 'You solve it' },
  { scrambled: 'AKCNS', answer: 'SNACK', hint: 'Small meal' },
  { scrambled: 'RTSMO', answer: 'STORM', hint: 'Bad weather' },
  { scrambled: 'RDGONA', answer: 'DRAGON', hint: 'Fire breather' },
  { scrambled: 'CSTALE', answer: 'CASTLE', hint: 'King lives here' },
];

const WordFinderGame = ({ onScore, highScore }) => {
  const [currentWord, setCurrentWord] = useState(null);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [usedIndices, setUsedIndices] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);

  const getNewWord = useCallback(() => {
    const available = WORD_SETS.filter((_, i) => !usedIndices.includes(i));
    if (available.length === 0) {
      setGameOver(true);
      return;
    }
    const randomIndex = Math.floor(Math.random() * available.length);
    const originalIndex = WORD_SETS.indexOf(available[randomIndex]);
    setUsedIndices([...usedIndices, originalIndex]);
    setCurrentWord(available[randomIndex]);
    setGuess('');
    setShowHint(false);
    setFeedback('');
    setTimeLeft(30);
  }, [usedIndices]);

  useEffect(() => {
    if (!isPlaying) return;
    getNewWord();
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || gameOver || !currentWord) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setFeedback(`TIME UP! It was: ${currentWord.answer}`);
          setTimeout(() => getNewWord(), 1500);
          return 30;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, gameOver, currentWord, getNewWord]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentWord) return;

    if (guess.toUpperCase() === currentWord.answer) {
      const timeBonus = timeLeft;
      const hintPenalty = showHint ? 5 : 0;
      const points = 10 + timeBonus - hintPenalty;
      const newScore = score + points;
      setScore(newScore);
      onScore(newScore);
      setLevel(l => l + 1);
      setFeedback(`CORRECT! +${points} points`);
      setTimeout(() => getNewWord(), 1000);
    } else {
      setFeedback('TRY AGAIN!');
      setTimeout(() => setFeedback(''), 1000);
    }
  };

  const startGame = () => {
    setScore(0);
    setLevel(1);
    setUsedIndices([]);
    setGameOver(false);
    setIsPlaying(true);
  };

  if (!isPlaying) {
    return (
      <div className="flex flex-col items-center gap-6" data-testid="wordfinder-game">
        <div className="text-center">
          <h2 className="text-2xl text-[#ff00ff] neon-text mb-4">WORD FINDER</h2>
          <p className="text-[#888] text-sm mb-4">Unscramble the letters to find the word!</p>
          <p className="text-[#00ffff] text-xs mb-2">BEST SCORE: {highScore}</p>
        </div>
        <button
          onClick={startGame}
          className="retro-btn text-[#00ff00] px-8 py-3"
          data-testid="start-btn"
        >
          START GAME
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="flex flex-col items-center gap-6" data-testid="wordfinder-game">
        <div className="text-center">
          <h2 className="text-2xl text-[#00ff00] neon-text mb-4">AMAZING!</h2>
          <p className="text-[#ffff00] text-xl">FINAL SCORE: {score}</p>
          <p className="text-[#888] text-sm mt-2">You solved {level - 1} words!</p>
        </div>
        <button
          onClick={startGame}
          className="retro-btn text-[#00ff00] px-8 py-3"
          data-testid="play-again-btn"
        >
          PLAY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4" data-testid="wordfinder-game">
      <div className="flex justify-between w-full max-w-sm text-xs">
        <span className="text-[#00ffff]">LEVEL: {level}</span>
        <span className="text-[#00ff00]">SCORE: {score}</span>
        <span className="text-[#ffff00]">BEST: {highScore}</span>
      </div>

      <div className={`text-2xl font-mono ${timeLeft <= 10 ? 'text-[#ff0000]' : 'text-[#00ffff]'}`}>
        {timeLeft}s
      </div>

      {currentWord && (
        <div className="bg-black/50 p-6 rounded-lg border-2 border-[#ff00ff]">
          <div className="flex gap-2 justify-center mb-4">
            {currentWord.scrambled.split('').map((letter, i) => (
              <div
                key={i}
                className="w-10 h-10 bg-[#1a1a2e] border-2 border-[#00ffff] rounded flex items-center justify-center text-xl font-bold text-[#00ffff]"
              >
                {letter}
              </div>
            ))}
          </div>

          {showHint && (
            <p className="text-[#ffff00] text-sm text-center mb-4">
              HINT: {currentWord.hint}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value.toUpperCase())}
              maxLength={currentWord.answer.length}
              className="bg-[#0a0a0a] border-2 border-[#00ff00] rounded px-4 py-2 text-center text-xl text-[#00ff00] font-mono uppercase tracking-widest"
              placeholder="YOUR ANSWER"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="retro-btn flex-1 text-[#00ff00]"
              >
                SUBMIT
              </button>
              {!showHint && (
                <button
                  type="button"
                  onClick={() => setShowHint(true)}
                  className="retro-btn text-[#ffff00]"
                >
                  HINT (-5)
                </button>
              )}
            </div>
          </form>

          {feedback && (
            <p className={`text-center mt-4 text-sm ${
              feedback.includes('CORRECT') ? 'text-[#00ff00]' : 
              feedback.includes('TIME') ? 'text-[#ff0000]' : 'text-[#ffff00]'
            }`}>
              {feedback}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default WordFinderGame;
