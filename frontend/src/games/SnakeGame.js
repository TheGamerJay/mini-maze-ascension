import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

const SnakeGame = ({ onScore, highScore, soundEnabled }) => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const directionRef = useRef(direction);

  const generateFood = useCallback((currentSnake) => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = () => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection({ x: 1, y: 0 });
    directionRef.current = { x: 1, y: 0 };
    setGameOver(false);
    setScore(0);
    setGameStarted(true);
  };

  const handleKeyDown = useCallback((e) => {
    if (!gameStarted && !gameOver) {
      setGameStarted(true);
      return;
    }

    const key = e.key;
    const currentDir = directionRef.current;

    if (key === 'ArrowUp' && currentDir.y !== 1) {
      directionRef.current = { x: 0, y: -1 };
      setDirection({ x: 0, y: -1 });
    } else if (key === 'ArrowDown' && currentDir.y !== -1) {
      directionRef.current = { x: 0, y: 1 };
      setDirection({ x: 0, y: 1 });
    } else if (key === 'ArrowLeft' && currentDir.x !== 1) {
      directionRef.current = { x: -1, y: 0 };
      setDirection({ x: -1, y: 0 });
    } else if (key === 'ArrowRight' && currentDir.x !== -1) {
      directionRef.current = { x: 1, y: 0 };
      setDirection({ x: 1, y: 0 });
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = {
          x: (head.x + directionRef.current.x + GRID_SIZE) % GRID_SIZE,
          y: (head.y + directionRef.current.y + GRID_SIZE) % GRID_SIZE
        };

        // Check self collision
        if (prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          setGameOver(true);
          onScore(score);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, INITIAL_SPEED - Math.min(score, 100));

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, food, score, generateFood, onScore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

    // Draw grid
    ctx.strokeStyle = '#111';
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
      const gradient = ctx.createRadialGradient(
        segment.x * CELL_SIZE + CELL_SIZE / 2,
        segment.y * CELL_SIZE + CELL_SIZE / 2,
        0,
        segment.x * CELL_SIZE + CELL_SIZE / 2,
        segment.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2
      );
      gradient.addColorStop(0, index === 0 ? '#00ff00' : '#00cc00');
      gradient.addColorStop(1, index === 0 ? '#00aa00' : '#008800');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });

    // Draw food
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Food glow
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [snake, food]);

  // Touch controls
  const handleTouch = (dir) => {
    if (!gameStarted && !gameOver) {
      setGameStarted(true);
      return;
    }
    const currentDir = directionRef.current;
    if (dir === 'up' && currentDir.y !== 1) {
      directionRef.current = { x: 0, y: -1 };
      setDirection({ x: 0, y: -1 });
    } else if (dir === 'down' && currentDir.y !== -1) {
      directionRef.current = { x: 0, y: 1 };
      setDirection({ x: 0, y: 1 });
    } else if (dir === 'left' && currentDir.x !== 1) {
      directionRef.current = { x: -1, y: 0 };
      setDirection({ x: -1, y: 0 });
    } else if (dir === 'right' && currentDir.x !== -1) {
      directionRef.current = { x: 1, y: 0 };
      setDirection({ x: 1, y: 0 });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[400px] mb-4 text-xs">
        <div className="text-[#00ff00]">SCORE: {score}</div>
        <div className="text-[#ffff00]">HI: {highScore}</div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="border-4 border-[#00ff00] neon-box"
          style={{ color: '#00ff00' }}
        />

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#00ff00] text-sm mb-4 neon-text">🐍 SNAKE 🐍</p>
            <p className="text-[#888] text-[10px] mb-4">PRESS ANY KEY OR TAP</p>
            <button onClick={() => setGameStarted(true)} className="retro-btn text-[10px] text-[#00ff00]">
              START
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#ff0000] text-lg mb-2 neon-text">GAME OVER</p>
            <p className="text-[#00ff00] text-sm mb-4">SCORE: {score}</p>
            {score >= highScore && score > 0 && (
              <p className="text-[#ffff00] text-xs mb-4 animate-pulse">NEW HIGH SCORE!</p>
            )}
            <button onClick={resetGame} className="retro-btn text-[10px] text-[#00ff00]">
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Touch Controls */}
      <div className="mt-6 grid grid-cols-3 gap-2 md:hidden">
        <div></div>
        <button onClick={() => handleTouch('up')} className="retro-btn text-2xl p-4">↑</button>
        <div></div>
        <button onClick={() => handleTouch('left')} className="retro-btn text-2xl p-4">←</button>
        <button onClick={() => handleTouch('down')} className="retro-btn text-2xl p-4">↓</button>
        <button onClick={() => handleTouch('right')} className="retro-btn text-2xl p-4">→</button>
      </div>

      <p className="text-[8px] text-[#666] mt-4 text-center">
        USE ARROW KEYS TO MOVE
      </p>
    </div>
  );
};

export default SnakeGame;
