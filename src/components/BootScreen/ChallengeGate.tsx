import { useState, useEffect, useCallback, useRef } from 'react';
import { useSystemStore } from '../../store/useSystem';
import { soundEngine } from '../../lib/sound';
import styles from '../../styles/components/boot-screen.module.css';

const COLS = 20;
const ROWS = 12;
const FRUITS_TO_WIN = 3;
const TICK_MS = 140;

type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Cell = { x: number; y: number };

const INIT_SNAKE: Cell[] = [
  { x: 5, y: 6 },
  { x: 4, y: 6 },
  { x: 3, y: 6 },
];

function randomFood(snake: Cell[]): Cell {
  const occupied = new Set(snake.map((c) => `${c.x},${c.y}`));
  const free: Cell[] = [];
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  return free[Math.floor(Math.random() * free.length)];
}

export function ChallengeGate() {
  const login = useSystemStore((s) => s.login);
  const soundEnabled = useSystemStore((s) => s.soundEnabled);
  const [snake, setSnake] = useState(INIT_SNAKE);
  const [food, setFood] = useState(() => randomFood(INIT_SNAKE));
  const [fruits, setFruits] = useState(0);
  const [dead, setDead] = useState(false);
  const [won, setWon] = useState(false);
  const [started, setStarted] = useState(false);
  const dirRef = useRef<Dir>('RIGHT');
  const snakeRef = useRef(INIT_SNAKE);
  const foodRef = useRef(food);
  const fruitsRef = useRef(0);
  const deadRef = useRef(false);
  const wonRef = useRef(false);
  const tickRef = useRef<number | null>(null);

  const endGame = useCallback(
    (win: boolean) => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      if (win) {
        setWon(true);
        if (soundEnabled) soundEngine.bootChirp();
      } else {
        setDead(true);
        if (soundEnabled) soundEngine.errorBuzz();
      }
      setTimeout(() => login('nabil'), 1200);
    },
    [soundEnabled, login],
  );

  const tick = useCallback(() => {
    if (deadRef.current || wonRef.current) return;

    const d = dirRef.current;
    const head = snakeRef.current[0];
    const next: Cell = {
      x: head.x + (d === 'RIGHT' ? 1 : d === 'LEFT' ? -1 : 0),
      y: head.y + (d === 'DOWN' ? 1 : d === 'UP' ? -1 : 0),
    };

    if (next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS) {
      deadRef.current = true;
      setDead(true);
      if (soundEnabled) soundEngine.errorBuzz();
      if (tickRef.current) window.clearInterval(tickRef.current);
      setTimeout(() => login('nabil'), 1200);
      return;
    }

    const hitSelf = snakeRef.current.some((c) => c.x === next.x && c.y === next.y);
    if (hitSelf) {
      deadRef.current = true;
      setDead(true);
      if (soundEnabled) soundEngine.errorBuzz();
      if (tickRef.current) window.clearInterval(tickRef.current);
      setTimeout(() => login('nabil'), 1200);
      return;
    }

    const ate = next.x === foodRef.current.x && next.y === foodRef.current.y;
    const newSnake = [next, ...snakeRef.current];
    if (!ate) newSnake.pop();

    snakeRef.current = newSnake;
    setSnake([...newSnake]);

    if (ate) {
      const newFruits = fruitsRef.current + 1;
      fruitsRef.current = newFruits;
      setFruits(newFruits);
      if (soundEnabled) soundEngine.keyClick();
      if (newFruits >= FRUITS_TO_WIN) {
        wonRef.current = true;
        endGame(true);
        return;
      }
      const newFood = randomFood(newSnake);
      foodRef.current = newFood;
      setFood(newFood);
    }
  }, [endGame, soundEnabled]);

  useEffect(() => {
    if (!started) return;
    tickRef.current = window.setInterval(tick, TICK_MS);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [started, tick]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (deadRef.current || wonRef.current) return;

      const startKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'];
      if (!started && startKeys.includes(e.key)) {
        setStarted(true);
      }

      const map: Record<string, Dir> = {
        ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
        w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
        W: 'UP', S: 'DOWN', A: 'LEFT', D: 'RIGHT',
      };
      const next = map[e.key];
      if (!next) return;
      e.preventDefault();

      const cur = dirRef.current;
      if ((next === 'UP' && cur === 'DOWN') || (next === 'DOWN' && cur === 'UP') ||
          (next === 'LEFT' && cur === 'RIGHT') || (next === 'RIGHT' && cur === 'LEFT')) return;

      dirRef.current = next;
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [started]);

  const cellSet = new Set(snake.map((c) => `${c.x},${c.y}`));
  const snakeHead = snake[0];

  return (
    <div className={styles.container} role="dialog" aria-label="Challenge gate">
      <div className={styles.content}>
        <div aria-hidden="true" className={styles.loginBanner}>+============================================+</div>
        <div aria-hidden="true" className={styles.loginBanner}>|         WELCOME TO NABIL'S OS              |</div>
        <div aria-hidden="true" className={styles.loginBanner}>+============================================+</div>
        <div className={styles.snakeStatus}>
          <span>snacks collected: {fruits}/{FRUITS_TO_WIN}</span>
          <span>{dead ? 'oops — try again!' : won ? 'you made it!' : ''}</span>
        </div>

        <div className={styles.snakeGrid} role="grid" aria-label="Snake game board">
          {Array.from({ length: ROWS }, (_, y) => (
            <div key={y} className={styles.snakeRow} role="row">
              {Array.from({ length: COLS }, (_, x) => {
                const isHead = snakeHead.x === x && snakeHead.y === y;
                const isBody = !isHead && cellSet.has(`${x},${y}`);
                const isFood = food.x === x && food.y === y;
                const isBorder = x === 0 || x === COLS - 1 || y === 0 || y === ROWS - 1;

                let cellClass = styles.snakeCell;
                if (isBorder) cellClass += ` ${styles.snakeBorder}`;
                if (isHead) cellClass += ` ${styles.snakeHead}`;
                else if (isBody) cellClass += ` ${styles.snakeBody}`;
                if (isFood) cellClass += ` ${styles.snakeFood}`;
                if (dead && (isHead || isBody)) cellClass += ` ${styles.snakeDead}`;

                return (
                  <div key={x} className={cellClass} role="gridcell">
                    {isHead ? (dead ? 'X' : 'O') : isFood ? '\u2666' : ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {!started && (
          <div className={styles.snakeHint}>
            grab a few snacks to enter — arrow keys or WASD
          </div>
        )}
        {(dead || won) && (
          <div className={styles.snakeEndMsg}>
            {dead ? 'nice try — loading desktop anyway...' : 'all snacks acquired — welcome aboard!'}
          </div>
        )}
      </div>
    </div>
  );
}
