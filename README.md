# Sliding Puzzle Game

A dynamic sliding puzzle game implemented in JavaScript with automatic solving capabilities.

## Features

- **Dynamic Grid Size**: Customize the puzzle size (e.g., 3x3, 4x4, 5x5)
- **Mouse Controls**: Click tiles adjacent to the empty space to move them
- **Auto-Solver**: Built-in puzzle solver with:
  - 60-second time limit for complex puzzles
  - Real-time countdown display
  - State computation counter
  - Move step counter
- **Performance Optimizations**:
  - Memoized winning patterns
  - Optimized DOM operations using document fragments
  - Chunked processing to prevent browser timeout
  - Enhanced heuristics for larger puzzles

## How to Play

1. Open `puzzleDynamic.html` in a web browser
2. Select a grid size using the input field
3. Click "Shuffle" to start a new game
4. Move tiles by clicking them (only tiles adjacent to the empty space can move)
5. Click "Solve" to let the algorithm solve the puzzle automatically

## Auto-Solver Details

The solver uses an A* algorithm with the following features:

- **Time Limit**: 60-second maximum solving time
- **Progress Display**:
  - Remaining time countdown
  - Number of computed states
  - Number of moves in solution
- **Optimization Techniques**:
  - Manhattan distance heuristic
  - Linear conflict detection
  - Row-by-row solving strategy
  - State caching for performance

## Technical Implementation

- Pure JavaScript implementation
- CSS Grid for puzzle layout
- Optimized state management
- Event-driven architecture
- Responsive design

## Files

- `puzzleDynamic.html`: Main HTML file
- `puzzle.js`: Game logic and solver implementation
- `styles.css`: Game styling

## Performance Considerations

- Uses document fragments for efficient DOM updates
- Implements chunked processing to maintain responsiveness
- Caches winning patterns for better performance
- Optimizes move validation and state checking
- Enhanced heuristics for larger grid sizes
