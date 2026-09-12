import type { CommandHandler } from '../../../types/terminal';

const W = 24;
const H = 14;

function buildGrid(snakeBody: [number, number][], foods: [number, number][], headDir: string): string[][] {
  const grid: string[][] = [];
  for (let y = 0; y < H; y++) {
    const row: string[] = [];
    for (let x = 0; x < W; x++) {
      row.push('·');
    }
    grid.push(row);
  }
  for (const fx of foods) {
    if (fx[0] >= 0 && fx[0] < W && fx[1] >= 0 && fx[1] < H) {
      grid[fx[1]][fx[0]] = '●';
    }
  }
  for (let i = snakeBody.length - 1; i >= 0; i--) {
    const [sx, sy] = snakeBody[i];
    if (sx >= 0 && sx < W && sy >= 0 && sy < H) {
      grid[sy][sx] = i === 0 ? headDir : '▓';
    }
  }
  return grid;
}

function runSnake(): { score: number; grid: string[][] } {
  let snake: [number, number][] = [[5, 7], [4, 7], [3, 7], [2, 7], [1, 7]];
  const foods: [number, number][] = [[18, 4], [10, 10], [20, 2], [14, 11], [7, 3]];
  let score = 0;
  const dirs: [number, number][] = [[1, 0], [0, -1], [1, 0], [1, 0], [0, -1], [1, 0], [1, 0], [0, 1], [1, 0], [1, 0], [0, 1], [1, 0], [0, 1], [0, 1], [1, 0], [1, 0], [1, 0], [0, -1], [1, 0], [1, 0], [0, 1], [1, 0], [0, 1], [1, 0], [0, 1], [1, 0], [1, 0], [0, 1], [0, 1], [1, 0]];
  let lastDir: [number, number] = [1, 0];

  for (const dir of dirs) {
    const head = snake[0];
    const newHead: [number, number] = [head[0] + dir[0], head[1] + dir[1]];
    lastDir = dir;

    let ate = false;
    for (let i = 0; i < foods.length; i++) {
      if (foods[i][0] === newHead[0] && foods[i][1] === newHead[1]) {
        score += 10;
        ate = true;
        break;
      }
    }

    snake.unshift(newHead);
    if (!ate) {
      snake.pop();
    }
  }

  const headSymbol = lastDir[0] === 1 ? '▶' : lastDir[0] === -1 ? '◀' : lastDir[1] === -1 ? '▲' : '▼';

  const lastHead = snake[0];
  const crashDirs: [number, number][] = [[0, 1], [1, 0], [1, 0], [0, -1], [1, 0], [0, 1]];
  for (const cd of crashDirs) {
    const nh: [number, number] = [lastHead[0] + cd[0], lastHead[1] + cd[1]];
    if (nh[0] >= 0 && nh[0] < W && nh[1] >= 0 && nh[1] < H) {
      const isSnake = snake.some(s => s[0] === nh[0] && s[1] === nh[1]);
      if (!isSnake) {
        snake.unshift(nh);
        break;
      }
    }
  }

  const finalGrid = buildGrid(snake, foods, headSymbol);
  return { score, grid: finalGrid };
}

export const cmd_snake: CommandHandler = () => {
  const { score, grid } = runSnake();
  const lines: string[] = [
    '',
    '  ╔══════════════════════════════════════════════════╗',
    '  ║       🐍  S N A K E   G A M E  🐍              ║',
    '  ║  ─────────────────────────────────────────────  ║',
  ];

  const scoreStr = `SCORE: ${String(score).padStart(3)}    HIGH: 087    LEVEL: ${Math.floor(score / 30) + 1}`;
  lines.push(`  ║  ${scoreStr.padEnd(50)}║`);
  lines.push('  ╠══════════════════════════════════════════════════╣');
  lines.push('  ║ ┌' + '─'.repeat(W) + '┐ ║');

  for (let y = 0; y < H; y++) {
    let row = '  ║ │';
    for (let x = 0; x < W; x++) {
      row += grid[y][x];
    }
    row += '│ ║';
    lines.push(row);
  }

  lines.push('  ║ └' + '─'.repeat(W) + '┘ ║');
  lines.push('  ╠══════════════════════════════════════════════════╣');
  lines.push('  ║                                                  ║');
  lines.push('  ║         ╔══════════════════════════╗             ║');
  lines.push('  ║         ║    G A M E   O V E R     ║             ║');
  lines.push('  ║         ╚══════════════════════════╝             ║');
  lines.push('  ║                                                  ║');
  lines.push('  ║       You crashed into the wall!                 ║');
  lines.push('  ║       Final Score: ' + String(score).padEnd(3) + '                       ║');
  lines.push('  ║                                                  ║');
  lines.push('  ╚══════════════════════════════════════════════════╝');
  lines.push('');

  return { type: 'output', content: lines.join('\n') };
};
