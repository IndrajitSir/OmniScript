import type { ReactNode } from 'react';

export function Panel({
  title,
  step,
  subtitle,
  actions,
  children,
  className = '',
}: {
  title: string;
  step?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex min-h-0 flex-col rounded-2xl border border-[var(--os-border)] bg-[var(--os-surface)]/80 shadow-[0_18px_40px_-28px_var(--os-glow)] backdrop-blur ${className}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 border-b border-[var(--os-border)] px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {step ? (
              <span className="rounded-md border border-[var(--os-border)] bg-[var(--os-bg)] px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-[var(--os-accent)]">
                {step}
              </span>
            ) : null}
            <h2 className="truncate text-sm font-semibold tracking-wide text-[var(--os-text)] uppercase">
              {title}
            </h2>
          </div>
          {subtitle ? (
            <p className="mt-1 text-xs leading-relaxed text-[var(--os-muted)]">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">{children}</div>
    </section>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex w-full items-start gap-3 rounded-lg border border-transparent px-2 py-2 text-left transition hover:border-[var(--os-border)] hover:bg-[var(--os-surface-alt)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--os-accent)]"
    >
      <span
        className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full border transition ${
          checked
            ? 'border-[var(--os-accent)] bg-[var(--os-accent)]/30'
            : 'border-[var(--os-border)] bg-[var(--os-bg)]'
        }`}
      >
        <span
          className={`ml-0.5 block h-3.5 w-3.5 rounded-full transition ${
            checked ? 'translate-x-4 bg-[var(--os-accent)]' : 'translate-x-0 bg-[var(--os-muted)]'
          }`}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-xs font-medium text-[var(--os-text)]">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-[11px] leading-snug text-[var(--os-muted)]">{hint}</span>
        ) : null}
      </span>
    </button>
  );
}

export function Pill({
  children,
  tone = 'muted',
  title,
}: {
  children: ReactNode;
  tone?: 'muted' | 'accent' | 'warn' | 'ok' | 'err';
  title?: string;
}) {
  const tones: Record<string, string> = {
    muted: 'border-[var(--os-border)] text-[var(--os-muted)]',
    accent: 'border-[var(--os-accent)]/60 text-[var(--os-accent)]',
    warn: 'border-[var(--os-warn)]/60 text-[var(--os-warn)]',
    ok: 'border-[var(--os-ok)]/60 text-[var(--os-ok)]',
    err: 'border-[var(--os-err)]/60 text-[var(--os-err)]',
  };
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-md border bg-[var(--os-bg)]/70 px-1.5 py-0.5 font-mono text-[10px] leading-4 whitespace-nowrap ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)]/60 px-3 py-2">
      <span className="text-[11px] tracking-wide text-[var(--os-muted)] uppercase">{label}</span>
      <span className="font-mono text-xs font-semibold text-[var(--os-text)]">{value}</span>
    </div>
  );
}
