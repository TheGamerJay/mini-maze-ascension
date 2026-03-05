import React, { useState, useEffect } from 'react';

const QUESTIONS = [
  { q: "What is the capital of France?", options: ["London", "Paris", "Berlin", "Madrid"], answer: 1 },
  { q: "Which planet is known as the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Saturn"], answer: 2 },
  { q: "What is 15 × 8?", options: ["100", "120", "130", "140"], answer: 1 },
  { q: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Monet"], answer: 2 },
  { q: "What is the largest ocean?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3 },
  { q: "In what year did WW2 end?", options: ["1943", "1944", "1945", "1946"], answer: 2 },
  { q: "What is the chemical symbol for Gold?", options: ["Go", "Gd", "Au", "Ag"], answer: 2 },
  { q: "How many continents are there?", options: ["5", "6", "7", "8"], answer: 2 },
  { q: "What is the fastest land animal?", options: ["Lion", "Cheetah", "Horse", "Leopard"], answer: 1 },
  { q: "Which country has the most people?", options: ["USA", "India", "China", "Russia"], answer: 2 },
  { q: "What is the square root of 144?", options: ["10", "11", "12", "14"], answer: 2 },
  { q: "Who wrote Romeo and Juliet?", options: ["Dickens", "Shakespeare", "Austen", "Hemingway"], answer: 1 },
  { q: "What is the largest mammal?", options: ["Elephant", "Blue Whale", "Giraffe", "Hippo"], answer: 1 },
  { q: "Which element has symbol 'O'?", options: ["Gold", "Osmium", "Oxygen", "Oxide"], answer: 2 },
  { q: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], answer: 1 },
];

const QuizGame = ({ onScore, highScore }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);

  const startGame = () => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setTimeLeft(15);
    setGameOver(false);
    setStreak(0);
  };

  useEffect(() => {
    if (questions.length === 0 || showResult || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleTimeout();
          return 15;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questions, currentQ, showResult, gameOver]);

  const handleTimeout = () => {
    setStreak(0);
    setShowResult(true);
    setTimeout(() => nextQuestion(), 1500);
  };

  const handleAnswer = (index) => {
    if (showResult) return;
    
    setSelected(index);
    setShowResult(true);
    
    if (index === questions[currentQ].answer) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const points = 10 + timeLeft + (newStreak > 1 ? newStreak * 2 : 0);
      setScore(s => s + points);
    } else {
      setStreak(0);
    }

    setTimeout(() => nextQuestion(), 1500);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setGameOver(true);
      onScore(score);
    } else {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setShowResult(false);
      setTimeLeft(15);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6" data-testid="quiz-game">
        <h2 className="text-2xl text-[#ff00ff] neon-text">QUIZ MASTER</h2>
        <p className="text-[#888] text-sm">Test your knowledge!</p>
        <p className="text-[#00ffff] text-xs">10 Questions • 15 sec each</p>
        <p className="text-[#ffff00] text-xs">BEST: {highScore}</p>
        <button onClick={startGame} className="retro-btn text-[#00ff00] px-8 py-3">
          START QUIZ
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="flex flex-col items-center gap-6" data-testid="quiz-game">
        <h2 className="text-2xl text-[#00ff00] neon-text">QUIZ COMPLETE!</h2>
        <p className="text-[#ffff00] text-3xl">{score} POINTS</p>
        {score > highScore && <p className="text-[#ff00ff]">NEW HIGH SCORE!</p>}
        <button onClick={startGame} className="retro-btn text-[#00ff00] px-8 py-3">
          PLAY AGAIN
        </button>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md" data-testid="quiz-game">
      <div className="flex justify-between w-full text-xs">
        <span className="text-[#00ffff]">Q{currentQ + 1}/10</span>
        <span className={`${timeLeft <= 5 ? 'text-[#ff0000]' : 'text-[#ffff00]'}`}>
          {timeLeft}s
        </span>
        <span className="text-[#00ff00]">SCORE: {score}</span>
      </div>

      {streak > 1 && (
        <span className="text-[#ff00ff] text-xs animate-pulse">
          🔥 {streak} STREAK!
        </span>
      )}

      {/* Progress bar */}
      <div className="w-full h-2 bg-[#333] rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#00ff00] to-[#ffff00] transition-all duration-1000"
          style={{ width: `${(timeLeft / 15) * 100}%` }}
        />
      </div>

      <div className="bg-black/50 p-6 rounded-lg border-2 border-[#ff00ff] w-full">
        <p className="text-[#00ffff] text-center mb-6">{q.q}</p>
        
        <div className="grid grid-cols-1 gap-3">
          {q.options.map((option, index) => {
            let btnClass = 'bg-[#1a1a2e] border-[#333] text-[#888]';
            if (showResult) {
              if (index === q.answer) {
                btnClass = 'bg-[#00ff00]/20 border-[#00ff00] text-[#00ff00]';
              } else if (index === selected) {
                btnClass = 'bg-[#ff0000]/20 border-[#ff0000] text-[#ff0000]';
              }
            } else if (selected === index) {
              btnClass = 'bg-[#ff00ff]/20 border-[#ff00ff] text-[#ff00ff]';
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                className={`p-3 rounded-lg border-2 text-sm transition-all hover:scale-102 ${btnClass}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizGame;
