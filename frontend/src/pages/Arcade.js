import React, { useState, useEffect, useCallback } from 'react';
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
import MazeAscension from '../games/MazeAscension';
import Wrecker from '../games/Wrecker';
import { Gamepad2, Trophy, ArrowLeft, Zap, Brain, MessageSquare, Users, Star, Sparkles, Crown, Medal, Flame, User, Home, TrendingUp, Play, Volume2, VolumeX } from 'lucide-react';
import Leaderboard from '../components/Leaderboard';
import ProfilePage from '../components/ProfilePage';
import Dashboard from '../components/Dashboard';
import { ToastProvider, useToast, showAchievementToast, showHighScoreToast, showStreakToast, showChallengeToast } from '../components/Toast';
import { soundManager } from '../utils/sounds';
import { createConfetti } from '../utils/confetti';
import { updateStreak, getStreakStatus } from '../utils/streakTracker';
import { checkAchievements, markAsNotified, getUnnotifiedAchievements, getAchievement } from '../utils/achievements';
import { getDailyChallenges, updateChallengeProgress } from '../utils/dailyChallenges';

const categories = [
  { id: 'all', name: 'All Games', icon: Sparkles, color: '#8b5cf6' },
  { id: 'action', name: 'Action', icon: Zap, color: '#ef4444' },
  { id: 'puzzle', name: 'Puzzle', icon: Brain, color: '#06b6d4' },
  { id: 'word', name: 'Word', icon: MessageSquare, color: '#10b981' },
  { id: 'strategy', name: 'Strategy', icon: Users, color: '#f59e0b' },
  { id: 'casual', name: 'Casual', icon: Star, color: '#ec4899' },
];

