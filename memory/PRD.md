# Mini Retro Arcade - Product Requirements Document

## Project Overview
**Name:** Mini Retro Arcade  
**Type:** Frontend-only React SPA  
**Description:** A competitive collection of 32 classic retro games with dashboard, profile system, global leaderboards, achievements, and weekly challenges  
**URL:** https://jarvis-hub-12.preview.emergentagent.com

## Tech Stack
- **Frontend:** React with Tailwind CSS
- **State Management:** React Hooks (useState, useEffect, useCallback)
- **Storage:** LocalStorage for high scores, profiles, settings, achievements
- **Icons:** Lucide React
- **Font:** Press Start 2P (retro pixel font)

## Current Features (Implemented)

### Dashboard (NEW!)
- **Daily Challenge** with random game and +500 bonus points
- **Reset Timer** showing time until next daily challenge
- **Quick Actions**: Random Game, All Games buttons
- **Stats Overview**: Total Score, Games Played, Day Streak
- **Continue Playing**: Recent games list
- **Your Top Games**: Best performing games with scores
- **Try Something New**: Suggested unplayed games
- **Weekly Goals**: Progress towards 10K points and 10 games

### Profile Page (NEW!)
- **Profile Card**: Avatar, name, rank badge, country flag, member since date
- **Edit Profile**: Change name, avatar (30 options), country (21 flags)
- **4 Tabs**: Overview, Achievements, Stats, Settings
- **Overview Tab**: Quick stats, rank progress, top games, recent achievements
- **Achievements Tab**: 12 unlockable achievements with progress
- **Stats Tab**: Detailed game statistics, all game scores
- **Settings Tab**: Sound toggle, notifications toggle, share/export data, reset progress

### Achievements System (NEW!)
12 achievements to unlock:
- First Steps, Getting Started, Rising Star, Pro Player, Legend (score-based)
- Explorer, Adventurer, Completionist (games played)
- On Fire, Dedicated (streak-based)
- Snake Charmer, Block Builder (game-specific)

### Competitive Features
- **Global Leaderboard** with 20+ simulated players
- **Rank System:** Bronze → Silver → Gold → Platinum → Diamond → Legend
- **World Ranking** position
- **Weekly Challenges** with rewards
- **Top 3 Podium** display

### Core Features
- **32 playable games** organized by 5 categories
- Beautiful hero section with player stats card
- Category filters (All, Action, Puzzle, Word, Strategy, Casual)
- Featured game carousel
- High score tracking
- Retro neon visual theme

### Games List (32 Total)
- **Action (9):** Snake, Tetris, Breakout, Space Invaders, Pong, Flappy Bird, Dino Run, Asteroids, Whack-A-Mole
- **Puzzle (6):** 2048, Minesweeper, Maze, Sliding Puzzle, Sudoku, Riddles
- **Word (6):** Wordle, Word Search, Word Finder, Crossword Mini, Hangman, Typing
- **Strategy (4):** Tic Tac Toe (AI), Connect Four (AI), Memory, Simon
- **Casual (7):** Bubble Pop, Rock Paper Scissors, Catch Game, Quiz Master, Clicker, Reaction, Color Match

## File Structure
```
/app/frontend/src/
├── App.js
├── index.css (neon theme + animations)
├── pages/
│   └── Arcade.js (main hub)
├── components/
│   ├── Leaderboard.js (global rankings, weekly challenges, rewards)
│   ├── ProfilePage.js (profile, achievements, stats, settings)
│   └── Dashboard.js (daily challenge, quick actions, goals)
└── games/ (32 game files)
```

## Rank Progression
| Rank | Points | Color |
|------|--------|-------|
| Bronze | 0+ | #CD7F32 |
| Silver | 10,000+ | #C0C0C0 |
| Gold | 50,000+ | #FFD700 |
| Platinum | 100,000+ | #E5E4E2 |
| Diamond | 200,000+ | #B9F2FF |
| Legend | 500,000+ | #FF00FF |

## Implementation Timeline
- **Dec 2025:** Initial 8 games
- **Dec 2025:** Expanded to 25 games
- **Jan 2026:** 32 games + categories + competitive leaderboard
- **Jan 2026:** Dashboard + Profile page + Achievements system

## Future Enhancements (Backlog)
- [ ] Backend for real multiplayer leaderboards
- [ ] User authentication
- [ ] Sound effects and background music
- [ ] More achievements (50+)
- [ ] Season pass system
- [ ] Friends list & social features
- [ ] Tournaments
- [ ] Mobile app version
