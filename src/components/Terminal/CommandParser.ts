import type { ParsedCommand } from '../../types/terminal';

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

export function parse(input: string): ParsedCommand | ParseError {
  const trimmed = input.trim();
  if (!trimmed) {
    return new ParseError('empty input');
  }

  const tokens: string[] = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];

    if (ch === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (ch === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (ch === ' ' && !inSingleQuote && !inDoubleQuote) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += ch;
  }

  if (current) tokens.push(current);
  if (inSingleQuote || inDoubleQuote) {
    return new ParseError('unclosed quote');
  }

  if (tokens.length === 0) {
    return new ParseError('empty input');
  }

  const name = tokens[0].toLowerCase();
  const args: string[] = [];
  const flags: Record<string, string | boolean> = {};
  let redirect: ParsedCommand['redirect'] = undefined;

  let i = 1;
  while (i < tokens.length) {
    const token = tokens[i];

    // Redirect
    if (token === '>' || token === '>>') {
      if (i + 1 >= tokens.length) {
        return new ParseError(`syntax error: expected filename after '${token}'`);
      }
      redirect = { type: token, target: tokens[i + 1] };
      i += 2;
      continue;
    }

    // Long flag: --name=value or --name
    if (token.startsWith('--')) {
      const eqIdx = token.indexOf('=');
      if (eqIdx !== -1) {
        flags[token.slice(2, eqIdx)] = token.slice(eqIdx + 1);
      } else {
        flags[token.slice(2)] = true;
      }
      i++;
      continue;
    }

    // Short flags: -a, -la
    if (token.startsWith('-') && token.length > 1) {
      for (let j = 1; j < token.length; j++) {
        flags[token[j]] = true;
      }
      i++;
      continue;
    }

    args.push(token);
    i++;
  }

  return { name, args, flags, redirect };
}
