import React, { useState, useEffect } from 'react';
import SnakeGame from '../games/SnakeGame';
import TetrisGame from '../games/TetrisGame';
import BreakoutGame from '../games/BreakoutGame';
import SpaceInvaders from '../games/SpaceInvaders';
import PongGame from '../games/PongGame';
import FlappyGame from '../games/FlappyGame';
import Game2048 from '../games/Game2048';
import MemoryGame from '../games/MemoryGame';
import Minesweeper from '../games/Minesweeper';
import MazeGame from '../games/MazeGame';
import RiddleGame from '../games/RiddleGame';
import SimonGame from '../games/SimonGame';
import TypingGame from '../games/TypingGame';
import WhackAMole from '../games/WhackAMole';
import DinoRun from '../games/DinoRun';
import WordleGame from '../games/WordleGame';
import AsteroidsGame from '../games/AsteroidsGame';
import ReactionGame from '../games/ReactionGame';
import ColorMatchGame from '../games/ColorMatchGame';
import WordSearchGame from '../games/WordSearchGame';
import WordFinderGame from '../games/WordFinderGame';
import SlidingPuzzle from '../games/SlidingPuzzle';
import CrosswordMini from '../games/CrosswordMini';
import SudokuGame from '../games/SudokuGame';
import HangmanGame from '../games/HangmanGame';
import { Gamepad2, Trophy, Volume2, VolumeX, ArrowLeft } from 'lucide-react';

const games = [
  // Classic Action Games
  { id: 'snake', name: 'SNAKE', color: '#00ff00', icon: '🐍', desc: 'Eat & Grow!', category: 'action' },
  { id: 'tetris', name: 'TETRIS', color: '#00ffff', icon: '🧱', desc: 'Stack Blocks!', category: 'action' },
  { id: 'breakout', name: 'BREAKOUT', color: '#ff00ff', icon: '🎾', desc: 'Break Bricks!', category: 'action' },
  { id: 'invaders', name: 'INVADERS', color: '#ff0000', icon: '👾', desc: 'Alien Attack!', category: 'action' },
  { id: 'pong', name: 'PONG', color: '#ffff00', icon: '🏓', desc: 'Classic Tennis!', category: 'action' },
  { id: 'flappy', name: 'FLAPPY', color: '#ff8800', icon: '🐦', desc: 'Fly High!', category: 'action' },
  { id: 'dino', name: 'DINO RUN', color: '#00ff00', icon: '🦖', desc: 'Jump & Run!', category: 'action' },
  { id: 'asteroids', name: 'ASTEROIDS', color: '#00ffff', icon: '☄️', desc: 'Shoot Rocks!', category: 'action' },
  { id: 'whack', name: 'WHACK', color: '#8B4513', icon: '🐹', desc: 'Hit Moles!', category: 'action' },
  
  // Puzzle Games
  { id: '2048', name: '2048', color: '#ff6600', icon: '🔢', desc: 'Merge Numbers!', category: 'puzzle' },
  { id: 'minesweeper', name: 'MINES', color: '#ff0000', icon: '💣', desc: 'Avoid Bombs!', category: 'puzzle' },
  { id: 'maze', name: 'MAZE', color: '#00ffff', icon: '🔷', desc: 'Find Exit!', category: 'puzzle' },
  { id: 'sliding', name: 'SLIDER', color: '#ff00ff', icon: '🔲', desc: 'Slide Tiles!', category: 'puzzle' },
  { id: 'sudoku', name: 'SUDOKU', color: '#00ff00', icon: '🔢', desc: 'Fill Numbers!', category: 'puzzle' },
  { id: 'riddle', name: 'RIDDLES', color: '#ff00ff', icon: '🧩', desc: 'Brain Teasers!', category: 'puzzle' },
  
  // Word Games
  { id: 'wordle', name: 'WORDLE', color: '#00ff00', icon: '📝', desc: 'Guess Word!', category: 'word' },
  { id: 'wordsearch', name: 'SEARCH', color: '#ffff00', icon: '🔍', desc: 'Find Words!', category: 'word' },
  { id: 'wordfinder', name: 'FINDER', color: '#ff8800', icon: '🔤', desc: 'Unscramble!', category: 'word' },
  { id: 'crossword', name: 'CROSS', color: '#00ffff', icon: '✏️', desc: 'Fill Clues!', category: 'word' },
  { id: 'hangman', name: 'HANGMAN', color: '#ff0000', icon: '🎭', desc: 'Save Him!', category: 'word' },
  { id: 'typing', name: 'TYPING', color: '#00ff00', icon: '⌨️', desc: 'Speed Type!', category: 'word' },
  
  // Memory & Quick Games
  { id: 'memory', name: 'MEMORY', color: '#9900ff', icon: '🧠', desc: 'Match Pairs!', category: 'memory' },
  { id: 'simon', name: 'SIMON', color: '#ffff00', icon: '🎵', desc: 'Repeat Pattern!', category: 'memory' },
  { id: 'reaction', name: 'REACTION', color: '#ff00ff', icon: '⚡', desc: 'Quick Tap!', category: 'memory' },
  { id: 'colormatch', name: 'COLORS', color: '#ff00ff', icon: '🎨', desc: 'Match Names!', category: 'memory' },
];

