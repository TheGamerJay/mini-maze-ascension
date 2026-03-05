import React, { useState, useEffect } from 'react';
import { 
  Home, Trophy, Flame, Target, Clock, Gamepad2, 
  TrendingUp, Calendar, ChevronRight, Star, Zap,
  Award, Gift, Play, RefreshCw, X, CheckCircle
} from 'lucide-react';
import { getDailyChallenges, getChallengeProgress, getTodayXP } from '../utils/dailyChallenges';
import { getStreakStatus, getCalendarData } from '../utils/streakTracker';

const Dashboard = ({ 
  onClose, 
  onPlayGame,
  highScores = {}, 
  totalScore = 0, 
  gamesPlayed = 0,
  playerProfile,
  games = []
}) => {
  const [dailyGame, setDailyGame] = useState(null);
  const [recentGames, setRecentGames] = useState([]);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [calendarData, setCalendarData] = useState([]);

  useEffect(() => {
    // Load daily challenges
    const dailyChallenges = getDailyChallenges();
    setChallenges(dailyChallenges);
    
    // Load streak data
    const streak = getStreakStatus();
    setStreakData(streak);
    
    // Load calendar data
    const calendar = getCalendarData(7);
    setCalendarData(calendar);
    
    // Get daily challenge game (changes daily based on date)
    const today = new Date().toDateString();
    const savedDaily = localStorage.getItem('miniArcadeDailyGame');
    const savedDate = localStorage.getItem('miniArcadeDailyDate');
    
    if (savedDate === today && savedDaily) {
      setDailyGame(games.find(g => g.id === savedDaily));
      setDailyCompleted(localStorage.getItem('miniArcadeDailyCompleted') === 'true');
    } else {
      // Pick new daily game
      const randomGame = games[Math.floor(Math.random() * games.length)];
      setDailyGame(randomGame);
      localStorage.setItem('miniArcadeDailyGame', randomGame.id);
      localStorage.setItem('miniArcadeDailyDate', today);
      localStorage.setItem('miniArcadeDailyCompleted', 'false');
      setDailyCompleted(false);
    }

    // Get recent games from localStorage
    const recent = JSON.parse(localStorage.getItem('miniArcadeRecentGames') || '[]');
    setRecentGames(recent.slice(0, 5).map(id => games.find(g => g.id === id)).filter(Boolean));
  }, [games]);

  // Calculate time until daily reset
  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Get suggested games (games not played yet or with low scores)
  const suggestedGames = games
    .filter(g => !highScores[g.id] || highScores[g.id] < 100)
    .slice(0, 4);

  // Get hot streak games (games with recent high scores)
  const hotGames = Object.entries(highScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([id]) => games.find(g => g.id === id))
    .filter(Boolean);

  // Quick play random game
  const playRandom = () => {
    const randomGame = games[Math.floor(Math.random() * games.length)];
    onPlayGame(randomGame.id);
    onClose();
  };

  // Play daily challenge
  const playDaily = () => {
    if (dailyGame) {
      onPlayGame(dailyGame.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-auto">
      <div className="max-w-2xl mx-auto p-4 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#ffff00] neon-text flex items-center gap-2">
            <Home className="w-5 h-5" /> DASHBOARD
          </h1>
          <button onClick={onClose} className="text-[#ff0000] hover:scale-110 transition-transform">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Daily Challenge Card */}
        {dailyGame && (
          <div className="bg-gradient-to-r from-[#ff8800]/20 to-[#ffff00]/20 rounded-xl p-4 mb-6 border-2 border-[#ff8800] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#ff8800] text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg">
              DAILY CHALLENGE
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="w-16 h-16 rounded-xl bg-black/50 flex items-center justify-center text-4xl border-2 border-[#ff8800]">
                {dailyGame.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-[#ff8800] text-lg font-bold">{dailyGame.name}</h3>
                <p className="text-[#888] text-xs">{dailyGame.desc}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Gift className="w-4 h-4 text-[#ffff00]" />
                  <span className="text-[#ffff00] text-xs">+500 BONUS POINTS</span>
                </div>
              </div>
              <div className="text-right">
                {dailyCompleted ? (
                  <div className="text-[#00ff00] text-center">
                    <Award className="w-8 h-8 mx-auto" />
                    <p className="text-[10px]">COMPLETED!</p>
                  </div>
                ) : (
                  <button 
                    onClick={playDaily}
                    className="bg-[#ff8800] text-black px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform"
                  >
                    <Play className="w-4 h-4" /> PLAY
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-3 text-[#888] text-[10px]">
              <Clock className="w-3 h-3" />
              <span>Resets in {getTimeUntilReset()}</span>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button 
            onClick={playRandom}
            className="bg-gradient-to-r from-[#ff00ff]/20 to-[#00ffff]/20 rounded-xl p-4 border border-[#ff00ff] hover:scale-105 transition-transform"
          >
            <RefreshCw className="w-8 h-8 text-[#ff00ff] mx-auto mb-2" />
            <p className="text-white text-sm font-bold">RANDOM GAME</p>
            <p className="text-[#888] text-[10px]">Feeling lucky?</p>
          </button>
          <button 
            onClick={onClose}
            className="bg-gradient-to-r from-[#00ff00]/20 to-[#ffff00]/20 rounded-xl p-4 border border-[#00ff00] hover:scale-105 transition-transform"
          >
            <Gamepad2 className="w-8 h-8 text-[#00ff00] mx-auto mb-2" />
            <p className="text-white text-sm font-bold">ALL GAMES</p>
            <p className="text-[#888] text-[10px]">Browse {games.length} games</p>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-black/30 rounded-xl p-3 border border-[#333] text-center">
            <Trophy className="w-5 h-5 text-[#ffff00] mx-auto mb-1" />
            <p className="text-[#ffff00] text-lg font-bold">{totalScore.toLocaleString()}</p>
            <p className="text-[8px] text-[#888]">TOTAL SCORE</p>
          </div>
          <div className="bg-black/30 rounded-xl p-3 border border-[#333] text-center">
            <Star className="w-5 h-5 text-[#00ffff] mx-auto mb-1" />
            <p className="text-[#00ffff] text-lg font-bold">{gamesPlayed}</p>
            <p className="text-[8px] text-[#888]">GAMES PLAYED</p>
          </div>
          <div className="bg-black/30 rounded-xl p-3 border border-[#333] text-center">
            <Flame className="w-5 h-5 text-[#ff8800] mx-auto mb-1" />
            <p className="text-[#ff8800] text-lg font-bold">{streakData?.currentStreak || 0}</p>
            <p className="text-[8px] text-[#888]">DAY STREAK</p>
          </div>
        </div>

        {/* Week Calendar */}
        {calendarData.length > 0 && (
          <div className="bg-black/30 rounded-xl p-4 border border-[#333] mb-6">
            <h3 className="text-[#ff8800] text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> THIS WEEK
            </h3>
            <div className="flex justify-between">
              {calendarData.map((day, i) => (
                <div key={i} className="text-center">
                  <p className="text-[10px] text-[#888] mb-1">{day.dayName}</p>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    day.isToday 
                      ? 'bg-[#ff8800] text-black ring-2 ring-[#ff8800]/50' 
                      : day.played 
                        ? 'bg-[#00ff00]/20 text-[#00ff00] border border-[#00ff00]' 
                        : 'bg-black/50 text-[#666] border border-[#333]'
                  }`}>
                    {day.played ? '✓' : day.dayNum}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Challenges */}
        {challenges.length > 0 && (
          <div className="bg-black/30 rounded-xl p-4 border border-[#333] mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#ff00ff] text-sm flex items-center gap-2">
                <Target className="w-4 h-4" /> DAILY CHALLENGES
              </h3>
              <span className="text-[#ff00ff] text-xs">+{getTodayXP()} XP earned</span>
            </div>
            <div className="space-y-2">
              {challenges.map((challenge, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    challenge.completed 
                      ? 'bg-[#00ff00]/10 border-[#00ff00]/30' 
                      : 'bg-black/30 border-[#333]'
                  }`}
                >
                  <span className="text-2xl">{challenge.icon}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${challenge.completed ? 'text-[#00ff00]' : 'text-white'}`}>
                      {challenge.name}
                    </p>
                    <p className="text-[10px] text-[#888]">{challenge.desc}</p>
                    {!challenge.completed && (
                      <div className="mt-1 h-1.5 bg-black/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#ff00ff] to-[#00ffff] transition-all"
                          style={{ width: `${Math.min(100, (challenge.progress / challenge.target) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    {challenge.completed ? (
                      <CheckCircle className="w-6 h-6 text-[#00ff00]" />
                    ) : (
                      <span className="text-[#ffff00] text-xs font-bold">+{challenge.xp} XP</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Games */}
        {recentGames.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[#00ffff] text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" /> CONTINUE PLAYING
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentGames.map(game => (
                <button
                  key={game.id}
                  onClick={() => { onPlayGame(game.id); onClose(); }}
                  className="flex-shrink-0 w-24 bg-black/30 rounded-xl p-3 border border-[#333] hover:border-[#00ffff] transition-all text-center"
                >
                  <span className="text-3xl">{game.icon}</span>
                  <p className="text-[#00ffff] text-[10px] mt-1 truncate">{game.name}</p>
                  <p className="text-[#00ff00] text-[10px]">{(highScores[game.id] || 0).toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hot Streak */}
        {hotGames.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[#ff8800] text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> YOUR TOP GAMES
            </h3>
            <div className="space-y-2">
              {hotGames.map((game, i) => (
                <button
                  key={game.id}
                  onClick={() => { onPlayGame(game.id); onClose(); }}
                  className="w-full flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-[#333] hover:border-[#ff8800] transition-all"
                >
                  <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  <span className="text-2xl">{game.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="text-white text-sm">{game.name}</p>
                    <p className="text-[#888] text-[10px]">{game.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#00ff00] font-mono">{(highScores[game.id] || 0).toLocaleString()}</p>
                    <p className="text-[8px] text-[#888]">HIGH SCORE</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#888]" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Try Something New */}
        {suggestedGames.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[#ff00ff] text-sm mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" /> TRY SOMETHING NEW
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {suggestedGames.map(game => (
                <button
                  key={game.id}
                  onClick={() => { onPlayGame(game.id); onClose(); }}
                  className="flex items-center gap-2 p-3 bg-black/30 rounded-xl border border-[#333] hover:border-[#ff00ff] transition-all"
                >
                  <span className="text-2xl">{game.icon}</span>
                  <div className="text-left">
                    <p className="text-white text-xs">{game.name}</p>
                    <p className="text-[#888] text-[10px]">{game.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Goals Progress */}
        <div className="bg-black/30 rounded-xl p-4 border border-[#333]">
          <h3 className="text-[#ffff00] text-sm mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" /> WEEKLY GOALS
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#888]">Score 10,000 points</span>
                <span className="text-[#00ff00]">{Math.min(totalScore, 10000).toLocaleString()}/10,000</span>
              </div>
              <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#00ff00] transition-all"
                  style={{ width: `${Math.min(100, (totalScore / 10000) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#888]">Play 10 games</span>
                <span className="text-[#00ffff]">{gamesPlayed}/10</span>
              </div>
              <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#00ffff] transition-all"
                  style={{ width: `${Math.min(100, (gamesPlayed / 10) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
