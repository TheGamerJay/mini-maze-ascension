// Achievement System for Mini Arcade

const STORAGE_KEY = 'miniArcadeAchievements';

export const ACHIEVEMENTS = [
  // Score-based achievements
  { id: 'first_game', name: 'First Steps', desc: 'Play your first game', icon: '🎮', points: 10, category: 'general' },
  { id: 'score_1k', name: 'Getting Started', desc: 'Score 1,000 total points', icon: '⭐', points: 25, category: 'score' },
  { id: 'score_5k', name: 'Point Collector', desc: 'Score 5,000 total points', icon: '🌟', points: 50, category: 'score' },
  { id: 'score_10k', name: 'Rising Star', desc: 'Score 10,000 total points', icon: '💫', points: 100, category: 'score' },
  { id: 'score_25k', name: 'Score Master', desc: 'Score 25,000 total points', icon: '🏅', points: 150, category: 'score' },
  { id: 'score_50k', name: 'Pro Player', desc: 'Score 50,000 total points', icon: '🎖️', points: 200, category: 'score' },
  { id: 'score_100k', name: 'Legend', desc: 'Score 100,000 total points', icon: '👑', points: 500, category: 'score' },

  // Games played achievements
  { id: 'play_5', name: 'Explorer', desc: 'Play 5 different games', icon: '🔍', points: 30, category: 'exploration' },
  { id: 'play_10', name: 'Adventurer', desc: 'Play 10 different games', icon: '🗺️', points: 60, category: 'exploration' },
  { id: 'play_20', name: 'Game Hopper', desc: 'Play 20 different games', icon: '🎪', points: 100, category: 'exploration' },
  { id: 'play_all', name: 'Completionist', desc: 'Play all 34 games', icon: '🏆', points: 250, category: 'exploration' },

  // Streak achievements
  { id: 'streak_3', name: 'On Fire', desc: 'Play 3 days in a row', icon: '🔥', points: 40, category: 'streak' },
  { id: 'streak_7', name: 'Dedicated', desc: 'Play 7 days in a row', icon: '💪', points: 80, category: 'streak' },
  { id: 'streak_14', name: 'Committed', desc: 'Play 14 days in a row', icon: '🎯', points: 150, category: 'streak' },
  { id: 'streak_30', name: 'Unstoppable', desc: 'Play 30 days in a row', icon: '⚡', points: 300, category: 'streak' },

  // Game-specific achievements
  { id: 'snake_50', name: 'Baby Snake', desc: 'Score 50+ in Snake', icon: '🐍', points: 20, category: 'game' },
  { id: 'snake_200', name: 'Snake Charmer', desc: 'Score 200+ in Snake', icon: '🐍', points: 50, category: 'game' },
  { id: 'snake_500', name: 'Snake Master', desc: 'Score 500+ in Snake', icon: '🐍', points: 100, category: 'game' },
  { id: 'tetris_500', name: 'Block Stacker', desc: 'Score 500+ in Tetris', icon: '🧱', points: 30, category: 'game' },
  { id: 'tetris_2000', name: 'Tetris Pro', desc: 'Score 2000+ in Tetris', icon: '🧱', points: 80, category: 'game' },
  { id: 'flappy_10', name: 'First Flight', desc: 'Score 10+ in Flappy Bird', icon: '🐦', points: 30, category: 'game' },
  { id: 'flappy_50', name: 'Sky High', desc: 'Score 50+ in Flappy Bird', icon: '🐦', points: 100, category: 'game' },
  { id: '2048_win', name: '2048 Victor', desc: 'Reach 2048 tile', icon: '🔢', points: 150, category: 'game' },
  { id: 'dino_500', name: 'Dino Runner', desc: 'Score 500+ in T-Rex Run', icon: '🦖', points: 50, category: 'game' },

  // Special achievements
  { id: 'night_owl', name: 'Night Owl', desc: 'Play between 12am-5am', icon: '🦉', points: 30, category: 'special' },
  { id: 'early_bird', name: 'Early Bird', desc: 'Play between 5am-7am', icon: '🌅', points: 30, category: 'special' },
  { id: 'weekend_warrior', name: 'Weekend Warrior', desc: 'Play on Saturday and Sunday', icon: '🎉', points: 40, category: 'special' },
  { id: 'perfect_week', name: 'Perfect Week', desc: 'Play every day for a week', icon: '📅', points: 100, category: 'special' },
];

// Get saved achievement data
export function getAchievementData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    unlocked: [],
    unlockedAt: {},
    notified: [],
  };
}

