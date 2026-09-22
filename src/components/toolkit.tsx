import { useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { copyTextToClipboard } from '../utils/fileActions';
import { Pill } from './ui';

/**
 * ────────────────────────────────────────────────────────────────────────────
 *  Tool toolkit
 * ────────────────────────────────────────────────────────────────────────────
 *  Small, unopinionated primitives every tool implementation composes. They
 *  reuse the existing OmniScript design tokens (`--os-*`) so a new tool looks
 *  native without re-implementing any chrome.
 */

export function ToolFrame({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`flex flex-col gap-4 ${className}`}>{children}</div>;
}

export function ToolColumns({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 lg:grid-cols-2">{children}</div>;
}

export function ToolCard({
  title,
  description,
  actions,
  children,
  className = '',
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex min-w-0 flex-col gap-3 rounded-2xl border border-[var(--os-border)] bg-[var(--os-surface)]/70 p-4 ${className}`}
    >
      {title || actions ? (
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            {title ? (
              <h3 className="font-mono text-[11px] font-semibold tracking-widest text-[var(--os-muted)] uppercase">
                {title}
              </h3>
            ) : null}
            {description ? (
              <p className="mt-1 text-xs leading-relaxed text-[var(--os-muted)]">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between gap-2 text-[11px] font-semibold tracking-wider text-[var(--os-muted)] uppercase">
        {label}
        {hint ? <span className="font-normal normal-case tracking-normal">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

const INPUT_CLASS =
  'w-full rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)] px-3 py-2 font-mono text-xs text-[var(--os-text)] outline-none transition focus:border-[var(--os-accent)] focus:ring-2 focus:ring-[var(--os-accent)]/25 placeholder:text-[var(--os-muted)]';

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props;
  return <input spellCheck={false} className={`${INPUT_CLASS} ${className}`} {...rest} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props;
  return (
    <textarea
      spellCheck={false}
      className={`os-scroll min-h-[9rem] resize-y whitespace-pre font-mono leading-relaxed ${INPUT_CLASS} ${className}`}
      {...rest}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`cursor-pointer ${INPUT_CLASS}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function Button({
  children,
  onClick,
  variant = 'ghost',
  disabled = false,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const variants: Record<string, string> = {
    primary:
      'border-[var(--os-accent)] bg-[var(--os-accent)]/15 text-[var(--os-accent)] hover:bg-[var(--os-accent)]/25',
    ghost:
      'border-[var(--os-border)] bg-[var(--os-surface-alt)] text-[var(--os-text)] hover:border-[var(--os-accent)] hover:text-[var(--os-accent)]',
    danger:
      'border-[var(--os-err)]/60 bg-[var(--os-err)]/10 text-[var(--os-err)] hover:bg-[var(--os-err)]/20',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--os-accent)] disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle');
  return (
    <Button
      onClick={async () => {
        const method = await copyTextToClipboard(text);
        setState(method === 'unsupported' ? 'fail' : 'ok');
        window.setTimeout(() => setState('idle'), 1800);
      }}
    >
      {state === 'ok' ? '✔ Copied' : state === 'fail' ? '✖ Blocked' : `⧉ ${label}`}
    </Button>
  );
}

export function OutputPane({
  children,
  label,
  actions,
  tone = 'default',
}: {
  children: ReactNode;
  label?: string;
  actions?: ReactNode;
  tone?: 'default' | 'ok' | 'warn' | 'err';
}) {
  const tones: Record<string, string> = {
    default: 'text-[var(--os-text)]',
    ok: 'text-[var(--os-ok)]',
    warn: 'text-[var(--os-warn)]',
    err: 'text-[var(--os-err)]',
  };
  return (
    <div className="flex min-w-0 flex-col gap-2">
      {label || actions ? (
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] font-semibold tracking-widest text-[var(--os-muted)] uppercase">
            {label}
          </span>
          {actions}
        </div>
      ) : null}
      <pre
        className={`os-scroll m-0 max-h-[26rem] overflow-auto rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)] p-3 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap ${tones[tone]}`}
      >
        {children}
      </pre>
    </div>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] leading-snug text-[var(--os-muted)]">{children}</p>
  );
}

export function TagRow({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Pill key={tag}>#{tag}</Pill>
      ))}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--os-border)] px-6 py-12 text-center">
      <span className="font-mono text-sm text-[var(--os-text)]">{title}</span>
      {children ? <div className="max-w-md text-xs text-[var(--os-muted)]">{children}</div> : null}
    </div>
  );
}
