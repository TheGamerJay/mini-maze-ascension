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
import TicTacToe from '../games/TicTacToe';
import ConnectFour from '../games/ConnectFour';
import BubblePop from '../games/BubblePop';
import RockPaperScissors from '../games/RockPaperScissors';
import CatchGame from '../games/CatchGame';
import QuizGame from '../games/QuizGame';
import ClickerGame from '../games/ClickerGame';
import { Gamepad2, Trophy, Volume2, VolumeX, ArrowLeft, Star, Zap, Brain, MessageSquare, Users, Sparkles } from 'lucide-react';

const categories = [
  { id: 'all', name: 'ALL GAMES', icon: Sparkles, color: '#ff00ff' },
  { id: 'action', name: 'ACTION', icon: Zap, color: '#ff0000' },
  { id: 'puzzle', name: 'PUZZLE', icon: Brain, color: '#00ffff' },
  { id: 'word', name: 'WORD', icon: MessageSquare, color: '#00ff00' },
  { id: 'strategy', name: 'STRATEGY', icon: Users, color: '#ffff00' },
  { id: 'casual', name: 'CASUAL', icon: Star, color: '#ff8800' },
];

const games = [
  // Action Games
  { id: 'snake', name: 'SNAKE', color: '#00ff00', icon: '🐍', desc: 'Eat & Grow!', category: 'action', featured: true },
  { id: 'tetris', name: 'TETRIS', color: '#00ffff', icon: '🧱', desc: 'Stack Blocks!', category: 'action', featured: true },
  { id: 'breakout', name: 'BREAKOUT', color: '#ff00ff', icon: '🎾', desc: 'Break Bricks!', category: 'action' },
  { id: 'invaders', name: 'INVADERS', color: '#ff0000', icon: '👾', desc: 'Alien Attack!', category: 'action', featured: true },
  { id: 'pong', name: 'PONG', color: '#ffff00', icon: '🏓', desc: 'Classic Tennis!', category: 'action' },
  { id: 'flappy', name: 'FLAPPY', color: '#ff8800', icon: '🐦', desc: 'Fly High!', category: 'action' },
  { id: 'dino', name: 'DINO RUN', color: '#00ff00', icon: '🦖', desc: 'Jump & Run!', category: 'action' },
  { id: 'asteroids', name: 'ASTEROIDS', color: '#00ffff', icon: '☄️', desc: 'Shoot Rocks!', category: 'action' },
  { id: 'whack', name: 'WHACK', color: '#8B4513', icon: '🐹', desc: 'Hit Moles!', category: 'action' },
  
  // Puzzle Games
  { id: '2048', name: '2048', color: '#ff6600', icon: '🔢', desc: 'Merge Numbers!', category: 'puzzle', featured: true },
  { id: 'minesweeper', name: 'MINES', color: '#ff0000', icon: '💣', desc: 'Avoid Bombs!', category: 'puzzle' },
  { id: 'maze', name: 'MAZE', color: '#00ffff', icon: '🔷', desc: 'Find Exit!', category: 'puzzle' },
  { id: 'sliding', name: 'SLIDER', color: '#ff00ff', icon: '🔲', desc: 'Slide Tiles!', category: 'puzzle' },
  { id: 'sudoku', name: 'SUDOKU', color: '#00ff00', icon: '9️⃣', desc: 'Fill Numbers!', category: 'puzzle' },
  { id: 'riddle', name: 'RIDDLES', color: '#ff00ff', icon: '🧩', desc: 'Brain Teasers!', category: 'puzzle' },
  
  // Word Games
  { id: 'wordle', name: 'WORDLE', color: '#00ff00', icon: '📝', desc: 'Guess Word!', category: 'word', featured: true },
  { id: 'wordsearch', name: 'SEARCH', color: '#ffff00', icon: '🔍', desc: 'Find Words!', category: 'word' },
  { id: 'wordfinder', name: 'FINDER', color: '#ff8800', icon: '🔤', desc: 'Unscramble!', category: 'word' },
  { id: 'crossword', name: 'CROSS', color: '#00ffff', icon: '✏️', desc: 'Fill Clues!', category: 'word' },
  { id: 'hangman', name: 'HANGMAN', color: '#ff0000', icon: '🎭', desc: 'Save Him!', category: 'word' },
  { id: 'typing', name: 'TYPING', color: '#00ff00', icon: '⌨️', desc: 'Speed Type!', category: 'word' },
  
  // Strategy Games
  { id: 'tictactoe', name: 'TIC TAC', color: '#ff00ff', icon: '⭕', desc: 'Beat the AI!', category: 'strategy' },
  { id: 'connect4', name: 'CONNECT 4', color: '#ff0000', icon: '🔴', desc: 'Line Em Up!', category: 'strategy' },
  { id: 'memory', name: 'MEMORY', color: '#9900ff', icon: '🧠', desc: 'Match Pairs!', category: 'strategy' },
  { id: 'simon', name: 'SIMON', color: '#ffff00', icon: '🎵', desc: 'Repeat Pattern!', category: 'strategy' },
  
  // Casual Games
  { id: 'bubblepop', name: 'BUBBLES', color: '#00ffff', icon: '🫧', desc: 'Pop Them!', category: 'casual', featured: true },
  { id: 'rps', name: 'RPS', color: '#ff8800', icon: '✊', desc: 'Rock Paper!', category: 'casual' },
  { id: 'catch', name: 'CATCH', color: '#ffff00', icon: '🧺', desc: 'Catch Items!', category: 'casual' },
  { id: 'quiz', name: 'QUIZ', color: '#ff00ff', icon: '❓', desc: 'Test Brain!', category: 'casual' },
  { id: 'clicker', name: 'CLICKER', color: '#00ff00', icon: '👆', desc: 'Click Away!', category: 'casual' },
  { id: 'reaction', name: 'REACTION', color: '#ff00ff', icon: '⚡', desc: 'Quick Tap!', category: 'casual' },
  { id: 'colormatch', name: 'COLORS', color: '#ff00ff', icon: '🎨', desc: 'Match Names!', category: 'casual' },
];

