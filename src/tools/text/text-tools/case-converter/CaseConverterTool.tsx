import { useMemo, useState } from 'react';
import { CopyButton, Field, TextArea, ToolCard, ToolFrame } from '../../../../components/toolkit';

function wordsOf(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-.]+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function CaseConverterTool() {
  const [input, setInput] = useState('OMNISCRIPT shell utility composer');

  const variants = useMemo(() => {
    const words = wordsOf(input);
    const lower = words.map((word) => word.toLowerCase());
    const upper = words.map((word) => word.toUpperCase());
    return [
      { label: 'camelCase', value: lower.map((word, index) => (index === 0 ? word : capitalize(word))).join('') },
      { label: 'PascalCase', value: lower.map(capitalize).join('') },
      { label: 'snake_case', value: lower.join('_') },
      { label: 'kebab-case', value: lower.join('-') },
      { label: 'SCREAMING_SNAKE', value: upper.join('_') },
      { label: 'dot.case', value: lower.join('.') },
      { label: 'Title Case', value: words.map(capitalize).join(' ') },
      {
        label: 'Sentence case',
        value: words.length ? `${capitalize(words[0]!)} ${lower.slice(1).join(' ')}`.trim() : '',
      },
      { label: 'lower case', value: lower.join(' ') },
      { label: 'UPPER CASE', value: upper.join(' ') },
    ];
  }, [input]);

  return (
    <ToolFrame>
      <ToolCard title="Source text">
        <Field label="Input">
          <TextArea value={input} onChange={(event) => setInput(event.target.value)} className="min-h-[7rem]" />
        </Field>
      </ToolCard>

      <ToolCard title="Variants">
        <ul className="flex flex-col gap-1.5">
          {variants.map((variant) => (
            <li
              key={variant.label}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)]/60 px-3 py-2"
            >
              <span className="w-36 shrink-0 text-[11px] tracking-wide text-[var(--os-muted)] uppercase">
                {variant.label}
              </span>
              <code className="min-w-0 flex-1 break-all font-mono text-xs text-[var(--os-text)]">
                {variant.value || '—'}
              </code>
              <CopyButton text={variant.value} label="" />
            </li>
          ))}
        </ul>
      </ToolCard>
    </ToolFrame>
  );
}
