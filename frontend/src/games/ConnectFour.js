import React, { useState } from 'react';

const ConnectFour = ({ onScore, highScore }) => {
  const ROWS = 6;
  const COLS = 7;
  
  const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [winner, setWinner] = useState(null);
  const [score, setScore] = useState({ wins: 0, losses: 0 });
  const [isAITurn, setIsAITurn] = useState(false);

  const checkWin = (board, row, col, player) => {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    
    for (let [dr, dc] of directions) {
      let count = 1;
      for (let i = 1; i < 4; i++) {
        const r = row + dr * i, c = col + dc * i;
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) count++;
        else break;
      }
      for (let i = 1; i < 4; i++) {
        const r = row - dr * i, c = col - dc * i;
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) count++;
        else break;
      }
      if (count >= 4) return true;
    }
    return false;
  };

  const getLowestRow = (board, col) => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!board[row][col]) return row;
    }
    return -1;
  };

  const getAIMove = (board) => {
    // Check for winning move
    for (let col = 0; col < COLS; col++) {
      const row = getLowestRow(board, col);
      if (row !== -1) {
        board[row][col] = 'yellow';
        if (checkWin(board, row, col, 'yellow')) {
          board[row][col] = null;
          return col;
        }
        board[row][col] = null;
      }
    }
    
    // Block player's winning move
    for (let col = 0; col < COLS; col++) {
      const row = getLowestRow(board, col);
      if (row !== -1) {
        board[row][col] = 'red';
        if (checkWin(board, row, col, 'red')) {
          board[row][col] = null;
          return col;
        }
        board[row][col] = null;
      }
    }
    
    // Prefer center
    if (getLowestRow(board, 3) !== -1) return 3;
    
    // Random valid move
    const validCols = [];
    for (let col = 0; col < COLS; col++) {
      if (getLowestRow(board, col) !== -1) validCols.push(col);
    }
    return validCols[Math.floor(Math.random() * validCols.length)];
  };

  const dropPiece = (col) => {
    if (winner || isAITurn) return;
    
    const row = getLowestRow(board, col);
    if (row === -1) return;
    
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = 'red';
    setBoard(newBoard);
    
    if (checkWin(newBoard, row, col, 'red')) {
      setWinner('red');
      const newScore = { ...score, wins: score.wins + 1 };
      setScore(newScore);
      onScore(newScore.wins * 100);
      return;
    }
    
    if (newBoard.every(row => row.every(cell => cell))) {
      setWinner('draw');
      return;
    }
    
    setIsAITurn(true);
    setCurrentPlayer('yellow');
    
    // AI move
    setTimeout(() => {
      const aiCol = getAIMove(newBoard);
      const aiRow = getLowestRow(newBoard, aiCol);
      if (aiRow !== -1) {
        newBoard[aiRow][aiCol] = 'yellow';
        setBoard([...newBoard.map(r => [...r])]);
        
        if (checkWin(newBoard, aiRow, aiCol, 'yellow')) {
          setWinner('yellow');
          setScore({ ...score, losses: score.losses + 1 });
        } else if (newBoard.every(row => row.every(cell => cell))) {
          setWinner('draw');
        }
      }
      setCurrentPlayer('red');
      setIsAITurn(false);
    }, 500);
  };

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setCurrentPlayer('red');
    setWinner(null);
    setIsAITurn(false);
  };

  return (
    <div className="flex flex-col items-center gap-4" data-testid="connect4-game">
      <div className="flex justify-between w-full max-w-sm text-xs">
        <span className="text-[#00ff00]">WINS: {score.wins}</span>
        <span className="text-[#ff0000]">LOSSES: {score.losses}</span>
        <span className="text-[#ffff00]">BEST: {highScore}</span>
      </div>

      <div className="bg-[#0000aa] p-2 rounded-lg border-4 border-[#0000dd]">
        {/* Column buttons */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {Array(COLS).fill(null).map((_, col) => (
            <button
              key={col}
              onClick={() => dropPiece(col)}
              disabled={winner || isAITurn}
              className="w-10 h-6 text-[10px] bg-[#00008b] hover:bg-[#0000cd] text-white rounded transition-all"
            >
              ▼
            </button>
          ))}
        </div>
        
        {/* Board */}
        <div className="grid grid-cols-7 gap-1">
          {board.map((row, rowIdx) =>
            row.map((cell, colIdx) => (
              <div
                key={`${rowIdx}-${colIdx}`}
                className="w-10 h-10 bg-[#00008b] rounded-full flex items-center justify-center"
              >
                <div
                  className={`w-8 h-8 rounded-full transition-all ${
                    cell === 'red' 
                      ? 'bg-[#ff0000] shadow-[0_0_10px_#ff0000]' 
                      : cell === 'yellow' 
                        ? 'bg-[#ffff00] shadow-[0_0_10px_#ffff00]' 
                        : 'bg-[#1a1a2e]'
                  }`}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {winner && (
        <div className="text-center">
          <p className={`text-xl neon-text mb-4 ${
            winner === 'red' ? 'text-[#00ff00]' : winner === 'yellow' ? 'text-[#ff0000]' : 'text-[#ffff00]'
          }`}>
            {winner === 'red' ? 'YOU WIN!' : winner === 'yellow' ? 'AI WINS!' : 'DRAW!'}
          </p>
          <button onClick={resetGame} className="retro-btn text-[#00ffff]">
            PLAY AGAIN
          </button>
        </div>
      )}

      {!winner && (
        <p className="text-sm text-[#888]">
          {isAITurn ? 'AI THINKING...' : 'YOUR TURN (RED)'}
        </p>
      )}
    </div>
  );
};

export default ConnectFour;
