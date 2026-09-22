import { useMemo, useState } from 'react';
import { Field, Hint, OutputPane, TextArea, TextInput, ToolCard, ToolFrame } from '../../../../components/toolkit';

const FLAGS = ['g', 'i', 'm', 's', 'u', 'y'] as const;

interface MatchInfo {
  index: number;
  text: string;
  groups: string[];
}

interface RegexResult {
  matches: MatchInfo[];
  error?: string;
}

function run(pattern: string, flags: string, text: string): RegexResult {
  if (!pattern) return { matches: [] };
  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags);
  } catch (error) {
    return { matches: [], error: error instanceof Error ? error.message : 'invalid pattern' };
  }
  const matches: MatchInfo[] = [];
  if (!flags.includes('g')) {
    const match = regex.exec(text);
    if (match) matches.push({ index: match.index, text: match[0], groups: match.slice(1).map((g) => g ?? '') });
    return { matches };
  }
  let current: RegExpExecArray | null;
  let guard = 0;
  while ((current = regex.exec(text)) !== null && guard < 5000) {
    matches.push({ index: current.index, text: current[0], groups: current.slice(1).map((g) => g ?? '') });
    if (current.index === regex.lastIndex) regex.lastIndex += 1;
    guard += 1;
  }
  return { matches };
}

export function RegexTesterTool() {
  const [pattern, setPattern] = useState('(\\w+)@(\\w+)\\.com');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('contact support@example.com or sales@acme.com for details');

  const activeFlags = useMemo(
    () => FLAGS.filter((flag) => flags.includes(flag)).join(''),
    [flags],
  );
  const result = useMemo(() => run(pattern, activeFlags, text), [pattern, activeFlags, text]);

  function toggleFlag(flag: string) {
    setFlags((current) =>
      current.includes(flag) ? current.replace(flag, '') : `${current}${flag}`,
    );
  }

  return (
    <ToolFrame>
      <ToolCard title="Pattern">
        <div className="flex flex-wrap items-end gap-1.5">
          <span className="pb-2 font-mono text-sm text-[var(--os-muted)]">/</span>
          <div className="min-w-[12rem] flex-1">
            <TextInput
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
              placeholder="\\d{4}-\\d{2}-\\d{2}"
            />
          </div>
          <span className="pb-2 font-mono text-sm text-[var(--os-muted)]">/{activeFlags}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {FLAGS.map((flag) => {
            const active = flags.includes(flag);
            return (
              <button
                key={flag}
                type="button"
                onClick={() => toggleFlag(flag)}
                aria-pressed={active}
                title={flag}
                className={`h-7 w-7 cursor-pointer rounded-md border font-mono text-xs transition ${
                  active
                    ? 'border-[var(--os-accent)] text-[var(--os-accent)]'
                    : 'border-[var(--os-border)] text-[var(--os-muted)] hover:border-[var(--os-muted)]'
                }`}
              >
                {flag}
              </button>
            );
          })}
        </div>
        <Hint>Global (g) is required to list every match; zero-length matches are advanced safely.</Hint>
      </ToolCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ToolCard title="Test string">
          <Field label="Input">
            <TextArea
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="min-h-[12rem]"
            />
          </Field>
        </ToolCard>

        <ToolCard title={`Matches (${result.matches.length})`}>
          {result.error ? (
            <OutputPane label="Regex error" tone="err">
              {result.error}
            </OutputPane>
          ) : result.matches.length === 0 ? (
            <p className="text-xs text-[var(--os-muted)]">No matches.</p>
          ) : (
            <ul className="os-scroll flex max-h-[16rem] flex-col gap-1.5 overflow-auto">
              {result.matches.map((match, index) => (
                <li
                  key={`${match.index}-${index}`}
                  className="rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)]/60 px-3 py-2"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <code className="font-mono text-xs text-[var(--os-ok)]">{match.text || '(empty)'}</code>
                    <span className="font-mono text-[10px] text-[var(--os-muted)]">@{match.index}</span>
                  </div>
                  {match.groups.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {match.groups.map((group, groupIndex) => (
                        <span
                          key={groupIndex}
                          className="rounded border border-[var(--os-border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--os-accent-alt)]"
                        >
                          ${groupIndex + 1}: {group || '∅'}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </ToolCard>
      </div>
    </ToolFrame>
  );
}
