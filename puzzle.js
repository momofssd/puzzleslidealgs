// Cache DOM elements
const boardGrid = document.getElementById('board-grid');
const shuffleBtn = document.querySelector('#shuffleBtn');
const solveBtn = document.querySelector('#solveBtn');
const boardSizeInput = document.querySelector('#boardSize');

let gridSize;
let board = [];

// Cache winning patterns for better performance
const winningPatternCache = new Map();

// Event listeners
shuffleBtn.addEventListener('click', initialGame);
solveBtn.addEventListener('click', puzzleSolving);
boardGrid.addEventListener('contextmenu', (event) => event.preventDefault());

function initialGame() {
  boardGrid.innerHTML = '';
  gridSize = parseInt(boardSizeInput.value, 10);
  const dimension = 60 * gridSize;
  
  boardGrid.style.width = `${dimension}px`;
  boardGrid.style.height = `${dimension}px`;
  
  const totalCells = gridSize * gridSize;
  board = Array.from({ length: totalCells }, (_, idx) => (idx < totalCells - 1 ? idx + 1 : 0));
  
  shufflePuzzle();
}

function shufflePuzzle() {
  const template = `repeat(${gridSize}, 1fr)`;
  boardGrid.style.gridTemplateRows = template;
  boardGrid.style.gridTemplateColumns = template;

  // Create document fragment for better performance
  const fragment = document.createDocumentFragment();
  
  // Single shuffle pass with enough iterations
  shuffleArray(board);

  // Create cells using optimized DOM operations
  const cells = board.map(item => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = item;
    cell.textContent = item || '';
    cell.addEventListener('click', (event) => moveCell(event));
    return cell;
  });

  cells.forEach(cell => fragment.appendChild(cell));
  boardGrid.appendChild(fragment);
}

function moveCell(event) {
  const emptyIdx = board.indexOf(0);
  const validMoves = getValidMoves(emptyIdx);
  const clickedIdx = board.indexOf(parseInt(event.target.dataset.index));
  
  if (validMoves.includes(clickedIdx)) {
    // Swap in board array
    [board[emptyIdx], board[clickedIdx]] = [board[clickedIdx], board[emptyIdx]];
    
    // Update UI
    const emptyCell = document.querySelector('[data-index="0"]');
    const clickedCell = event.target;
    
    emptyCell.textContent = clickedCell.textContent;
    clickedCell.textContent = '';
    
    emptyCell.dataset.index = clickedCell.dataset.index;
    clickedCell.dataset.index = '0';
    
    // Check win condition
    if (arraysEqual(board, getWinningPattern(gridSize))) {
      setTimeout(() => {
        alert('Congratulations! You solved the puzzle!');
      }, 100);
    }
  }
}

function shuffleArray(arr) {
  let emptyIdx = arr.indexOf(0);
  
  for (let i = 0; i < 2000; i++) {
    const validMoves = getValidMoves(emptyIdx);
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    [arr[emptyIdx], arr[randomMove]] = [arr[randomMove], arr[emptyIdx]];
    emptyIdx = randomMove;
  }
}

// Memoized winning pattern generator
function getWinningPattern(size) {
  const key = size.toString();
  if (winningPatternCache.has(key)) {
    return winningPatternCache.get(key);
  }
  
  const totalCells = size * size;
  const pattern = Array.from({ length: totalCells }, (_, idx) => (idx < totalCells - 1 ? idx + 1 : 0));
  winningPatternCache.set(key, pattern);
  return pattern;
}

function getValidMoves(emptyIdx, excludedRows = [], excludeIdxArr = []) {
  const size = Number(gridSize);
  const row = Math.floor(emptyIdx / size);
  const col = emptyIdx % size;
  const validMoves = [];

  // Optimize move checks using a directions array
  const directions = [
    { check: row > 0, move: -size }, // up
    { check: row < size - 1, move: size }, // down
    { check: col > 0, move: -1 }, // left
    { check: col < size - 1, move: 1 } // right
  ];

  for (const { check, move } of directions) {
    if (check) {
      const newIdx = emptyIdx + move;
      const newRow = Math.floor(newIdx / size);
      if (!excludedRows.includes(newRow) && !excludeIdxArr.includes(newIdx)) {
        validMoves.push(newIdx);
      }
    }
  }

  return validMoves;
}

