import { useMemo, useState } from 'react';
import { Field, TextArea, ToolCard, ToolFrame } from '../../../../components/toolkit';

function analyze(text: string) {
  const characters = [...text].length;
  const charactersNoSpaces = [...text.replace(/\s/g, '')].length;
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  const sentences = text.split(/[.!?]+(?:\s|$)/).filter((part) => part.trim().length > 0).length;
  const paragraphs = text.split(/\n{2,}/).filter((part) => part.trim().length > 0).length;
  const lines = text.length === 0 ? 0 : text.split('\n').length;
  const readingMinutes = words.length / 220;

  const frequency = new Map<string, number>();
  for (const word of words) {
    const key = word.toLowerCase().replace(/[^\p{L}\p{N}']/gu, '');
    if (key.length < 2) continue;
    frequency.set(key, (frequency.get(key) ?? 0) + 1);
  }
  const top = [...frequency.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8);

  return { characters, charactersNoSpaces, words: words.length, sentences, paragraphs, lines, readingMinutes, top, unique: frequency.size };
}

export function TextStatsTool() {
  const [text, setText] = useState(
    'OmniScript turns the shell commands you already know into a repeatable toolkit. Choose a domain, pick a template, then open the tool you need.',
  );
  const stats = useMemo(() => analyze(text), [text]);

  const cards: Array<[string, string]> = [
    ['Words', stats.words.toLocaleString()],
    ['Characters', stats.characters.toLocaleString()],
    ['No spaces', stats.charactersNoSpaces.toLocaleString()],
    ['Sentences', stats.sentences.toLocaleString()],
    ['Paragraphs', stats.paragraphs.toLocaleString()],
    ['Lines', stats.lines.toLocaleString()],
    ['Unique words', stats.unique.toLocaleString()],
    ['Reading time', stats.readingMinutes < 1 ? 'under a minute' : `${Math.ceil(stats.readingMinutes)} min`],
  ];

  return (
    <ToolFrame>
      <ToolCard title="Text">
        <Field label="Input">
          <TextArea value={text} onChange={(event) => setText(event.target.value)} className="min-h-[10rem]" />
        </Field>
      </ToolCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ToolCard title="Counts">
          <div className="grid grid-cols-2 gap-2">
            {cards.map(([label, value]) => (
              <div
                key={label}
                className="flex items-baseline justify-between gap-2 rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)]/60 px-3 py-2"
              >
                <span className="text-[11px] tracking-wide text-[var(--os-muted)] uppercase">{label}</span>
                <span className="font-mono text-sm font-semibold text-[var(--os-text)]">{value}</span>
              </div>
            ))}
          </div>
        </ToolCard>

        <ToolCard title="Most frequent words">
          {stats.top.length === 0 ? (
            <p className="text-xs text-[var(--os-muted)]">Add some text to see word frequency.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {stats.top.map(([word, count]) => {
                const max = stats.top[0]![1];
                return (
                  <li key={word} className="flex items-center gap-3">
                    <code className="w-28 shrink-0 truncate font-mono text-xs text-[var(--os-text)]">{word}</code>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--os-border)]">
                      <span
                        className="block h-full rounded-full bg-[var(--os-accent)]"
                        style={{ width: `${(count / max) * 100}%` }}
                      />
                    </span>
                    <span className="w-8 shrink-0 text-right font-mono text-[11px] text-[var(--os-muted)]">{count}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </ToolCard>
      </div>
    </ToolFrame>
  );
}
