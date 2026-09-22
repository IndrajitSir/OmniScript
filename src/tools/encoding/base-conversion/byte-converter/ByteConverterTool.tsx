import { useMemo, useState } from 'react';
import { Field, Hint, TextInput, ToolCard, ToolFrame } from '../../../../components/toolkit';

const UNITS: Array<{ key: string; label: string; bytes: number }> = [
  { key: 'bit', label: 'Bits', bytes: 1 / 8 },
  { key: 'B', label: 'Bytes', bytes: 1 },
  { key: 'KB', label: 'Kilobytes (1000)', bytes: 1e3 },
  { key: 'MB', label: 'Megabytes (1000²)', bytes: 1e6 },
  { key: 'GB', label: 'Gigabytes (1000³)', bytes: 1e9 },
  { key: 'TB', label: 'Terabytes (1000⁴)', bytes: 1e12 },
  { key: 'KiB', label: 'Kibibytes (1024)', bytes: 1024 },
  { key: 'MiB', label: 'Mebibytes (1024²)', bytes: 1024 ** 2 },
  { key: 'GiB', label: 'Gibibytes (1024³)', bytes: 1024 ** 3 },
  { key: 'TiB', label: 'Tebibytes (1024⁴)', bytes: 1024 ** 4 },
];

function format(value: number): string {
  if (value === 0) return '0';
  if (value < 0.001 || value >= 1e15) return value.toExponential(4);
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export function ByteConverterTool() {
  const [amount, setAmount] = useState('1.5');
  const [unit, setUnit] = useState('GiB');

  const rows = useMemo(() => {
    const numeric = Number(amount);
    if (Number.isNaN(numeric)) return null;
    const factor = UNITS.find((entry) => entry.key === unit)?.bytes ?? 1;
    const bytes = numeric * factor;
    return { bytes, values: UNITS.map((entry) => [entry.label, format(bytes / entry.bytes)] as [string, string]) };
  }, [amount, unit]);

  return (
    <ToolFrame>
      <ToolCard title="Amount">
        <div className="grid max-w-xl gap-3 sm:grid-cols-[1fr_16rem]">
          <Field label="Value">
            <TextInput
              value={amount}
              onChange={(event) => setAmount(event.target.value.replace(/[^0-9.eE+-]/g, ''))}
              placeholder="1.5"
            />
          </Field>
          <Field label="Unit">
            <select
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              className="w-full cursor-pointer rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)] px-3 py-2 font-mono text-xs text-[var(--os-text)] outline-none focus:border-[var(--os-accent)]"
            >
              {UNITS.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Hint>SI (1000) and binary (1024) families are both listed so disk-size confusion is easy to spot.</Hint>
      </ToolCard>

      {rows ? (
        <ToolCard title={`Exactly ${format(rows.bytes)} bytes`}>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {rows.values.map(([label, value]) => (
              <div
                key={label}
                className="flex items-baseline justify-between gap-3 rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)]/60 px-3 py-2"
              >
                <span className="text-[11px] text-[var(--os-muted)]">{label}</span>
                <code className="font-mono text-xs text-[var(--os-text)]">{value}</code>
              </div>
            ))}
          </div>
        </ToolCard>
      ) : (
        <p className="text-xs text-[var(--os-err)]">Enter a numeric value.</p>
      )}
    </ToolFrame>
  );
}
