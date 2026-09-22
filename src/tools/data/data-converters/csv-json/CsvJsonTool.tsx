import { useMemo, useState } from 'react';
import { CopyButton, Field, Hint, OutputPane, Select, TextArea, ToolCard, ToolFrame } from '../../../../components/toolkit';

type Mode = 'csv-to-json' | 'json-to-csv';

const DELIMITERS = [
  { value: ',', label: 'Comma' },
  { value: '\t', label: 'Tab' },
  { value: ';', label: 'Semicolon' },
  { value: '|', label: 'Pipe' },
];

function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]!;
    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }
  row.push(field);
  rows.push(row);
  return rows.filter((candidate) => !(candidate.length === 1 && candidate[0] === ''));
}

function csvToJson(text: string, delimiter: string, hasHeader: boolean): string {
  const rows = parseCsv(text, delimiter);
  if (rows.length === 0) return '[]';
  const headers = hasHeader ? rows[0]!.map((header) => header.trim()) : rows[0]!.map((_, index) => `column_${index + 1}`);
  const body = hasHeader ? rows.slice(1) : rows;
  const objects = body.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])));
  return JSON.stringify(objects, null, 2);
}

function csvEscape(value: unknown, delimiter: string): string {
  const text = value === null || value === undefined ? '' : String(value);
  return /[\n"<DELIM>]/.test(text.replace('<DELIM>', delimiter)) || text.includes(delimiter)
    ? `"${text.replace(/"/g, '""')}"`
    : text;
}

function jsonToCsv(text: string, delimiter: string): string {
  const parsed = JSON.parse(text) as unknown;
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Expected a non-empty JSON array.');
  const records = parsed as Array<Record<string, unknown>>;
  const headers = [...new Set(records.flatMap((record) => Object.keys(record)))];
  const lines = [headers.join(delimiter)];
  for (const record of records) {
    lines.push(headers.map((header) => csvEscape(record[header], delimiter)).join(delimiter));
  }
  return lines.join('\n');
}

export function CsvJsonTool() {
  const [input, setInput] = useState('name,role,active\nAda Lovelace,engineer,true\nGrace Hopper,admiral,false');
  const [mode, setMode] = useState<Mode>('csv-to-json');
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeader, setHasHeader] = useState(true);

  const result = useMemo(() => {
    if (!input.trim()) return { ok: true, output: '' };
    try {
      return {
        ok: true,
        output:
          mode === 'csv-to-json'
            ? csvToJson(input, delimiter, hasHeader)
            : jsonToCsv(input, delimiter),
      };
    } catch (error) {
      return { ok: false, output: error instanceof Error ? error.message : 'conversion failed' };
    }
  }, [input, mode, delimiter, hasHeader]);

  return (
    <ToolFrame>
      <div className="grid gap-4 lg:grid-cols-2">
        <ToolCard title={mode === 'csv-to-json' ? 'CSV input' : 'JSON input'}>
          <Field label="Input">
            <TextArea value={input} onChange={(event) => setInput(event.target.value)} className="min-h-[16rem]" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Direction">
              <Select
                value={mode}
                onChange={(value) => setMode(value as Mode)}
                options={[
                  { value: 'csv-to-json', label: 'CSV → JSON' },
                  { value: 'json-to-csv', label: 'JSON → CSV' },
                ]}
              />
            </Field>
            <Field label="Delimiter">
              <Select value={delimiter} onChange={setDelimiter} options={DELIMITERS} />
            </Field>
          </div>
          {mode === 'csv-to-json' ? (
            <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--os-text)]">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={() => setHasHeader((value) => !value)}
                className="h-3.5 w-3.5 accent-[var(--os-accent)]"
              />
              First row contains column headers
            </label>
          ) : (
            <Hint>Input must be a JSON array of objects.</Hint>
          )}
        </ToolCard>

        <ToolCard
          title={mode === 'csv-to-json' ? 'JSON output' : 'CSV output'}
          actions={result.ok ? <CopyButton text={result.output} /> : undefined}
        >
          <OutputPane tone={result.ok ? 'ok' : 'err'}>{result.output || '(empty)'}</OutputPane>
        </ToolCard>
      </div>
    </ToolFrame>
  );
}
