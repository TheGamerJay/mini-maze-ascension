import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Star, Flame, Target, Zap, Gift, ChevronRight, User, Edit2, X } from 'lucide-react';

// Fake players for global leaderboard simulation
const FAKE_PLAYERS = [
  { name: 'xXProGamerXx', avatar: '😎', score: 125000, country: '🇺🇸' },
  { name: 'NinjaKing', avatar: '🥷', score: 118500, country: '🇯🇵' },
  { name: 'ArcadeMaster', avatar: '👑', score: 112000, country: '🇬🇧' },
  { name: 'RetroQueen', avatar: '👸', score: 98700, country: '🇫🇷' },
  { name: 'PixelWizard', avatar: '🧙', score: 95200, country: '🇩🇪' },
  { name: 'GameLegend', avatar: '🦸', score: 89000, country: '🇧🇷' },
  { name: 'SpeedRunner', avatar: '🏃', score: 84500, country: '🇰🇷' },
  { name: 'CoinCollector', avatar: '🤑', score: 78900, country: '🇨🇦' },
  { name: 'BossSlayer', avatar: '⚔️', score: 72300, country: '🇦🇺' },
  { name: 'HighScoreHero', avatar: '🦹', score: 68000, country: '🇲🇽' },
  { name: 'ArcadeAce', avatar: '🎯', score: 62500, country: '🇮🇹' },
  { name: 'RetroRacer', avatar: '🏎️', score: 58000, country: '🇪🇸' },
  { name: 'PixelPro', avatar: '🎮', score: 52000, country: '🇳🇱' },
  { name: 'GameGuru', avatar: '🧘', score: 45000, country: '🇮🇳' },
  { name: 'ScoreSeeker', avatar: '🔍', score: 38000, country: '🇸🇪' },
  { name: 'CasualChamp', avatar: '🏆', score: 32000, country: '🇵🇱' },
  { name: 'RetroRookie', avatar: '🐣', score: 25000, country: '🇳🇴' },
  { name: 'ArcadeNewbie', avatar: '🌟', score: 18000, country: '🇫🇮' },
  { name: 'PixelPunk', avatar: '🎸', score: 12000, country: '🇦🇷' },
  { name: 'GameStarter', avatar: '🚀', score: 5000, country: '🇨🇱' },
];

const AVATARS = ['😎', '🥷', '👑', '👸', '🧙', '🦸', '🏃', '🤑', '⚔️', '🦹', '🎯', '🏎️', '🎮', '🧘', '🔍', '🏆', '🐣', '🌟', '🎸', '🚀', '🐱', '🐶', '🦊', '🐼', '🐨', '🦁', '🐯', '🐸', '🐙', '👽'];

const COUNTRIES = ['🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷', '🇯🇵', '🇰🇷', '🇧🇷', '🇲🇽', '🇮🇹', '🇪🇸', '🇳🇱', '🇮🇳', '🇸🇪', '🇵🇱', '🇳🇴', '🇫🇮', '🇦🇷', '🇨🇱', '🌍'];

const RANKS = [
  { name: 'BRONZE', min: 0, color: '#CD7F32', icon: Medal },
  { name: 'SILVER', min: 10000, color: '#C0C0C0', icon: Medal },
  { name: 'GOLD', min: 50000, color: '#FFD700', icon: Trophy },
  { name: 'PLATINUM', min: 100000, color: '#E5E4E2', icon: Crown },
  { name: 'DIAMOND', min: 200000, color: '#B9F2FF', icon: Crown },
  { name: 'LEGEND', min: 500000, color: '#FF00FF', icon: Star },
];

const WEEKLY_CHALLENGES = [
  { id: 'score_10k', name: 'Score 10,000 points', target: 10000, reward: 500, icon: Target },
  { id: 'play_10', name: 'Play 10 different games', target: 10, reward: 300, icon: Zap },
  { id: 'streak_5', name: 'Win 5 games in a row', target: 5, reward: 400, icon: Flame },
];

