import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Trophy, Star, Flame, Target, Clock, Gamepad2, 
  Award, TrendingUp, Calendar, ChevronRight, Settings,
  Volume2, VolumeX, Bell, BellOff, Trash2, Download,
  Share2, X, Edit2, Check, Crown, Medal, Zap, Camera, Upload
} from 'lucide-react';

const AVATARS = ['😎', '🥷', '👑', '👸', '🧙', '🦸', '🏃', '🤑', '⚔️', '🦹', '🎯', '🏎️', '🎮', '🧘', '🔍', '🏆', '🐣', '🌟', '🎸', '🚀', '🐱', '🐶', '🦊', '🐼', '🐨', '🦁', '🐯', '🐸', '🐙', '👽'];
const COUNTRIES = ['🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷', '🇯🇵', '🇰🇷', '🇧🇷', '🇲🇽', '🇮🇹', '🇪🇸', '🇳🇱', '🇮🇳', '🇸🇪', '🇵🇱', '🇳🇴', '🇫🇮', '🇦🇷', '🇨🇱', '🌍'];

const ACHIEVEMENTS = [
  { id: 'first_game', name: 'First Steps', desc: 'Play your first game', icon: '🎮', requirement: (s) => s.gamesPlayed >= 1 },
  { id: 'score_1k', name: 'Getting Started', desc: 'Score 1,000 points', icon: '⭐', requirement: (s) => s.totalScore >= 1000 },
  { id: 'score_10k', name: 'Rising Star', desc: 'Score 10,000 points', icon: '🌟', requirement: (s) => s.totalScore >= 10000 },
  { id: 'score_50k', name: 'Pro Player', desc: 'Score 50,000 points', icon: '💫', requirement: (s) => s.totalScore >= 50000 },
  { id: 'score_100k', name: 'Legend', desc: 'Score 100,000 points', icon: '👑', requirement: (s) => s.totalScore >= 100000 },
  { id: 'play_5', name: 'Explorer', desc: 'Play 5 different games', icon: '🔍', requirement: (s) => s.gamesPlayed >= 5 },
  { id: 'play_10', name: 'Adventurer', desc: 'Play 10 different games', icon: '🗺️', requirement: (s) => s.gamesPlayed >= 10 },
  { id: 'play_all', name: 'Completionist', desc: 'Play all 34 games', icon: '🏆', requirement: (s) => s.gamesPlayed >= 34 },
  { id: 'streak_3', name: 'On Fire', desc: 'Play 3 days in a row', icon: '🔥', requirement: (s) => s.streak >= 3 },
  { id: 'streak_7', name: 'Dedicated', desc: 'Play 7 days in a row', icon: '💪', requirement: (s) => s.streak >= 7 },
  { id: 'snake_master', name: 'Snake Charmer', desc: 'Score 500+ in Snake', icon: '🐍', requirement: (s) => (s.highScores?.snake || 0) >= 500 },
  { id: 'tetris_master', name: 'Block Builder', desc: 'Score 1000+ in Tetris', icon: '🧱', requirement: (s) => (s.highScores?.tetris || 0) >= 1000 },
];

const RANKS = [
  { name: 'BRONZE', min: 0, color: '#CD7F32', icon: Medal },
  { name: 'SILVER', min: 10000, color: '#C0C0C0', icon: Medal },
  { name: 'GOLD', min: 50000, color: '#FFD700', icon: Trophy },
  { name: 'PLATINUM', min: 100000, color: '#E5E4E2', icon: Crown },
  { name: 'DIAMOND', min: 200000, color: '#B9F2FF', icon: Crown },
  { name: 'LEGEND', min: 500000, color: '#FF00FF', icon: Star },
];

