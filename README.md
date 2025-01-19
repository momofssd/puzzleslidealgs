# Advanced Sliding Puzzle Solver

A sophisticated implementation of the sliding puzzle game featuring an intelligent solver that uses advanced algorithms, optimized memory management, and efficient sorting techniques.

## Features

- **Dynamic Grid Sizing**: Support for puzzles from 3x3 up to 10x10
- **Interactive Interface**: Intuitive drag-and-drop tile movement
- **Smart Auto-Solver**: Advanced A* algorithm implementation
- **Performance Monitoring**:
  - Real-time state computation counter
  - Move step tracking
  - Solving time countdown
  - Memory usage optimization

## Algorithm Implementation

### A* Search Algorithm
The solver implements an optimized A* search algorithm with several key features:

1. **State Management**:
   - States are efficiently encoded using compact string representations
   - Implements a state cache to prevent revisiting previously explored states
   - Uses a MinHeap priority queue for optimal state exploration

2. **Heuristic Function**:
   - Manhattan distance calculation (base distance metric)
   - Linear conflict detection (adds penalties for tiles in correct row/column but wrong order)
   - Out-of-place tiles consideration (additional weight for misplaced tiles)
   - Dynamic weight adjustment based on puzzle size
   - Pattern database for caching frequently encountered state distances

3. **Row-by-Row Solving**:
   - Progressive row locking strategy
   - Optimizes search space by excluding solved rows
   - Reduces computational complexity for larger puzzles

### Memory Management

1. **State Caching**:
   - Dynamic cache size based on puzzle dimensions
   - Automatic cleanup of least recently used states
   - Configurable cleanup thresholds and intervals
   - Memory-efficient state key generation

2. **Pattern Database**:
   - Limited-size cache for frequently encountered patterns
   - Automatic pruning of less useful patterns
   - Size optimization based on puzzle dimensions

3. **DOM Operations**:
   - Use of DocumentFragment for batch updates
   - Minimal DOM manipulation during moves
   - Efficient event listener management

### Sorting and Data Structures

1. **MinHeap Implementation**:
   - Custom priority queue for state management
   - O(log n) complexity for enqueue/dequeue operations
   - Efficient bubbleUp/bubbleDown operations
   - Memory-efficient storage of states and priorities

2. **State Organization**:
   - Optimized array operations for state manipulation
   - Efficient state comparison mechanisms
   - Smart state key generation for different puzzle sizes

## Performance Optimizations

1. **Time Management**:
   - Adaptive time limits based on puzzle size
   - Chunked processing to maintain UI responsiveness
   - Periodic cleanup of memory-intensive structures

2. **Move Generation**:
   - Cached valid move calculations
   - Direction-based move validation
   - Excluded row optimization

3. **Solution Execution**:
   - Controlled animation timing
   - Progress tracking and display
   - Efficient move application

## Technical Details

### Memory Efficiency
```javascript
// Efficient state key generation based on puzzle size
function getStateKey(state) {
  return gridSize >= 10 ? state.join('') : state.join(',');
}

// Automatic cache cleanup
const MAX_CACHE_SIZE = gridSize >= 10 ? 50000 : 1000000;
const CLEANUP_THRESHOLD = MAX_CACHE_SIZE * 0.9;
```

### Heuristic Calculation
```javascript
function heuristic(state, goalState) {
  // Base Manhattan distance
  distance += (rowDist + colDist) * 3;
  
  // Linear conflict detection
  if (currentRow === goal.row) {
    // Add penalties for tiles in correct row but wrong order
    distance += 6;
  }
  
  // Out-of-place tiles
  distance += outOfPlace * (size > 6 ? 4 : 2);
}
```

## Usage

1. Open `puzzleDynamic.html` in a web browser
2. Select puzzle size (3x3 to 5x5)
3. Click "Shuffle" to randomize the puzzle
4. Solve manually by clicking tiles or use "Solve" for automatic solution

## Files

- `puzzleDynamic.html`: Main application interface
- `puzzle.js`: Core game logic and solver implementation
- `styles.css`: UI styling and animations

## Performance Considerations

- Automatic memory management for large puzzles
- Progressive optimization based on puzzle size
- Efficient DOM updates and event handling
- Smart caching of frequently used patterns
- Adaptive processing chunks for UI responsiveness
