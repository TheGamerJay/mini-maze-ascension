# Mini Retro Arcade - Product Requirements Document

## Project Overview
**Name:** Mini Retro Arcade  
**Type:** Frontend-only React SPA  
**Description:** A competitive collection of 32 classic retro games with global leaderboards, ranks, and weekly challenges  
**URL:** https://jarvis-hub-12.preview.emergentagent.com

## Tech Stack
- **Frontend:** React with Tailwind CSS
- **State Management:** React Hooks (useState, useEffect, useCallback)
- **Storage:** LocalStorage for high scores & player profiles
- **Icons:** Lucide React
- **Font:** Press Start 2P (retro pixel font)

## Current Features (Implemented)

### Competitive Features (NEW!)
- **Global Leaderboard** with 20+ simulated players
- **Player Profiles** with customizable name, avatar (30 options), and country flag
- **Rank System:** Bronze → Silver → Gold → Platinum → Diamond → Legend
- **World Ranking** position showing where player stands globally
- **Weekly Challenges** with reset timer and rewards:
  - Score 10,000 points (+500 reward)
  - Play 10 different games (+300 reward)
  - Win 5 games in a row (+400 reward)
- **Progress Bars** showing advancement to next rank
- **Top 3 Podium** display with gold/silver/bronze badges

### Core Features
- **32 playable games** organized by 5 categories
- Beautiful hero section with player stats card
- Category filters (All, Action, Puzzle, Word, Strategy, Casual)
- Featured game carousel with auto-rotation
- High score tracking with localStorage persistence
- "HOT" badges on featured games
- Retro neon visual theme with CRT effects
- Responsive design (mobile/tablet/desktop)

### Games List (32 Total)

#### Action Games (9)
Snake, Tetris, Breakout, Space Invaders, Pong, Flappy Bird, Dino Run, Asteroids, Whack-A-Mole

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
├── index.css (neon theme + animations)
├── pages/
│   └── Arcade.js (main hub with competitive features)
├── components/
│   └── Leaderboard.js (global rankings, weekly challenges, rewards)
└── games/ (32 game files)
```

## Rank Progression
| Rank | Points Required | Color |
|------|-----------------|-------|
| Bronze | 0+ | #CD7F32 |
| Silver | 10,000+ | #C0C0C0 |
| Gold | 50,000+ | #FFD700 |
| Platinum | 100,000+ | #E5E4E2 |
| Diamond | 200,000+ | #B9F2FF |
| Legend | 500,000+ | #FF00FF |

## Implementation Timeline
- **Dec 2025:** Initial 8 games
- **Dec 2025:** Expanded to 25 games
- **Jan 2026:** Added 7 more games + improved UI + categories (32 total)
- **Jan 2026:** Added competitive leaderboard system like Subway Surfers/Jetpack Joyride

## Future Enhancements (Backlog)
- [ ] Backend for real global leaderboards
- [ ] User authentication
- [ ] Sound effects and background music
- [ ] Daily challenges (rotating game of the day)
- [ ] Achievement badges (100+ badges)
- [ ] Friends system
- [ ] Season pass with exclusive rewards
- [ ] Mobile app version (React Native)