const ProfilePage = ({ 
  onClose, 
  highScores = {}, 
  totalScore = 0, 
  gamesPlayed = 0,
  playerProfile,
  setPlayerProfile,
  games = []
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(playerProfile?.name || 'Player1');
  const [editAvatar, setEditAvatar] = useState(playerProfile?.avatar || '🎮');
  const [editCountry, setEditCountry] = useState(playerProfile?.country || '🌍');
  const [editCustomImage, setEditCustomImage] = useState(playerProfile?.customImage || null);
  const [useCustomImage, setUseCustomImage] = useState(playerProfile?.useCustomImage || false);
  const [avatarTab, setAvatarTab] = useState('emoji'); // emoji or custom
  const fileInputRef = useRef(null);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('miniArcadeSettings');
    return saved ? JSON.parse(saved) : {
      sound: true,
      notifications: true,
      vibration: true,
    };
  });

  // Calculate stats
  const stats = {
    totalScore,
    gamesPlayed,
    highScores,
    streak: parseInt(localStorage.getItem('miniArcadeStreak') || '0'),
    totalSessions: parseInt(localStorage.getItem('miniArcadeSessions') || '1'),
    memberSince: playerProfile?.created || Date.now(),
  };

  // Get rank
  const getRank = (score) => {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (score >= RANKS[i].min) return RANKS[i];
    }
    return RANKS[0];
  };
  const playerRank = getRank(totalScore);
  const nextRank = RANKS[RANKS.indexOf(playerRank) + 1];

  // Get achievements
  const unlockedAchievements = ACHIEVEMENTS.filter(a => a.requirement(stats));
  const lockedAchievements = ACHIEVEMENTS.filter(a => !a.requirement(stats));

  // Get top games
  const topGames = Object.entries(highScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([id, score]) => {
      const game = games.find(g => g.id === id);
      return { ...game, score };
    })
    .filter(g => g.name);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) {
        alert('Image too large! Please use an image under 500KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditCustomImage(reader.result);
        setUseCustomImage(true);
        setAvatarTab('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile
  const saveProfile = () => {
    const newProfile = { 
      ...playerProfile, 
      name: editName, 
      avatar: editAvatar, 
      country: editCountry,
      customImage: editCustomImage,
      useCustomImage: useCustomImage,
    };
    setPlayerProfile(newProfile);
    localStorage.setItem('miniArcadeProfile', JSON.stringify(newProfile));
    setEditMode(false);
  };

  // Save settings
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('miniArcadeSettings', JSON.stringify(newSettings));
  };

  // Reset progress
  const resetProgress = () => {
    if (confirm('Are you sure? This will delete ALL your progress!')) {
      localStorage.removeItem('miniRetroArcadeScores');
      localStorage.removeItem('miniArcadeProfile');
      localStorage.removeItem('miniArcadeStreak');
      window.location.reload();
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Render avatar or custom image
  const renderProfileImage = (size = 'large') => {
    const sizeClasses = size === 'large' ? 'w-20 h-20 text-5xl' : 'w-14 h-14 text-3xl';
    
    if (useCustomImage && editCustomImage) {
      return (
        <img 
          src={editCustomImage} 
          alt="Profile" 
          className={`${size === 'large' ? 'w-20 h-20' : 'w-14 h-14'} rounded-full object-cover border-4`}
          style={{ borderColor: playerRank.color }}
        />
      );
    }
    return (
      <div className={`${sizeClasses} rounded-full bg-black/50 flex items-center justify-center border-4`} 
        style={{ borderColor: playerRank.color }}>
        {editAvatar}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-auto">
      <div className="max-w-2xl mx-auto p-4 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#00ffff] neon-text flex items-center gap-2">
            <User className="w-5 h-5" /> PROFILE
          </h1>
          <button onClick={onClose} className="text-[#ff0000] hover:scale-110 transition-transform">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-r from-[#1a0a2e] to-[#2a1a4e] rounded-xl p-6 mb-6 border-2 border-[#ff00ff]">
          {editMode ? (
            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="text-[#888] text-xs flex items-center gap-2">
                  <User className="w-3 h-3" /> USERNAME
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value.slice(0, 16))}
                  maxLength={16}
                  placeholder="Enter your name..."
                  className="w-full bg-black/50 border border-[#ff00ff] rounded-lg px-4 py-3 text-white mt-1 text-lg focus:outline-none focus:border-[#00ffff]"
                />
                <p className="text-[#666] text-[10px] mt-1">{editName.length}/16 characters</p>
              </div>

              {/* Avatar Selection Tabs */}
              <div>
                <label className="text-[#888] text-xs flex items-center gap-2 mb-2">
                  <Camera className="w-3 h-3" /> PROFILE PICTURE
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => { setAvatarTab('emoji'); setUseCustomImage(false); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      avatarTab === 'emoji' ? 'bg-[#ff00ff] text-white' : 'bg-black/50 text-[#888] border border-[#333]'
                    }`}
                  >
                    EMOJI AVATAR
                  </button>
                  <button
                    onClick={() => setAvatarTab('custom')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      avatarTab === 'custom' ? 'bg-[#ff00ff] text-white' : 'bg-black/50 text-[#888] border border-[#333]'
                    }`}
                  >
                    CUSTOM IMAGE
                  </button>
                </div>

                {avatarTab === 'emoji' ? (
                  <div className="grid grid-cols-10 gap-1">
                    {AVATARS.map(a => (
                      <button
                        key={a}
                        onClick={() => { setEditAvatar(a); setUseCustomImage(false); }}
                        className={`text-xl p-1.5 rounded transition-all hover:scale-110 ${
                          editAvatar === a && !useCustomImage ? 'bg-[#ff00ff]/30 ring-2 ring-[#ff00ff] scale-110' : 'hover:bg-[#333]'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Current custom image preview */}
                    {editCustomImage && (
                      <div className="flex items-center justify-center">
                        <div className="relative">
                          <img 
                            src={editCustomImage} 
                            alt="Preview" 
                            className="w-24 h-24 rounded-full object-cover border-4 border-[#ff00ff]"
                          />
                          <button
                            onClick={() => { setEditCustomImage(null); setUseCustomImage(false); }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-[#ff0000] rounded-full flex items-center justify-center"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Upload button */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 bg-black/50 border-2 border-dashed border-[#00ffff] rounded-lg flex items-center justify-center gap-2 hover:bg-[#00ffff]/10 transition-all"
                    >
                      <Upload className="w-5 h-5 text-[#00ffff]" />
                      <span className="text-[#00ffff] text-sm">Upload Image</span>
                    </button>
                    <p className="text-[#666] text-[10px] text-center">Max 500KB • JPG, PNG, GIF</p>
                  </div>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="text-[#888] text-xs">COUNTRY</label>
                <div className="grid grid-cols-7 gap-1 mt-1">
                  {COUNTRIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setEditCountry(c)}
                      className={`text-xl p-1.5 rounded transition-all hover:scale-110 ${
                        editCountry === c ? 'bg-[#ff00ff]/30 ring-2 ring-[#ff00ff] scale-110' : 'hover:bg-[#333]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save/Cancel buttons */}
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => {
                    setEditMode(false);
                    setEditName(playerProfile?.name || 'Player1');
                    setEditAvatar(playerProfile?.avatar || '🎮');
                    setEditCountry(playerProfile?.country || '🌍');
                    setEditCustomImage(playerProfile?.customImage || null);
                    setUseCustomImage(playerProfile?.useCustomImage || false);
                  }} 
                  className="flex-1 py-2 bg-black/50 text-[#888] rounded-lg border border-[#333]"
                >
                  CANCEL
                </button>
                <button onClick={saveProfile} className="flex-1 py-2 bg-[#00ff00] text-black rounded-lg font-bold flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> SAVE
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="relative">
                {renderProfileImage('large')}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: playerRank.color }}>
                  <playerRank.icon className="w-4 h-4 text-black" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-xl font-bold">{playerProfile?.name || 'Player1'}</span>
                  <span className="text-lg">{playerProfile?.country || '🌍'}</span>
                  <button onClick={() => setEditMode(true)} className="ml-2 text-[#888] hover:text-[#ff00ff] transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: playerRank.color }}>{playerRank.name}</span>
                  <span className="text-[#888] text-xs">• {totalScore.toLocaleString()} pts</span>
                </div>
                <p className="text-[#666] text-[10px] mt-1">
                  Member since {formatDate(stats.memberSince)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['overview', 'achievements', 'stats', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? 'bg-[#ff00ff] text-white' 
                  : 'bg-black/50 text-[#888] border border-[#333]'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-black/30 rounded-xl p-4 border border-[#333] text-center">
                <Trophy className="w-6 h-6 text-[#ffff00] mx-auto mb-2" />
                <p className="text-[#ffff00] text-xl font-bold">{totalScore.toLocaleString()}</p>
                <p className="text-[8px] text-[#888]">TOTAL SCORE</p>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-[#333] text-center">
                <Gamepad2 className="w-6 h-6 text-[#00ffff] mx-auto mb-2" />
                <p className="text-[#00ffff] text-xl font-bold">{gamesPlayed}/34</p>
                <p className="text-[8px] text-[#888]">GAMES PLAYED</p>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-[#333] text-center">
                <Award className="w-6 h-6 text-[#ff00ff] mx-auto mb-2" />
                <p className="text-[#ff00ff] text-xl font-bold">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</p>
                <p className="text-[8px] text-[#888]">ACHIEVEMENTS</p>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-[#333] text-center">
                <Flame className="w-6 h-6 text-[#ff8800] mx-auto mb-2" />
                <p className="text-[#ff8800] text-xl font-bold">{stats.streak}</p>
                <p className="text-[8px] text-[#888]">DAY STREAK</p>
              </div>
            </div>

            {/* Rank Progress */}
            {nextRank && (
              <div className="bg-black/30 rounded-xl p-4 border border-[#333]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: playerRank.color }}>{playerRank.name}</span>
                  <span className="text-sm" style={{ color: nextRank.color }}>{nextRank.name}</span>
                </div>
                <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: `${((totalScore - playerRank.min) / (nextRank.min - playerRank.min)) * 100}%`,
                      background: `linear-gradient(to right, ${playerRank.color}, ${nextRank.color})`
                    }}
                  />
                </div>
                <p className="text-center text-[#888] text-xs mt-2">
                  {(nextRank.min - totalScore).toLocaleString()} points to {nextRank.name}
                </p>
              </div>
            )}

            {/* Top Games */}
            {topGames.length > 0 && (
              <div className="bg-black/30 rounded-xl p-4 border border-[#333]">
                <h3 className="text-[#ffff00] text-sm mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" /> TOP GAMES
                </h3>
                <div className="space-y-2">
                  {topGames.map((game, i) => (
                    <div key={game.id} className="flex items-center gap-3 p-2 bg-black/30 rounded-lg">
                      <span className="text-lg w-6 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}</span>
                      <span className="text-xl">{game.icon}</span>
                      <span className="flex-1 text-sm text-white">{game.name}</span>
                      <span className="text-[#00ff00] font-mono">{game.score.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Achievements */}
            {unlockedAchievements.length > 0 && (
              <div className="bg-black/30 rounded-xl p-4 border border-[#333]">
                <h3 className="text-[#ff00ff] text-sm mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" /> RECENT ACHIEVEMENTS
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {unlockedAchievements.slice(0, 5).map(achievement => (
                    <div key={achievement.id} className="flex-shrink-0 w-20 text-center p-2 bg-[#ff00ff]/10 rounded-lg border border-[#ff00ff]/30">
                      <span className="text-2xl">{achievement.icon}</span>
                      <p className="text-[8px] text-[#ff00ff] mt-1">{achievement.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <p className="text-center text-[#888] text-sm">
              {unlockedAchievements.length}/{ACHIEVEMENTS.length} Unlocked
            </p>
            
            {/* Unlocked */}
            {unlockedAchievements.length > 0 && (
              <div>
                <h3 className="text-[#00ff00] text-xs mb-2">UNLOCKED</h3>
                <div className="grid grid-cols-2 gap-2">
                  {unlockedAchievements.map(a => (
                    <div key={a.id} className="bg-[#00ff00]/10 rounded-lg p-3 border border-[#00ff00]/30">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{a.icon}</span>
                        <div>
                          <p className="text-[#00ff00] text-xs font-bold">{a.name}</p>
                          <p className="text-[#888] text-[10px]">{a.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked */}
            {lockedAchievements.length > 0 && (
              <div>
                <h3 className="text-[#888] text-xs mb-2">LOCKED</h3>
                <div className="grid grid-cols-2 gap-2">
                  {lockedAchievements.map(a => (
                    <div key={a.id} className="bg-black/30 rounded-lg p-3 border border-[#333] opacity-50">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl grayscale">🔒</span>
                        <div>
                          <p className="text-[#888] text-xs font-bold">{a.name}</p>
                          <p className="text-[#666] text-[10px]">{a.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="bg-black/30 rounded-xl p-4 border border-[#333]">
              <h3 className="text-[#00ffff] text-sm mb-4">GAME STATISTICS</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-[#333]">
                  <span className="text-[#888] text-sm">Total Score</span>
                  <span className="text-[#00ff00] font-mono">{totalScore.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#333]">
                  <span className="text-[#888] text-sm">Games Played</span>
                  <span className="text-[#00ffff] font-mono">{gamesPlayed}/34</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#333]">
                  <span className="text-[#888] text-sm">Current Rank</span>
                  <span style={{ color: playerRank.color }}>{playerRank.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#333]">
                  <span className="text-[#888] text-sm">Achievements</span>
                  <span className="text-[#ff00ff] font-mono">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#333]">
                  <span className="text-[#888] text-sm">Day Streak</span>
                  <span className="text-[#ff8800] font-mono">{stats.streak} days</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#333]">
                  <span className="text-[#888] text-sm">Total Sessions</span>
                  <span className="text-[#ffff00] font-mono">{stats.totalSessions}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#888] text-sm">Member Since</span>
                  <span className="text-[#888] font-mono">{formatDate(stats.memberSince)}</span>
                </div>
              </div>
            </div>

            {/* All Game Scores */}
            <div className="bg-black/30 rounded-xl p-4 border border-[#333]">
              <h3 className="text-[#ffff00] text-sm mb-4">ALL GAME SCORES</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {games.map(game => (
                  <div key={game.id} className="flex items-center gap-2 p-2 bg-black/30 rounded-lg">
                    <span className="text-lg">{game.icon}</span>
                    <span className="flex-1 text-xs text-white">{game.name}</span>
                    <span className="text-[8px] text-[#666] uppercase">{game.category}</span>
                    <span className={`font-mono text-sm ${highScores[game.id] ? 'text-[#00ff00]' : 'text-[#333]'}`}>
                      {(highScores[game.id] || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-black/30 rounded-xl p-4 border border-[#333]">
              <h3 className="text-[#00ffff] text-sm mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4" /> PREFERENCES
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {settings.sound ? <Volume2 className="w-4 h-4 text-[#00ff00]" /> : <VolumeX className="w-4 h-4 text-[#888]" />}
                    <span className="text-sm text-white">Sound Effects</span>
                  </div>
                  <button 
                    onClick={() => updateSetting('sound', !settings.sound)}
                    className={`w-12 h-6 rounded-full transition-all ${settings.sound ? 'bg-[#00ff00]' : 'bg-[#333]'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-all ${settings.sound ? 'ml-6' : 'ml-0.5'}`} />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {settings.notifications ? <Bell className="w-4 h-4 text-[#00ff00]" /> : <BellOff className="w-4 h-4 text-[#888]" />}
                    <span className="text-sm text-white">Notifications</span>
                  </div>
                  <button 
                    onClick={() => updateSetting('notifications', !settings.notifications)}
                    className={`w-12 h-6 rounded-full transition-all ${settings.notifications ? 'bg-[#00ff00]' : 'bg-[#333]'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-all ${settings.notifications ? 'ml-6' : 'ml-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-4 border border-[#333]">
              <h3 className="text-[#ffff00] text-sm mb-4">DATA</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 bg-black/30 rounded-lg hover:bg-black/50 transition-all">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-[#00ffff]" />
                    <span className="text-sm text-white">Share Profile</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#888]" />
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-black/30 rounded-lg hover:bg-black/50 transition-all">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-[#00ff00]" />
                    <span className="text-sm text-white">Export Data</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#888]" />
                </button>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-4 border border-[#ff0000]/30">
              <h3 className="text-[#ff0000] text-sm mb-4">DANGER ZONE</h3>
              <button 
                onClick={resetProgress}
                className="w-full flex items-center justify-center gap-2 p-3 bg-[#ff0000]/20 rounded-lg border border-[#ff0000]/30 hover:bg-[#ff0000]/30 transition-all"
              >
                <Trash2 className="w-4 h-4 text-[#ff0000]" />
                <span className="text-sm text-[#ff0000]">Reset All Progress</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