const games = [
  // Action Games
  { id: 'snake', name: 'Snake', color: '#10b981', icon: '🐍', desc: 'Classic snake game', category: 'action', featured: true },
  { id: 'tetris', name: 'Tetris', color: '#06b6d4', icon: '🧱', desc: 'Stack the blocks', category: 'action', featured: true },
  { id: 'breakout', name: 'Breakout', color: '#8b5cf6', icon: '🎾', desc: 'Break all bricks', category: 'action' },
  { id: 'invaders', name: 'Space Invaders', color: '#ef4444', icon: '👾', desc: 'Defend Earth', category: 'action', featured: true },
  { id: 'pong', name: 'Pong', color: '#f59e0b', icon: '🏓', desc: 'Classic tennis', category: 'action' },
  { id: 'flappy', name: 'Flappy Bird', color: '#f97316', icon: '🐦', desc: 'Dodge the pipes', category: 'action' },
  { id: 'dino', name: 'T-Rex Run', color: '#10b981', icon: '🦖', desc: 'Endless runner', category: 'action' },
  { id: 'asteroids', name: 'Asteroids', color: '#06b6d4', icon: '☄️', desc: 'Shoot space rocks', category: 'action' },
  { id: 'whack', name: 'Whack-a-Mole', color: '#92400e', icon: '🐹', desc: 'Test your reflexes', category: 'action' },
  { id: 'mazeascension', name: 'Maze Ascension', color: '#10b981', icon: '🧟', desc: 'Zombie survival', category: 'action', featured: true },
  { id: 'wrecker', name: 'Wrecker', color: '#ef4444', icon: '🦖', desc: 'Destroy the city', category: 'action', featured: true },
  
  // Puzzle Games
  { id: '2048', name: '2048', color: '#f97316', icon: '🔢', desc: 'Merge to win', category: 'puzzle', featured: true },
  { id: 'minesweeper', name: 'Minesweeper', color: '#ef4444', icon: '💣', desc: 'Avoid the bombs', category: 'puzzle' },
  { id: 'maze', name: 'Maze Runner', color: '#06b6d4', icon: '🔷', desc: 'Find the exit', category: 'puzzle' },
  { id: 'sliding', name: 'Slide Puzzle', color: '#8b5cf6', icon: '🔲', desc: 'Arrange tiles', category: 'puzzle' },
  { id: 'sudoku', name: 'Sudoku', color: '#10b981', icon: '9️⃣', desc: 'Number puzzle', category: 'puzzle' },
  { id: 'riddle', name: 'Riddles', color: '#ec4899', icon: '🧩', desc: 'Brain teasers', category: 'puzzle' },
  
  // Word Games
  { id: 'wordle', name: 'Wordle', color: '#10b981', icon: '📝', desc: 'Guess the word', category: 'word', featured: true },
  { id: 'wordsearch', name: 'Word Search', color: '#f59e0b', icon: '🔍', desc: 'Find hidden words', category: 'word' },
  { id: 'wordfinder', name: 'Word Finder', color: '#f97316', icon: '🔤', desc: 'Unscramble letters', category: 'word' },
  { id: 'crossword', name: 'Crossword', color: '#06b6d4', icon: '✏️', desc: 'Fill the clues', category: 'word' },
  { id: 'hangman', name: 'Hangman', color: '#ef4444', icon: '🎭', desc: 'Save the man', category: 'word' },
  { id: 'typing', name: 'Speed Typing', color: '#10b981', icon: '⌨️', desc: 'Type fast', category: 'word' },
  
  // Strategy Games
  { id: 'tictactoe', name: 'Tic Tac Toe', color: '#8b5cf6', icon: '⭕', desc: 'Beat the AI', category: 'strategy' },
  { id: 'connect4', name: 'Connect Four', color: '#ef4444', icon: '🔴', desc: 'Line up four', category: 'strategy' },
  { id: 'memory', name: 'Memory Match', color: '#a855f7', icon: '🧠', desc: 'Find pairs', category: 'strategy' },
  { id: 'simon', name: 'Simon Says', color: '#f59e0b', icon: '🎵', desc: 'Follow pattern', category: 'strategy' },
  
  // Casual Games
  { id: 'bubblepop', name: 'Bubble Pop', color: '#06b6d4', icon: '🫧', desc: 'Pop bubbles', category: 'casual', featured: true },
  { id: 'rps', name: 'Rock Paper Scissors', color: '#f97316', icon: '✊', desc: 'Classic game', category: 'casual' },
  { id: 'catch', name: 'Catch Game', color: '#f59e0b', icon: '🧺', desc: 'Catch items', category: 'casual' },
  { id: 'quiz', name: 'Quiz Master', color: '#8b5cf6', icon: '❓', desc: 'Test knowledge', category: 'casual' },
  { id: 'clicker', name: 'Clicker', color: '#10b981', icon: '👆', desc: 'Click to win', category: 'casual' },
  { id: 'reaction', name: 'Reaction Test', color: '#ec4899', icon: '⚡', desc: 'How fast?', category: 'casual' },
  { id: 'colormatch', name: 'Color Match', color: '#8b5cf6', icon: '🎨', desc: 'Match colors', category: 'casual' },
];

// Main Arcade component wrapped with ToastProvider
const Arcade = () => {
  return (
    <ToastProvider>
      <ArcadeContent />
    </ToastProvider>
  );
};

