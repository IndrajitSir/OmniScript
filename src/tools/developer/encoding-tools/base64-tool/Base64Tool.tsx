import { useMemo, useState } from 'react';
import { CopyButton, Field, Hint, OutputPane, Select, TextArea, ToolCard, ToolFrame } from '../../../../components/toolkit';

type Mode = 'encode' | 'decode';

function encodeUtf8(text: string, urlSafe: boolean): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const base64 = btoa(binary);
  return urlSafe ? base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : base64;
}

function decodeUtf8(value: string): string {
  let normalized = value.trim().replace(/-/g, '+').replace(/_/g, '/');
  normalized = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function convert(input: string, mode: Mode, urlSafe: boolean): { ok: boolean; output: string } {
  if (!input) return { ok: true, output: '' };
  try {
    return { ok: true, output: mode === 'encode' ? encodeUtf8(input, urlSafe) : decodeUtf8(input) };
  } catch {
    return { ok: false, output: 'Not valid Base64 — check the padding and alphabet.' };
  }
}

export function Base64Tool() {
  const [input, setInput] = useState('OmniScript — compose, preview, ship');
  const [mode, setMode] = useState<Mode>('encode');
  const [urlSafe, setUrlSafe] = useState(false);
  const result = useMemo(() => convert(input, mode, urlSafe), [input, mode, urlSafe]);

  return (
    <ToolFrame>
      <div className="grid gap-4 lg:grid-cols-2">
        <ToolCard title={mode === 'encode' ? 'Plaintext' : 'Base64'}>
          <Field label="Input">
            <TextArea value={input} onChange={(event) => setInput(event.target.value)} className="min-h-[12rem]" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Direction">
              <Select
                value={mode}
                onChange={(value) => setMode(value as Mode)}
                options={[
                  { value: 'encode', label: 'Encode' },
                  { value: 'decode', label: 'Decode' },
                ]}
              />
            </Field>
            <Field label="URL-safe">
              <Select
                value={urlSafe ? 'yes' : 'no'}
                onChange={(value) => setUrlSafe(value === 'yes')}
                options={[
                  { value: 'no', label: 'Standard (+/)' },
                  { value: 'yes', label: 'URL-safe (-_)' },
                ]}
              />
            </Field>
          </div>
          <Hint>UTF-8 aware — emoji and accents round-trip correctly.</Hint>
        </ToolCard>

        <ToolCard
          title={mode === 'encode' ? 'Base64' : 'Plaintext'}
          actions={result.ok ? <CopyButton text={result.output} /> : undefined}
        >
          <OutputPane tone={result.ok ? 'ok' : 'err'}>{result.output || '(empty)'}</OutputPane>
        </ToolCard>
      </div>
    </ToolFrame>
  );
}
