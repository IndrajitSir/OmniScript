import { useCallback, useEffect, useMemo, useState } from 'react';
import { defaultModulesFor, getTemplate, TEMPLATE_REGISTRY } from '../config';
import { DEFAULT_THEME_ID, getTheme, THEMES } from '../config/themes';
import type {
  FlagModule,
  ScriptSettings,
  ScriptTemplate,
  TerminalTheme,
  ThemeId,
} from '../types/script';
import {
  activeModulesOf,
  collectRequiredDependencies,
  compileBashScript,
  DEFAULT_SETTINGS,
  scriptFileName,
} from '../utils/scriptCompiler';

const STORAGE_KEY = 'omniscript.composer.v1';

/** Everything except the command name, which is derived from the template. */
export type ComposerOptions = Omit<ScriptSettings, 'commandName'>;

export interface PersistedComposerState {
  activeTemplateId: string;
  terminalTheme: ThemeId;
  /** Per-template module selections, so switching back restores your work. */
  selections: Record<string, string[]>;
  options: ComposerOptions;
  /** `null` means "follow the template default". */
  commandNameOverride: string | null;
}

export interface UseScriptComposerResult {
  templates: ScriptTemplate[];
  activeTemplate: ScriptTemplate;
  themes: TerminalTheme[];
  theme: TerminalTheme;
  settings: ScriptSettings;
  /** Spec-compatible set of enabled module ids. */
  enabledModuleIds: Set<string>;
  activeModules: FlagModule[];
  availableModules: FlagModule[];
  dependencies: string[];
  script: string;
  fileName: string;
  lineCount: number;
  selectTemplate: (id: string) => void;
  toggleModule: (id: string) => void;
  setAllModules: (enabled: boolean) => void;
  updateOptions: (patch: Partial<ComposerOptions>) => void;
  setCommandName: (value: string) => void;
  setTheme: (id: ThemeId) => void;
  resetAll: () => void;
}

const DEFAULT_OPTIONS: ComposerOptions = {
  includeColor: DEFAULT_SETTINGS.includeColor,
  failFastOnErrors: DEFAULT_SETTINGS.failFastOnErrors,
  includeClipboard: DEFAULT_SETTINGS.includeClipboard,
  verifyDependencies: DEFAULT_SETTINGS.verifyDependencies,
  includeTrace: DEFAULT_SETTINGS.includeTrace,
};

function createInitialState(): PersistedComposerState {
  const fallbackTemplate = TEMPLATE_REGISTRY[0]!;
  return {
    activeTemplateId: fallbackTemplate.id,
    terminalTheme: DEFAULT_THEME_ID,
    selections: Object.fromEntries(
      TEMPLATE_REGISTRY.map((template) => [template.id, [...defaultModulesFor(template)]]),
    ),
    options: { ...DEFAULT_OPTIONS },
    commandNameOverride: null,
  };
}

function readPersistedState(): PersistedComposerState {
  const base = createInitialState();
  if (typeof window === 'undefined') return base;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<PersistedComposerState>;
    const templateExists = TEMPLATE_REGISTRY.some((t) => t.id === parsed.activeTemplateId);
    return {
      activeTemplateId: templateExists ? parsed.activeTemplateId! : base.activeTemplateId,
      terminalTheme: parsed.terminalTheme && parsed.terminalTheme in THEMES
        ? parsed.terminalTheme
        : base.terminalTheme,
      selections: { ...base.selections, ...(parsed.selections ?? {}) },
      options: { ...base.options, ...(parsed.options ?? {}) },
      commandNameOverride:
        typeof parsed.commandNameOverride === 'string' ? parsed.commandNameOverride : null,
    };
  } catch {
    return base;
  }
}

/**
 * The single source of truth for the composer.
 *
 * Every piece of UI is a pure projection of this state, and the generated
 * script is a memoised pure function of it — there is no imperative "generate"
 * step anywhere in the app.
 */
export function useScriptComposer(): UseScriptComposerResult {
  const [state, setState] = useState<PersistedComposerState>(readPersistedState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Private-mode / quota failures must never break the composer.
    }
  }, [state]);

  const activeTemplate = useMemo(() => getTemplate(state.activeTemplateId), [state.activeTemplateId]);

  const enabledModuleIds = useMemo(
    () => new Set(state.selections[activeTemplate.id] ?? []),
    [state.selections, activeTemplate.id],
  );

  const theme = useMemo(() => getTheme(state.terminalTheme), [state.terminalTheme]);

  const settings = useMemo<ScriptSettings>(
    () => ({
      commandName: state.commandNameOverride ?? activeTemplate.defaultCommandName,
      ...state.options,
    }),
    [state.commandNameOverride, state.options, activeTemplate.defaultCommandName],
  );

  const activeModules = useMemo(
    () => activeModulesOf(activeTemplate, enabledModuleIds),
    [activeTemplate, enabledModuleIds],
  );

  const dependencies = useMemo(
    () => collectRequiredDependencies(activeTemplate, enabledModuleIds),
    [activeTemplate, enabledModuleIds],
  );

  const script = useMemo(
    () => compileBashScript(activeTemplate, enabledModuleIds, settings, theme),
    [activeTemplate, enabledModuleIds, settings, theme],
  );

  const fileName = useMemo(() => scriptFileName(activeTemplate, settings), [activeTemplate, settings]);

  const lineCount = useMemo(() => script.replace(/\n$/, '').split('\n').length, [script]);

  const selectTemplate = useCallback((id: string) => {
    setState((current) => ({ ...current, activeTemplateId: getTemplate(id).id }));
  }, []);

  const toggleModule = useCallback((id: string) => {
    setState((current) => {
      const template = getTemplate(current.activeTemplateId);
      const currentSelection = new Set(current.selections[template.id] ?? []);
      if (currentSelection.has(id)) currentSelection.delete(id);
      else currentSelection.add(id);
      return {
        ...current,
        selections: {
          ...current.selections,
          [template.id]: template.modules
            .filter((module) => currentSelection.has(module.id))
            .map((module) => module.id),
        },
      };
    });
  }, []);

  const setAllModules = useCallback((enabled: boolean) => {
    setState((current) => {
      const template = getTemplate(current.activeTemplateId);
      return {
        ...current,
        selections: {
          ...current.selections,
          [template.id]: enabled ? template.modules.map((module) => module.id) : [],
        },
      };
    });
  }, []);

  const updateOptions = useCallback((patch: Partial<ComposerOptions>) => {
    setState((current) => ({ ...current, options: { ...current.options, ...patch } }));
  }, []);

  const setCommandName = useCallback((value: string) => {
    setState((current) => ({ ...current, commandNameOverride: value.length > 0 ? value : null }));
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    setState((current) => ({ ...current, terminalTheme: id }));
  }, []);

  const resetAll = useCallback(() => setState(createInitialState()), []);

  return {
    templates: TEMPLATE_REGISTRY,
    activeTemplate,
    themes: Object.values(THEMES),
    theme,
    settings,
    enabledModuleIds,
    activeModules,
    availableModules: activeTemplate.modules,
    dependencies,
    script,
    fileName,
    lineCount,
    selectTemplate,
    toggleModule,
    setAllModules,
    updateOptions,
    setCommandName,
    setTheme,
    resetAll,
  };
}
