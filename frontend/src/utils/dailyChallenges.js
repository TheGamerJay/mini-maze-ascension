// Daily Challenges System for Mini Arcade

const STORAGE_KEY = 'miniArcadeDailyChallenges';

// Challenge templates
const CHALLENGE_TEMPLATES = [
  // Score challenges
  { type: 'score_total', name: 'Score Hunter', desc: 'Earn {target} points today', targets: [500, 1000, 2000, 3000], icon: '🎯', xp: [50, 100, 150, 200] },
  { type: 'score_single', name: 'High Scorer', desc: 'Score {target}+ in a single game', targets: [100, 250, 500, 1000], icon: '💯', xp: [60, 120, 180, 250] },
  
  // Play challenges
  { type: 'play_games', name: 'Game Explorer', desc: 'Play {target} different games', targets: [3, 5, 7, 10], icon: '🎮', xp: [40, 80, 120, 160] },
  { type: 'play_category', name: 'Category Master', desc: 'Play {target} {category} games', targets: [2, 3, 4, 5], icon: '📂', xp: [50, 75, 100, 125] },
  
  // Specific game challenges
  { type: 'beat_score', name: 'Personal Best', desc: 'Beat your high score in any game', targets: [1], icon: '🏆', xp: [100] },
  { type: 'play_specific', name: 'Daily Game', desc: 'Play {game}', targets: [1], icon: '⭐', xp: [30] },
  
  // Streak challenges
  { type: 'win_streak', name: 'Hot Streak', desc: 'Score points in {target} games in a row', targets: [3, 5], icon: '🔥', xp: [80, 150] },
];

const CATEGORIES = ['action', 'puzzle', 'word', 'strategy', 'casual'];
const FEATURED_GAMES = ['snake', 'tetris', '2048', 'flappy', 'invaders', 'wordle', 'memory', 'dino'];

// Get today's date as YYYY-MM-DD
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

// Seed random based on date for consistent daily challenges
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getDaySeed() {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

// Generate daily challenges
function generateDailyChallenges() {
  const seed = getDaySeed();
  const challenges = [];
  
  // Always include a score challenge
  const scoreTemplate = CHALLENGE_TEMPLATES[0];
  const scoreDifficulty = Math.floor(seededRandom(seed) * scoreTemplate.targets.length);
  challenges.push({
    id: `daily_score_${getTodayString()}`,
    type: scoreTemplate.type,
    name: scoreTemplate.name,
    desc: scoreTemplate.desc.replace('{target}', scoreTemplate.targets[scoreDifficulty]),
    target: scoreTemplate.targets[scoreDifficulty],
    icon: scoreTemplate.icon,
    xp: scoreTemplate.xp[scoreDifficulty],
    progress: 0,
    completed: false,
  });
  
  // Add a play games challenge
  const playTemplate = CHALLENGE_TEMPLATES[2];
  const playDifficulty = Math.floor(seededRandom(seed + 1) * playTemplate.targets.length);
  challenges.push({
    id: `daily_play_${getTodayString()}`,
    type: playTemplate.type,
    name: playTemplate.name,
    desc: playTemplate.desc.replace('{target}', playTemplate.targets[playDifficulty]),
    target: playTemplate.targets[playDifficulty],
    icon: playTemplate.icon,
    xp: playTemplate.xp[playDifficulty],
    progress: 0,
    completed: false,
  });
  
  // Add a specific game challenge
  const gameIndex = Math.floor(seededRandom(seed + 2) * FEATURED_GAMES.length);
  const gameId = FEATURED_GAMES[gameIndex];
  const gameNames = {
    snake: 'Snake', tetris: 'Tetris', '2048': '2048', flappy: 'Flappy Bird',
    invaders: 'Space Invaders', wordle: 'Wordle', memory: 'Memory Match', dino: 'T-Rex Run'
  };
  challenges.push({
    id: `daily_specific_${getTodayString()}`,
    type: 'play_specific',
    name: 'Daily Game',
    desc: `Play ${gameNames[gameId]}`,
    target: 1,
    targetGame: gameId,
    icon: '⭐',
    xp: 30,
    progress: 0,
    completed: false,
  });
  
  return challenges;
}

// Get or create today's challenges
export function getDailyChallenges() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const today = getTodayString();
  
  if (saved) {
    const data = JSON.parse(saved);
    // Check if challenges are from today
    if (data.date === today) {
      return data.challenges;
    }
  }
  
  // Generate new challenges for today
  const challenges = generateDailyChallenges();
  saveDailyChallenges(challenges);
  return challenges;
}

// Save challenges
function saveDailyChallenges(challenges) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    date: getTodayString(),
    challenges,
  }));
}

// Update challenge progress
export function updateChallengeProgress(gameId, score, totalScoreToday, gamesPlayedToday) {
  const challenges = getDailyChallenges();
  const completedNow = [];
  
  challenges.forEach(challenge => {
    if (challenge.completed) return;
    
    let newProgress = challenge.progress;
    
    switch (challenge.type) {
      case 'score_total':
        newProgress = totalScoreToday;
        break;
      case 'score_single':
        newProgress = Math.max(challenge.progress, score);
        break;
      case 'play_games':
        newProgress = gamesPlayedToday;
        break;
      case 'play_specific':
        if (gameId === challenge.targetGame) {
          newProgress = 1;
        }
        break;
      default:
        break;
    }
    
    challenge.progress = newProgress;
    
    if (newProgress >= challenge.target && !challenge.completed) {
      challenge.completed = true;
      challenge.completedAt = Date.now();
      completedNow.push(challenge);
    }
  });
  
  saveDailyChallenges(challenges);
  return completedNow;
}

// Get total XP earned today from challenges
export function getTodayXP() {
  const challenges = getDailyChallenges();
  return challenges
    .filter(c => c.completed)
    .reduce((sum, c) => sum + c.xp, 0);
}

// Get challenge completion percentage
export function getChallengeProgress() {
  const challenges = getDailyChallenges();
  const completed = challenges.filter(c => c.completed).length;
  return {
    completed,
    total: challenges.length,
    percentage: Math.round((completed / challenges.length) * 100),
  };
}

// Check if all daily challenges are complete
export function allChallengesComplete() {
  const challenges = getDailyChallenges();
  return challenges.every(c => c.completed);
}

export default {
  getDailyChallenges,
  updateChallengeProgress,
  getTodayXP,
  getChallengeProgress,
  allChallengesComplete,
};
