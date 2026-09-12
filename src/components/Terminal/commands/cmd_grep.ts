import type { CommandHandler } from '../../../types/terminal';
import type { FSNode } from '../../../types/vfs';

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

function fuzzyMatchLine(line: string, pattern: string): boolean {
  const words = line.split(/\s+/);
  const lowerPattern = pattern.toLowerCase();
  return words.some((w) => levenshtein(w.toLowerCase(), lowerPattern) <= 2);
}

function fuzzySearch(tree: FSNode, basePath: string, pattern: string) {
  const results: { path: string; matchLine: string }[] = [];
  for (const child of tree.children ?? []) {
    const childPath = basePath.endsWith('/')
      ? basePath + child.name
      : basePath + '/' + child.name;
    if (child.type === 'file' && child.content) {
      const lines = child.content.split('\n');
      for (const line of lines) {
        if (fuzzyMatchLine(line, pattern)) {
          results.push({ path: childPath, matchLine: line.trim() });
          break;
        }
      }
    }
    if (child.type === 'directory') {
      results.push(...fuzzySearch(child, childPath, pattern));
    }
  }
  return results;
}

export const cmd_grep: CommandHandler = (args, flags, { vfs }) => {
  if (args.length < 1) {
    return { type: 'error', content: 'grep: missing pattern' };
  }

  const pattern = args[0];
  const useFuzzy = flags.fuzzy === true || flags.f === true;

  if (useFuzzy) {
    const results = fuzzySearch(vfs.tree, '/', pattern);
    if (results.length === 0) {
      return { type: 'output', content: `No matches found for '${pattern}'` };
    }
    const lines = results.map(
      (r) => `[~] ${r.path}: ${r.matchLine}`
    );
    return { type: 'output', content: lines.join('\n') };
  }

  const results = vfs.search(pattern);
  if (results.length === 0) {
    return { type: 'output', content: `No matches found for '${pattern}'` };
  }

  const lines = results.map(
    (r) => `${r.path}: ${r.matchLine || ''}`
  );
  return { type: 'output', content: lines.join('\n') };
};
