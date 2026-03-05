import React, { useState, useEffect, useCallback } from 'react';

const SlidingPuzzle = ({ onScore, highScore }) => {
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [size, setSize] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const initializeGame = useCallback(() => {
    const totalTiles = size * size;
    let tiles = Array.from({ length: totalTiles }, (_, i) => i);
    
    // Shuffle with solvability check
    do {
      for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
      }
    } while (!isSolvable(tiles, size));

    setTiles(tiles);
    setMoves(0);
    setGameWon(false);
    setStartTime(Date.now());
    setElapsedTime(0);
    setIsPlaying(true);
  }, [size]);

  const isSolvable = (tiles, size) => {
    let inversions = 0;
    const arr = tiles.filter(t => t !== 0);
    
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] > arr[j]) inversions++;
      }
    }

    if (size % 2 === 1) {
      return inversions % 2 === 0;
    } else {
      const emptyRow = Math.floor(tiles.indexOf(0) / size);
      return (inversions + emptyRow) % 2 === 1;
    }
  };

  useEffect(() => {
    if (!isPlaying || gameWon) return;
    
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, gameWon, startTime]);

  const checkWin = useCallback((currentTiles) => {
    for (let i = 0; i < currentTiles.length - 1; i++) {
      if (currentTiles[i] !== i + 1) return false;
    }
    return currentTiles[currentTiles.length - 1] === 0;
  }, []);

  const handleTileClick = (index) => {
    if (gameWon || tiles[index] === 0) return;

    const emptyIndex = tiles.indexOf(0);
    const row = Math.floor(index / size);
    const col = index % size;
    const emptyRow = Math.floor(emptyIndex / size);
    const emptyCol = emptyIndex % size;

    const isAdjacent = 
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1);

    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      setMoves(m => m + 1);

      if (checkWin(newTiles)) {
        setGameWon(true);
        const timeBonus = Math.max(0, 300 - elapsedTime);
        const moveBonus = Math.max(0, 100 - moves);
        const score = 100 + timeBonus + moveBonus + (size * 50);
        onScore(score);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isPlaying) {
    return (
      <div className="flex flex-col items-center gap-6" data-testid="sliding-puzzle">
        <h2 className="text-2xl text-[#ff00ff] neon-text">SLIDING PUZZLE</h2>
        <p className="text-[#888] text-sm">Arrange numbers in order!</p>
        <p className="text-[#00ffff] text-xs">BEST SCORE: {highScore}</p>
        
        <div className="flex gap-4">
          {[3, 4, 5].map(s => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`retro-btn ${size === s ? 'text-[#00ff00] border-[#00ff00]' : 'text-[#888]'}`}
            >
              {s}x{s}
            </button>
          ))}
        </div>

        <button
          onClick={initializeGame}
          className="retro-btn text-[#00ff00] px-8 py-3"
          data-testid="start-btn"
        >
          START GAME
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4" data-testid="sliding-puzzle">
      <div className="flex justify-between w-full max-w-sm text-xs">
        <span className="text-[#00ffff]">MOVES: {moves}</span>
        <span className="text-[#00ff00]">TIME: {formatTime(elapsedTime)}</span>
        <span className="text-[#ffff00]">BEST: {highScore}</span>
      </div>

      <div 
        className="grid gap-1 p-4 bg-black/50 rounded-lg border-2 border-[#00ffff]"
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {tiles.map((tile, index) => (
          <button
            key={index}
            onClick={() => handleTileClick(index)}
            disabled={tile === 0 || gameWon}
            className={`
              aspect-square flex items-center justify-center font-bold rounded
              transition-all duration-150
              ${tile === 0 
                ? 'bg-transparent' 
                : 'bg-gradient-to-br from-[#1a1a2e] to-[#2a2a4e] border-2 border-[#ff00ff] text-[#ff00ff] hover:scale-105 cursor-pointer'
              }
            `}
            style={{ 
              width: size === 3 ? '60px' : size === 4 ? '50px' : '40px',
              height: size === 3 ? '60px' : size === 4 ? '50px' : '40px',
              fontSize: size === 3 ? '24px' : size === 4 ? '20px' : '16px'
            }}
          >
            {tile !== 0 && tile}
          </button>
        ))}
      </div>

      {gameWon && (
        <div className="text-center">
          <p className="text-[#00ff00] text-xl neon-text mb-2">PUZZLE SOLVED!</p>
          <p className="text-[#ffff00] text-sm">
            {moves} moves in {formatTime(elapsedTime)}
          </p>
          <button
            onClick={initializeGame}
            className="retro-btn text-[#00ff00] mt-4"
            data-testid="play-again-btn"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      {!gameWon && (
        <button
          onClick={initializeGame}
          className="retro-btn text-[#ff0000] text-xs"
        >
          RESTART
        </button>
      )}
    </div>
  );
};

export default SlidingPuzzle;