// Save achievement data
function saveAchievementData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Check if an achievement should be unlocked
function checkAchievement(achievementId, stats) {
  const { totalScore, gamesPlayed, streak, highScores, playHistory } = stats;
  
  switch (achievementId) {
    // General
    case 'first_game': return gamesPlayed >= 1;
    
    // Score-based
    case 'score_1k': return totalScore >= 1000;
    case 'score_5k': return totalScore >= 5000;
    case 'score_10k': return totalScore >= 10000;
    case 'score_25k': return totalScore >= 25000;
    case 'score_50k': return totalScore >= 50000;
    case 'score_100k': return totalScore >= 100000;
    
    // Games played
    case 'play_5': return gamesPlayed >= 5;
    case 'play_10': return gamesPlayed >= 10;
    case 'play_20': return gamesPlayed >= 20;
    case 'play_all': return gamesPlayed >= 34;
    
    // Streak
    case 'streak_3': return streak >= 3;
    case 'streak_7': return streak >= 7;
    case 'streak_14': return streak >= 14;
    case 'streak_30': return streak >= 30;
    
    // Game-specific
    case 'snake_50': return (highScores?.snake || 0) >= 50;
    case 'snake_200': return (highScores?.snake || 0) >= 200;
    case 'snake_500': return (highScores?.snake || 0) >= 500;
    case 'tetris_500': return (highScores?.tetris || 0) >= 500;
    case 'tetris_2000': return (highScores?.tetris || 0) >= 2000;
    case 'flappy_10': return (highScores?.flappy || 0) >= 10;
    case 'flappy_50': return (highScores?.flappy || 0) >= 50;
    case '2048_win': return (highScores?.['2048'] || 0) >= 2048;
    case 'dino_500': return (highScores?.dino || 0) >= 500;
    
    // Time-based
    case 'night_owl': {
      const hour = new Date().getHours();
      return hour >= 0 && hour < 5;
    }
    case 'early_bird': {
      const hour = new Date().getHours();
      return hour >= 5 && hour < 7;
    }
    case 'weekend_warrior': {
      if (!playHistory || playHistory.length < 2) return false;
      const hasSaturday = playHistory.some(d => new Date(d).getDay() === 6);
      const hasSunday = playHistory.some(d => new Date(d).getDay() === 0);
      return hasSaturday && hasSunday;
    }
    
    default: return false;
  }
}

// Check all achievements and return newly unlocked ones
export function checkAchievements(stats) {
  const data = getAchievementData();
  const newlyUnlocked = [];
  
  ACHIEVEMENTS.forEach(achievement => {
    // Skip if already unlocked
    if (data.unlocked.includes(achievement.id)) return;
    
    // Check if achievement should be unlocked
    if (checkAchievement(achievement.id, stats)) {
      data.unlocked.push(achievement.id);
      data.unlockedAt[achievement.id] = Date.now();
      newlyUnlocked.push(achievement);
    }
  });
  
  if (newlyUnlocked.length > 0) {
    saveAchievementData(data);
  }
  
  return newlyUnlocked;
}

// Mark achievement as notified
export function markAsNotified(achievementId) {
  const data = getAchievementData();
  if (!data.notified.includes(achievementId)) {
    data.notified.push(achievementId);
    saveAchievementData(data);
  }
}

// Get unnotified achievements
export function getUnnotifiedAchievements() {
  const data = getAchievementData();
  return data.unlocked.filter(id => !data.notified.includes(id));
}

// Get achievement by ID
export function getAchievement(id) {
  return ACHIEVEMENTS.find(a => a.id === id);
}

// Get unlocked achievements
export function getUnlockedAchievements() {
  const data = getAchievementData();
  return ACHIEVEMENTS.filter(a => data.unlocked.includes(a.id));
}

// Get locked achievements
export function getLockedAchievements() {
  const data = getAchievementData();
  return ACHIEVEMENTS.filter(a => !data.unlocked.includes(a.id));
}

// Get total achievement points
export function getTotalAchievementPoints() {
  const unlocked = getUnlockedAchievements();
  return unlocked.reduce((sum, a) => sum + a.points, 0);
}

// Get achievements by category
export function getAchievementsByCategory(category) {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

export default {
  ACHIEVEMENTS,
  checkAchievements,
  getAchievementData,
  getUnlockedAchievements,
  getLockedAchievements,
  getTotalAchievementPoints,
  markAsNotified,
  getUnnotifiedAchievements,
  getAchievement,
};