const Arcade = () => {
  const [currentGame, setCurrentGame] = useState(null);
  const [highScores, setHighScores] = useState({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showScores, setShowScores] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('retroArcadeScores');
    if (saved) {
      setHighScores(JSON.parse(saved));
    }
  }, []);

  const updateHighScore = (gameId, score) => {
    const current = highScores[gameId] || 0;
    if (score > current) {
      const newScores = { ...highScores, [gameId]: score };
      setHighScores(newScores);
      localStorage.setItem('retroArcadeScores', JSON.stringify(newScores));
      return true;
    }
    return false;
  };

  const renderGame = () => {
    const props = { 
      onScore: (score) => updateHighScore(currentGame, score),
      highScore: highScores[currentGame] || 0,
      soundEnabled 
    };

    switch (currentGame) {
      case 'snake': return <SnakeGame {...props} />;
      case 'tetris': return <TetrisGame {...props} />;
      case 'breakout': return <BreakoutGame {...props} />;
      case 'invaders': return <SpaceInvaders {...props} />;
      case 'pong': return <PongGame {...props} />;
      case 'flappy': return <FlappyGame {...props} />;
      case '2048': return <Game2048 {...props} />;
      case 'memory': return <MemoryGame {...props} />;
      case 'minesweeper': return <Minesweeper {...props} />;
      case 'maze': return <MazeGame {...props} />;
      case 'riddle': return <RiddleGame {...props} />;
      case 'simon': return <SimonGame {...props} />;
      case 'typing': return <TypingGame {...props} />;
      case 'whack': return <WhackAMole {...props} />;
      case 'dino': return <DinoRun {...props} />;
      case 'wordle': return <WordleGame {...props} />;
      case 'asteroids': return <AsteroidsGame {...props} />;
      case 'reaction': return <ReactionGame {...props} />;
      case 'colormatch': return <ColorMatchGame {...props} />;
      case 'wordsearch': return <WordSearchGame {...props} />;
      case 'wordfinder': return <WordFinderGame {...props} />;
      case 'sliding': return <SlidingPuzzle {...props} />;
      case 'crossword': return <CrosswordMini {...props} />;
      case 'sudoku': return <SudokuGame {...props} />;
      case 'hangman': return <HangmanGame {...props} />;
      default: return null;
    }
  };

  const totalScore = Object.values(highScores).reduce((a, b) => a + b, 0);

  if (currentGame) {
    const game = games.find(g => g.id === currentGame);
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#1a0a2e] to-[#0a0a0a] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentGame(null)}
              className="retro-btn flex items-center gap-2 text-[10px]"
              style={{ color: game?.color }}
            >
              <ArrowLeft className="w-4 h-4" />
              BACK
            </button>
            <div className="text-center">
              <h2 
                className="text-xl neon-text"
                style={{ color: game?.color }}
              >
                {game?.name}
              </h2>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="retro-btn text-[10px]"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
          {renderGame()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#1a0a2e] to-[#0a0a0a] crt-effect">
      {/* Header */}
      <header className="pt-8 pb-6 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Gamepad2 className="w-12 h-12 text-[#ff00ff] neon-text" />
          <h1 className="text-3xl md:text-4xl rainbow-text neon-text tracking-wider">
            MINI RETRO ARCADE
          </h1>
          <Gamepad2 className="w-12 h-12 text-[#00ffff] neon-text" />
        </div>
        <p className="text-[#888] text-xs tracking-widest">
          {games.length} CLASSIC GAMES • INSERT COIN TO PLAY
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => setShowScores(!showScores)}
            className="retro-btn flex items-center gap-2 text-[10px] text-[#ffff00]"
          >
            <Trophy className="w-4 h-4" />
            HIGH SCORES
          </button>
          <div className="retro-btn text-[10px] text-[#00ff00]">
            TOTAL: {totalScore}
          </div>
        </div>
      </header>

      {/* High Scores Modal */}
      {showScores && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-auto">
          <div className="bg-[#1a0a2e] border-4 border-[#ff00ff] p-6 max-w-md w-full max-h-[80vh] overflow-auto neon-box" style={{ color: '#ff00ff' }}>
            <h2 className="text-xl text-center mb-6 text-[#ffff00] neon-text">🏆 HIGH SCORES 🏆</h2>
            <div className="space-y-2">
              {games.map(game => (
                <div key={game.id} className="flex justify-between items-center text-xs py-1 border-b border-[#333]">
                  <span style={{ color: game.color }}>{game.icon} {game.name}</span>
                  <span className="text-[#00ff00] font-mono">{highScores[game.id] || 0}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t-2 border-[#ffff00] flex justify-between text-sm">
              <span className="text-[#ffff00]">TOTAL</span>
              <span className="text-[#00ff00] font-mono">{totalScore}</span>
            </div>
            <button
              onClick={() => setShowScores(false)}
              className="retro-btn w-full mt-6 text-[10px] text-[#ff00ff]"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Games Grid */}
      <main className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setCurrentGame(game.id)}
              className="group relative bg-black/50 border-4 rounded-lg p-4 transition-all duration-300 hover:scale-105 neon-box"
              style={{ 
                borderColor: game.color,
                color: game.color
              }}
            >
              <div className="text-4xl mb-2 group-hover:scale-125 transition-transform">
                {game.icon}
              </div>
              <h3 className="text-[10px] mb-1 neon-text">{game.name}</h3>
              <p className="text-[8px] text-[#888]">{game.desc}</p>
              {highScores[game.id] > 0 && (
                <div className="absolute top-1 right-1 text-[8px] text-[#ffff00] bg-black/50 px-1 rounded">
                  {highScores[game.id]}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-[8px] text-[#666]">
        <p>USE ARROW KEYS, MOUSE, OR TOUCH TO PLAY</p>
        <p className="mt-2">© 2025 MINI RETRO ARCADE • {games.length} GAMES</p>
      </footer>
    </div>
  );
};

export default Arcade;
