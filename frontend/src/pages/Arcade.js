import React, { useState, useEffect } from 'react';
import SnakeGame from '../games/SnakeGame';
import TetrisGame from '../games/TetrisGame';
import BreakoutGame from '../games/BreakoutGame';
import SpaceInvaders from '../games/SpaceInvaders';
import PongGame from '../games/PongGame';
import FlappyGame from '../games/FlappyGame';
import Game2048 from '../games/Game2048';
import MemoryGame from '../games/MemoryGame';
import { Gamepad2, Trophy, Volume2, VolumeX, ArrowLeft } from 'lucide-react';

const games = [
  { id: 'snake', name: 'SNAKE', color: '#00ff00', icon: '🐍', desc: 'Eat & Grow!' },
  { id: 'tetris', name: 'TETRIS', color: '#00ffff', icon: '🧱', desc: 'Stack Blocks!' },
  { id: 'breakout', name: 'BREAKOUT', color: '#ff00ff', icon: '🧱', desc: 'Break Bricks!' },
  { id: 'invaders', name: 'INVADERS', color: '#ff0000', icon: '👾', desc: 'Alien Attack!' },
  { id: 'pong', name: 'PONG', color: '#ffff00', icon: '🏓', desc: 'Classic Tennis!' },
  { id: 'flappy', name: 'FLAPPY', color: '#ff8800', icon: '🐦', desc: 'Fly High!' },
  { id: '2048', name: '2048', color: '#ff6600', icon: '🔢', desc: 'Merge Numbers!' },
  { id: 'memory', name: 'MEMORY', color: '#9900ff', icon: '🧠', desc: 'Match Pairs!' },
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
      default: return null;
    }
  };

  if (currentGame) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#1a0a2e] to-[#0a0a0a] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentGame(null)}
              className="retro-btn flex items-center gap-2 text-[10px]"
              style={{ color: games.find(g => g.id === currentGame)?.color }}
            >
              <ArrowLeft className="w-4 h-4" />
              BACK
            </button>
            <div className="text-center">
              <h2 
                className="text-xl neon-text"
                style={{ color: games.find(g => g.id === currentGame)?.color }}
              >
                {games.find(g => g.id === currentGame)?.name}
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
            RETRO ARCADE
          </h1>
          <Gamepad2 className="w-12 h-12 text-[#00ffff] neon-text" />
        </div>
        <p className="text-[#888] text-xs tracking-widest">
          INSERT COIN TO PLAY
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => setShowScores(!showScores)}
            className="retro-btn flex items-center gap-2 text-[10px] text-[#ffff00]"
          >
            <Trophy className="w-4 h-4" />
            HIGH SCORES
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="retro-btn text-[10px]"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* High Scores Modal */}
      {showScores && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a0a2e] border-4 border-[#ff00ff] p-6 max-w-md w-full neon-box" style={{ color: '#ff00ff' }}>
            <h2 className="text-xl text-center mb-6 text-[#ffff00] neon-text">🏆 HIGH SCORES 🏆</h2>
            <div className="space-y-3">
              {games.map(game => (
                <div key={game.id} className="flex justify-between items-center text-xs">
                  <span style={{ color: game.color }}>{game.icon} {game.name}</span>
                  <span className="text-[#00ff00]">{highScores[game.id] || 0}</span>
                </div>
              ))}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setCurrentGame(game.id)}
              className="group relative bg-black/50 border-4 rounded-lg p-6 transition-all duration-300 hover:scale-105 neon-box"
              style={{ 
                borderColor: game.color,
                color: game.color
              }}
            >
              <div className="text-5xl mb-4 group-hover:scale-125 transition-transform">
                {game.icon}
              </div>
              <h3 className="text-sm mb-2 neon-text">{game.name}</h3>
              <p className="text-[8px] text-[#888]">{game.desc}</p>
              {highScores[game.id] > 0 && (
                <div className="absolute top-2 right-2 text-[8px] text-[#ffff00]">
                  HI: {highScores[game.id]}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-[8px] text-[#666]">
        <p>USE ARROW KEYS OR TOUCH TO PLAY</p>
        <p className="mt-2">© 2025 RETRO ARCADE</p>
      </footer>
    </div>
  );
};

export default Arcade;
