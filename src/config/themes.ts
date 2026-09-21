import type { TerminalTheme, ThemeId } from '../types/script';

/**
 * Terminal themes.
 *
 * `ansi` drives the color declaration block inside the generated bash script,
 * `ui` drives the CSS custom properties on the app shell. Both are declared
 * here so a designer can add a palette without touching a component.
 *
 * Only portable SGR codes (30-37 / 90-97) are used so the output renders
 * correctly in tty, tmux, and every SSH client.
 */
export const THEMES: Record<ThemeId, TerminalTheme> = {
  dracula: {
    id: 'dracula',
    label: 'Dracula',
    blurb: 'High contrast purple & cyan on deep charcoal.',
    ui: {
      bg: '#16171d',
      surface: '#1e2029',
      surfaceAlt: '#282a36',
      border: '#343746',
      text: '#f8f8f2',
      muted: '#9198b5',
      accent: '#bd93f9',
      accentAlt: '#8be9fd',
      ok: '#50fa7b',
      warn: '#f1fa8c',
      err: '#ff5555',
      glow: 'rgba(189, 147, 249, 0.35)',
    },
    ansi: {
      NC: '\\033[0m',
      BOLD: '\\033[1m',
      MUTED: '\\033[0;90m',
      OK: '\\033[0;32m',
      WARN: '\\033[0;33m',
      ERR: '\\033[0;31m',
      INFO: '\\033[0;36m',
      TITLE: '\\033[1;35m',
      VALUE: '\\033[0;97m',
    },
  },
  nord: {
    id: 'nord',
    label: 'Nord',
    blurb: 'Arctic, low-contrast frost blues.',
    ui: {
      bg: '#21262f',
      surface: '#2e3440',
      surfaceAlt: '#3b4252',
      border: '#4c566a',
      text: '#eceff4',
      muted: '#96a0b5',
      accent: '#88c0d0',
      accentAlt: '#81a1c1',
      ok: '#a3be8c',
      warn: '#ebcb8b',
      err: '#bf616a',
      glow: 'rgba(136, 192, 208, 0.30)',
    },
    ansi: {
      NC: '\\033[0m',
      BOLD: '\\033[1m',
      MUTED: '\\033[0;90m',
      OK: '\\033[0;32m',
      WARN: '\\033[0;33m',
      ERR: '\\033[0;31m',
      INFO: '\\033[0;94m',
      TITLE: '\\033[1;36m',
      VALUE: '\\033[0;97m',
    },
  },
  monokai: {
    id: 'monokai',
    label: 'Monokai',
    blurb: 'Classic editor palette: lime, pink, amber.',
    ui: {
      bg: '#1c1e19',
      surface: '#272822',
      surfaceAlt: '#33352c',
      border: '#45473a',
      text: '#f8f8f2',
      muted: '#9c9f8b',
      accent: '#a6e22e',
      accentAlt: '#66d9ef',
      ok: '#a6e22e',
      warn: '#e6db74',
      err: '#f92672',
      glow: 'rgba(166, 226, 46, 0.28)',
    },
    ansi: {
      NC: '\\033[0m',
      BOLD: '\\033[1m',
      MUTED: '\\033[0;90m',
      OK: '\\033[0;92m',
      WARN: '\\033[0;93m',
      ERR: '\\033[0;91m',
      INFO: '\\033[0;36m',
      TITLE: '\\033[1;95m',
      VALUE: '\\033[0;97m',
    },
  },
  cyberpunk: {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    blurb: 'Neon magenta & electric cyan on void black.',
    ui: {
      bg: '#08040f',
      surface: '#12071f',
      surfaceAlt: '#1c0b2e',
      border: '#3a1a5e',
      text: '#e6dcff',
      muted: '#9b7fd4',
      accent: '#ff2a6d',
      accentAlt: '#00fff9',
      ok: '#05ffa1',
      warn: '#f9f002',
      err: '#ff3860',
      glow: 'rgba(0, 255, 249, 0.35)',
    },
    ansi: {
      NC: '\\033[0m',
      BOLD: '\\033[1m',
      MUTED: '\\033[0;90m',
      OK: '\\033[0;92m',
      WARN: '\\033[0;93m',
      ERR: '\\033[0;91m',
      INFO: '\\033[0;96m',
      TITLE: '\\033[1;91m',
      VALUE: '\\033[0;95m',
    },
  },
};

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

export const DEFAULT_THEME_ID: ThemeId = 'dracula';

export function getTheme(id: string): TerminalTheme {
  return THEMES[id as ThemeId] ?? THEMES[DEFAULT_THEME_ID];
}

/** Convert a theme into the CSS custom properties consumed by Tailwind. */
export function themeToCssVars(theme: TerminalTheme): Record<string, string> {
  return Object.fromEntries(
    Object.entries(theme.ui).map(([key, value]) => [`--os-${key}`, value]),
  );
}
