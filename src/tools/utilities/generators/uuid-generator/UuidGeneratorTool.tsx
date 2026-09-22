import { useState } from 'react';
import { CopyButton, Field, Hint, OutputPane, Select, ToolCard, ToolFrame } from '../../../../components/toolkit';

interface UuidOptions {
  count: string;
  uppercase: boolean;
  hyphens: boolean;
  braces: boolean;
}

const DEFAULT_OPTIONS: UuidOptions = { count: '5', uppercase: false, hyphens: true, braces: false };

function randomUuidV4(): string {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();
  const bytes = new Uint8Array(16);
  cryptoObj.getRandomValues(bytes);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function build(options: UuidOptions): string[] {
  const total = Math.min(100, Math.max(1, Number(options.count) || 1));
  let values = Array.from({ length: total }, randomUuidV4);
  if (!options.hyphens) values = values.map((value) => value.replace(/-/g, ''));
  if (options.uppercase) values = values.map((value) => value.toUpperCase());
  if (options.braces) values = values.map((value) => `{${value}}`);
  return values;
}

export function UuidGeneratorTool() {
  const [options, setOptions] = useState<UuidOptions>(DEFAULT_OPTIONS);
  const [uuids, setUuids] = useState<string[]>(() => build(DEFAULT_OPTIONS));

  const update = (patch: Partial<UuidOptions>) => {
    const next = { ...options, ...patch };
    setOptions(next);
    setUuids(build(next));
  };

  const output = uuids.join('\n');
  const toggles: Array<[keyof Pick<UuidOptions, 'uppercase' | 'hyphens' | 'braces'>, string]> = [
    ['uppercase', 'Uppercase'],
    ['hyphens', 'Hyphens'],
    ['braces', 'Curly braces'],
  ];

  return (
    <ToolFrame>
      <ToolCard title="Options">
        <div className="grid max-w-xl gap-3 sm:grid-cols-[10rem_1fr]">
          <Field label="How many">
            <Select
              value={options.count}
              onChange={(value) => update({ count: value })}
              options={['1', '5', '10', '25', '50', '100'].map((value) => ({ value, label: value }))}
            />
          </Field>
          <div className="flex flex-wrap items-end gap-4 pb-2">
            {toggles.map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-xs text-[var(--os-text)]">
                <input
                  type="checkbox"
                  checked={options[key]}
                  onChange={() => update({ [key]: !options[key] })}
                  className="h-3.5 w-3.5 accent-[var(--os-accent)]"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
        <Hint>RFC 4122 version 4 — 122 bits of randomness from the Web Crypto API.</Hint>
      </ToolCard>

      <ToolCard title={`Generated (${uuids.length})`} actions={<CopyButton text={output} label="Copy all" />}>
        <OutputPane>{output || '(none)'}</OutputPane>
      </ToolCard>
    </ToolFrame>
  );
}
