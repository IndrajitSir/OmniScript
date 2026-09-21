import type { ColorRefs } from '../types/script';

/**
 * Tiny string helpers shared by the compiler and every template registry.
 *
 * `frag` keeps bash fragments readable (one line per argument) while making
 * shell interpolation explicit — no accidental TypeScript template-literal
 * substitution inside generated code.
 */

/** Join lines into a newline-terminated fragment. Blank strings are kept. */
export function frag(...lines: string[]): string {
  return `${lines.join('\n')}\n`;
}

/** Prefix every non-empty line with `pad` spaces. */
export function indentLines(text: string, pad: number): string {
  const prefix = ' '.repeat(pad);
  return text
    .replace(/\n$/, '')
    .split('\n')
    .map((line) => (line.trim().length === 0 ? line : prefix + line))
    .join('\n');
}

/** `# ─── title ───` style section banner used across the generated script. */
export function sectionRule(title: string, width = 78): string {
  const head = `# ── ${title} `;
  const fill = Math.max(3, width - head.length);
  return head + '─'.repeat(fill);
}

/**
 * Substitute `@{TOKEN}` color placeholders with the shell references handed to
 * a `bashCaseBlock`.
 *
 * Authors write plain POSIX bash and never touch a theme:
 *
 * ```ts
 * bashCaseBlock: (colors) => colorize(`
 *   -f | --foo)
 *     printf "%s✔%s done\n" "@{OK}" "@{NC}"
 *     ;;
 * `, colors)
 * ```
 */
export function colorize(text: string, colors: ColorRefs): string {
  return text.replace(/@\{([A-Z_]+)\}/g, (match, token: string) =>
    Object.prototype.hasOwnProperty.call(colors, token) ? colors[token]! : match,
  );
}

/** Draw a boxed comment block (used for the script header). */
export function boxedComment(lines: string[], width = 78): string {
  const top = `# ${'═'.repeat(width)}`;
  return [top, ...lines.map((l) => `#  ${l}`), top].join('\n');
}
