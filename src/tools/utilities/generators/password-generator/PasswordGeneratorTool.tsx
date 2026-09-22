import { useState } from 'react';
import { CopyButton, Field, Hint, OutputPane, Select, ToolCard, ToolFrame } from '../../../../components/toolkit';

const POOLS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/',
};

type PoolKey = keyof typeof POOLS;

const AMBIGUOUS = /[Il1O0o]/g;

interface Recipe {
  length: number;
  count: string;
  pools: Record<PoolKey, boolean>;
  avoidAmbiguous: boolean;
}

const DEFAULT_RECIPE: Recipe = {
  length: 20,
  count: '5',
  pools: { lower: true, upper: true, digits: true, symbols: true },
  avoidAmbiguous: true,
};

function activePool(recipe: Recipe): string {
  return (Object.keys(POOLS) as PoolKey[])
    .filter((key) => recipe.pools[key])
    .map((key) => POOLS[key])
    .join('')
    .replace(recipe.avoidAmbiguous ? AMBIGUOUS : /$^/, '');
}

function pick(length: number, pool: string): string {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => pool[byte % pool.length]!).join('');
}

function build(recipe: Recipe): string[] {
  const pool = activePool(recipe);
  if (!pool) return [];
  const size = Math.min(128, Math.max(6, recipe.length));
  const total = Math.min(50, Math.max(1, Number(recipe.count) || 1));
  return Array.from({ length: total }, () => pick(size, pool));
}

export function PasswordGeneratorTool() {
  const [recipe, setRecipe] = useState<Recipe>(DEFAULT_RECIPE);
  const [passwords, setPasswords] = useState<string[]>(() => build(DEFAULT_RECIPE));

  const update = (patch: Partial<Recipe>) => {
    const next = { ...recipe, ...patch };
    setRecipe(next);
    setPasswords(build(next));
  };

  const size = Math.min(128, Math.max(6, recipe.length));
  const poolSize = (Object.keys(POOLS) as PoolKey[])
    .filter((key) => recipe.pools[key])
    .reduce((total, key) => total + POOLS[key].length, 0);
  const entropy = poolSize > 0 ? (size * Math.log2(poolSize)).toFixed(1) : '0';

  return (
    <ToolFrame>
      <ToolCard title="Recipe">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={`Length (${size})`}>
            <input
              type="range"
              min={6}
              max={64}
              value={size}
              onChange={(event) => update({ length: Number(event.target.value) })}
              className="w-full cursor-pointer accent-[var(--os-accent)]"
            />
          </Field>
          <Field label="How many">
            <Select
              value={recipe.count}
              onChange={(value) => update({ count: value })}
              options={['1', '5', '10', '25', '50'].map((value) => ({ value, label: value }))}
            />
          </Field>
        </div>
        <div className="mt-1 flex flex-wrap gap-4">
          {(Object.keys(POOLS) as PoolKey[]).map((key) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 text-xs text-[var(--os-text)] capitalize">
              <input
                type="checkbox"
                checked={recipe.pools[key]}
                onChange={() => update({ pools: { ...recipe.pools, [key]: !recipe.pools[key] } })}
                className="h-3.5 w-3.5 accent-[var(--os-accent)]"
              />
              {key}
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--os-text)]">
            <input
              type="checkbox"
              checked={recipe.avoidAmbiguous}
              onChange={() => update({ avoidAmbiguous: !recipe.avoidAmbiguous })}
              className="h-3.5 w-3.5 accent-[var(--os-accent)]"
            />
            Avoid look-alikes (Il1O0o)
          </label>
        </div>
        <Hint>Entropy ≈ {entropy} bits per password.</Hint>
      </ToolCard>

      <ToolCard
        title={`Generated (${passwords.length})`}
        actions={<CopyButton text={passwords.join('\n')} label="Copy all" />}
      >
        <OutputPane tone={passwords.length ? 'ok' : 'err'}>
          {passwords.length ? passwords.join('\n') : 'Select at least one character pool.'}
        </OutputPane>
      </ToolCard>
    </ToolFrame>
  );
}
