# Mini Retro Arcade - Product Requirements Document

## Project Overview
**Name:** Mini Retro Arcade  
**Type:** Frontend-only React SPA  
**Description:** A competitive collection of 34 classic retro games with dashboard, profile system, global leaderboards, achievements, and weekly challenges  
**URL:** https://jarvis-hub-12.preview.emergentagent.com

## Tech Stack
- **Frontend:** React with Tailwind CSS
- **State Management:** React Hooks (useState, useEffect, useCallback)
- **Storage:** LocalStorage for high scores, profiles, settings, achievements
- **Rendering:** Canvas API for action games
- **Icons:** Lucide React

## Current Features (Implemented)

### NEW GAMES (Jan 2026)
- **Maze Ascension** 🧟 - Pac-Man style zombie maze game
  - Collect dots, avoid zombies
  - Power-ups let you eat zombies
  - Multiple levels with increasing difficulty
  - Mobile touch controls
  
- **Wrecker** 🦖 - Rampage-style city destruction
  - Smash buildings as a giant monster
  - Climb buildings, punch to destroy
  - Rage meter for 2X damage
  - Fight helicopters and soldiers
  - Progressive levels with more buildings

### Dashboard
- Daily Challenge with +500 bonus points
- Quick Actions: Random Game, All Games
- Stats Overview: Total Score, Games Played, Day Streak
- Continue Playing: Recent games list
- Your Top Games, Try Something New suggestions
- Weekly Goals with progress bars

### Profile Page
- Profile Card: Avatar, name, rank badge, country flag
- Edit Profile: 30 avatars, 21 country flags
- 4 Tabs: Overview, Achievements, Stats, Settings
- 12 unlockable achievements
- Sound/notification toggles, reset progress

### Competitive Features
- Global Leaderboard with 20+ simulated players
- Rank System: Bronze → Silver → Gold → Platinum → Diamond → Legend
- Weekly Challenges with rewards
- Top 3 Podium display

### Games List (34 Total)

#### Action Games (11)
Snake, Tetris, Breakout, Space Invaders, Pong, Flappy Bird, Dino Run, Asteroids, Whack-A-Mole, **Maze Ascension**, **Wrecker**

#### Puzzle Games (6)
2048, Minesweeper, Maze, Sliding Puzzle, Sudoku, Riddles

#### Word Games (6)
Wordle, Word Search, Word Finder, Crossword Mini, Hangman, Typing

#### Strategy Games (4)
Tic Tac Toe (AI), Connect Four (AI), Memory, Simon

#### Casual Games (7)
Bubble Pop, Rock Paper Scissors, Catch Game, Quiz Master, Clicker, Reaction, Color Match

## File Structure
```
/app/frontend/src/
├── App.js
├── index.css
├── pages/
│   └── Arcade.js
├── components/
│   ├── Leaderboard.js
│   ├── ProfilePage.js
│   └── Dashboard.js
└── games/ (34 game files)
    ├── MazeAscension.js (NEW - zombie pac-man)
    ├── Wrecker.js (NEW - rampage style)
    └── ... (32 other games)
```

## Implementation Timeline
- **Dec 2025:** Initial 8 games
- **Dec 2025:** Expanded to 25 games
- **Jan 2026:** 32 games + categories + competitive leaderboard
- **Jan 2026:** Dashboard + Profile page + Achievements
- **Jan 2026:** Maze Ascension + Wrecker (34 total games)

## Future Enhancements (Backlog)
- [ ] Backend for real multiplayer leaderboards
- [ ] User authentication
- [ ] Sound effects and background music
- [ ] More achievements (50+)
- [ ] More games (Tower Defense, RPG, Racing)
- [ ] Season pass system
- [ ] Tournaments
- [ ] Mobile app version
