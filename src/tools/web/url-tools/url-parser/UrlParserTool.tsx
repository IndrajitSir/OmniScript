import { useMemo, useState } from 'react';
import { CopyButton, Field, Hint, OutputPane, TextInput, ToolCard, ToolFrame } from '../../../../components/toolkit';

interface Parsed {
  ok: boolean;
  parts?: Array<{ label: string; value: string }>;
  params?: Array<{ key: string; value: string }>;
  error?: string;
}

function parse(input: string): Parsed {
  const trimmed = input.trim();
  if (!trimmed) return { ok: true, parts: [], params: [] };
  try {
    const url = new URL(trimmed);
    const params: Array<{ key: string; value: string }> = [];
    url.searchParams.forEach((value, key) => params.push({ key, value }));
    return {
      ok: true,
      params,
      parts: [
        { label: 'Scheme', value: url.protocol.replace(':', '') },
        { label: 'Origin', value: url.origin },
        { label: 'Host', value: url.host },
        { label: 'Hostname', value: url.hostname },
        { label: 'Port', value: url.port || '(default)' },
        { label: 'Path', value: url.pathname },
        { label: 'Query', value: url.search || '(none)' },
        { label: 'Fragment', value: url.hash || '(none)' },
        { label: 'Username', value: url.username || '(none)' },
      ],
    };
  } catch {
    return { ok: false, error: 'Not a valid absolute URL. Include a scheme such as https://.' };
  }
}

export function UrlParserTool() {
  const [input, setInput] = useState('https://user@example.com:8443/api/search?q=omniscript&page=2#results');
  const result = useMemo(() => parse(input), [input]);

  return (
    <ToolFrame>
      <ToolCard title="URL">
        <Field label="Absolute URL">
          <TextInput value={input} onChange={(event) => setInput(event.target.value)} placeholder="https://…" />
        </Field>
        <Hint>Relative URLs are rejected — this uses the browser&apos;s standard URL parser.</Hint>
      </ToolCard>

      {result.ok ? (
        <>
          <ToolCard title="Components" actions={<CopyButton text={input} />}>
            <ul className="flex flex-col divide-y divide-[var(--os-border)] rounded-lg border border-[var(--os-border)]">
              {result.parts!.map((part) => (
                <li key={part.label} className="flex items-baseline justify-between gap-3 px-3 py-2">
                  <span className="text-[11px] tracking-wide text-[var(--os-muted)] uppercase">{part.label}</span>
                  <code className="min-w-0 break-all text-right font-mono text-xs text-[var(--os-text)]">
                    {part.value}
                  </code>
                </li>
              ))}
            </ul>
          </ToolCard>

          <ToolCard title={`Query parameters (${result.params!.length})`}>
            {result.params!.length === 0 ? (
              <p className="text-xs text-[var(--os-muted)]">No query parameters.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {result.params!.map((param, index) => (
                  <li
                    key={`${param.key}-${index}`}
                    className="flex flex-wrap items-baseline gap-3 rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)]/60 px-3 py-2"
                  >
                    <code className="font-mono text-xs text-[var(--os-accent)]">{param.key}</code>
                    <span className="text-[var(--os-muted)]">=</span>
                    <code className="min-w-0 break-all font-mono text-xs text-[var(--os-text)]">
                      {param.value || '(empty)'}
                    </code>
                  </li>
                ))}
              </ul>
            )}
          </ToolCard>
        </>
      ) : (
        <OutputPane label="Error" tone="err">
          {result.error}
        </OutputPane>
      )}
    </ToolFrame>
  );
}
