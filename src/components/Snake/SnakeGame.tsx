import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import styles from '../../styles/components/snake.module.css';

/* ── Constants ────────────────────────────────────────────────────────── */
export const COLS = 20;
export const ROWS = 16;
const INITIAL_SPEED = 140;
const MIN_SPEED = 70;
const SPEED_DECREASE = 3;
const INITIAL_SNAKE_LENGTH = 4;
const FOOD_SCORE = 10;
const SWIPE_THRESHOLD = 24;
const HIGH_SCORE_KEY = 'nabilos-snake-high';

/* ── Types ────────────────────────────────────────────────────────────── */
export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Direction {
  readonly x: number;
  readonly y: number;
}

export interface StepResult {
  readonly snake: readonly Point[];
  readonly food: Point;
  readonly score: number;
  readonly gameOver: boolean;
  readonly ate: boolean;
}

type GameStatus = 'playing' | 'paused' | 'gameover';

/* ── Direction constants ──────────────────────────────────────────────── */
const DIR_RIGHT: Direction = { x: 1, y: 0 };
const DIR_LEFT: Direction = { x: -1, y: 0 };
const DIR_UP: Direction = { x: 0, y: -1 };
const DIR_DOWN: Direction = { x: 0, y: 1 };

/* ── Pure helpers (exported for testing) ──────────────────────────────── */

export function nextHead(head: Point, dir: Direction): Point {
  return { x: head.x + dir.x, y: head.y + dir.y };
}

export function isWallCollision(head: Point, cols: number, rows: number): boolean {
  return head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows;
}

export function isSelfCollision(head: Point, body: readonly Point[]): boolean {
  return body.some((seg) => seg.x === head.x && seg.y === head.y);
}

export function isOppositeDir(a: Direction, b: Direction): boolean {
  return a.x + b.x === 0 && a.y + b.y === 0 && (a.x !== 0 || a.y !== 0);
}

export function randomFood(
  cols: number,
  rows: number,
  snake: readonly Point[],
): Point {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
  const empty: Point[] = [];
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (!occupied.has(`${x},${y}`)) empty.push({ x, y });
    }
  }
  return empty[Math.floor(Math.random() * empty.length)];
}

/** Core tick logic — pure function, no side effects. */
export function stepGame(
  snake: readonly Point[],
  direction: Direction,
  food: Point,
  score: number,
  cols: number,
  rows: number,
): StepResult {
  const head = snake[0];
  const newHead = nextHead(head, direction);

  if (isWallCollision(newHead, cols, rows)) {
    return { snake, food, score, gameOver: true, ate: false };
  }

  // Check against all segments except the tail — it moves away when not
  // eating, and food never spawns on the snake so head can't land on tail
  // via eating.
  if (isSelfCollision(newHead, snake.slice(0, -1))) {
    return { snake, food, score, gameOver: true, ate: false };
  }

  const ate = newHead.x === food.x && newHead.y === food.y;
  const newSnake: Point[] = [newHead, ...snake];
  if (!ate) newSnake.pop();

  const newScore = ate ? score + FOOD_SCORE : score;
  const newFood = ate ? randomFood(cols, rows, newSnake) : food;

  return { snake: newSnake, food: newFood, score: newScore, gameOver: false, ate };
}

