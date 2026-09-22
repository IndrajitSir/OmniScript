import { useMemo, useState } from 'react';
import { CopyButton, Field, OutputPane, Select, ToolCard, ToolFrame } from '../../../../components/toolkit';

const WORDS =
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(
    ' ',
  );

type Unit = 'words' | 'sentences' | 'paragraphs';

/** Small deterministic PRNG so generation is pure during render. */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function build(amount: number, unit: Unit, seed: number): string {
  const random = mulberry32(seed);
  const pickWord = () => WORDS[Math.floor(random() * WORDS.length)]!;
  const sentence = () => {
    const length = 8 + Math.floor(random() * 10);
    const words = Array.from({ length }, pickWord);
    return `${words.join(' ').replace(/^./, (char) => char.toUpperCase())}.`;
  };

  if (unit === 'words') return Array.from({ length: amount }, pickWord).join(' ');
  if (unit === 'sentences') return Array.from({ length: amount }, sentence).join(' ');
  return Array.from({ length: amount }, () =>
    Array.from({ length: 3 + Math.floor(random() * 3) }, sentence).join(' '),
  ).join('\n\n');
}

export function LoremIpsumTool() {
  const [amount, setAmount] = useState('3');
  const [unit, setUnit] = useState<Unit>('paragraphs');
  const [seed, setSeed] = useState(1);

  const output = useMemo(
    () => build(Math.max(1, Math.min(50, Number(amount) || 1)), unit, seed),
    [amount, unit, seed],
  );

  return (
    <ToolFrame>
      <ToolCard title="Amount">
        <div className="grid max-w-xl gap-3 sm:grid-cols-[1fr_12rem]">
          <Field label="How many">
            <Select
              value={amount}
              onChange={setAmount}
              options={['1', '2', '3', '5', '8'].map((value) => ({ value, label: value }))}
            />
          </Field>
          <Field label="Unit">
            <Select
              value={unit}
              onChange={(value) => setUnit(value as Unit)}
              options={[
                { value: 'paragraphs', label: 'Paragraphs' },
                { value: 'sentences', label: 'Sentences' },
                { value: 'words', label: 'Words' },
              ]}
            />
          </Field>
        </div>
      </ToolCard>

      <ToolCard
        title="Placeholder copy"
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSeed((value) => value + 1)}
              className="cursor-pointer rounded-lg border border-[var(--os-border)] px-3 py-2 font-mono text-xs text-[var(--os-muted)] transition hover:border-[var(--os-accent)] hover:text-[var(--os-accent)]"
            >
              ↻ Regenerate
            </button>
            <CopyButton text={output} />
          </div>
        }
      >
        <OutputPane>{output}</OutputPane>
      </ToolCard>
    </ToolFrame>
  );
}