const Leaderboard = ({ playerScore, gamesPlayed, onClose, highScores }) => {
  const [playerProfile, setPlayerProfile] = useState(() => {
    const saved = localStorage.getItem('miniArcadeProfile');
    return saved ? JSON.parse(saved) : {
      name: 'Player1',
      avatar: '🎮',
      country: '🌍',
      created: Date.now(),
    };
  });
  const [activeTab, setActiveTab] = useState('global');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(playerProfile.name);
  const [editAvatar, setEditAvatar] = useState(playerProfile.avatar);
  const [editCountry, setEditCountry] = useState(playerProfile.country);

  // Calculate weekly progress
  const weeklyProgress = {
    score_10k: playerScore,
    play_10: gamesPlayed,
    streak_5: Math.min(5, Math.floor(playerScore / 5000)), // Simulated
  };

  // Get player rank
  const getRank = (score) => {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (score >= RANKS[i].min) return RANKS[i];
    }
    return RANKS[0];
  };

  const playerRank = getRank(playerScore);
  const nextRank = RANKS[RANKS.indexOf(playerRank) + 1];

  // Generate leaderboard with player
  const getLeaderboard = () => {
    const allPlayers = [
      ...FAKE_PLAYERS,
      { name: playerProfile.name, avatar: playerProfile.avatar, score: playerScore, country: playerProfile.country, isPlayer: true }
    ].sort((a, b) => b.score - a.score);
    
    return allPlayers.map((p, i) => ({ ...p, rank: i + 1 }));
  };

  const leaderboard = getLeaderboard();
  const playerPosition = leaderboard.findIndex(p => p.isPlayer) + 1;

  // Save profile
  const saveProfile = () => {
    const newProfile = { ...playerProfile, name: editName, avatar: editAvatar, country: editCountry };
    setPlayerProfile(newProfile);
    localStorage.setItem('miniArcadeProfile', JSON.stringify(newProfile));
    setShowEditProfile(false);
  };

  // Get weekly reset time
  const getWeeklyReset = () => {
    const now = new Date();
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
    const resetDate = new Date(now);
    resetDate.setDate(now.getDate() + daysUntilSunday);
    resetDate.setHours(0, 0, 0, 0);
    const diff = resetDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-auto">
      <div className="max-w-lg mx-auto p-4 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#ffff00] neon-text flex items-center gap-2">
            <Trophy className="w-6 h-6" /> LEADERBOARD
          </h1>
          <button onClick={onClose} className="text-[#ff0000] hover:scale-110 transition-transform">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Player Card */}
        <div className="bg-gradient-to-r from-[#1a0a2e] to-[#2a1a4e] rounded-xl p-4 mb-6 border-2 border-[#ff00ff]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center text-4xl border-2 border-[#00ffff]">
                {playerProfile.avatar}
              </div>
              <button 
                onClick={() => setShowEditProfile(true)}
                className="absolute -bottom-1 -right-1 bg-[#ff00ff] rounded-full p-1"
              >
                <Edit2 className="w-3 h-3 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">{playerProfile.name}</span>
                <span>{playerProfile.country}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <playerRank.icon className="w-4 h-4" style={{ color: playerRank.color }} />
                <span className="text-sm" style={{ color: playerRank.color }}>{playerRank.name}</span>
              </div>
              <p className="text-[#00ff00] text-lg font-mono mt-1">{playerScore.toLocaleString()} pts</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-[#ffff00]">#{playerPosition}</p>
              <p className="text-[8px] text-[#888]">WORLD RANK</p>
            </div>
          </div>

          {/* Progress to next rank */}
          {nextRank && (
            <div className="mt-4">
              <div className="flex justify-between text-[10px] mb-1">
                <span style={{ color: playerRank.color }}>{playerRank.name}</span>
                <span style={{ color: nextRank.color }}>{nextRank.name}</span>
              </div>
              <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, ((playerScore - playerRank.min) / (nextRank.min - playerRank.min)) * 100)}%`,
                    background: `linear-gradient(to right, ${playerRank.color}, ${nextRank.color})`
                  }}
                />
              </div>
              <p className="text-[10px] text-[#888] mt-1 text-center">
                {(nextRank.min - playerScore).toLocaleString()} pts to {nextRank.name}
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {['global', 'weekly', 'rewards'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab 
                  ? 'bg-[#ff00ff] text-white' 
                  : 'bg-black/50 text-[#888] border border-[#333]'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Global Leaderboard */}
        {activeTab === 'global' && (
          <div className="space-y-2">
            {/* Top 3 */}
            <div className="flex justify-center gap-4 mb-6">
              {[1, 0, 2].map(i => {
                const player = leaderboard[i];
                if (!player) return null;
                const isFirst = i === 0;
                return (
                  <div 
                    key={i}
                    className={`text-center ${isFirst ? 'order-2' : i === 1 ? 'order-1' : 'order-3'}`}
                  >
                    <div className={`relative ${isFirst ? 'scale-125 mb-4' : ''}`}>
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 
                        ${player.isPlayer ? 'bg-[#ff00ff]/30 border-[#ff00ff]' : 'bg-black/50 border-[#333]'}
                        ${isFirst ? 'border-[#FFD700]' : i === 1 ? 'border-[#C0C0C0]' : 'border-[#CD7F32]'}`}
                      >
                        {player.avatar}
                      </div>
                      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${isFirst ? 'bg-[#FFD700] text-black' : i === 1 ? 'bg-[#C0C0C0] text-black' : 'bg-[#CD7F32] text-white'}`}
                      >
                        {player.rank}
                      </div>
                    </div>
                    <p className={`text-xs mt-1 ${player.isPlayer ? 'text-[#ff00ff]' : 'text-white'}`}>
                      {player.name.slice(0, 8)}
                    </p>
                    <p className="text-[10px] text-[#00ff00]">{player.score.toLocaleString()}</p>
                  </div>
                );
              })}
            </div>

            {/* Rest of leaderboard */}
            <div className="bg-black/30 rounded-xl overflow-hidden">
              {leaderboard.slice(3, 20).map(player => (
                <div 
                  key={player.rank}
                  className={`flex items-center gap-3 p-3 border-b border-[#222] ${
                    player.isPlayer ? 'bg-[#ff00ff]/20' : ''
                  }`}
                >
                  <span className="w-8 text-center text-sm font-bold text-[#888]">#{player.rank}</span>
                  <span className="text-xl">{player.avatar}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className={`text-sm ${player.isPlayer ? 'text-[#ff00ff]' : 'text-white'}`}>
                        {player.name}
                      </span>
                      <span className="text-xs">{player.country}</span>
                    </div>
                  </div>
                  <span className="text-[#00ff00] font-mono text-sm">{player.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Challenges */}
        {activeTab === 'weekly' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-[#ffff00] text-sm">WEEKLY CHALLENGE</p>
              <p className="text-[#888] text-xs">Resets in {getWeeklyReset()}</p>
            </div>

            {WEEKLY_CHALLENGES.map(challenge => {
              const progress = weeklyProgress[challenge.id] || 0;
              const completed = progress >= challenge.target;
              const Icon = challenge.icon;
              
              return (
                <div 
                  key={challenge.id}
                  className={`p-4 rounded-xl border-2 ${
                    completed ? 'bg-[#00ff00]/10 border-[#00ff00]' : 'bg-black/30 border-[#333]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      completed ? 'bg-[#00ff00]/20' : 'bg-[#333]'
                    }`}>
                      <Icon className={`w-5 h-5 ${completed ? 'text-[#00ff00]' : 'text-[#888]'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{challenge.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#00ff00] transition-all"
                            style={{ width: `${Math.min(100, (progress / challenge.target) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[#888]">
                          {Math.min(progress, challenge.target).toLocaleString()}/{challenge.target.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-[#ffff00]">
                        <Gift className="w-3 h-3" />
                        <span className="text-xs">+{challenge.reward}</span>
                      </div>
                      {completed && <span className="text-[8px] text-[#00ff00]">CLAIMED</span>}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Season Pass Preview */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#ff00ff]/20 to-[#00ffff]/20 border border-[#ff00ff]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#ff00ff] text-sm font-bold">SEASON REWARDS</p>
                  <p className="text-[#888] text-xs">Climb ranks for exclusive rewards!</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#ff00ff]" />
              </div>
            </div>
          </div>
        )}

        {/* Rewards/Ranks */}
        {activeTab === 'rewards' && (
          <div className="space-y-3">
            <p className="text-center text-[#888] text-xs mb-4">Earn points to unlock ranks!</p>
            
            {RANKS.map((rank, i) => {
              const Icon = rank.icon;
              const unlocked = playerScore >= rank.min;
              const current = playerRank.name === rank.name;
              
              return (
                <div 
                  key={rank.name}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    current ? 'border-[#ff00ff] bg-[#ff00ff]/10 scale-105' : 
                    unlocked ? 'border-[#333] bg-black/30' : 'border-[#222] bg-black/10 opacity-50'
                  }`}
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${rank.color}20`, border: `2px solid ${rank.color}` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: rank.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold" style={{ color: rank.color }}>{rank.name}</p>
                    <p className="text-[#888] text-xs">{rank.min.toLocaleString()}+ points</p>
                  </div>
                  {current && (
                    <span className="text-[#ff00ff] text-xs bg-[#ff00ff]/20 px-2 py-1 rounded-full">CURRENT</span>
                  )}
                  {unlocked && !current && (
                    <span className="text-[#00ff00] text-xs">✓</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4">
            <div className="bg-[#1a0a2e] rounded-xl p-6 w-full max-w-sm border-2 border-[#00ffff]">
              <h2 className="text-xl text-[#00ffff] text-center mb-4">EDIT PROFILE</h2>
              
              <div className="mb-4">
                <label className="text-[#888] text-xs">NAME</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value.slice(0, 12))}
                  maxLength={12}
                  className="w-full bg-black/50 border border-[#333] rounded-lg px-3 py-2 text-white mt-1"
                />
              </div>

              <div className="mb-4">
                <label className="text-[#888] text-xs">AVATAR</label>
                <div className="grid grid-cols-10 gap-1 mt-1">
                  {AVATARS.map(a => (
                    <button
                      key={a}
                      onClick={() => setEditAvatar(a)}
                      className={`text-xl p-1 rounded ${editAvatar === a ? 'bg-[#ff00ff]/30 ring-2 ring-[#ff00ff]' : ''}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="text-[#888] text-xs">COUNTRY</label>
                <div className="grid grid-cols-7 gap-1 mt-1">
                  {COUNTRIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setEditCountry(c)}
                      className={`text-xl p-1 rounded ${editCountry === c ? 'bg-[#ff00ff]/30 ring-2 ring-[#ff00ff]' : ''}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 py-2 bg-black/50 text-[#888] rounded-lg border border-[#333]"
                >
                  CANCEL
                </button>
                <button
                  onClick={saveProfile}
                  className="flex-1 py-2 bg-[#00ff00] text-black rounded-lg font-bold"
                >
                  SAVE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
