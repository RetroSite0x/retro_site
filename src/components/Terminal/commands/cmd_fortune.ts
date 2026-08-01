import type { CommandHandler } from '../../../types/terminal';

const FORTUNES = [
  'Talk is cheap. Show me the code. \u2014 Linus Torvalds',
  'First, solve the problem. Then, write the code. \u2014 John Johnson',
  'Any sufficiently advanced technology is indistinguishable from magic. \u2014 Arthur C. Clarke',
  'The best error message is the one that never shows up. \u2014 Thomas Fuchs',
  'Code is like humor. When you have to explain it, it\'s bad. \u2014 Cory House',
  'You have power over your mind, not outside events. \u2014 Marcus Aurelius',
  'Simplicity is the soul of efficiency. \u2014 Austin Freeman',
  'Make it work, make it right, make it fast. \u2014 Kent Beck',
  'The most dangerous phrase is: We\'ve always done it this way. \u2014 Grace Hopper',
  'Stay hungry, stay foolish. \u2014 Steve Jobs',
  'Debugging is twice as hard as writing the code in the first place. \u2014 Brian Kernighan',
  'Unix is simple. It just takes a genius to understand its simplicity. \u2014 Dennis Ritchie',
  'In the beginning the Universe was created. This has made a lot of people very angry and been widely regarded as a bad move. \u2014 Douglas Adams',
  'The computer was born to solve problems that did not exist before. \u2014 Bill Gates',
  'It\'s not a bug \u2014 it\'s an undocumented feature. \u2014 Anonymous',
  'A language that doesn\'t affect the way you think about programming is not worth knowing. \u2014 Alan Perlis',
  'Premature optimization is the root of all evil. \u2014 Donald Knuth',
  'The only way to learn a new programming language is by writing programs in it. \u2014 Dennis Ritchie',
  'I could have written a shorter letter, but I didn\'t have the time. \u2014 Blaise Pascal',
  'Computers are good at following instructions, but not at reading your mind. \u2014 Donald Knuth',
];

export const cmd_fortune: CommandHandler = () => {
  const index = Math.floor(Math.random() * FORTUNES.length);
  return { type: 'output', content: FORTUNES[index] };
};
