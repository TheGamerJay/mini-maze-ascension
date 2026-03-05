# Mini Retro Arcade - Product Requirements Document

## Project Overview
**Name:** Mini Retro Arcade
**Type:** Frontend-only React SPA
**Description:** A collection of 25 classic retro games with a neon arcade aesthetic

## Tech Stack
- **Frontend:** React with Tailwind CSS
- **State Management:** React Hooks (useState, useEffect, useCallback)
- **Storage:** LocalStorage for high scores
- **Icons:** Lucide React

## Current Features (Implemented)

### Core Features
- Main arcade hub with game grid display
- 25 playable games organized by category
- High score tracking with localStorage persistence
- Total score aggregation across all games
- Retro neon visual theme with CRT effects
- Sound toggle functionality
- Responsive design (mobile/tablet/desktop)

### Games List (25 Total)

#### Action Games (9)
1. **Snake** - Classic snake game, eat & grow
2. **Tetris** - Block stacking puzzle
3. **Breakout** - Brick breaker with paddle
4. **Space Invaders** - Alien shooter
5. **Pong** - Classic paddle tennis
6. **Flappy Bird** - Side-scroller obstacle game
7. **Dino Run** - Chrome dinosaur-style runner
8. **Asteroids** - Space rock shooter
9. **Whack-A-Mole** - Reaction timing game

#### Puzzle Games (6)
10. **2048** - Number merging puzzle
11. **Minesweeper** - Bomb avoidance logic game
12. **Maze** - Navigate to find exit
13. **Sliding Puzzle** - Classic number slider (3x3, 4x4, 5x5)
14. **Sudoku** - Number placement (Easy/Med/Hard)
15. **Riddles** - Brain teaser questions

#### Word Games (6)
16. **Wordle** - 5-letter word guessing
17. **Word Search** - Find hidden words in grid
18. **Word Finder** - Unscramble letters
19. **Crossword Mini** - Mini crossword puzzles
20. **Hangman** - Category-based word guessing
21. **Typing** - Speed typing challenge

#### Memory & Quick Games (4)
22. **Memory** - Card matching pairs
23. **Simon** - Pattern repetition
24. **Reaction** - Quick tap speed test
25. **Color Match** - Match color names

## File Structure
```
/app/frontend/src/
├── App.js                 # Main app entry
├── index.css              # Global styles (neon theme)
├── pages/
│   └── Arcade.js          # Main hub with game grid
└── games/
    ├── SnakeGame.js
    ├── TetrisGame.js
    ├── BreakoutGame.js
    ├── SpaceInvaders.js
    ├── PongGame.js
    ├── FlappyGame.js
    ├── Game2048.js
    ├── MemoryGame.js
    ├── Minesweeper.js
    ├── MazeGame.js
    ├── RiddleGame.js
    ├── SimonGame.js
    ├── TypingGame.js
    ├── WhackAMole.js
    ├── DinoRun.js
    ├── WordleGame.js
    ├── AsteroidsGame.js
    ├── ReactionGame.js
    ├── ColorMatchGame.js
    ├── WordSearchGame.js
    ├── WordFinderGame.js
    ├── SlidingPuzzle.js
    ├── CrosswordMini.js
    ├── SudokuGame.js
    └── HangmanGame.js
```

## Implementation Dates
- **Dec 2025:** Initial 8 games created (Snake, Tetris, Breakout, Invaders, Pong, Flappy, 2048, Memory)
- **Dec 2025:** Added 11 more games (Minesweeper, Maze, Riddle, Simon, Typing, Whack-A-Mole, Dino, Wordle, Asteroids, Reaction, Color Match)
- **Dec 2025:** Added 6 puzzle/word games (Word Search, Word Finder, Sliding Puzzle, Crossword, Sudoku, Hangman)
- **Dec 2025:** Renamed to "Mini Retro Arcade"

## Future Enhancements (Backlog)
- [ ] Global online leaderboard system
- [ ] 2-Player mode for Pong
- [ ] Sound effects and background music
- [ ] Achievement/badge system
- [ ] Daily challenges
- [ ] User accounts with cloud save
- [ ] More game modes per game
- [ ] Mobile app version