function puzzleSolving() {
  document.getElementById('moveCount').textContent = 'Moving steps: 0';
  document.getElementById('computeCount').textContent = 'States computed: 0';
  document.getElementById('timeUsed').textContent = 'Time used: 0.00s';
  
  const startSolveTime = performance.now();
  const goalState = getWinningPattern(gridSize);
  const openSet = new MinHeap();
  const stateCache = new Map();
  let statesComputed = 0;
  
  let nextRowToSolve = 0;
  const excludedRows = [];
  const excludeIdxArr = [];
  const tileStates = {
    one: false,
    two: false,
    three: false
  };

  // Set 60 second time limit
  const startTime = Date.now();
  const TIME_LIMIT = 60000; // 60 seconds in milliseconds

  // Update time display
  function updateTimeDisplay() {
    const timeElapsed = Date.now() - startTime;
    const timeLeft = Math.max(0, Math.ceil((TIME_LIMIT - timeElapsed) / 1000));
    document.getElementById('status').textContent = `Time remaining: ${timeLeft}s`;
    
    // Update elapsed time
    const elapsedTime = ((performance.now() - startSolveTime) / 1000).toFixed(2);
    document.getElementById('timeUsed').textContent = `Time used: ${elapsedTime}s`;
  }

  // Start time display updates
  updateTimeDisplay();
  const timeDisplayInterval = setInterval(updateTimeDisplay, 1000);

  // Initialize search with current board state
  openSet.enqueue({ 
    state: board.slice(), 
    emptyIdx: board.indexOf(0), 
    moves: [], 
    cost: 0 
  }, 0);

  // Process states in chunks to prevent browser timeout
  function processStates() {
    const chunkStartTime = performance.now();
    const chunkTimeLimit = gridSize > 4 ? 50 : 16; // Increase time slice for larger puzzles

    // Check if overall time limit reached
    if (Date.now() - startTime > TIME_LIMIT) {
      clearInterval(timeDisplayInterval);
      const timeUsed = ((performance.now() - startSolveTime) / 1000).toFixed(2);
      document.getElementById('timeUsed').textContent = `Time used: ${timeUsed}s`;
      document.getElementById('status').textContent = 'Time limit reached (60s). Puzzle too complex.';
      return;
    }

    while (!openSet.isEmpty() && performance.now() - chunkStartTime < chunkTimeLimit) {
      const { state, emptyIdx, moves, cost } = openSet.dequeue();

      if (arraysEqual(state, goalState)) {
        clearInterval(timeDisplayInterval);
        const endTime = performance.now();
        const timeUsed = ((endTime - startSolveTime) / 1000).toFixed(2);
        document.getElementById('timeUsed').textContent = `Time used: ${timeUsed}s`;
        document.getElementById('status').textContent = '';
        executeMoves(moves);
        return;
      }

      const size = Number(gridSize);

      // Check tile states
      if (state[0] === goalState[0] && !tileStates.one) {
        if (!excludeIdxArr.includes(0)) {
          excludeIdxArr.push(0);
        }
        tileStates.one = true;
        openSet.clear();
      }

      if (size > 3 && state[size-1] === goalState[size-1] && !tileStates.two) {
        if (!excludeIdxArr.includes(size-1)) {
          excludeIdxArr.push(size-1);
        }
        tileStates.two = true;
        openSet.clear();
      }

      // Update excluded rows
      for (let i = (nextRowToSolve * size); i < state.length; i += size) {
        if (size - nextRowToSolve <= 2) break;
        
        const start = i;
        const end = i + size;
        const row = Math.floor(i / size);
        
        if (row === nextRowToSolve && arraysEqual(state.slice(start, end), goalState.slice(start, end))) {
          if (!excludedRows.includes(row)) {
            excludedRows.push(row);
          }
          
          if (state[size] === goalState[size] && !tileStates.three && size > 3 && nextRowToSolve === 1) {
            if (!excludeIdxArr.includes(size)) {
              excludeIdxArr.push(size);
            }
            tileStates.three = true;
            openSet.clear();
          }

          nextRowToSolve++;
          openSet.clear();
        }
      }

      // Process state
      const stateKey = state.join(',');
      if (stateCache.has(stateKey) && stateCache.get(stateKey) <= cost) {
        continue;
      }
      stateCache.set(stateKey, cost);
      statesComputed++;
      document.getElementById('computeCount').textContent = `States computed: ${statesComputed}`;

      // Process moves
      for (const move of getValidMoves(emptyIdx, excludedRows, excludeIdxArr)) {
        [state[emptyIdx], state[move]] = [state[move], state[emptyIdx]];
        
        const newKey = state.join(',');
        if (!stateCache.has(newKey)) {
          moves.push(move);
          const heuristicCost = moves.length + heuristic(state, goalState);
          openSet.enqueue({
            state: state.slice(),
            emptyIdx: move,
            moves: [...moves],
            cost: heuristicCost
          }, heuristicCost);
          moves.pop();
        }
        
        [state[emptyIdx], state[move]] = [state[move], state[emptyIdx]];
      }
    }

    // Schedule next chunk of processing
    if (!openSet.isEmpty()) {
      requestAnimationFrame(processStates);
    }
  }

  // Start processing
  requestAnimationFrame(processStates);
}

