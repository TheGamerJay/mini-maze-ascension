import React, { useState } from 'react';

const TicTacToe = ({ onScore, highScore }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const minimax = (squares, isMaximizing) => {
    const winner = checkWinner(squares);
    if (winner === 'O') return 10;
    if (winner === 'X') return -10;
    if (!squares.includes(null)) return 0;

    if (isMaximizing) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'O';
          best = Math.max(best, minimax(squares, false));
          squares[i] = null;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'X';
          best = Math.min(best, minimax(squares, true));
          squares[i] = null;
        }
      }
      return best;
    }
  };

  const getBestMove = (squares) => {
    let bestVal = -Infinity;
    let bestMove = -1;
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        squares[i] = 'O';
        const moveVal = minimax(squares, false);
        squares[i] = null;
        if (moveVal > bestVal) {
          bestMove = i;
          bestVal = moveVal;
        }
      }
    }
    return bestMove;
  };

  const handleClick = (i) => {
    if (board[i] || gameOver || !isXNext) return;
    
    const newBoard = [...board];
    newBoard[i] = 'X';
    setBoard(newBoard);
    
    const win = checkWinner(newBoard);
    if (win) {
      endGame(win, newBoard);
      return;
    }
    if (!newBoard.includes(null)) {
      endGame(null, newBoard);
      return;
    }
    
    setIsXNext(false);
    
    // AI move
    setTimeout(() => {
      const aiMove = getBestMove([...newBoard]);
      if (aiMove !== -1) {
        newBoard[aiMove] = 'O';
        setBoard([...newBoard]);
        
        const aiWin = checkWinner(newBoard);
        if (aiWin) {
          endGame(aiWin, newBoard);
        } else if (!newBoard.includes(null)) {
          endGame(null, newBoard);
        } else {
          setIsXNext(true);
        }
      }
    }, 300);
  };

  const endGame = (win, finalBoard) => {
    setGameOver(true);
    setWinner(win);
    if (win === 'X') {
      const newScore = { ...score, wins: score.wins + 1 };
      setScore(newScore);
      onScore(newScore.wins * 100);
    } else if (win === 'O') {
      setScore({ ...score, losses: score.losses + 1 });
    } else {
      setScore({ ...score, draws: score.draws + 1 });
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameOver(false);
    setWinner(null);
  };

  return (
    <div className="flex flex-col items-center gap-4" data-testid="tictactoe-game">
      <div className="flex justify-between w-full max-w-xs text-xs">
        <span className="text-[#00ff00]">WINS: {score.wins}</span>
        <span className="text-[#ffff00]">DRAWS: {score.draws}</span>
        <span className="text-[#ff0000]">LOSSES: {score.losses}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 p-4 bg-black/50 rounded-lg border-2 border-[#00ffff]">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={`w-16 h-16 text-3xl font-bold rounded transition-all
              ${cell === 'X' ? 'text-[#00ff00]' : cell === 'O' ? 'text-[#ff00ff]' : 'text-transparent'}
              ${!cell && !gameOver ? 'hover:bg-[#1a1a2e] cursor-pointer' : ''}
              bg-[#0a0a0a] border-2 border-[#333]`}
          >
            {cell || '-'}
          </button>
        ))}
      </div>

      {gameOver && (
        <div className="text-center">
          <p className={`text-xl neon-text mb-4 ${
            winner === 'X' ? 'text-[#00ff00]' : winner === 'O' ? 'text-[#ff0000]' : 'text-[#ffff00]'
          }`}>
            {winner === 'X' ? 'YOU WIN!' : winner === 'O' ? 'AI WINS!' : 'DRAW!'}
          </p>
          <button onClick={resetGame} className="retro-btn text-[#00ffff]">
            PLAY AGAIN
          </button>
        </div>
      )}

      {!gameOver && (
        <p className="text-sm text-[#888]">
          {isXNext ? 'YOUR TURN (X)' : 'AI THINKING...'}
        </p>
      )}
    </div>
  );
};

export default TicTacToe;
