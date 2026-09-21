/**
 * A deliberately tiny, dependency-free bash tokenizer for the preview pane.
 *
 * It is not a real parser — it is a single-pass scanner that is good enough to
 * colour comments, strings, expansions, keywords, flags and calls, and it never
 * throws on partial or malformed input (the composer renders half-finished
 * scripts all the time).
 */

export type BashTokenType =
  | 'shebang'
  | 'comment'
  | 'string'
  | 'variable'
  | 'keyword'
  | 'flag'
  | 'function'
  | 'operator'
  | 'number'
  | 'plain';

export interface BashToken {
  type: BashTokenType;
  value: string;
}

const KEYWORDS = new Set([
  'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'until', 'do', 'done',
  'case', 'esac', 'in', 'function', 'return', 'local', 'export', 'readonly',
  'declare', 'unset', 'shift', 'set', 'trap', 'exit', 'source', 'eval', 'exec',
  'echo', 'printf', 'read', 'cd', 'die', 'have', 'banner', 'rule',
  'require_dependency', 'require_root', 'verify_dependencies',
]);

const BUILTINS = new Set([
  'cat', 'grep', 'awk', 'sed', 'cut', 'head', 'tail', 'sort', 'uniq', 'tr',
  'find', 'wc', 'basename', 'dirname', 'mkdir', 'rm', 'ls', 'mv', 'cp',
  'tar', 'rsync', 'gzip', 'openssl', 'sha256sum', 'curl', 'ip', 'ss',
  'df', 'free', 'du', 'ps', 'uname', 'id', 'date', 'command', 'chmod',
]);

interface Rule {
  type: BashTokenType;
  pattern: RegExp;
}

/** Ordered rules — the first match at the current index wins. */
const RULES: Rule[] = [
  { type: 'string', pattern: /^"(?:[^"\\]|\\.)*"/ },
  { type: 'string', pattern: /^'[^']*'/ },
  { type: 'variable', pattern: /^\$\{[^}]*\}|^\$[A-Za-z_][A-Za-z0-9_]*|^\$[0-9@*#?$!]/ },
  { type: 'comment', pattern: /^#.*/ },
  { type: 'operator', pattern: /^(?:\|\||&&|>>|<<|2>|\||[;<>(){}&=])/ },
  { type: 'function', pattern: /^[A-Za-z_][A-Za-z0-9_]*(?=\s*\(\s*\))/ },
  { type: 'flag', pattern: /^--?[A-Za-z][A-Za-z0-9_-]*/ },
  { type: 'number', pattern: /^\d+/ },
  { type: 'plain', pattern: /^[A-Za-z_][A-Za-z0-9_.\-/]*/ },
  { type: 'plain', pattern: /^\s+/ },
  { type: 'plain', pattern: /^./ },
];

function classifyPlain(value: string): BashTokenType {
  const lower = value.toLowerCase();
  if (KEYWORDS.has(lower)) return 'keyword';
  if (BUILTINS.has(lower)) return 'function';
  return 'plain';
}

export function tokenizeBashLine(line: string): BashToken[] {
  if (line.startsWith('#!')) {
    return [{ type: 'shebang', value: line }];
  }

  const tokens: BashToken[] = [];
  let rest = line;

  // Leading indentation stays plain.
  const indentation = rest.match(/^\s+/);
  if (indentation) {
    tokens.push({ type: 'plain', value: indentation[0] });
    rest = rest.slice(indentation[0].length);
  }

  while (rest.length > 0) {
    let matched = false;
    for (const rule of RULES) {
      const match = rule.pattern.exec(rest);
      if (match && match[0].length > 0) {
        const value = match[0];
        const type = rule.type === 'plain' ? classifyPlain(value) : rule.type;
        const previous = tokens[tokens.length - 1];
        if (previous && previous.type === type && (type === 'plain' || type === 'variable')) {
          previous.value += value;
        } else {
          tokens.push({ type, value });
        }
        rest = rest.slice(value.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push({ type: 'plain', value: rest });
      break;
    }
  }

  return tokens;
}

export function countScriptLines(source: string): number {
  return source.replace(/\n$/, '').split('\n').length;
}

export function scriptByteSize(source: string): number {
  return new TextEncoder().encode(source).length;
}