function heuristic(state, goalState) {
  let distance = 0;
  const size = Math.sqrt(state.length);
  const goalPositions = new Map();
  
  // Pre-calculate goal positions once
  if (!goalPositions.size) {
    goalState.forEach((value, index) => {
      if (value !== 0) {
        goalPositions.set(value, {
          row: Math.floor(index / size),
          col: index % size
        });
      }
    });
  }

  // Optimized distance calculation
  const stateSize = state.length;
  for (let i = 0; i < stateSize; i++) {
    const value = state[i];
    if (value !== 0) {
      const currentRow = Math.floor(i / size);
      const currentCol = i % size;
      const goal = goalPositions.get(value);
      
      // Enhanced Manhattan Distance with weighted components
      const rowDist = Math.abs(currentRow - goal.row);
      const colDist = Math.abs(currentCol - goal.col);
      distance += (rowDist + colDist) * 2;

      // Optimized Linear Conflict
      if (currentRow === goal.row) {
        const rowStart = currentRow * size;
        const rowEnd = rowStart + size;
        for (let j = i + 1; j < rowEnd; j++) {
          const otherValue = state[j];
          if (otherValue !== 0) {
            const otherGoal = goalPositions.get(otherValue);
            if (otherGoal.row === currentRow && otherGoal.col < goal.col) {
              distance += 4; // Increased penalty for conflicts
            }
          }
        }
      }

      // Add column conflict detection
      if (currentCol === goal.col) {
        for (let j = i + size; j < stateSize; j += size) {
          const otherValue = state[j];
          if (otherValue !== 0) {
            const otherGoal = goalPositions.get(otherValue);
            if (otherGoal.col === currentCol && otherGoal.row < goal.row) {
              distance += 4; // Penalty for column conflicts
            }
          }
        }
      }
    }
  }
  return distance * (size > 4 ? 1.5 : 1); // Increase heuristic weight for larger puzzles
}

function executeMoves(moves) {
  if (!moves.length) return;
  
  let moveCount = 0;
  document.getElementById('status').textContent = `Executing solution...`;
  document.getElementById('moveCount').textContent = `Moving steps: ${moves.length}`;
  
  const interval = setInterval(() => {
    if (!moves.length) {
      clearInterval(interval);
      document.getElementById('status').textContent = 'Solved!';
      return;
    }

    const move = moves.shift();
    const emptyIdx = board.indexOf(0);
    moveCount++;
    document.getElementById('moveCount').textContent = `Moving steps: ${moveCount} of ${moves.length + moveCount}`;
    
    [board[emptyIdx], board[move]] = [board[move], board[emptyIdx]];
    
    const emptyCell = document.querySelector('[data-index="0"]');
    const targetCell = document.querySelector(`[data-index="${board[emptyIdx]}"]`);
    
    emptyCell.textContent = targetCell.textContent;
    targetCell.textContent = '';
    emptyCell.dataset.index = board[emptyIdx];
    targetCell.dataset.index = '0';
  }, 50);
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, idx) => val === b[idx]);
}

class MinHeap {
  constructor() {
    this.heap = [];
  }

  clear() {
    this.heap = [];
  }

  enqueue(item, priority) {
    this.heap.push({ item, priority });
    this.bubbleUp();
  }

  dequeue() {
    const top = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this.bubbleDown();
    }
    return top.item;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  bubbleUp() {
    let idx = this.heap.length - 1;
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      if (this.heap[idx].priority >= this.heap[parentIdx].priority) break;
      [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
      idx = parentIdx;
    }
  }

  bubbleDown() {
    let idx = 0;
    while (true) {
      const leftIdx = 2 * idx + 1;
      const rightIdx = 2 * idx + 2;
      let smallest = idx;

      if (leftIdx < this.heap.length && this.heap[leftIdx].priority < this.heap[smallest].priority) {
        smallest = leftIdx;
      }
      if (rightIdx < this.heap.length && this.heap[rightIdx].priority < this.heap[smallest].priority) {
        smallest = rightIdx;
      }
      if (smallest === idx) break;

      [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
      idx = smallest;
    }
  }
}