/* ── localStorage helpers (guarded for jsdom / private-browsing) ──────── */
function loadHighScore(): number {
  try {
    const raw = localStorage.getItem(HIGH_SCORE_KEY);
    return raw !== null ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

function saveHighScore(score: number): void {
  try {
    if (score > loadHighScore()) {
      localStorage.setItem(HIGH_SCORE_KEY, String(score));
    }
  } catch {
    /* localStorage may be unavailable */
  }
}

/* ── Mutable game state (ref-based so tick always reads fresh data) ──── */
interface GameData {
  snake: Point[];
  food: Point;
  score: number;
  highScore: number;
  direction: Direction;
  status: GameStatus;
  speed: number;
  dirQueue: Direction[];
}

function createGameData(highScore: number): GameData {
  const midX = Math.floor(COLS / 2);
  const midY = Math.floor(ROWS / 2);
  const snake: Point[] = [];
  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    snake.push({ x: midX - i, y: midY });
  }
  const food = randomFood(COLS, ROWS, snake);
  return {
    snake,
    food,
    score: 0,
    highScore,
    direction: DIR_RIGHT,
    status: 'playing',
    speed: INITIAL_SPEED,
    dirQueue: [],
  };
}

/* ── Component ────────────────────────────────────────────────────────── */
export interface SnakeGameProps {
  onExit: (score: number) => void;
}

export function SnakeGame({ onExit }: SnakeGameProps): JSX.Element {
  const gameRef = useRef<GameData>(createGameData(loadHighScore()));
  // Version counter triggers re-renders after ref mutations
  const [, setRenderTick] = useState(0);
  const bump = useCallback(() => setRenderTick((v) => v + 1), []);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const onExitRef = useRef(onExit);
  onExitRef.current = onExit;

  /* ── Core tick ──────────────────────────────────────────────────────── */
  const tick = useCallback(() => {
    if (!mountedRef.current) return;
    const g = gameRef.current;
    if (g.status !== 'playing') return;

    // Apply at most one valid queued direction per tick
    let dir = g.direction;
    while (g.dirQueue.length > 0) {
      const next = g.dirQueue.shift()!;
      if (!isOppositeDir(next, dir)) {
        dir = next;
        break;
      }
    }
    g.direction = dir;

    const result = stepGame(g.snake, dir, g.food, g.score, COLS, ROWS);

    if (result.gameOver) {
      saveHighScore(g.score);
      g.status = 'gameover';
      g.highScore = Math.max(g.score, loadHighScore());
      bump();
      return;
    }

    if (result.ate) {
      g.speed = Math.max(MIN_SPEED, g.speed - SPEED_DECREASE);
      if (tickRef.current !== null) {
        clearInterval(tickRef.current);
        tickRef.current = setInterval(tick, g.speed);
      }
    }

    g.snake = result.snake as Point[];
    g.food = result.food;
    g.score = result.score;
    bump();
  }, [bump]);

  /* ── Interval management ────────────────────────────────────────────── */
  const startLoop = useCallback(() => {
    if (tickRef.current !== null) clearInterval(tickRef.current);
    tickRef.current = setInterval(tick, gameRef.current.speed);
  }, [tick]);

  const stopLoop = useCallback(() => {
    if (tickRef.current !== null) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  /* ── Control callbacks ──────────────────────────────────────────────── */
  const togglePause = useCallback(() => {
    const g = gameRef.current;
    if (g.status === 'playing') {
      stopLoop();
      g.status = 'paused';
      bump();
    } else if (g.status === 'paused') {
      g.status = 'playing';
      startLoop();
      bump();
    }
  }, [stopLoop, startLoop, bump]);

  const restart = useCallback(() => {
    stopLoop();
    const hs = loadHighScore();
    const fresh = createGameData(hs);
    Object.assign(gameRef.current, fresh);
    tickRef.current = null;
    startLoop();
    bump();
  }, [stopLoop, startLoop, bump]);

  const handleExit = useCallback(() => {
    stopLoop();
    saveHighScore(gameRef.current.score);
    onExitRef.current(gameRef.current.score);
  }, [stopLoop]);

  const queueDirection = useCallback((dir: Direction) => {
    const g = gameRef.current;
    if (g.status !== 'playing') return;
    const queue = g.dirQueue;
    if (queue.length < 2) {
      const lastDir =
        queue.length > 0 ? queue[queue.length - 1] : g.direction;
      if (!isOppositeDir(dir, lastDir)) {
        queue.push(dir);
      }
    }
  }, []);

  /* ── Keyboard handler (capture phase) ──────────────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key;
      switch (key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          e.stopPropagation();
          queueDirection(DIR_UP);
          return;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          e.stopPropagation();
          queueDirection(DIR_DOWN);
          return;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          e.stopPropagation();
          queueDirection(DIR_LEFT);
          return;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          e.stopPropagation();
          queueDirection(DIR_RIGHT);
          return;
        case ' ':
          e.preventDefault();
          e.stopPropagation();
          togglePause();
          return;
        case 'r':
        case 'R':
          e.preventDefault();
          e.stopPropagation();
          restart();
          return;
        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          handleExit();
          return;
        default:
          return;
      }
    };

    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true });
  }, [queueDirection, togglePause, restart, handleExit]);

  /* ── Mount / unmount ────────────────────────────────────────────────── */
  useEffect(() => {
    mountedRef.current = true;
    startLoop();
    return () => {
      mountedRef.current = false;
      stopLoop();
    };
  }, [startLoop, stopLoop]);

  /* ── Swipe (pointer events on the board) ────────────────────────────── */
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const onBoardPointerDown = useCallback((e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onBoardPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const start = pointerStartRef.current;
      if (start === null) return;
      pointerStartRef.current = null;

      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx < SWIPE_THRESHOLD && absDy < SWIPE_THRESHOLD) return;

      if (absDx > absDy) {
        queueDirection(dx > 0 ? DIR_RIGHT : DIR_LEFT);
      } else {
        queueDirection(dy > 0 ? DIR_DOWN : DIR_UP);
      }
    },
    [queueDirection],
  );

  /* ── D-pad handlers ─────────────────────────────────────────────────── */
  const makeDpadHandler = useCallback(
    (dir: Direction) => (e: React.PointerEvent) => {
      e.preventDefault();
      queueDirection(dir);
    },
    [queueDirection],
  );

  /* ── Board sizing (fit the available area, keep square cells) ───────── */
  const areaRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState<{ w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;

    const compute = () => {
      const aw = el.clientWidth;
      const ah = el.clientHeight;
      if (aw <= 0 || ah <= 0) return;
      const h = Math.min(ah, (aw * ROWS) / COLS);
      const w = (h * COLS) / ROWS;
      setBoardSize({ w: Math.floor(w), h: Math.floor(h) });
    };

    compute();
    const raf = requestAnimationFrame(compute);
    window.addEventListener('resize', compute);

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(compute);
      ro.observe(el);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', compute);
      ro?.disconnect();
    };
  }, []);

  // Dismiss the on-screen keyboard so it does not shrink the play area
  useEffect(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
  }, []);

  /* ── Render (read from ref, guaranteed fresh after bump) ────────────── */
  const g = gameRef.current;
  const { snake, food, score, highScore, status } = g;

  return (
    <div className={styles.snakeRoot}>
      {/* Header */}
      <div className={styles.snakeHeader}>
        <span className={styles.snakeScore}>SCORE: {score}</span>
        <span className={styles.snakeHighScore}>HIGH: {highScore}</span>
        {status === 'paused' && (
          <span className={styles.snakePaused}>PAUSED</span>
        )}
      </div>

      {/* Board */}
      <div className={styles.snakeBoardArea} ref={areaRef}>
        <div
          className={styles.snakeBoard}
          style={boardSize ? { width: boardSize.w, height: boardSize.h } : undefined}
          onPointerDown={onBoardPointerDown}
          onPointerUp={onBoardPointerUp}
        >
          {Array.from({ length: ROWS }, (_, row) =>
            Array.from({ length: COLS }, (_, col) => {
              const isHead =
                snake[0].x === col && snake[0].y === row;
              const isBody =
                !isHead &&
                snake.some((s) => s.x === col && s.y === row);
              const isFood = food.x === col && food.y === row;
              const cls = isHead
                ? styles.snakeHead
                : isBody
                  ? styles.snakeBody
                  : isFood
                    ? styles.snakeFood
                    : styles.snakeCell;
              return <div key={`${col}-${row}`} className={cls} />;
            }),
          )}
        </div>
      </div>

      {/* Game Over overlay */}
      {status === 'gameover' && (
        <div className={styles.snakeOverlay}>
          <div className={styles.snakeGameOverBox}>
            <div className={styles.snakeGameOverTitle}>GAME OVER</div>
            <div className={styles.snakeGameOverScore}>Score: {score}</div>
            <div className={styles.snakeOverlayButtons}>
              <button
                type="button"
                className={styles.snakeBtn}
                onPointerDown={(e) => {
                  e.preventDefault();
                  restart();
                }}
              >
                RESTART
              </button>
              <button
                type="button"
                className={styles.snakeBtn}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleExit();
                }}
              >
                EXIT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls: D-pad + action buttons */}
      <div className={styles.snakeControls}>
        <div className={styles.snakeDpad}>
          <div />
          <button
            type="button"
            className={styles.snakeDpadBtn}
            aria-label="Move up"
            onPointerDown={makeDpadHandler(DIR_UP)}
          >
            ▲
          </button>
          <div />
          <button
            type="button"
            className={styles.snakeDpadBtn}
            aria-label="Move left"
            onPointerDown={makeDpadHandler(DIR_LEFT)}
          >
            ◀
          </button>
          <div className={styles.snakeDpadCenter} />
          <button
            type="button"
            className={styles.snakeDpadBtn}
            aria-label="Move right"
            onPointerDown={makeDpadHandler(DIR_RIGHT)}
          >
            ▶
          </button>
          <div />
          <button
            type="button"
            className={styles.snakeDpadBtn}
            aria-label="Move down"
            onPointerDown={makeDpadHandler(DIR_DOWN)}
          >
            ▼
          </button>
          <div />
        </div>
        <div className={styles.snakeActionBtns}>
          <button
            type="button"
            className={styles.snakeBtn}
            aria-label="Pause game"
            onPointerDown={(e) => {
              e.preventDefault();
              togglePause();
            }}
          >
            {status === 'paused' ? 'RESUME' : 'PAUSE'}
          </button>
          <button
            type="button"
            className={styles.snakeBtn}
            aria-label="Restart game"
            onPointerDown={(e) => {
              e.preventDefault();
              restart();
            }}
          >
            RESTART
          </button>
        </div>
      </div>
    </div>
  );
}
