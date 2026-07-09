import { describe, it, expect } from 'vitest';
import { parse, ParseError } from '../../src/components/Terminal/CommandParser';

describe('CommandParser', () => {
  it('parses simple command with no args', () => {
    const result = parse('ls');
    expect(result).not.toBeInstanceOf(ParseError);
    if (!(result instanceof ParseError)) {
      expect(result.name).toBe('ls');
      expect(result.args).toEqual([]);
      expect(result.flags).toEqual({});
    }
  });

  it('parses command with args', () => {
    const result = parse('ls -la /home');
    if (!(result instanceof ParseError)) {
      expect(result.name).toBe('ls');
      expect(result.args).toEqual(['/home']);
      expect(result.flags).toEqual({ l: true, a: true });
    }
  });

  it('handles quoted strings with spaces', () => {
    const result = parse('cat "file with spaces.txt"');
    if (!(result instanceof ParseError)) {
      expect(result.args).toEqual(['file with spaces.txt']);
    }
  });

  it('handles single quotes', () => {
    const result = parse("echo 'hello world'");
    if (!(result instanceof ParseError)) {
      expect(result.args).toEqual(['hello world']);
    }
  });

  it('parses long flags', () => {
    const result = parse('command --name=value --verbose');
    if (!(result instanceof ParseError)) {
      expect(result.flags).toEqual({ name: 'value', verbose: true });
    }
  });

  it('parses redirect', () => {
    const result = parse('echo hello > file.txt');
    if (!(result instanceof ParseError)) {
      expect(result.redirect).toEqual({ type: '>', target: 'file.txt' });
      expect(result.args).toEqual(['hello']);
    }
  });

  it('returns ParseError for empty input', () => {
    const result = parse('');
    expect(result).toBeInstanceOf(ParseError);
  });

  it('returns ParseError for whitespace-only input', () => {
    const result = parse('   ');
    expect(result).toBeInstanceOf(ParseError);
  });

  it('returns ParseError for unclosed single quote', () => {
    const result = parse("echo 'hello");
    expect(result).toBeInstanceOf(ParseError);
  });

  it('returns ParseError for unclosed double quote', () => {
    const result = parse('echo "hello');
    expect(result).toBeInstanceOf(ParseError);
  });

  it('converts command name to lowercase', () => {
    const result = parse('LS');
    if (!(result instanceof ParseError)) {
      expect(result.name).toBe('ls');
    }
  });

  it('parses append redirect', () => {
    const result = parse('echo test >> log.txt');
    if (!(result instanceof ParseError)) {
      expect(result.redirect).toEqual({ type: '>>', target: 'log.txt' });
    }
  });

  it('handles mixed short flags', () => {
    const result = parse('ls -la');
    if (!(result instanceof ParseError)) {
      expect(result.flags).toEqual({ l: true, a: true });
    }
  });
});
