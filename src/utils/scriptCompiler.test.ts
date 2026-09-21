import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { TEMPLATE_REGISTRY } from '../config';
import { dependencyInfo } from '../config/dependencies';
import { THEMES } from '../config/themes';
import type { ScriptSettings, ScriptTemplate } from '../types/script';
import {
  DEFAULT_SETTINGS,
  collectRequiredDependencies,
  compileBashScript,
  modulePrimaryPattern,
  sanitizeCommandName,
  scriptFileName,
} from './scriptCompiler';

const BASE_SETTINGS: ScriptSettings = { ...DEFAULT_SETTINGS };

function allModules(template: ScriptTemplate): Set<string> {
  return new Set(template.modules.map((module) => module.id));
}

function firstTemplate(): ScriptTemplate {
  return TEMPLATE_REGISTRY[0]!;
}

function hasBash(): boolean {
  try {
    execFileSync('bash', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const describeBash = hasBash() ? describe : describe.skip;

function writeScript(template: ScriptTemplate, settings: ScriptSettings, modules: Set<string>) {
  const dir = mkdtempSync(join(tmpdir(), 'omniscript-'));
  const path = join(dir, scriptFileName(template, settings));
  writeFileSync(path, compileBashScript(template, modules, settings, THEMES.dracula), 'utf8');
  return path;
}

function runBash(path: string, args: string[], env: Record<string, string> = {}) {
  try {
    const stdout = execFileSync('bash', [path, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, ...env },
    });
    return { code: 0, stdout };
  } catch (error) {
    const failure = error as { status?: number; stdout?: string; stderr?: string };
    return { code: failure.status ?? 1, stdout: `${failure.stdout ?? ''}${failure.stderr ?? ''}` };
  }
}

describe('compileBashScript structure', () => {
  it('is deterministic for identical inputs', () => {
    const template = firstTemplate();
    const modules = allModules(template);
    const a = compileBashScript(template, modules, BASE_SETTINGS, THEMES.nord);
    const b = compileBashScript(template, modules, BASE_SETTINGS, THEMES.nord);
    expect(a).toBe(b);
  });

  it('emits only the enabled modules', () => {
    const template = firstTemplate();
    const enabled = template.modules.filter((m) => m.id !== 'whois');
    const source = compileBashScript(
      template,
      new Set(enabled.map((m) => m.id)),
      BASE_SETTINGS,
      THEMES.dracula,
    );

    expect(source).not.toContain('--whois');
    for (const module of enabled) {
      // The case pattern drops any `<arg>` placeholder from the human-readable flag.
      const pattern = module.flag.split('<')[0]!.trim();
      expect(source).toContain(`${pattern})`);
    }
  });

  it('documents exactly the active modules in the help menu', () => {
    const template = firstTemplate();
    const enabled = [template.modules[0]!, template.modules[1]!];
    const source = compileBashScript(
      template,
      new Set(enabled.map((m) => m.id)),
      BASE_SETTINGS,
      THEMES.dracula,
    );

    const helpBody = source.slice(source.indexOf('show_help()'));
    for (const module of enabled) {
      expect(helpBody).toContain(module.flag);
    }
    expect(helpBody).not.toContain('--trace');
  });

  it('deduplicates and sorts the dependency manifest', () => {
    const template = firstTemplate();
    const deps = collectRequiredDependencies(template, allModules(template));
    expect(deps).toEqual([...deps].sort());
    expect(new Set(deps).size).toBe(deps.length);
    expect(deps).toContain('curl');
  });

  it('switches the emitted ANSI palette with the theme', () => {
    const template = firstTemplate();
    const modules = allModules(template);
    const dracula = compileBashScript(template, modules, BASE_SETTINGS, THEMES.dracula);
    const cyberpunk = compileBashScript(template, modules, BASE_SETTINGS, THEMES.cyberpunk);

    expect(dracula).toContain(`TITLE=$'${THEMES.dracula.ansi.TITLE}'`);
    expect(cyberpunk).toContain(`TITLE=$'${THEMES.cyberpunk.ansi.TITLE}'`);
    expect(dracula).not.toBe(cyberpunk);
  });

  it('compiles colors out but keeps the variables declared for set -u', () => {
    const source = compileBashScript(
      firstTemplate(),
      allModules(firstTemplate()),
      { ...BASE_SETTINGS, includeColor: false },
      THEMES.dracula,
    );

    expect(source).not.toContain('\\033[');
    expect(source).toContain('NC="" BOLD="" MUTED="" OK="" WARN="" ERR="" INFO="" TITLE="" VALUE=""');
  });

  it('toggles strict mode and tracing', () => {
    const template = firstTemplate();
    const modules = new Set([template.modules[0]!.id]);

    const strict = compileBashScript(template, modules, BASE_SETTINGS, THEMES.nord);
    expect(strict).toContain('set -euo pipefail');

    const relaxed = compileBashScript(
      template,
      modules,
      { ...BASE_SETTINGS, failFastOnErrors: false, includeTrace: true },
      THEMES.nord,
    );
    expect(relaxed).not.toContain('set -euo pipefail');
    expect(relaxed).toContain('set -x');
  });

  it('adds the clipboard block only when requested', () => {
    const template = firstTemplate();
    const modules = new Set([template.modules[0]!.id]);
    expect(compileBashScript(template, modules, BASE_SETTINGS, THEMES.nord)).not.toContain(
      'copy_to_clipboard() {',
    );
    expect(
      compileBashScript(
        template,
        modules,
        { ...BASE_SETTINGS, includeClipboard: true },
        THEMES.nord,
      ),
    ).toContain('copy_to_clipboard() {');
  });

  it('escapes printf metacharacters coming from module text', () => {
    const base = firstTemplate();
    const template: ScriptTemplate = {
      ...base,
      shortDescription: '100% hardened',
      baseSystemChecks: 'preflight() { :; }',
      modules: [{ ...base.modules[0]!, summary: 'shows 50% usage' }],
    };
    const source = compileBashScript(
      template,
      new Set([template.modules[0]!.id]),
      BASE_SETTINGS,
      THEMES.dracula,
    );

    // `%` inside printf-formatted text must always be doubled, or printf eats it.
    expect(source).toContain('shows 50%% usage');
    expect(source).not.toContain('shows 50% usage');
  });

  it('sanitises command names and derives the download file name', () => {
    expect(sanitizeCommandName('my ip!', 'myip')).toBe('my-ip');
    expect(sanitizeCommandName('   ', 'myip')).toBe('myip');
    expect(sanitizeCommandName('--weird..', 'myip')).toBe('weird');
    expect(sanitizeCommandName('a b c d', 'myip')).toBe('a-b-c-d');

    const template = firstTemplate();
    expect(scriptFileName(template, { ...BASE_SETTINGS, commandName: 'net/tool' })).toBe(
      'net-tool.sh',
    );
    expect(scriptFileName(template, BASE_SETTINGS)).toBe(
      `${template.defaultCommandName}.sh`,
    );
  });

  it('translates declared packages into probed binaries', () => {
    const source = compileBashScript(
      firstTemplate(),
      allModules(firstTemplate()),
      BASE_SETTINGS,
      THEMES.dracula,
    );

    expect(source).toContain('dependency_probe() {');
    expect(source).toContain('iproute2) echo "ip" ;;');
    expect(source).toContain('dnsutils) echo "dig" ;;');
    expect(source).toContain('dependency_package() {');
    expect(source).toContain('netcat) echo "netcat-openbsd" ;;');
    // The bug this table exists to prevent: probing a package name as a binary.
    expect(source).toContain('probe="$(dependency_probe "$declared")"');
    expect(source).not.toContain('if have "$1"; then return 0; fi');
  });

  it('falls back to a 1:1 mapping for ad-hoc binaries', () => {
    expect(dependencyInfo('nproc')).toEqual({
      id: 'nproc',
      probe: 'nproc',
      package: 'nproc',
      note: 'probed directly as an executable',
    });
  });

  it('uses the first pattern of a module flag for the help example', () => {
    expect(modulePrimaryPattern('-d | --dns <host>')).toBe('-d');
  });
});

describeBash('generated bash', () => {
  const combos: Array<[string, ScriptSettings, (t: ScriptTemplate) => Set<string>]> = [
    ['all modules + defaults', BASE_SETTINGS, allModules],
    ['all modules + clipboard + trace', { ...BASE_SETTINGS, includeClipboard: true, includeTrace: true }, allModules],
    ['no modules', { ...BASE_SETTINGS, includeColor: false }, () => new Set<string>()],
    ['single module, permissive', { ...BASE_SETTINGS, failFastOnErrors: false }, (t) => new Set([t.modules[0]!.id])],
  ];

  for (const template of TEMPLATE_REGISTRY) {
    for (const [label, settings, select] of combos) {
      it(`${template.id} — ${label} parses with bash -n`, () => {
        const path = writeScript(template, settings, select(template));
        expect(() => execFileSync('bash', ['-n', path], { stdio: 'pipe' })).not.toThrow();
      });
    }
  }

  it('runs --help without requiring any dependency to be installed', () => {
    const template = firstTemplate();
    const modules = new Set([template.modules[0]!.id, template.modules[1]!.id]);
    const path = writeScript(template, BASE_SETTINGS, modules);
    const result = runBash(path, ['--help']);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain('USAGE');
    expect(result.stdout).toContain(template.modules[0]!.flag);
  });

  it('prints help when invoked without arguments', () => {
    const template = firstTemplate();
    const path = writeScript(template, BASE_SETTINGS, allModules(template));
    expect(runBash(path, []).code).toBe(0);
  });

  it('rejects unknown flags with exit code 64', () => {
    const template = firstTemplate();
    const path = writeScript(template, BASE_SETTINGS, allModules(template));
    // Skip the package preflight: this host is not guaranteed to have every dep.
    const result = runBash(path, ['--definitely-not-a-module'], { VERIFY_DEPENDENCIES: '0' });

    expect(result.code).toBe(64);
    expect(result.stdout).toContain('unknown command');
  });

  it('fails the dependency preflight with an install hint', () => {
    const base = firstTemplate();
    const template: ScriptTemplate = {
      ...base,
      baseSystemChecks: 'preflight() { :; }',
      modules: [
        {
          ...base.modules[0]!,
          requiredDependencies: ['omniscript-missing-binary-xyz'],
        },
      ],
    };
    const path = writeScript(template, BASE_SETTINGS, new Set([template.modules[0]!.id]));
    const result = runBash(path, ['--active']);

    expect(result.code).toBe(1);
    expect(result.stdout).toContain('missing dependency');
    expect(result.stdout).toContain('omniscript-missing-binary-xyz');
    expect(result.stdout).toMatch(/install|package/);
  });

  it('honours $OMNISCRIPT_COMMAND_NAME in help text', () => {
    const template = firstTemplate();
    const path = writeScript(template, BASE_SETTINGS, allModules(template));
    const result = runBash(path, ['--help'], { OMNISCRIPT_COMMAND_NAME: 'netspy' });
    expect(result.stdout).toContain('netspy');
  });
});
