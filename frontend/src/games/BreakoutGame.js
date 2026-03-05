import React, { useState, useEffect, useCallback, useRef } from 'react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 12;
const BALL_SIZE = 10;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 45;
const BRICK_HEIGHT = 20;
const BRICK_GAP = 4;

const COLORS = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#00ffff'];

const BreakoutGame = ({ onScore, highScore, soundEnabled }) => {
  const canvasRef = useRef(null);
  const [paddle, setPaddle] = useState({ x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2 });
  const [ball, setBall] = useState({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, dx: 4, dy: -4 });
  const [bricks, setBricks] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const paddleRef = useRef(paddle);

  const initBricks = () => {
    const newBricks = [];
    const startX = (CANVAS_WIDTH - (BRICK_COLS * (BRICK_WIDTH + BRICK_GAP))) / 2;
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        newBricks.push({
          x: startX + col * (BRICK_WIDTH + BRICK_GAP),
          y: 50 + row * (BRICK_HEIGHT + BRICK_GAP),
          color: COLORS[row],
          alive: true,
          points: (BRICK_ROWS - row) * 10
        });
      }
    }
    return newBricks;
  };

  useEffect(() => {
    setBricks(initBricks());
  }, []);

  const resetBall = () => {
    setBall({
      x: paddleRef.current.x + PADDLE_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      dx: (Math.random() > 0.5 ? 1 : -1) * 4,
      dy: -4
    });
  };

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - PADDLE_WIDTH / 2;
    const newX = Math.max(0, Math.min(x, CANVAS_WIDTH - PADDLE_WIDTH));
    setPaddle({ x: newX });
    paddleRef.current = { x: newX };
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left - PADDLE_WIDTH / 2;
    const newX = Math.max(0, Math.min(x, CANVAS_WIDTH - PADDLE_WIDTH));
    setPaddle({ x: newX });
    paddleRef.current = { x: newX };
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (!gameStarted && !gameOver) {
      setGameStarted(true);
      return;
    }
    
    const speed = 20;
    if (e.key === 'ArrowLeft') {
      setPaddle(p => {
        const newX = Math.max(0, p.x - speed);
        paddleRef.current = { x: newX };
        return { x: newX };
      });
    } else if (e.key === 'ArrowRight') {
      setPaddle(p => {
        const newX = Math.min(CANVAS_WIDTH - PADDLE_WIDTH, p.x + speed);
        paddleRef.current = { x: newX };
        return { x: newX };
      });
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!gameStarted || gameOver || gameWon) return;

    const gameLoop = setInterval(() => {
      setBall(prevBall => {
        let { x, y, dx, dy } = prevBall;
        x += dx;
        y += dy;

        // Wall collisions
        if (x <= 0 || x >= CANVAS_WIDTH - BALL_SIZE) dx = -dx;
        if (y <= 0) dy = -dy;

        // Paddle collision
        const paddleX = paddleRef.current.x;
        if (
          y + BALL_SIZE >= CANVAS_HEIGHT - PADDLE_HEIGHT - 10 &&
          y + BALL_SIZE <= CANVAS_HEIGHT - 10 &&
          x + BALL_SIZE >= paddleX &&
          x <= paddleX + PADDLE_WIDTH
        ) {
          dy = -Math.abs(dy);
          // Add angle based on hit position
          const hitPos = (x + BALL_SIZE / 2 - paddleX) / PADDLE_WIDTH;
          dx = (hitPos - 0.5) * 10;
        }

        // Ball lost
        if (y > CANVAS_HEIGHT) {
          setLives(l => {
            if (l <= 1) {
              setGameOver(true);
              onScore(score);
              return 0;
            }
            resetBall();
            return l - 1;
          });
          return prevBall;
        }

        // Brick collisions
        setBricks(prevBricks => {
          let hitBrick = false;
          const newBricks = prevBricks.map(brick => {
            if (!brick.alive) return brick;
            if (
              x + BALL_SIZE > brick.x &&
              x < brick.x + BRICK_WIDTH &&
              y + BALL_SIZE > brick.y &&
              y < brick.y + BRICK_HEIGHT
            ) {
              hitBrick = true;
              setScore(s => s + brick.points);
              return { ...brick, alive: false };
            }
            return brick;
          });

          if (hitBrick) {
            dy = -dy;
          }

          // Check win
          if (newBricks.every(b => !b.alive)) {
            setGameWon(true);
            onScore(score);
          }

          return newBricks;
        });

        return { x, y, dx, dy };
      });
    }, 16);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, gameWon, score, onScore]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw bricks
    bricks.forEach(brick => {
      if (brick.alive) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(brick.x + 2, brick.y + 2, BRICK_WIDTH - 4, BRICK_HEIGHT - 4);
      }
    });

    // Draw paddle
    const gradient = ctx.createLinearGradient(paddle.x, 0, paddle.x + PADDLE_WIDTH, 0);
    gradient.addColorStop(0, '#ff00ff');
    gradient.addColorStop(1, '#00ffff');
    ctx.fillStyle = gradient;
    ctx.fillRect(paddle.x, CANVAS_HEIGHT - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x + BALL_SIZE / 2, ball.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw lives
    for (let i = 0; i < lives; i++) {
      ctx.fillStyle = '#ff00ff';
      ctx.beginPath();
      ctx.arc(20 + i * 20, CANVAS_HEIGHT - 20, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [bricks, paddle, ball, lives]);

  const resetGame = () => {
    setBricks(initBricks());
    setPaddle({ x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2 });
    paddleRef.current = { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2 };
    setBall({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, dx: 4, dy: -4 });
    setGameOver(false);
    setGameWon(false);
    setScore(0);
    setLives(3);
    setGameStarted(true);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[400px] mb-4 text-xs">
        <div className="text-[#ff00ff]">SCORE: {score}</div>
        <div className="text-[#ffff00]">HI: {highScore}</div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-[#ff00ff] neon-box cursor-none"
          style={{ color: '#ff00ff' }}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onClick={() => !gameStarted && setGameStarted(true)}
        />

        {!gameStarted && !gameOver && !gameWon && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#ff00ff] text-sm mb-4 neon-text">🧱 BREAKOUT 🧱</p>
            <p className="text-[#888] text-[10px] mb-4">CLICK OR TAP TO START</p>
            <button onClick={() => setGameStarted(true)} className="retro-btn text-[10px] text-[#ff00ff]">
              START
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#ff0000] text-lg mb-2 neon-text">GAME OVER</p>
            <p className="text-[#ff00ff] text-sm mb-4">SCORE: {score}</p>
            <button onClick={resetGame} className="retro-btn text-[10px] text-[#ff00ff]">
              PLAY AGAIN
            </button>
          </div>
        )}

        {gameWon && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#00ff00] text-lg mb-2 neon-text">YOU WIN!</p>
            <p className="text-[#ff00ff] text-sm mb-4">SCORE: {score}</p>
            <button onClick={resetGame} className="retro-btn text-[10px] text-[#ff00ff]">
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      <p className="text-[8px] text-[#666] mt-4 text-center">
        MOVE MOUSE OR TOUCH TO CONTROL PADDLE
      </p>
    </div>
  );
};

export default BreakoutGame;