const ArcadeContent = () => {
  const { addToast } = useToast();
  const [currentGame, setCurrentGame] = useState(null);
  const [highScores, setHighScores] = useState({});
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('miniArcadeSettings');
    return saved ? JSON.parse(saved).sound !== false : true;
  });
  const [showScores, setShowScores] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [streak, setStreak] = useState(0);
  const [todayScoreTotal, setTodayScoreTotal] = useState(0);
  const [todayGamesPlayed, setTodayGamesPlayed] = useState(new Set());
  const [playerProfile, setPlayerProfile] = useState(() => {
    const saved = localStorage.getItem('miniArcadeProfile');
    return saved ? JSON.parse(saved) : { name: 'Player', avatar: '🎮', country: '🌍' };
  });

  const featuredGames = games.filter(g => g.featured);

  // Initialize sound system and check streak on mount
  useEffect(() => {
    soundManager.init();
    
    // Check and update streak
    const streakResult = updateStreak();
    setStreak(streakResult.currentStreak);
    
    // Show streak toast if streak increased
    if (streakResult.streakIncreased && streakResult.currentStreak > 1) {
      setTimeout(() => {
        showStreakToast(addToast, streakResult.currentStreak);
        if (soundEnabled) soundManager.playLevelUp();
      }, 1000);
    }
    
    // Check for any unnotified achievements
    const unnotified = getUnnotifiedAchievements();
    unnotified.forEach((id, index) => {
      const achievement = getAchievement(id);
      if (achievement) {
        setTimeout(() => {
          showAchievementToast(addToast, achievement);
          markAsNotified(id);
          if (soundEnabled) soundManager.playAchievement();
        }, 2000 + index * 1500);
      }
    });
  }, []);

  // Load high scores
  useEffect(() => {
    const saved = localStorage.getItem('miniRetroArcadeScores');
    if (saved) setHighScores(JSON.parse(saved));
  }, []);

  // Resume audio context on user interaction
  useEffect(() => {
    const handleInteraction = () => {
      soundManager.resume();
    };
    document.addEventListener('click', handleInteraction, { once: true });
    return () => document.removeEventListener('click', handleInteraction);
  }, []);

  const updateHighScore = useCallback((gameId, score) => {
    // Play score sound
    if (soundEnabled) soundManager.playScore();
    
    // Update recent games
    const recent = JSON.parse(localStorage.getItem('miniArcadeRecentGames') || '[]');
    const updatedRecent = [gameId, ...recent.filter(id => id !== gameId)].slice(0, 10);
    localStorage.setItem('miniArcadeRecentGames', JSON.stringify(updatedRecent));
    
    // Update sessions
    const sessions = parseInt(localStorage.getItem('miniArcadeSessions') || '0') + 1;
    localStorage.setItem('miniArcadeSessions', sessions.toString());
    
    // Track today's progress
    const newTodayGames = new Set(todayGamesPlayed);
    newTodayGames.add(gameId);
    setTodayGamesPlayed(newTodayGames);
    setTodayScoreTotal(prev => prev + score);
    
    // Update daily challenges
    const completedChallenges = updateChallengeProgress(gameId, score, todayScoreTotal + score, newTodayGames.size);
    completedChallenges.forEach((challenge, index) => {
      setTimeout(() => {
        showChallengeToast(addToast, challenge);
        if (soundEnabled) soundManager.playSuccess();
      }, 500 + index * 1000);
    });
    
    // Check for new high score
    const current = highScores[gameId] || 0;
    const isNewHighScore = score > current;
    
    if (isNewHighScore) {
      const newScores = { ...highScores, [gameId]: score };
      setHighScores(newScores);
      localStorage.setItem('miniRetroArcadeScores', JSON.stringify(newScores));
      
      // Celebrate new high score!
      const game = games.find(g => g.id === gameId);
      showHighScoreToast(addToast, game?.name || gameId, score);
      if (soundEnabled) soundManager.playNewHighScore();
      createConfetti();
      
      // Check achievements with new scores
      const totalScore = Object.values(newScores).reduce((a, b) => a + b, 0);
      const gamesPlayed = Object.keys(newScores).length;
      const streakData = getStreakStatus();
      
      const newAchievements = checkAchievements({
        totalScore,
        gamesPlayed,
        streak: streakData.currentStreak,
        highScores: newScores,
        playHistory: streakData.playHistory,
      });
      
      newAchievements.forEach((achievement, index) => {
        setTimeout(() => {
          showAchievementToast(addToast, achievement);
          markAsNotified(achievement.id);
          if (soundEnabled) soundManager.playAchievement();
        }, 1500 + index * 1500);
      });
      
      return true;
    }
    
    return false;
  }, [highScores, soundEnabled, addToast, todayScoreTotal, todayGamesPlayed]);

  // Toggle sound
  const toggleSound = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    const settings = JSON.parse(localStorage.getItem('miniArcadeSettings') || '{}');
    settings.sound = newSoundEnabled;
    localStorage.setItem('miniArcadeSettings', JSON.stringify(settings));
    if (newSoundEnabled) soundManager.playClick();
  };

  // Play click sound on button interactions
  const handleButtonClick = (callback) => {
    if (soundEnabled) soundManager.playClick();
    callback();
  };

  const RANKS = [
    { name: 'Bronze', min: 0, color: '#CD7F32', icon: Medal },
    { name: 'Silver', min: 10000, color: '#C0C0C0', icon: Medal },
    { name: 'Gold', min: 50000, color: '#FFD700', icon: Trophy },
    { name: 'Platinum', min: 100000, color: '#E5E4E2', icon: Crown },
    { name: 'Diamond', min: 200000, color: '#B9F2FF', icon: Crown },
    { name: 'Legend', min: 500000, color: '#8b5cf6', icon: Star },
  ];

  const getRank = (score) => {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (score >= RANKS[i].min) return RANKS[i];
    }
    return RANKS[0];
  };

  const filteredGames = selectedCategory === 'all' ? games : games.filter(g => g.category === selectedCategory);
  const totalScore = Object.values(highScores).reduce((a, b) => a + b, 0);
  const gamesPlayed = Object.keys(highScores).length;
  const playerRank = getRank(totalScore);
  const nextRank = RANKS[RANKS.indexOf(playerRank) + 1];
  const progressToNext = nextRank ? ((totalScore - playerRank.min) / (nextRank.min - playerRank.min)) * 100 : 100;

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
      case 'mazeascension': return <MazeAscension {...props} />;
      case 'wrecker': return <Wrecker {...props} />;
      default: return null;
    }
  };

  // Game Screen
  if (currentGame) {
    const game = games.find(g => g.id === currentGame);
    return (
      <div className="min-h-screen bg-[#0a0a0f] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentGame(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-all"
              data-testid="back-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{game?.icon}</span>
              <div>
                <h2 className="text-lg font-bold text-white">{game?.name}</h2>
                <p className="text-xs text-white/50">High Score: {(highScores[currentGame] || 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="w-24" />
          </div>
          <div className="glass-card p-6">
            {renderGame()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="bg-orb w-[500px] h-[500px] bg-purple-500/30 -top-64 -left-64" />
      <div className="bg-orb w-[400px] h-[400px] bg-cyan-500/20 top-1/2 -right-48" style={{ animationDelay: '-5s' }} />
      <div className="bg-orb w-[300px] h-[300px] bg-pink-500/20 bottom-0 left-1/3" style={{ animationDelay: '-10s' }} />

      {/* Hero Section */}
      <header className="relative pt-8 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Mini Arcade</h1>
                <p className="text-xs text-white/50">{games.length} Games</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleButtonClick(() => setShowDashboard(true))}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-all"
                data-testid="open-dashboard-btn"
              >
                <Home className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleButtonClick(() => setShowLeaderboard(true))}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-all"
                data-testid="open-leaderboard-btn"
              >
                <Trophy className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleButtonClick(() => setShowProfile(true))}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-all"
                data-testid="open-profile-btn"
              >
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={toggleSound}
                className={`p-2.5 rounded-xl border transition-all ${
                  soundEnabled 
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' 
                    : 'bg-white/5 border-white/10 text-white/30'
                }`}
                data-testid="toggle-sound-btn"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Player Card */}
          <div className="glass-card p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Avatar & Info */}
              <div className="flex items-center gap-4 flex-1">
                <div className="relative">
                  {playerProfile.useCustomImage && playerProfile.customImage ? (
                    <img src={playerProfile.customImage} alt="Profile" className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-500/50" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-3xl ring-2 ring-purple-500/50">
                      {playerProfile.avatar}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ backgroundColor: playerRank.color }}>
                    <playerRank.icon className="w-3 h-3 text-black" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-white">{playerProfile.name}</span>
                    <span className="text-sm">{playerProfile.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: `${playerRank.color}20`, color: playerRank.color }}>
                      {playerRank.name}
                    </span>
                    <span className="text-xs text-white/50">{totalScore.toLocaleString()} pts</span>
                  </div>
                  {nextRank && (
                    <div className="mt-2 w-48">
                      <div className="progress-bar">
                        <div className="progress-fill bg-gradient-to-r from-purple-500 to-cyan-500" style={{ width: `${progressToNext}%` }} />
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">{(nextRank.min - totalScore).toLocaleString()} to {nextRank.name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <div className="stat-card min-w-[100px]">
                  <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                  <p className="stat-value gradient-text-gold">{totalScore.toLocaleString()}</p>
                  <p className="text-[10px] text-white/40">Total Score</p>
                </div>
                <div className="stat-card min-w-[100px]">
                  <Gamepad2 className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
                  <p className="stat-value text-cyan-400">{gamesPlayed}/{games.length}</p>
                  <p className="text-[10px] text-white/40">Played</p>
                </div>
                <div className="stat-card min-w-[100px]">
                  <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <p className="stat-value text-orange-400">{streak}</p>
                  <p className="text-[10px] text-white/40">Day Streak</p>
                </div>
                <div className="stat-card min-w-[100px]">
                  <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="stat-value text-green-400">#{Math.max(1, 21 - Math.floor(totalScore / 5000))}</p>
                  <p className="text-[10px] text-white/40">Rank</p>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Games */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" /> Featured Games
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {featuredGames.slice(0, 6).map(game => (
                <button
                  key={game.id}
                  onClick={() => handleButtonClick(() => setCurrentGame(game.id))}
                  className="glass-card glass-card-hover p-4 text-left group"
                  data-testid={`featured-${game.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl game-icon">{game.icon}</span>
                    <span className="badge-hot">Hot</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{game.name}</h3>
                  <p className="text-[10px] text-white/50">{game.desc}</p>
                  {highScores[game.id] > 0 && (
                    <p className="text-[10px] text-green-400 mt-2">{highScores[game.id].toLocaleString()} pts</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map(cat => {
              const Icon = cat.icon;
              const count = cat.id === 'all' ? games.length : games.filter(g => g.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`category-pill flex items-center gap-2 ${selectedCategory === cat.id ? 'active' : ''}`}
                  data-testid={`category-${cat.id}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-50">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredGames.map(game => (
            <button
              key={game.id}
              onClick={() => handleButtonClick(() => setCurrentGame(game.id))}
              className="game-card text-left group"
              data-testid={`game-${game.id}`}
            >
              {game.featured && (
                <div className="absolute top-3 right-3">
                  <span className="badge-hot">Hot</span>
                </div>
              )}
              <div className="text-4xl mb-3 game-icon">{game.icon}</div>
              <h3 className="text-sm font-semibold text-white mb-1">{game.name}</h3>
              <p className="text-[11px] text-white/40 mb-3">{game.desc}</p>
              <div className="flex items-center justify-between">
                {highScores[game.id] > 0 ? (
                  <span className="text-[10px] text-green-400 font-medium">{highScores[game.id].toLocaleString()}</span>
                ) : (
                  <span className="text-[10px] text-white/20">No score yet</span>
                )}
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-4 h-4 text-white" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Modals */}
      {showLeaderboard && (
        <Leaderboard 
          playerScore={totalScore}
          gamesPlayed={gamesPlayed}
          highScores={highScores}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {showProfile && (
        <ProfilePage 
          onClose={() => setShowProfile(false)}
          highScores={highScores}
          totalScore={totalScore}
          gamesPlayed={gamesPlayed}
          playerProfile={playerProfile}
          setPlayerProfile={setPlayerProfile}
          games={games}
        />
      )}

      {showDashboard && (
        <Dashboard 
          onClose={() => setShowDashboard(false)}
          onPlayGame={(gameId) => setCurrentGame(gameId)}
          highScores={highScores}
          totalScore={totalScore}
          gamesPlayed={gamesPlayed}
          playerProfile={playerProfile}
          games={games}
        />
      )}

      {/* Footer */}
      <footer className="text-center py-8 border-t border-white/5">
        <p className="text-white/30 text-xs">© 2026 Mini Arcade • {games.length} Games</p>
      </footer>
    </div>
  );
};

export default Arcade;
