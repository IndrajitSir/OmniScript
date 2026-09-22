import { useMemo, useState } from 'react';
import { Field, Hint, OutputPane, TextInput, ToolCard, ToolFrame } from '../../../../components/toolkit';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function describeField(
  value: string,
  singular: string,
  options: { min: number; max: number; names?: string[] },
): string {
  const { min, max, names } = options;
  const name = (index: number) => names?.[index - min] ?? String(index);

  if (value === '*') return `every ${singular}`;
  if (value.startsWith('*/')) return `every ${value.slice(2)} ${singular}s`;
  if (value.includes('-') && !value.includes(',')) {
    const [start, end] = value.split('-');
    const step = end?.split('/')[1];
    const range = `${name(Number(start))} through ${name(Number(end?.split('/')[0]))}`;
    return step ? `every ${step} ${singular}s from ${range}` : range;
  }
  if (value.includes(',')) {
    return value
      .split(',')
      .map((part) => name(Number(part.trim())))
      .join(', ');
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric) || numeric < min || numeric > max) return `invalid (${value})`;
  return `${singular} ${name(numeric)}`;
}

interface Explanation {
  ok: boolean;
  summary?: string;
  fields?: Array<{ label: string; value: string; meaning: string }>;
  error?: string;
}

const PRESETS: Array<[string, string]> = [
  ['*/5 * * * *', 'Every 5 minutes'],
  ['0 3 * * *', 'Daily at 03:00'],
  ['30 9 * * 1-5', 'Weekdays at 09:30'],
  ['0 0 1 * *', 'First day of each month'],
];

function explain(expression: string): Explanation {
  const fields = expression.trim().split(/\s+/);
  if (fields.length !== 5) {
    return { ok: false, error: `Expected 5 fields (minute hour day-of-month month day-of-week), got ${fields.length}.` };
  }
  const [minute, hour, dom, month, dow] = fields as [string, string, string, string, string];
  const explained = [
    { label: 'Minute', value: minute, meaning: describeField(minute, 'minute', { min: 0, max: 59 }) },
    { label: 'Hour', value: hour, meaning: describeField(hour, 'hour', { min: 0, max: 23 }) },
    { label: 'Day of month', value: dom, meaning: describeField(dom, 'day', { min: 1, max: 31 }) },
    { label: 'Month', value: month, meaning: describeField(month, 'month', { min: 1, max: 12, names: MONTHS }) },
    { label: 'Day of week', value: dow, meaning: describeField(dow, 'day', { min: 0, max: 6, names: DAYS }) },
  ];
  const summary = [
    `Runs at ${explained[0]!.meaning.replace(/^minute /, 'minute ')}, ${explained[1]!.meaning}`,
    `on ${explained[2]!.meaning}`,
    `in ${explained[3]!.meaning}`,
    `(${explained[4]!.meaning}).`,
  ].join(' ');
  return { ok: true, fields: explained, summary };
}

export function CronExplainerTool() {
  const [expression, setExpression] = useState('*/5 9-17 * * 1-5');
  const result = useMemo(() => explain(expression), [expression]);

  return (
    <ToolFrame>
      <ToolCard title="Schedule">
        <Field label="Cron expression (standard 5-field)">
          <TextInput
            value={expression}
            onChange={(event) => setExpression(event.target.value)}
            placeholder="0 3 * * *"
          />
        </Field>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PRESETS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setExpression(value)}
              className="cursor-pointer rounded-md border border-[var(--os-border)] px-2 py-1 font-mono text-[10px] text-[var(--os-muted)] transition hover:border-[var(--os-accent)] hover:text-[var(--os-accent)]"
            >
              {label}
            </button>
          ))}
        </div>
        <Hint>Standard cron has no seconds field; step syntax uses `*/n`.</Hint>
      </ToolCard>

      {result.ok ? (
        <>
          <OutputPane label="Plain English" tone="ok">
            {result.summary}
          </OutputPane>
          <ToolCard title="Field breakdown">
            <ul className="flex flex-col divide-y divide-[var(--os-border)]">
              {result.fields!.map((field) => (
                <li key={field.label} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
                  <span className="w-28 shrink-0 text-[11px] tracking-wide text-[var(--os-muted)] uppercase">
                    {field.label}
                  </span>
                  <code className="w-20 shrink-0 font-mono text-xs text-[var(--os-accent)]">{field.value}</code>
                  <span className="text-xs text-[var(--os-text)]">{field.meaning}</span>
                </li>
              ))}
            </ul>
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
