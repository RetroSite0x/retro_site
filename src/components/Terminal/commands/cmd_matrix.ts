import type { CommandHandler } from '../../../types/terminal';

const KATAKANA_CHARS = 'ｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾙﾚﾛﾜﾝ';
const ASCII_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function randomChar(): string {
  const source = Math.random() > 0.5 ? KATAKANA_CHARS : ASCII_CHARS;
  return source[Math.floor(Math.random() * source.length)];
}

function generateRainLine(width: number): string {
  let line = '';
  for (let i = 0; i < width; i++) {
    // ~40% chance of a character at each position
    if (Math.random() < 0.4) {
      line += randomChar();
    } else {
      line += ' ';
    }
  }
  return line;
}

export const cmd_matrix: CommandHandler = () => {
  const width = 60;
  const height = 25;

  const lines: string[] = [
    'Matrix mode activated...',
    '',
  ];

  // Generate rain frames - each "frame" is a column of random chars
  for (let row = 0; row < height; row++) {
    lines.push(generateRainLine(width));
  }

  lines.push('');
  lines.push('Connection terminated.');

  return { type: 'output', content: lines.join('\n') };
};
