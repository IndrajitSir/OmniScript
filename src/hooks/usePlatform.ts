import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_THEME_ID, getTheme, THEMES } from '../config/themes';
import type { TerminalTheme, ThemeId } from '../types/script';

const STORAGE_KEY = 'omniscript.platform.v1';
const RECENT_LIMIT = 12;

/**
 * Platform state that is not specific to the shell composer: the chrome
 * palette, favourite tools and recently used tools. Persisted to localStorage
 * exactly like the composer state, and deliberately keyed by *tool id* so the
 * data survives slug or template changes.
 */
export interface PersistedPlatformState {
  themeId: ThemeId;
  favorites: string[];
  recent: string[];
}

function createInitialState(): PersistedPlatformState {
  return { themeId: DEFAULT_THEME_ID, favorites: [], recent: [] };
}

function readPersistedState(): PersistedPlatformState {
  const base = createInitialState();
  if (typeof window === 'undefined') return base;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<PersistedPlatformState>;
    return {
      themeId:
        parsed.themeId && parsed.themeId in THEMES ? parsed.themeId : base.themeId,
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites.filter(isString) : [],
      recent: Array.isArray(parsed.recent) ? parsed.recent.filter(isString) : [],
    };
  } catch {
    return base;
  }
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export interface UsePlatformResult {
  themeId: ThemeId;
  theme: TerminalTheme;
  themes: TerminalTheme[];
  setTheme: (id: ThemeId) => void;
  favorites: string[];
  isFavorite: (toolId: string) => boolean;
  toggleFavorite: (toolId: string) => void;
  recent: string[];
  recordVisit: (toolId: string) => void;
  resetPlatform: () => void;
}

export function usePlatform(): UsePlatformResult {
  const [state, setState] = useState<PersistedPlatformState>(readPersistedState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Private-mode / quota failures must never break the platform.
    }
  }, [state]);

  const setTheme = useCallback((id: ThemeId) => {
    setState((current) => ({ ...current, themeId: id }));
  }, []);

  const toggleFavorite = useCallback((toolId: string) => {
    setState((current) => ({
      ...current,
      favorites: current.favorites.includes(toolId)
        ? current.favorites.filter((id) => id !== toolId)
        : [toolId, ...current.favorites],
    }));
  }, []);

  const recordVisit = useCallback((toolId: string) => {
    setState((current) => ({
      ...current,
      recent: [toolId, ...current.recent.filter((id) => id !== toolId)].slice(0, RECENT_LIMIT),
    }));
  }, []);

  const resetPlatform = useCallback(() => setState(createInitialState()), []);

  const theme = useMemo(() => getTheme(state.themeId), [state.themeId]);

  const isFavorite = useCallback(
    (toolId: string) => state.favorites.includes(toolId),
    [state.favorites],
  );

  return {
    themeId: state.themeId,
    theme,
    themes: Object.values(THEMES),
    setTheme,
    favorites: state.favorites,
    isFavorite,
    toggleFavorite,
    recent: state.recent,
    recordVisit,
    resetPlatform,
  };
}
