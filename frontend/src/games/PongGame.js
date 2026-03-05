import React, { useState, useEffect, useCallback, useRef } from 'react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 60;
const BALL_SIZE = 10;
const AI_SPEED = 4;

const PongGame = ({ onScore, highScore, soundEnabled }) => {
  const canvasRef = useRef(null);
  const [playerPaddle, setPlayerPaddle] = useState(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [aiPaddle, setAiPaddle] = useState(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [ball, setBall] = useState({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 5, dy: 3 });
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const playerRef = useRef(playerPaddle);

  const resetBall = (direction = 1) => {
    setBall({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      dx: 5 * direction,
      dy: (Math.random() - 0.5) * 6
    });
  };

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top - PADDLE_HEIGHT / 2;
    const newY = Math.max(0, Math.min(y, CANVAS_HEIGHT - PADDLE_HEIGHT));
    setPlayerPaddle(newY);
    playerRef.current = newY;
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const y = touch.clientY - rect.top - PADDLE_HEIGHT / 2;
    const newY = Math.max(0, Math.min(y, CANVAS_HEIGHT - PADDLE_HEIGHT));
    setPlayerPaddle(newY);
    playerRef.current = newY;
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (!gameStarted && !gameOver) {
      setGameStarted(true);
      return;
    }

    const speed = 20;
    if (e.key === 'ArrowUp') {
      setPlayerPaddle(p => {
        const newY = Math.max(0, p - speed);
        playerRef.current = newY;
        return newY;
      });
    } else if (e.key === 'ArrowDown') {
      setPlayerPaddle(p => {
        const newY = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, p + speed);
        playerRef.current = newY;
        return newY;
      });
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      setBall(prevBall => {
        let { x, y, dx, dy } = prevBall;
        x += dx;
        y += dy;

        // Top/bottom wall collision
        if (y <= 0 || y >= CANVAS_HEIGHT - BALL_SIZE) {
          dy = -dy;
        }

        // Player paddle collision (left side)
        if (
          x <= 20 + PADDLE_WIDTH &&
          x >= 20 &&
          y + BALL_SIZE >= playerRef.current &&
          y <= playerRef.current + PADDLE_HEIGHT
        ) {
          dx = Math.abs(dx) * 1.05;
          const hitPos = (y + BALL_SIZE / 2 - playerRef.current) / PADDLE_HEIGHT;
          dy = (hitPos - 0.5) * 10;
        }

        // AI paddle collision (right side)
        if (
          x + BALL_SIZE >= CANVAS_WIDTH - 20 - PADDLE_WIDTH &&
          x + BALL_SIZE <= CANVAS_WIDTH - 20 &&
          y + BALL_SIZE >= aiPaddle &&
          y <= aiPaddle + PADDLE_HEIGHT
        ) {
          dx = -Math.abs(dx) * 1.05;
          const hitPos = (y + BALL_SIZE / 2 - aiPaddle) / PADDLE_HEIGHT;
          dy = (hitPos - 0.5) * 10;
        }

        // Score
        if (x < 0) {
          setAiScore(s => {
            if (s + 1 >= 5) {
              setGameOver(true);
              onScore(playerScore);
            }
            return s + 1;
          });
          resetBall(1);
          return { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 5, dy: 3 };
        }

        if (x > CANVAS_WIDTH) {
          setPlayerScore(s => {
            if (s + 1 >= 5) {
              setGameOver(true);
              onScore(s + 1);
            }
            return s + 1;
          });
          resetBall(-1);
          return { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: -5, dy: 3 };
        }

        // Limit speed
        dx = Math.sign(dx) * Math.min(Math.abs(dx), 12);
        dy = Math.sign(dy) * Math.min(Math.abs(dy), 8);

        return { x, y, dx, dy };
      });

      // AI movement
      setBall(currentBall => {
        setAiPaddle(prev => {
          const targetY = currentBall.y - PADDLE_HEIGHT / 2;
          const diff = targetY - prev;
          const move = Math.sign(diff) * Math.min(Math.abs(diff), AI_SPEED);
          return Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, prev + move));
        });
        return currentBall;
      });
    }, 16);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, aiPaddle, playerScore, onScore]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Center line
    ctx.strokeStyle = '#333';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Player paddle
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.fillRect(20, playerPaddle, PADDLE_WIDTH, PADDLE_HEIGHT);

    // AI paddle
    ctx.fillStyle = '#ff00ff';
    ctx.shadowColor = '#ff00ff';
    ctx.fillRect(CANVAS_WIDTH - 20 - PADDLE_WIDTH, aiPaddle, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Ball
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x + BALL_SIZE / 2, ball.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Scores
    ctx.font = '40px "Press Start 2P"';
    ctx.fillStyle = '#00ffff';
    ctx.fillText(playerScore.toString(), CANVAS_WIDTH / 4, 50);
    ctx.fillStyle = '#ff00ff';
    ctx.fillText(aiScore.toString(), (CANVAS_WIDTH * 3) / 4 - 20, 50);
  }, [playerPaddle, aiPaddle, ball, playerScore, aiScore]);

  const resetGame = () => {
    setPlayerPaddle(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    playerRef.current = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    setAiPaddle(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setBall({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 5, dy: 3 });
    setPlayerScore(0);
    setAiScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[400px] mb-4 text-xs">
        <div className="text-[#00ffff]">YOU: {playerScore}</div>
        <div className="text-[#ffff00]">FIRST TO 5</div>
        <div className="text-[#ff00ff]">CPU: {aiScore}</div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-[#ffff00] neon-box"
          style={{ color: '#ffff00' }}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onClick={() => !gameStarted && setGameStarted(true)}
        />

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#ffff00] text-sm mb-4 neon-text">🏓 PONG 🏓</p>
            <p className="text-[#888] text-[10px] mb-4">MOVE MOUSE OR USE ARROWS</p>
            <button onClick={() => setGameStarted(true)} className="retro-btn text-[10px] text-[#ffff00]">
              START
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className={`text-lg mb-2 neon-text ${playerScore >= 5 ? 'text-[#00ff00]' : 'text-[#ff0000]'}`}>
              {playerScore >= 5 ? 'YOU WIN!' : 'CPU WINS!'}
            </p>
            <p className="text-[#ffff00] text-sm mb-4">{playerScore} - {aiScore}</p>
            <button onClick={resetGame} className="retro-btn text-[10px] text-[#ffff00]">
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      <p className="text-[8px] text-[#666] mt-4 text-center">
        MOVE MOUSE OR ↑↓ TO CONTROL
      </p>
    </div>
  );
};

export default PongGame;
