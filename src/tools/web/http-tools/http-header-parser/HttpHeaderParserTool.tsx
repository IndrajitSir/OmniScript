import { useMemo, useState } from 'react';
import { CopyButton, Field, Hint, OutputPane, TextArea, ToolCard, ToolFrame } from '../../../../components/toolkit';

const SAMPLE = [
  'HTTP/2 301',
  'date: Mon, 21 Sep 2026 10:15:00 GMT',
  'server: nginx/1.27.0',
  'location: https://www.example.com/',
  'cache-control: max-age=3600',
  'content-type: text/html; charset=utf-8',
].join('\n');

interface ParsedHeaders {
  startLine: string;
  headers: Array<{ name: string; value: string }>;
  duplicates: string[];
}

function parse(input: string): ParsedHeaders {
  const lines = input.split('\n');
  const headers: Array<{ name: string; value: string }> = [];
  let startLine = '';
  let lastName = '';

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '');
    if (!line.trim()) {
      lastName = '';
      continue;
    }
    if (/^\s/.test(line) && lastName) {
      const last = headers[headers.length - 1];
      if (last) last.value += ` ${line.trim()}`;
      continue;
    }
    const match = line.match(/^([A-Za-z0-9-]+)\s*:\s*(.*)$/);
    if (match) {
      headers.push({ name: match[1]!, value: match[2]! });
      lastName = match[1]!;
    } else if (!startLine) {
      startLine = line.trim();
    }
  }

  const counts = new Map<string, number>();
  for (const header of headers) counts.set(header.name.toLowerCase(), (counts.get(header.name.toLowerCase()) ?? 0) + 1);
  const duplicates = [...counts.entries()].filter(([, count]) => count > 1).map(([name]) => name);

  return { startLine, headers, duplicates };
}

export function HttpHeaderParserTool() {
  const [input, setInput] = useState(SAMPLE);
  const parsed = useMemo(() => parse(input), [input]);
  const json = useMemo(
    () => JSON.stringify(Object.fromEntries(parsed.headers.map((header) => [header.name.toLowerCase(), header.value])), null, 2),
    [parsed.headers],
  );

  return (
    <ToolFrame>
      <ToolCard title="Raw block" description="Paste a `curl -I` response or a copied request header block.">
        <Field label="Headers">
          <TextArea value={input} onChange={(event) => setInput(event.target.value)} className="min-h-[14rem]" />
        </Field>
        <Hint>Folded continuation lines (leading whitespace) are joined to the previous header.</Hint>
      </ToolCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ToolCard title={`Parsed (${parsed.headers.length})`}>
          {parsed.startLine ? (
            <p className="rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)]/60 px-3 py-2 font-mono text-xs text-[var(--os-accent)]">
              {parsed.startLine}
            </p>
          ) : null}
          <ul className="os-scroll flex max-h-[18rem] flex-col divide-y divide-[var(--os-border)] overflow-auto rounded-lg border border-[var(--os-border)]">
            {parsed.headers.map((header, index) => (
              <li key={`${header.name}-${index}`} className="flex flex-col gap-0.5 px-3 py-2 sm:flex-row sm:items-baseline sm:gap-3">
                <code className="shrink-0 font-mono text-[11px] text-[var(--os-accent-alt)]">{header.name}</code>
                <code className="min-w-0 break-all font-mono text-[11px] text-[var(--os-text)]">{header.value}</code>
              </li>
            ))}
          </ul>
          {parsed.duplicates.length > 0 ? (
            <p className="text-[11px] text-[var(--os-warn)]">
              ⚠ repeated header(s): {parsed.duplicates.join(', ')}
            </p>
          ) : null}
        </ToolCard>

        <ToolCard title="As JSON" actions={<CopyButton text={json} />}>
          <OutputPane>{json}</OutputPane>
        </ToolCard>
      </div>
    </ToolFrame>
  );
}
