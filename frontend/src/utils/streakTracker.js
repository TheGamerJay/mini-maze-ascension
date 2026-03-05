// Day Streak Tracking System for Mini Arcade

const STORAGE_KEY = 'miniArcadeStreakData';

export function getStreakData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastPlayDate: null,
    totalDaysPlayed: 0,
    playHistory: [], // Last 30 days
  };
}

export function saveStreakData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Get today's date as YYYY-MM-DD string
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

// Get yesterday's date as YYYY-MM-DD string
function getYesterdayString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

// Check and update streak when user plays
export function updateStreak() {
  const data = getStreakData();
  const today = getTodayString();
  const yesterday = getYesterdayString();

  // Already played today
  if (data.lastPlayDate === today) {
    return {
      ...data,
      streakIncreased: false,
      isNewDay: false,
    };
  }

  let newStreak = data.currentStreak;
  let streakIncreased = false;
  let streakBroken = false;

  if (data.lastPlayDate === yesterday) {
    // Continuing streak
    newStreak = data.currentStreak + 1;
    streakIncreased = true;
  } else if (data.lastPlayDate === null) {
    // First time playing
    newStreak = 1;
    streakIncreased = true;
  } else {
    // Streak broken - more than 1 day gap
    streakBroken = data.currentStreak > 0;
    newStreak = 1;
    streakIncreased = true;
  }

  // Update play history (keep last 30 days)
  const history = [...data.playHistory];
  if (!history.includes(today)) {
    history.push(today);
    // Keep only last 30 entries
    while (history.length > 30) {
      history.shift();
    }
  }

  const updatedData = {
    currentStreak: newStreak,
    longestStreak: Math.max(data.longestStreak, newStreak),
    lastPlayDate: today,
    totalDaysPlayed: data.totalDaysPlayed + (data.lastPlayDate !== today ? 1 : 0),
    playHistory: history,
  };

  saveStreakData(updatedData);

  return {
    ...updatedData,
    streakIncreased,
    streakBroken,
    isNewDay: true,
    previousStreak: data.currentStreak,
  };
}

// Get streak status without updating
export function getStreakStatus() {
  const data = getStreakData();
  const today = getTodayString();
  const yesterday = getYesterdayString();

  const playedToday = data.lastPlayDate === today;
  const willContinueStreak = data.lastPlayDate === yesterday || data.lastPlayDate === today;
  const streakAtRisk = data.currentStreak > 0 && !playedToday && data.lastPlayDate === yesterday;

  return {
    ...data,
    playedToday,
    willContinueStreak,
    streakAtRisk,
  };
}

// Get calendar data for the last N days
export function getCalendarData(days = 7) {
  const data = getStreakData();
  const calendar = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    calendar.push({
      date: dateStr,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate(),
      played: data.playHistory.includes(dateStr),
      isToday: i === 0,
    });
  }
  
  return calendar;
}

// Calculate streak bonus multiplier
export function getStreakBonus(streak) {
  if (streak >= 30) return 2.0;    // 100% bonus
  if (streak >= 14) return 1.5;    // 50% bonus
  if (streak >= 7) return 1.25;    // 25% bonus
  if (streak >= 3) return 1.1;     // 10% bonus
  return 1.0;                       // No bonus
}

export default {
  getStreakData,
  updateStreak,
  getStreakStatus,
  getCalendarData,
  getStreakBonus,
};
