import { useMemo, useState } from 'react';
import { CopyButton, Field, Hint, OutputPane, TextArea, ToolCard, ToolFrame } from '../../../../components/toolkit';

const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjIwMDAwMDAwMDB9.' +
  'dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';

function decodeBase64Url(segment: string): string {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

interface Decoded {
  header?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  error?: string;
  signatureBytes: number;
}

function decodeToken(token: string): Decoded {
  const parts = token.trim().split('.');
  if (parts.length < 2) return { error: 'A JWT needs at least a header and a payload segment.', signatureBytes: 0 };
  try {
    const header = JSON.parse(decodeBase64Url(parts[0]!)) as Record<string, unknown>;
    const payload = JSON.parse(decodeBase64Url(parts[1]!)) as Record<string, unknown>;
    const signatureBytes = parts[2]
      ? Math.floor((parts[2].replace(/=+$/, '').length * 3) / 4)
      : 0;
    return { header, payload, signatureBytes };
  } catch (error) {
    return { error: `Could not decode: ${error instanceof Error ? error.message : 'invalid base64url/JSON'}`, signatureBytes: 0 };
  }
}

function formatTimestamp(value: unknown): string | null {
  if (typeof value !== 'number') return null;
  const date = new Date(value * 1000);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

const TIME_CLAIMS = ['exp', 'iat', 'nbf', 'auth_time', 'updated_at'] as const;

/** Captured once at module load so expiry math stays out of the render path. */
const PAGE_LOADED_AT = Date.now();

export function JwtDecoderTool() {
  const [token, setToken] = useState(SAMPLE);
  const decoded = useMemo(() => decodeToken(token), [token]);
  const claims = useMemo(() => {
    if (!decoded.payload) return [];
    return TIME_CLAIMS.filter((claim) => claim in decoded.payload!).map((claim) => ({
      claim,
      iso: formatTimestamp(decoded.payload![claim]),
      expired:
        claim === 'exp' &&
        typeof decoded.payload!.exp === 'number' &&
        decoded.payload!.exp * 1000 < PAGE_LOADED_AT,
    }));
  }, [decoded.payload]);

  const alg = typeof decoded.header?.alg === 'string' ? decoded.header.alg : null;

  return (
    <ToolFrame>
      <Field label="Encoded token">
        <TextArea
          value={token}
          onChange={(event) => setToken(event.target.value)}
          className="min-h-[7rem]"
        />
      </Field>
      <Hint>Decoding is local and does not verify the signature — never trust an unverified token.</Hint>

      {decoded.error ? (
        <OutputPane label="Error" tone="err">
          {decoded.error}
        </OutputPane>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <ToolCard
            title="Header"
            actions={<CopyButton text={JSON.stringify(decoded.header, null, 2)} />}
          >
            <OutputPane>{JSON.stringify(decoded.header, null, 2)}</OutputPane>
          </ToolCard>

          <ToolCard
            title="Payload"
            actions={<CopyButton text={JSON.stringify(decoded.payload, null, 2)} />}
          >
            <OutputPane>{JSON.stringify(decoded.payload, null, 2)}</OutputPane>
          </ToolCard>

          <ToolCard title="Registered claims" className="lg:col-span-2">
            <ul className="flex flex-wrap gap-2">
              {claims.length === 0 ? (
                <li className="text-xs text-[var(--os-muted)]">No time-based claims present.</li>
              ) : (
                claims.map((entry) => (
                  <li
                    key={entry.claim}
                    className={`rounded-lg border px-3 py-2 font-mono text-[11px] ${
                      entry.expired
                        ? 'border-[var(--os-err)]/60 text-[var(--os-err)]'
                        : 'border-[var(--os-border)] text-[var(--os-text)]'
                    }`}
                  >
                    <span className="text-[var(--os-muted)]">{entry.claim}</span>{' '}
                    {entry.iso ?? '—'}
                    {entry.expired ? '  (expired)' : ''}
                  </li>
                ))
              )}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-md border border-[var(--os-border)] px-2 py-1 font-mono text-[10px] text-[var(--os-muted)]">
                alg: {alg ?? 'unknown'}
              </span>
              <span className="rounded-md border border-[var(--os-border)] px-2 py-1 font-mono text-[10px] text-[var(--os-muted)]">
                signature: {decoded.signatureBytes} bytes
              </span>
              {alg === 'none' ? (
                <span className="rounded-md border border-[var(--os-err)]/60 px-2 py-1 font-mono text-[10px] text-[var(--os-err)]">
                  ⚠ alg=none — never accept this
                </span>
              ) : null}
            </div>
          </ToolCard>
        </div>
      )}
    </ToolFrame>
  );
}
