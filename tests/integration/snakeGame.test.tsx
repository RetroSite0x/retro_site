import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  SnakeGame,
  stepGame,
  nextHead,
  isWallCollision,
  isSelfCollision,
  isOppositeDir,
  randomFood,
  COLS,
  ROWS,
  type Point,
  type Direction,
} from '../../src/components/Snake/SnakeGame';
import { executeCommand, registerCommand } from '../../src/components/Terminal/CommandRegistry';
import { cmd_snake } from '../../src/components/Terminal/commands/cmd_snake';
import { useTerminalStore } from '../../src/store/useTerminal';
import { Terminal } from '../../src/components/Terminal/Terminal';

// ---------------------------------------------------------------------------
// Pure helper unit tests
// ---------------------------------------------------------------------------
describe('snake pure helpers', () => {
  it('nextHead computes the next position', () => {
    expect(nextHead({ x: 5, y: 5 }, { x: 1, y: 0 })).toEqual({ x: 6, y: 5 });
    expect(nextHead({ x: 5, y: 5 }, { x: 0, y: -1 })).toEqual({ x: 5, y: 4 });
  });

  it('isWallCollision detects out-of-bounds', () => {
    expect(isWallCollision({ x: -1, y: 0 }, 20, 16)).toBe(true);
    expect(isWallCollision({ x: 20, y: 0 }, 20, 16)).toBe(true);
    expect(isWallCollision({ x: 0, y: -1 }, 20, 16)).toBe(true);
    expect(isWallCollision({ x: 0, y: 16 }, 20, 16)).toBe(true);
    expect(isWallCollision({ x: 10, y: 8 }, 20, 16)).toBe(false);
  });

  it('isSelfCollision detects head on body', () => {
    const body: Point[] = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
    expect(isSelfCollision({ x: 4, y: 5 }, body)).toBe(true);
    expect(isSelfCollision({ x: 10, y: 10 }, body)).toBe(false);
  });

  it('isOppositeDir detects opposite directions', () => {
    const right: Direction = { x: 1, y: 0 };
    const left: Direction = { x: -1, y: 0 };
    const up: Direction = { x: 0, y: -1 };
    const down: Direction = { x: 0, y: 1 };

    expect(isOppositeDir(right, left)).toBe(true);
    expect(isOppositeDir(left, right)).toBe(true);
    expect(isOppositeDir(up, down)).toBe(true);
    expect(isOppositeDir(right, up)).toBe(false);
    expect(isOppositeDir(right, right)).toBe(false);
  });

  it('randomFood returns a point not occupied by the snake', () => {
    const snake: Point[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }];
    // Run 20 times to reduce flakiness from randomness
    for (let i = 0; i < 20; i++) {
      const food = randomFood(5, 5, snake);
      expect(food.x).toBeGreaterThanOrEqual(0);
      expect(food.x).toBeLessThan(5);
      expect(food.y).toBeGreaterThanOrEqual(0);
      expect(food.y).toBeLessThan(5);
      const onSnake = snake.some((s) => s.x === food.x && s.y === food.y);
      expect(onSnake).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// stepGame — the core tick logic
// ---------------------------------------------------------------------------
describe('stepGame', () => {
  it('moves the snake forward when no food is eaten', () => {
    const snake: Point[] = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ];
    const food: Point = { x: 10, y: 10 };
    const result = stepGame(snake, { x: 1, y: 0 }, food, 0, COLS, ROWS);

    expect(result.gameOver).toBe(false);
    expect(result.ate).toBe(false);
    expect(result.score).toBe(0);
    expect(result.snake[0]).toEqual({ x: 6, y: 5 });
    expect(result.snake).toHaveLength(3);
  });

  it('grows the snake and increments score when eating food', () => {
    const snake: Point[] = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ];
    const food: Point = { x: 6, y: 5 }; // food is directly ahead
    const result = stepGame(snake, { x: 1, y: 0 }, food, 20, COLS, ROWS);

    expect(result.ate).toBe(true);
    expect(result.score).toBe(30);
    expect(result.snake).toHaveLength(4);
    expect(result.snake[0]).toEqual({ x: 6, y: 5 });
    // Tail is preserved
    expect(result.snake[3]).toEqual({ x: 3, y: 5 });
  });

  it('returns gameOver on wall collision', () => {
    const snake: Point[] = [
      { x: 19, y: 0 },
      { x: 18, y: 0 },
      { x: 17, y: 0 },
    ];
    const food: Point = { x: 0, y: 0 };
    const result = stepGame(snake, { x: 1, y: 0 }, food, 0, COLS, ROWS);

    expect(result.gameOver).toBe(true);
    expect(result.ate).toBe(false);
  });

  it('returns gameOver on self collision', () => {
    // Snake: head at (5,5), moving left → newHead (4,5) which is body[0]
    const snake: Point[] = [
      { x: 5, y: 5 },
      { x: 4, y: 5 }, // This is where the head would go
      { x: 3, y: 5 },
    ];
    const food: Point = { x: 0, y: 0 };
    const result = stepGame(snake, { x: -1, y: 0 }, food, 0, COLS, ROWS);

    expect(result.gameOver).toBe(true);
    expect(result.ate).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Component integration tests
// ---------------------------------------------------------------------------
describe('SnakeGame component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Stub localStorage
    const store: Record<string, string> = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
      (key: string) => store[key] ?? null,
    );
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
      (key: string, value: string) => {
        store[key] = value;
      },
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders the score header and board', () => {
    render(<SnakeGame onExit={vi.fn()} />);
    expect(screen.getByText(/SCORE: 0/)).toBeInTheDocument();
    expect(screen.getByText(/HIGH: 0/)).toBeInTheDocument();
    // Board renders 20*16 = 320 cells
    const board = document.querySelector('[class*="snakeBoard"]');
    expect(board).toBeTruthy();
  });

  it('renders D-pad with 4 accessible direction buttons', () => {
    render(<SnakeGame onExit={vi.fn()} />);
    expect(
      screen.getByRole('button', { name: /move up/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /move left/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /move right/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /move down/i }),
    ).toBeInTheDocument();
  });

  it('keyboard inputs do not throw and game keeps rendering', () => {
    render(<SnakeGame onExit={vi.fn()} />);
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'd' });
    act(() => { vi.advanceTimersByTime(600); });
    expect(screen.getByText(/SCORE:/)).toBeInTheDocument();
  });

  it('Space toggles pause on and off', () => {
    render(<SnakeGame onExit={vi.fn()} />);
    // Pause
    fireEvent.keyDown(window, { key: ' ' });
    expect(screen.getByText('PAUSED')).toBeInTheDocument();
    // Resume
    fireEvent.keyDown(window, { key: ' ' });
    expect(screen.queryByText('PAUSED')).not.toBeInTheDocument();
  });

  it('Escape calls onExit with the current score', () => {
    const onExit = vi.fn();
    render(<SnakeGame onExit={onExit} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onExit).toHaveBeenCalledTimes(1);
    expect(onExit).toHaveBeenCalledWith(0);
  });

  it('EXIT button calls onExit after game over', () => {
    const onExit = vi.fn();
    render(<SnakeGame onExit={onExit} />);
    // Advance enough ticks for the snake (starting at x=10, moving right)
    // to hit the right wall at x=20
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText('GAME OVER')).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByText('EXIT'));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('RESTART button in game over overlay resets the game', () => {
    render(<SnakeGame onExit={vi.fn()} />);
    // Force game over
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText('GAME OVER')).toBeInTheDocument();
    // Restart — overlay button has no aria-label, so accessible name is just "RESTART"
    fireEvent.pointerDown(screen.getByRole('button', { name: 'RESTART' }));
    expect(screen.queryByText('GAME OVER')).not.toBeInTheDocument();
    expect(screen.getByText(/SCORE: 0/)).toBeInTheDocument();
  });

  it('PAUSE button toggles pause', () => {
    render(<SnakeGame onExit={vi.fn()} />);
    fireEvent.pointerDown(screen.getByLabelText('Pause game'));
    expect(screen.getByText('PAUSED')).toBeInTheDocument();
    // Button text changes to RESUME
    fireEvent.pointerDown(screen.getByLabelText('Pause game'));
    expect(screen.queryByText('PAUSED')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Terminal / command wiring
// ---------------------------------------------------------------------------
describe('snake command wiring', () => {
  beforeEach(() => {
    registerCommand('snake', cmd_snake);
    useTerminalStore.setState({ activeGame: null, history: [] });
  });

  afterEach(() => {
    useTerminalStore.setState({ activeGame: null, history: [] });
  });

  it('cmd_snake starts the game and returns a control hint', () => {
    const result = executeCommand('snake');

    expect(result).not.toBeNull();
    expect(result!.content).toMatch(/snake:/i);
    expect(useTerminalStore.getState().activeGame).toBe('snake');
  });

  it('Terminal renders the on-screen direction controller while the game is active', () => {
    useTerminalStore.setState({ activeGame: 'snake' });
    render(<Terminal />);

    expect(screen.getByRole('button', { name: /move up/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /move down/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /move left/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /move right/i })).toBeInTheDocument();
  });

  it('Terminal renders no controller when no game is active', () => {
    render(<Terminal />);

    expect(screen.queryByRole('button', { name: /move up/i })).not.toBeInTheDocument();
  });
});
