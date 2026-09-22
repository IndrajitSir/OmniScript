import { useMemo, useState } from 'react';
import { CopyButton, Field, Hint, OutputPane, Select, TextInput, ToolCard, ToolFrame } from '../../../../components/toolkit';

const BASES = [
  { value: '10', label: 'Decimal (10)' },
  { value: '2', label: 'Binary (2)' },
  { value: '8', label: 'Octal (8)' },
  { value: '16', label: 'Hexadecimal (16)' },
];

function cleanDigits(value: string, base: number): string {
  const allowed: Record<number, RegExp> = {
    2: /[^01]/g,
    8: /[^0-7]/g,
    10: /[^0-9]/g,
    16: /[^0-9a-fA-F]/g,
  };
  return value.replace(allowed[base] ?? /[^0-9a-fA-F]/g, '');
}

export function NumberBaseConverterTool() {
  const [input, setInput] = useState('255');
  const [base, setBase] = useState('10');

  const result = useMemo(() => {
    const digits = cleanDigits(input, Number(base));
    if (!digits) return null;
    const value = Number.parseInt(digits, Number(base));
    if (Number.isNaN(value)) return null;
    return {
      value,
      rows: [
        ['Binary', value.toString(2)],
        ['Octal', value.toString(8)],
        ['Decimal', value.toString(10)],
        ['Hexadecimal', value.toString(16).toUpperCase()],
      ] as Array<[string, string]>,
    };
  }, [input, base]);

  return (
    <ToolFrame>
      <ToolCard title="Value">
        <div className="grid max-w-xl gap-3 sm:grid-cols-[1fr_12rem]">
          <Field label="Number">
            <TextInput value={input} onChange={(event) => setInput(event.target.value)} placeholder="255" />
          </Field>
          <Field label="Input base">
            <Select value={base} onChange={setBase} options={BASES} />
          </Field>
        </div>
        <Hint>Integers up to 2^53 − 1 (9,007,199,254,740,991) are exact.</Hint>
      </ToolCard>

      {result ? (
        <ToolCard title="All bases">
          <ul className="flex flex-col divide-y divide-[var(--os-border)] rounded-lg border border-[var(--os-border)]">
            {result.rows.map(([label, value]) => (
              <li key={label} className="flex items-center gap-3 px-3 py-2">
                <span className="w-28 shrink-0 text-[11px] tracking-wide text-[var(--os-muted)] uppercase">{label}</span>
                <code className="min-w-0 flex-1 break-all font-mono text-xs text-[var(--os-text)]">{value}</code>
                <CopyButton text={value} label="" />
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-[var(--os-muted)]">
            Prefix forms: 0b{result.value.toString(2)} · 0o{result.value.toString(8)} · 0x{result.value.toString(16).toUpperCase()}
          </p>
        </ToolCard>
      ) : (
        <OutputPane label="Error" tone="err">
          Enter a valid base-{base} number.
        </OutputPane>
      )}
    </ToolFrame>
  );
}
