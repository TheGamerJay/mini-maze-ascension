import React, { useState, useEffect, useCallback, useRef } from 'react';

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 500;
const BIRD_SIZE = 20;
const PIPE_WIDTH = 50;
const PIPE_GAP = 150;
const GRAVITY = 0.5;
const JUMP_FORCE = -8;

const FlappyGame = ({ onScore, highScore, soundEnabled }) => {
  const canvasRef = useRef(null);
  const [bird, setBird] = useState({ y: CANVAS_HEIGHT / 2, velocity: 0 });
  const [pipes, setPipes] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const jump = useCallback(() => {
    if (gameOver) return;
    if (!gameStarted) {
      setGameStarted(true);
      return;
    }
    setBird(prev => ({ ...prev, velocity: JUMP_FORCE }));
  }, [gameOver, gameStarted]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === ' ' || e.key === 'ArrowUp') {
      jump();
    }
  }, [jump]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Generate pipes
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const pipeInterval = setInterval(() => {
      const gapY = Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50;
      setPipes(prev => [...prev, {
        x: CANVAS_WIDTH,
        gapY,
        passed: false
      }]);
    }, 2000);

    return () => clearInterval(pipeInterval);
  }, [gameStarted, gameOver]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      // Update bird
      setBird(prev => {
        const newVelocity = prev.velocity + GRAVITY;
        const newY = prev.y + newVelocity;

        // Check ground/ceiling collision
        if (newY < 0 || newY > CANVAS_HEIGHT - BIRD_SIZE) {
          setGameOver(true);
          onScore(score);
          return prev;
        }

        return { y: newY, velocity: newVelocity };
      });

      // Update pipes
      setPipes(prev => {
        const birdY = bird.y;
        const birdX = 50;

        return prev
          .map(pipe => {
            const newX = pipe.x - 3;

            // Check collision
            if (
              birdX + BIRD_SIZE > newX &&
              birdX < newX + PIPE_WIDTH
            ) {
              if (birdY < pipe.gapY || birdY + BIRD_SIZE > pipe.gapY + PIPE_GAP) {
                setGameOver(true);
                onScore(score);
              }
            }

            // Check score
            if (!pipe.passed && newX + PIPE_WIDTH < birdX) {
              setScore(s => s + 1);
              return { ...pipe, x: newX, passed: true };
            }

            return { ...pipe, x: newX };
          })
          .filter(pipe => pipe.x > -PIPE_WIDTH);
      });
    }, 20);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, bird.y, score, onScore]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a0a2e');
    gradient.addColorStop(1, '#000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Stars
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 30; i++) {
      const x = (i * 47) % CANVAS_WIDTH;
      const y = (i * 31) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 1, 1);
    }

    // Pipes
    pipes.forEach(pipe => {
      // Top pipe
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
      ctx.strokeStyle = '#00aa00';
      ctx.lineWidth = 3;
      ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);

      // Bottom pipe
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - pipe.gapY - PIPE_GAP);
      ctx.strokeRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - pipe.gapY - PIPE_GAP);
    });

    // Bird
    ctx.fillStyle = '#ff8800';
    ctx.beginPath();
    ctx.arc(50 + BIRD_SIZE / 2, bird.y + BIRD_SIZE / 2, BIRD_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(55, bird.y + 8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(56, bird.y + 8, 2, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.moveTo(60, bird.y + 10);
    ctx.lineTo(70, bird.y + 12);
    ctx.lineTo(60, bird.y + 14);
    ctx.fill();

    // Ground
    ctx.fillStyle = '#333';
    ctx.fillRect(0, CANVAS_HEIGHT - 5, CANVAS_WIDTH, 5);
  }, [bird, pipes]);

  const resetGame = () => {
    setBird({ y: CANVAS_HEIGHT / 2, velocity: 0 });
    setPipes([]);
    setGameOver(false);
    setScore(0);
    setGameStarted(true);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[300px] mb-4 text-xs">
        <div className="text-[#ff8800]">SCORE: {score}</div>
        <div className="text-[#ffff00]">HI: {highScore}</div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-[#ff8800] neon-box cursor-pointer"
          style={{ color: '#ff8800' }}
          onClick={jump}
        />

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#ff8800] text-sm mb-4 neon-text">🐦 FLAPPY 🐦</p>
            <p className="text-[#888] text-[10px] mb-4">TAP OR PRESS SPACE</p>
            <button onClick={jump} className="retro-btn text-[10px] text-[#ff8800]">
              START
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#ff0000] text-lg mb-2 neon-text">GAME OVER</p>
            <p className="text-[#ff8800] text-sm mb-4">SCORE: {score}</p>
            {score >= highScore && score > 0 && (
              <p className="text-[#ffff00] text-xs mb-4 animate-pulse">NEW HIGH SCORE!</p>
            )}
            <button onClick={resetGame} className="retro-btn text-[10px] text-[#ff8800]">
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      <p className="text-[8px] text-[#666] mt-4 text-center">
        TAP OR SPACE TO JUMP
      </p>
    </div>
  );
};

export default FlappyGame;
