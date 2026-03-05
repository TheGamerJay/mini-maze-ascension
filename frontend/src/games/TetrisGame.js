import React, { useState, useEffect, useCallback, useRef } from 'react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 25;

const TETROMINOES = {
  I: { shape: [[1, 1, 1, 1]], color: '#00ffff' },
  O: { shape: [[1, 1], [1, 1]], color: '#ffff00' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#ff00ff' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#00ff00' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#ff0000' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000ff' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#ff8800' },
};

const TetrisGame = ({ onScore, highScore, soundEnabled }) => {
  const canvasRef = useRef(null);
  const [board, setBoard] = useState(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
  const [currentPiece, setCurrentPiece] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const getRandomPiece = () => {
    const pieces = Object.keys(TETROMINOES);
    const piece = pieces[Math.floor(Math.random() * pieces.length)];
    return { ...TETROMINOES[piece], type: piece };
  };

  const rotatePiece = (piece) => {
    const rotated = piece.shape[0].map((_, i) =>
      piece.shape.map(row => row[i]).reverse()
    );
    return { ...piece, shape: rotated };
  };

  const isValidMove = useCallback((piece, pos, boardState) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return false;
          if (newY >= 0 && boardState[newY][newX]) return false;
        }
      }
    }
    return true;
  }, []);

  const mergePiece = useCallback(() => {
    const newBoard = board.map(row => [...row]);
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }

    // Check for completed lines
    let completedLines = 0;
    const filteredBoard = newBoard.filter(row => {
      if (row.every(cell => cell !== null)) {
        completedLines++;
        return false;
      }
      return true;
    });

    while (filteredBoard.length < BOARD_HEIGHT) {
      filteredBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }

    if (completedLines > 0) {
      const points = [0, 100, 300, 500, 800][completedLines] * level;
      setScore(s => s + points);
      setLines(l => {
        const newLines = l + completedLines;
        setLevel(Math.floor(newLines / 10) + 1);
        return newLines;
      });
    }

    setBoard(filteredBoard);

    // Spawn new piece
    const newPiece = getRandomPiece();
    const startPos = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };
    
    if (!isValidMove(newPiece, startPos, filteredBoard)) {
      setGameOver(true);
      onScore(score + (completedLines > 0 ? [0, 100, 300, 500, 800][completedLines] * level : 0));
    } else {
      setCurrentPiece(newPiece);
      setPosition(startPos);
    }
  }, [board, currentPiece, position, level, score, isValidMove, onScore]);

  const moveLeft = useCallback(() => {
    if (currentPiece && isValidMove(currentPiece, { x: position.x - 1, y: position.y }, board)) {
      setPosition(p => ({ ...p, x: p.x - 1 }));
    }
  }, [currentPiece, position, board, isValidMove]);

  const moveRight = useCallback(() => {
    if (currentPiece && isValidMove(currentPiece, { x: position.x + 1, y: position.y }, board)) {
      setPosition(p => ({ ...p, x: p.x + 1 }));
    }
  }, [currentPiece, position, board, isValidMove]);

  const moveDown = useCallback(() => {
    if (currentPiece && isValidMove(currentPiece, { x: position.x, y: position.y + 1 }, board)) {
      setPosition(p => ({ ...p, y: p.y + 1 }));
    } else if (currentPiece) {
      mergePiece();
    }
  }, [currentPiece, position, board, isValidMove, mergePiece]);

  const rotate = useCallback(() => {
    if (currentPiece) {
      const rotated = rotatePiece(currentPiece);
      if (isValidMove(rotated, position, board)) {
        setCurrentPiece(rotated);
      }
    }
  }, [currentPiece, position, board, isValidMove]);

  const hardDrop = useCallback(() => {
    if (!currentPiece) return;
    let newY = position.y;
    while (isValidMove(currentPiece, { x: position.x, y: newY + 1 }, board)) {
      newY++;
    }
    setPosition(p => ({ ...p, y: newY }));
    setTimeout(mergePiece, 50);
  }, [currentPiece, position, board, isValidMove, mergePiece]);

  const handleKeyDown = useCallback((e) => {
    if (gameOver) return;
    if (!gameStarted) {
      setGameStarted(true);
      return;
    }

    switch (e.key) {
      case 'ArrowLeft': moveLeft(); break;
      case 'ArrowRight': moveRight(); break;
      case 'ArrowDown': moveDown(); break;
      case 'ArrowUp': rotate(); break;
      case ' ': hardDrop(); break;
      default: break;
    }
  }, [gameOver, gameStarted, moveLeft, moveRight, moveDown, rotate, hardDrop]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (gameStarted && !currentPiece && !gameOver) {
      const piece = getRandomPiece();
      setCurrentPiece(piece);
      setPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
    }
  }, [gameStarted, currentPiece, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver || !currentPiece) return;

    const speed = Math.max(100, 500 - (level - 1) * 50);
    const gameLoop = setInterval(moveDown, speed);
    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, currentPiece, level, moveDown]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, BOARD_WIDTH * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);

    // Draw grid
    ctx.strokeStyle = '#111';
    for (let i = 0; i <= BOARD_WIDTH; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }
    for (let i = 0; i <= BOARD_HEIGHT; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(BOARD_WIDTH * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw board
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.fillStyle = cell;
          ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
          ctx.strokeStyle = '#fff';
          ctx.strokeRect(x * CELL_SIZE + 2, y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        }
      });
    });

    // Draw current piece
    if (currentPiece) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const drawX = (position.x + x) * CELL_SIZE;
            const drawY = (position.y + y) * CELL_SIZE;
            ctx.fillStyle = currentPiece.color;
            ctx.fillRect(drawX + 1, drawY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(drawX + 2, drawY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
          }
        });
      });
    }
  }, [board, currentPiece, position]);

  const resetGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
    setCurrentPiece(null);
    setPosition({ x: 0, y: 0 });
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameStarted(true);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-8 mb-4 text-xs">
        <div className="text-[#00ffff]">SCORE: {score}</div>
        <div className="text-[#ff00ff]">LEVEL: {level}</div>
        <div className="text-[#ffff00]">LINES: {lines}</div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={BOARD_WIDTH * CELL_SIZE}
          height={BOARD_HEIGHT * CELL_SIZE}
          className="border-4 border-[#00ffff] neon-box"
          style={{ color: '#00ffff' }}
        />

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#00ffff] text-sm mb-4 neon-text">🧱 TETRIS 🧱</p>
            <p className="text-[#888] text-[10px] mb-4">PRESS ANY KEY</p>
            <button onClick={() => setGameStarted(true)} className="retro-btn text-[10px] text-[#00ffff]">
              START
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-[#ff0000] text-lg mb-2 neon-text">GAME OVER</p>
            <p className="text-[#00ffff] text-sm mb-4">SCORE: {score}</p>
            <button onClick={resetGame} className="retro-btn text-[10px] text-[#00ffff]">
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Touch Controls */}
      <div className="mt-4 grid grid-cols-4 gap-2 md:hidden">
        <button onClick={moveLeft} className="retro-btn text-xl p-3">←</button>
        <button onClick={rotate} className="retro-btn text-xl p-3">↻</button>
        <button onClick={moveDown} className="retro-btn text-xl p-3">↓</button>
        <button onClick={moveRight} className="retro-btn text-xl p-3">→</button>
      </div>

      <p className="text-[8px] text-[#666] mt-4 text-center">
        ← → MOVE | ↑ ROTATE | SPACE DROP
      </p>
    </div>
  );
};

export default TetrisGame;