const Arcade = () => {
  const [currentGame, setCurrentGame] = useState(null);
  const [highScores, setHighScores] = useState({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showScores, setShowScores] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [heroIndex, setHeroIndex] = useState(0);

  const featuredGames = games.filter(g => g.featured);

  useEffect(() => {
    const saved = localStorage.getItem('miniRetroArcadeScores');
    if (saved) {
      setHighScores(JSON.parse(saved));
    }
  }, []);

  // Rotate featured games
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex(i => (i + 1) % featuredGames.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [featuredGames.length]);

  const updateHighScore = (gameId, score) => {
    const current = highScores[gameId] || 0;
    if (score > current) {
      const newScores = { ...highScores, [gameId]: score };
      setHighScores(newScores);
      localStorage.setItem('miniRetroArcadeScores', JSON.stringify(newScores));
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
      case 'tictactoe': return <TicTacToe {...props} />;
      case 'connect4': return <ConnectFour {...props} />;
      case 'bubblepop': return <BubblePop {...props} />;
      case 'rps': return <RockPaperScissors {...props} />;
      case 'catch': return <CatchGame {...props} />;
      case 'quiz': return <QuizGame {...props} />;
      case 'clicker': return <ClickerGame {...props} />;
      default: return null;
    }
  };

  const filteredGames = selectedCategory === 'all' 
    ? games 
    : games.filter(g => g.category === selectedCategory);

  const totalScore = Object.values(highScores).reduce((a, b) => a + b, 0);
  const gamesPlayed = Object.keys(highScores).length;

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
              data-testid="back-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK
            </button>
            <div className="text-center">
              <h2 className="text-xl neon-text" style={{ color: game?.color }}>
                {game?.icon} {game?.name}
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
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-[#ff00ff]/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
          <div className="absolute w-96 h-96 bg-[#00ffff]/20 rounded-full blur-3xl -top-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute w-64 h-64 bg-[#ffff00]/10 rounded-full blur-3xl top-20 left-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="relative pt-8 pb-6 text-center px-4">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <Gamepad2 className="w-10 h-10 text-[#ff00ff] animate-bounce" style={{ animationDuration: '2s' }} />
            <h1 className="text-4xl md:text-5xl font-bold tracking-wider">
              <span className="text-[#ff00ff] neon-text">MINI</span>
              <span className="text-white mx-2">RETRO</span>
              <span className="text-[#00ffff] neon-text">ARCADE</span>
            </h1>
            <Gamepad2 className="w-10 h-10 text-[#00ffff] animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
          </div>
          
          <p className="text-[#888] text-sm tracking-widest mb-4">
            {games.length} CLASSIC GAMES • FREE TO PLAY
          </p>

          {/* Stats Bar */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="bg-black/50 border border-[#00ff00] rounded-lg px-4 py-2">
              <p className="text-[#00ff00] text-xl font-bold">{totalScore.toLocaleString()}</p>
              <p className="text-[8px] text-[#888]">TOTAL SCORE</p>
            </div>
            <div className="bg-black/50 border border-[#ffff00] rounded-lg px-4 py-2">
              <p className="text-[#ffff00] text-xl font-bold">{gamesPlayed}/{games.length}</p>
              <p className="text-[8px] text-[#888]">GAMES PLAYED</p>
            </div>
            <button 
              onClick={() => setShowScores(true)}
              className="bg-black/50 border border-[#ff00ff] rounded-lg px-4 py-2 hover:bg-[#ff00ff]/20 transition-all"
            >
              <Trophy className="w-6 h-6 text-[#ff00ff] mx-auto" />
              <p className="text-[8px] text-[#888]">LEADERBOARD</p>
            </button>
          </div>

          {/* Featured Game Carousel */}
          <div className="max-w-lg mx-auto mb-6">
            <p className="text-[#ffff00] text-xs mb-3 flex items-center justify-center gap-2">
              <Star className="w-3 h-3" /> FEATURED GAME <Star className="w-3 h-3" />
            </p>
            <button
              onClick={() => setCurrentGame(featuredGames[heroIndex].id)}
              className="w-full bg-gradient-to-r from-[#1a0a2e] to-[#2a1a4e] border-2 rounded-xl p-4 
                transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,0,255,0.3)]"
              style={{ borderColor: featuredGames[heroIndex].color }}
              data-testid="featured-game-btn"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <span className="text-5xl">{featuredGames[heroIndex].icon}</span>
                </div>
                <div className="text-center flex-1">
                  <h3 className="text-2xl neon-text mb-1" style={{ color: featuredGames[heroIndex].color }}>
                    {featuredGames[heroIndex].name}
                  </h3>
                  <p className="text-[#888] text-sm">{featuredGames[heroIndex].desc}</p>
                </div>
                <div className="text-right">
                  <span className="text-[#00ff00] text-xs">PLAY NOW →</span>
                </div>
              </div>
            </button>
            
            {/* Carousel Dots */}
            <div className="flex justify-center gap-2 mt-3">
              {featuredGames.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === heroIndex ? 'bg-[#ff00ff] w-6' : 'bg-[#333]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur border-y border-[#333] py-3">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              const count = cat.id === 'all' ? games.length : games.filter(g => g.category === cat.id).length;
              
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all text-xs
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#1a1a2e] to-[#2a2a4e] border-2 scale-105' 
                      : 'bg-black/30 border border-[#333] hover:border-[#666]'
                    }`}
                  style={{ borderColor: isActive ? cat.color : undefined, color: isActive ? cat.color : '#888' }}
                  data-testid={`category-${cat.id}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.name}</span>
                  <span className="bg-black/50 px-2 py-0.5 rounded-full text-[10px]">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* High Scores Modal */}
      {showScores && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-auto">
          <div className="bg-[#1a0a2e] border-4 border-[#ff00ff] p-6 max-w-md w-full max-h-[80vh] overflow-auto neon-box rounded-xl">
            <h2 className="text-xl text-center mb-6 text-[#ffff00] neon-text">🏆 HIGH SCORES 🏆</h2>
            <div className="space-y-2">
              {games.sort((a,b) => (highScores[b.id] || 0) - (highScores[a.id] || 0)).map(game => (
                <div key={game.id} className="flex justify-between items-center text-xs py-1 border-b border-[#333]">
                  <span style={{ color: game.color }}>{game.icon} {game.name}</span>
                  <span className="text-[#00ff00] font-mono">{(highScores[game.id] || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t-2 border-[#ffff00] flex justify-between text-sm">
              <span className="text-[#ffff00]">TOTAL</span>
              <span className="text-[#00ff00] font-mono">{totalScore.toLocaleString()}</span>
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
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {filteredGames.map((game) => (
            <button
              key={game.id}
              onClick={() => setCurrentGame(game.id)}
              className="group relative bg-black/50 border-2 rounded-xl p-4 transition-all duration-300 
                hover:scale-105 hover:-translate-y-1 hover:shadow-lg neon-box"
              style={{ 
                borderColor: game.color,
                '--glow-color': game.color,
              }}
              data-testid={`game-${game.id}`}
            >
              {game.featured && (
                <div className="absolute -top-1 -right-1 bg-[#ffff00] text-black text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                  HOT
                </div>
              )}
              <div className="text-4xl mb-2 group-hover:scale-125 transition-transform">
                {game.icon}
              </div>
              <h3 className="text-[10px] mb-1 neon-text font-bold" style={{ color: game.color }}>
                {game.name}
              </h3>
              <p className="text-[8px] text-[#888]">{game.desc}</p>
              {highScores[game.id] > 0 && (
                <div className="absolute top-1 left-1 text-[8px] text-[#00ff00] bg-black/70 px-1.5 py-0.5 rounded-full">
                  {highScores[game.id].toLocaleString()}
                </div>
              )}
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-[#333]">
        <p className="text-[#666] text-xs mb-2">USE KEYBOARD, MOUSE, OR TOUCH TO PLAY</p>
        <p className="text-[#444] text-[10px]">© 2026 MINI RETRO ARCADE • {games.length} GAMES</p>
      </footer>
    </div>
  );
};

export default Arcade;
