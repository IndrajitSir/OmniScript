import { useMemo, useState } from 'react';
import { Field, Hint, OutputPane, TextInput, ToolCard, ToolFrame } from '../../../../components/toolkit';

const COMMON = new Set([
  'password',
  'passw0rd',
  '123456',
  '123456789',
  'qwerty',
  'letmein',
  'admin',
  'welcome',
  'iloveyou',
  'monkey',
  'dragon',
  'football',
  'correcthorsebatterystaple',
]);

function poolSize(value: string): number {
  let pool = 0;
  if (/[a-z]/.test(value)) pool += 26;
  if (/[A-Z]/.test(value)) pool += 26;
  if (/[0-9]/.test(value)) pool += 10;
  if (/[^A-Za-z0-9]/.test(value)) pool += 32;
  return pool;
}

function humanizeSeconds(seconds: number): string {
  if (!Number.isFinite(seconds)) return 'effectively forever';
  if (seconds < 1) return 'instantly';
  const units: Array<[string, number]> = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ];
  for (const [label, size] of units) {
    const value = seconds / size;
    if (value >= 1) return `${value < 10 ? value.toFixed(1) : Math.round(value).toLocaleString()} ${label}${Math.round(value) === 1 ? '' : 's'}`;
  }
  const years = seconds / (86400 * 365);
  if (years > 1) return `${years.toExponential(1)} years`;
  return `${seconds.toFixed(1)} seconds`;
}

interface Analysis {
  entropy: number;
  score: number;
  verdict: string;
  online: string;
  offline: string;
  checks: Array<{ label: string; ok: boolean }>;
  warnings: string[];
}

function analyze(value: string): Analysis {
  const pool = poolSize(value);
  const entropy = value.length > 0 && pool > 0 ? value.length * Math.log2(pool) : 0;
  const guesses = 2 ** entropy;
  const online = humanizeSeconds(guesses / 1e4);
  const offline = humanizeSeconds(guesses / 1e10);

  const warnings: string[] = [];
  const lower = value.toLowerCase();
  if (COMMON.has(lower)) warnings.push('This is one of the most common passwords in the world.');
  if (/(.)\1{2,}/.test(value)) warnings.push('Contains a repeated character run.');
  if (/(?:abc|bcd|cde|123|234|345|456|567|678|789|qwe|wer|ert|asd|sdf)/i.test(value)) {
    warnings.push('Contains a keyboard or alphabet sequence.');
  }
  if (/^\d+$/.test(value) && value.length > 0) warnings.push('Digits only — the pool is tiny.');

  const checks = [
    { label: 'At least 12 characters', ok: value.length >= 12 },
    { label: 'Mixed case', ok: /[a-z]/.test(value) && /[A-Z]/.test(value) },
    { label: 'Includes a digit', ok: /[0-9]/.test(value) },
    { label: 'Includes a symbol', ok: /[^A-Za-z0-9]/.test(value) },
    { label: 'No common pattern', ok: warnings.length === 0 },
  ];

  const score =
    entropy === 0
      ? 0
      : entropy < 40
        ? 1
        : entropy < 60
          ? 2
          : entropy < 80
            ? 3
            : 4;
  const verdict = ['empty', 'very weak', 'weak', 'strong', 'very strong'][score]!;

  return { entropy, score, verdict, online, offline, checks, warnings };
}

const SCORE_COLORS = ['var(--os-muted)', 'var(--os-err)', 'var(--os-warn)', 'var(--os-ok)', 'var(--os-accent)'];

export function PasswordStrengthTool() {
  const [value, setValue] = useState('');
  const analysis = useMemo(() => analyze(value), [value]);

  return (
    <ToolFrame>
      <ToolCard title="Candidate password" description="Everything stays in your browser — nothing is transmitted.">
        <Field label="Password">
          <TextInput
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="type or paste a password…"
          />
        </Field>
        <div className="mt-1 flex gap-1.5">
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{
                backgroundColor:
                  index < analysis.score ? SCORE_COLORS[analysis.score] : 'var(--os-border)',
              }}
            />
          ))}
        </div>
        <Hint>
          Verdict: <strong style={{ color: SCORE_COLORS[analysis.score] }}>{analysis.verdict}</strong>
        </Hint>
      </ToolCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ToolCard title="Estimate">
          <OutputPane tone={analysis.score >= 3 ? 'ok' : analysis.score >= 2 ? 'warn' : 'err'}>
            {[
              `Entropy        ${analysis.entropy.toFixed(1)} bits`,
              `Online attack   ${analysis.online}`,
              `Offline attack  ${analysis.offline}`,
              'Assumes 10,000 guesses/s online and 10 billion/s offline.',
            ].join('\n')}
          </OutputPane>
        </ToolCard>

        <ToolCard title="Checks">
          <ul className="flex flex-col gap-1.5">
            {analysis.checks.map((check) => (
              <li key={check.label} className="flex items-center gap-2 text-xs">
                <span className={check.ok ? 'text-[var(--os-ok)]' : 'text-[var(--os-err)]'}>
                  {check.ok ? '✔' : '✖'}
                </span>
                <span className="text-[var(--os-text)]">{check.label}</span>
              </li>
            ))}
          </ul>
          {analysis.warnings.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-1">
              {analysis.warnings.map((warning) => (
                <li key={warning} className="text-[11px] text-[var(--os-warn)]">
                  ⚠ {warning}
                </li>
              ))}
            </ul>
          ) : null}
        </ToolCard>
      </div>
    </ToolFrame>
  );
}
