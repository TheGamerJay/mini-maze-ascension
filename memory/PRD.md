# Retro Arcade - Product Requirements Document

## Overview
A fun, addictive web-based retro game arcade featuring 8 classic games with a neon cyberpunk aesthetic.

## Tech Stack
- **Frontend**: React with Tailwind CSS
- **Styling**: Press Start 2P font, neon glow effects, CRT scanlines
- **Storage**: LocalStorage for high scores
- **No Backend Required**: Pure frontend application

## Features

### Games Included (8 Total)
1. **🐍 Snake** - Classic snake game, eat food and grow
2. **🧱 Tetris** - Stack falling blocks, clear lines
3. **🧱 Breakout** - Break bricks with a bouncing ball
4. **👾 Space Invaders** - Shoot alien invaders
5. **🏓 Pong** - Classic tennis against AI
6. **🐦 Flappy** - Tap to fly through pipes
7. **🔢 2048** - Merge numbers to reach 2048
8. **🧠 Memory** - Match emoji pairs

### Core Features
- High score tracking (localStorage)
- Sound toggle
- Mobile-friendly touch controls
- Retro CRT visual effects (scanlines, flicker)
- Neon glow styling
- Rainbow animated title

### Visual Theme
- Dark purple/black background
- Neon colors: cyan, magenta, green, yellow, orange, red
- Press Start 2P pixel font
- Glowing borders and text
- CRT scanline overlay

## Controls

### Desktop
- Arrow keys for movement
- Space bar for actions (shoot, jump, drop)
- Mouse for paddle games

### Mobile
- On-screen touch buttons
- Swipe gestures for 2048
- Tap for Flappy

## File Structure
```
/app/frontend/src/
├── App.js
├── index.css          # Retro styles, neon effects
├── pages/
│   └── Arcade.js      # Main hub with game selection
└── games/
    ├── SnakeGame.js
    ├── TetrisGame.js
    ├── BreakoutGame.js
    ├── SpaceInvaders.js
    ├── PongGame.js
    ├── FlappyGame.js
    ├── Game2048.js
    └── MemoryGame.js
```

## Scoring System
- Snake: +10 per food
- Tetris: 100/300/500/800 for 1/2/3/4 lines × level
- Breakout: 10-30 points per brick (by row)
- Space Invaders: 10/20/30 points by alien type
- Pong: First to 5 wins
- Flappy: +1 per pipe passed
- 2048: Points for merged tiles
- Memory: 100 per match + bonus for fewer moves

---
Last Updated: December 2025
