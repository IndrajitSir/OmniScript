import { useMemo, useState } from 'react';
import { CopyButton, Field, Hint, OutputPane, Select, TextArea, ToolCard, ToolFrame } from '../../../../components/toolkit';

type Mode = 'pretty' | 'minify';

interface ParseResult {
  ok: boolean;
  output: string;
  error?: string;
}

function format(input: string, mode: Mode, indent: string): ParseResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: true, output: '' };
  try {
    const value = JSON.parse(trimmed) as unknown;
    return {
      ok: true,
      output:
        mode === 'minify'
          ? JSON.stringify(value)
          : JSON.stringify(value, null, indent === 'tab' ? '\t' : Number(indent)),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'invalid JSON';
    const position = message.match(/position (\d+)/)?.[1];
    let detail = message;
    if (position) {
      const index = Number(position);
      detail += `\n\n${trimmed.slice(Math.max(0, index - 30), index)}⟶${trimmed.slice(index, index + 30)}`;
    }
    return { ok: false, output: '', error: detail };
  }
}

export function JsonFormatterTool() {
  const [input, setInput] = useState('{"name":"OmniScript","tools":["ping","dns"],"meta":{"version":1}}');
  const [mode, setMode] = useState<Mode>('pretty');
  const [indent, setIndent] = useState('2');
  const result = useMemo(() => format(input, mode, indent), [input, mode, indent]);

  const stats = useMemo(() => {
    if (!input.trim()) return null;
    const lines = input.split('\n').length;
    return `${new TextEncoder().encode(input).length} bytes · ${lines} line(s) in`;
  }, [input]);

  return (
    <ToolFrame>
      <div className="grid gap-4 lg:grid-cols-2">
        <ToolCard title="Raw JSON">
          <Field label="Input">
            <TextArea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="min-h-[20rem]"
              placeholder='{ "hello": "world" }'
            />
          </Field>
          <div className="flex flex-wrap gap-3">
            <div className="w-36">
              <Field label="Mode">
                <Select
                  value={mode}
                  onChange={(value) => setMode(value as Mode)}
                  options={[
                    { value: 'pretty', label: 'Prettify' },
                    { value: 'minify', label: 'Minify' },
                  ]}
                />
              </Field>
            </div>
            <div className="w-36">
              <Field label="Indent">
                <Select
                  value={indent}
                  onChange={setIndent}
                  options={[
                    { value: '2', label: '2 spaces' },
                    { value: '4', label: '4 spaces' },
                    { value: 'tab', label: 'Tab' },
                  ]}
                />
              </Field>
            </div>
          </div>
          {stats ? <Hint>{stats}</Hint> : null}
        </ToolCard>

        <ToolCard
          title={result.ok ? 'Formatted' : 'Parse error'}
          actions={result.ok ? <CopyButton text={result.output} /> : undefined}
        >
          <OutputPane tone={result.ok ? 'ok' : 'err'}>
            {result.ok ? result.output || '(empty)' : result.error}
          </OutputPane>
        </ToolCard>
      </div>
    </ToolFrame>
  );
}
