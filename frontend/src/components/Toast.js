import React, { useState, useEffect } from 'react';
import { X, Trophy, Flame, Star, Award } from 'lucide-react';

// Toast notification system
const ToastContext = React.createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...toast, id }]);
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(onRemove, 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'achievement':
        return <Award className="w-6 h-6 text-yellow-400" />;
      case 'highscore':
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 'streak':
        return <Flame className="w-6 h-6 text-orange-500" />;
      case 'challenge':
        return <Star className="w-6 h-6 text-purple-400" />;
      default:
        return <Star className="w-6 h-6 text-cyan-400" />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case 'achievement':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/50';
      case 'highscore':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/50';
      case 'streak':
        return 'from-orange-500/20 to-red-500/20 border-orange-500/50';
      case 'challenge':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/50';
      default:
        return 'from-cyan-500/20 to-blue-500/20 border-cyan-500/50';
    }
  };

  return (
    <div
      className={`
        pointer-events-auto
        min-w-[300px] max-w-[400px]
        bg-gradient-to-r ${getBgColor()}
        backdrop-blur-xl
        border rounded-xl
        p-4 shadow-2xl
        transform transition-all duration-300
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        animate-slide-in
      `}
      style={{
        animation: isExiting ? 'none' : 'slideIn 0.3s ease-out',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center text-2xl">
          {toast.icon || getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm">{toast.title}</p>
          <p className="text-white/70 text-xs mt-0.5">{toast.message}</p>
          {toast.points && (
            <p className="text-yellow-400 text-xs mt-1 font-bold">+{toast.points} XP</p>
          )}
        </div>
        <button
          onClick={handleRemove}
          className="flex-shrink-0 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Pre-built toast functions
export function showAchievementToast(addToast, achievement) {
  addToast({
    type: 'achievement',
    title: 'Achievement Unlocked!',
    message: achievement.name,
    icon: <span className="text-2xl">{achievement.icon}</span>,
    points: achievement.points,
    duration: 5000,
  });
}

export function showHighScoreToast(addToast, gameName, score) {
  addToast({
    type: 'highscore',
    title: 'New High Score!',
    message: `${gameName}: ${score.toLocaleString()} points`,
    duration: 4000,
  });
}

export function showStreakToast(addToast, streak) {
  addToast({
    type: 'streak',
    title: `${streak} Day Streak!`,
    message: streak >= 7 ? "You're on fire! Keep it up!" : "Come back tomorrow to continue!",
    duration: 4000,
  });
}

export function showChallengeToast(addToast, challenge) {
  addToast({
    type: 'challenge',
    title: 'Challenge Complete!',
    message: challenge.name,
    icon: <span className="text-2xl">{challenge.icon}</span>,
    points: challenge.xp,
    duration: 4000,
  });
}

export default ToastProvider;
