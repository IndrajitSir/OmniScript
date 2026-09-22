import { useMemo, useState } from 'react';
import { CopyButton, Field, Hint, OutputPane, Select, TextArea, ToolCard, ToolFrame } from '../../../../components/toolkit';

type Mode = 'encode' | 'decode';
type Scope = 'component' | 'uri';

function convert(input: string, mode: Mode, scope: Scope): { ok: boolean; output: string } {
  if (!input) return { ok: true, output: '' };
  try {
    if (mode === 'encode') {
      return { ok: true, output: scope === 'component' ? encodeURIComponent(input) : encodeURI(input) };
    }
    return { ok: true, output: scope === 'component' ? decodeURIComponent(input) : decodeURI(input) };
  } catch {
    return { ok: false, output: 'Malformed percent-encoding — a “%” is not followed by two hex digits.' };
  }
}

export function UrlTool() {
  const [input, setInput] = useState('https://example.com/search?q=hello world&lang=en');
  const [mode, setMode] = useState<Mode>('encode');
  const [scope, setScope] = useState<Scope>('component');
  const result = useMemo(() => convert(input, mode, scope), [input, mode, scope]);

  return (
    <ToolFrame>
      <div className="grid gap-4 lg:grid-cols-2">
        <ToolCard title="Input">
          <Field label="Text">
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
            <Field label="Scope">
              <Select
                value={scope}
                onChange={(value) => setScope(value as Scope)}
                options={[
                  { value: 'component', label: 'Component (encodeURIComponent)' },
                  { value: 'uri', label: 'Full URI (encodeURI)' },
                ]}
              />
            </Field>
          </div>
          <Hint>Use component scope for query keys/values; full URI keeps `:/?#&=` intact.</Hint>
        </ToolCard>

        <ToolCard
          title="Result"
          actions={result.ok ? <CopyButton text={result.output} /> : undefined}
        >
          <OutputPane tone={result.ok ? 'ok' : 'err'}>{result.output || '(empty)'}</OutputPane>
        </ToolCard>
      </div>
    </ToolFrame>
  );
}
