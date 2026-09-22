import { useMemo, useState } from 'react';
import { CopyButton, Field, Hint, OutputPane, TextInput, ToolCard, ToolFrame } from '../../../../components/toolkit';

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function parse(input: string): Rgb | null {
  const value = input.trim().toLowerCase();
  const hex = value.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hex) {
    const digits = hex[1]!;
    const full = digits.length === 3 ? digits.split('').map((char) => char + char).join('') : digits;
    return {
      r: Number.parseInt(full.slice(0, 2), 16),
      g: Number.parseInt(full.slice(2, 4), 16),
      b: Number.parseInt(full.slice(4, 6), 16),
    };
  }
  const rgb = value.match(/^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})/);
  if (rgb) {
    const [r, g, b] = [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
    if (r > 255 || g > 255 || b > 255) return null;
    return { r, g, b };
  }
  return null;
}

function toHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function toHsl({ r, g, b }: Rgb): string {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const lightness = (max + min) / 2;
  const delta = max - min;
  let hue = 0;
  let saturation = 0;
  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (max === rn) hue = ((gn - bn) / delta) % 6;
    else if (max === gn) hue = (bn - rn) / delta + 2;
    else hue = (rn - gn) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return `hsl(${hue.toFixed(0)}, ${(saturation * 100).toFixed(0)}%, ${(lightness * 100).toFixed(0)}%)`;
}

export function ColorConverterTool() {
  const [input, setInput] = useState('#bd93f9');
  const rgb = useMemo(() => parse(input), [input]);
  const rows = rgb
    ? [
        { label: 'HEX', value: toHex(rgb) },
        { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
        { label: 'HSL', value: toHsl(rgb) },
        { label: 'Channels', value: `R ${rgb.r} · G ${rgb.g} · B ${rgb.b}` },
      ]
    : [];

  return (
    <ToolFrame>
      <ToolCard title="Color">
        <div className="grid max-w-xl gap-3 sm:grid-cols-[1fr_6rem] sm:items-end">
          <Field label="HEX or RGB">
            <TextInput value={input} onChange={(event) => setInput(event.target.value)} placeholder="#bd93f9 or rgb(189,147,249)" />
          </Field>
          <div
            className="h-10 rounded-lg border border-[var(--os-border)]"
            style={{ backgroundColor: rgb ? toHex(rgb) : 'transparent' }}
            aria-hidden
          />
        </div>
        <Hint>Accepts #rgb, #rrggbb and rgb()/rgba() notation.</Hint>
      </ToolCard>

      {rgb ? (
        <ToolCard title="Representations">
          <ul className="flex flex-col divide-y divide-[var(--os-border)] rounded-lg border border-[var(--os-border)]">
            {rows.map((row) => (
              <li key={row.label} className="flex items-center gap-3 px-3 py-2">
                <span className="w-24 shrink-0 text-[11px] tracking-wide text-[var(--os-muted)] uppercase">{row.label}</span>
                <code className="min-w-0 flex-1 font-mono text-xs text-[var(--os-text)]">{row.value}</code>
                <CopyButton text={row.value} label="" />
              </li>
            ))}
          </ul>
        </ToolCard>
      ) : (
        <OutputPane label="Error" tone="err">
          Could not parse “{input}”. Try #bd93f9 or rgb(189, 147, 249).
        </OutputPane>
      )}
    </ToolFrame>
  );
}
