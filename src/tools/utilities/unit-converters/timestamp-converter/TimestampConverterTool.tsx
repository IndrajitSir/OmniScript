import { useMemo, useState } from 'react';
import { CopyButton, Field, Hint, OutputPane, TextInput, ToolCard, ToolFrame } from '../../../../components/toolkit';

function relative(date: Date): string {
  const delta = Date.now() - date.getTime();
  const absolute = Math.abs(delta);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31536000000],
    ['month', 2592000000],
    ['day', 86400000],
    ['hour', 3600000],
    ['minute', 60000],
    ['second', 1000],
  ];
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [unit, ms] of units) {
    if (absolute >= ms) {
      const value = Math.round(delta / ms);
      return formatter.format(-value, unit);
    }
  }
  return 'just now';
}

interface Result {
  ok: boolean;
  rows?: Array<{ label: string; value: string }>;
  error?: string;
}

function convert(input: string): Result {
  const trimmed = input.trim();
  if (!trimmed) return { ok: true, rows: [] };

  let date: Date;
  if (/^-?\d+$/.test(trimmed)) {
    const numeric = Number(trimmed);
    // 13+ digits (or very large) are treated as milliseconds.
    const milliseconds = Math.abs(numeric) >= 1e12 ? numeric : numeric * 1000;
    date = new Date(milliseconds);
  } else {
    date = new Date(trimmed);
  }

  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: 'Unrecognised input — pass an epoch number or a parseable date string.' };
  }

  return {
    ok: true,
    rows: [
      { label: 'Epoch seconds', value: String(Math.floor(date.getTime() / 1000)) },
      { label: 'Epoch milliseconds', value: String(date.getTime()) },
      { label: 'ISO 8601 (UTC)', value: date.toISOString() },
      { label: 'UTC string', value: date.toUTCString() },
      { label: 'Local time', value: date.toLocaleString() },
      { label: 'Relative', value: relative(date) },
    ],
  };
}

export function TimestampConverterTool() {
  const [input, setInput] = useState('1758453000');
  const result = useMemo(() => convert(input), [input]);

  return (
    <ToolFrame>
      <ToolCard title="Timestamp or date">
        <Field label="Input">
          <TextInput value={input} onChange={(event) => setInput(event.target.value)} placeholder="1758453000 or 2026-09-21T10:15:00Z" />
        </Field>
        <Hint>10-digit values are treated as seconds, 13-digit values as milliseconds.</Hint>
      </ToolCard>

      {result.ok ? (
        <ToolCard title="Conversions">
          <ul className="flex flex-col divide-y divide-[var(--os-border)] rounded-lg border border-[var(--os-border)]">
            {result.rows!.map((row) => (
              <li key={row.label} className="flex items-center gap-3 px-3 py-2">
                <span className="w-40 shrink-0 text-[11px] tracking-wide text-[var(--os-muted)] uppercase">{row.label}</span>
                <code className="min-w-0 flex-1 break-all font-mono text-xs text-[var(--os-text)]">{row.value}</code>
                <CopyButton text={row.value} label="" />
              </li>
            ))}
          </ul>
        </ToolCard>
      ) : (
        <OutputPane label="Error" tone="err">
          {result.error}
        </OutputPane>
      )}
    </ToolFrame>
  );
}
