# Mini Retro Arcade Hub - Product Requirements Document

## Original Problem Statement
Build a "mini fun addictive web app game" that evolved into a "Retro Arcade Hub" with competitive features inspired by mobile games like Subway Surfer, Hill Climb, and Jetpack Joyride.

## User Personas
- Casual gamers looking for quick, nostalgic gaming sessions
- Competitive players wanting to climb leaderboards and earn achievements
- Users who enjoy customizing their profiles and tracking progress

## Core Requirements
1. **Game Library** - Collection of retro-style browser games
2. **Competitive Layer** - Leaderboards, rankings, and challenges
3. **Player Profiles** - Customizable avatars, usernames, and stats tracking
4. **Achievement System** - Unlockable achievements for various accomplishments
5. **Modern UI/UX** - Premium glassmorphism dark theme design

## What's Been Implemented

### Games (34 Total)
- **Action (11):** Snake, Space Invaders, Breakout, Flappy Bird, Dino Run, Asteroid Dodge, Fruit Ninja, Bubble Shooter, Maze Ascension (zombie Pac-Man), Wrecker (Rampage-style), and more
- **Puzzle (6):** Tetris, 2048, Sudoku, Minesweeper, Sliding Puzzle, Memory Match
- **Word (6):** Word Scramble, Hangman, Word Search, Typing Speed, Word Chain, Crossword
- **Strategy (4):** Chess, Checkers, Connect Four, Tic-Tac-Toe
- **Casual (7):** Pong, Simon Says, Cookie Clicker, Whack-a-Mole, Bubble Pop, Color Match, Reaction Time

### UI/UX Features
- ✅ Glassmorphism + Premium Dark theme (Dec 2025)
- ✅ Featured games carousel with HOT badges
- ✅ Category filtering tabs (All, Action, Puzzle, Word, Strategy, Casual)
- ✅ Player stats bar (Total Score, Games Played, Rank)
- ✅ Profile modal with Overview, Achievements, Stats, Settings tabs
- ✅ Leaderboard modal with Global/Weekly/Rewards tabs
- ✅ Top 3 podium display with mock player data
- ✅ Avatar selection (emojis) and custom image upload
- ✅ Username editing capability

### Game-Specific Features
- ✅ Wrecker: 4 selectable animal characters (T-Rex, Rhino, Crocodile, Eagle)
- ✅ Dino Run: Distinct T-Rex character sprite
- ✅ All games assigned to categories

## Technical Architecture
- **Frontend:** React SPA (Single Page Application)
- **State:** React useState/useEffect hooks (NO persistence yet)
- **Styling:** CSS with glassmorphism, gradients, and animations
- **Data:** All mock data in React state (resets on refresh)

## Prioritized Backlog

### P0 - Critical
- [ ] **Data Persistence:** Implement localStorage to save profiles, scores, achievements

### P1 - High Priority  
- [ ] **Sound Effects:** Background music and UI sound effects
- [ ] **Achievements System:** Activate tracking logic for unlocking achievements

### P2 - Medium Priority
- [ ] **Backend:** FastAPI + MongoDB for scalable data storage
- [ ] **Friends System:** Add friends, compare scores

### P3 - Future
- [ ] More games (Tower Defense suggested)
- [ ] Daily/Weekly challenges with rewards
- [ ] Social sharing features

## Data Persistence (IMPLEMENTED)
localStorage keys used:
- `miniArcadeProfile` - Player profile (name, avatar, country, custom image)
- `miniRetroArcadeScores` - All game high scores
- `miniArcadeSettings` - User preferences (sound, notifications)
- `miniArcadeSessions` - Total play session count
- `miniArcadeRecentGames` - Recently played games list

## Known Issues
- Bubble Pop game may have performance issues (browser crash observed)
- Day streak tracking needs proper date-based implementation

## File Structure
```
/app/frontend/src/
├── App.js                 # Main entry
├── index.css              # Global styles (glassmorphism theme)
├── pages/
│   └── Arcade.js          # Core hub component (~600 lines)
├── components/
│   ├── ProfilePage.js     # Profile modal
│   ├── Dashboard.js       # Player dashboard
│   └── Leaderboard.js     # Competitive leaderboard
└── games/                 # 34 individual game components
    ├── Snake.js
    ├── Tetris.js
    ├── Wrecker.js
    └── ... (31 more)
```

## Last Updated
December 2025 - UI Redesign Verification Complete
