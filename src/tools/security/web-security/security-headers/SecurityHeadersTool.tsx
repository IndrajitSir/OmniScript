import { useMemo, useState, type ReactNode } from 'react';
import { Field, Hint, OutputPane, TextArea, ToolCard, ToolFrame } from '../../../../components/toolkit';

type Severity = 'pass' | 'warn' | 'fail' | 'info';

interface Finding {
  header: string;
  severity: Severity;
  message: string;
}

const SAMPLE = [
  'HTTP/2 200',
  'content-type: text/html; charset=utf-8',
  'strict-transport-security: max-age=63072000; includeSubDomains; preload',
  'content-security-policy: default-src \'self\'; script-src \'self\'',
  'x-content-type-options: nosniff',
  'x-frame-options: DENY',
  'referrer-policy: strict-origin-when-cross-origin',
  'permissions-policy: geolocation=(), camera=()',
  'cross-origin-opener-policy: same-origin',
  'server: nginx',
  'x-powered-by: Express',
].join('\n');

function parseHeaders(input: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of input.split('\n')) {
    const match = line.match(/^\s*([A-Za-z0-9-]+)\s*:\s*(.*)$/);
    if (match) map.set(match[1]!.toLowerCase(), match[2]!.trim());
  }
  return map;
}

function analyze(headers: Map<string, string>): Finding[] {
  const findings: Finding[] = [];
  const get = (name: string) => headers.get(name);

  const hsts = get('strict-transport-security');
  if (!hsts) {
    findings.push({ header: 'Strict-Transport-Security', severity: 'fail', message: 'Missing — HTTPS is not pinned, so downgrade attacks stay possible.' });
  } else {
    const maxAge = Number(hsts.match(/max-age\s*=\s*(\d+)/i)?.[1] ?? 0);
    findings.push({
      header: 'Strict-Transport-Security',
      severity: maxAge >= 15768000 ? 'pass' : 'warn',
      message: maxAge >= 15768000 ? `max-age=${maxAge}s is long enough (≥ 6 months).` : `max-age=${maxAge}s is short — aim for at least 15768000.`,
    });
    if (!/includeSubDomains/i.test(hsts)) {
      findings.push({ header: 'Strict-Transport-Security', severity: 'info', message: 'Consider includeSubDomains when every subdomain is HTTPS-only.' });
    }
  }

  const csp = get('content-security-policy');
  if (!csp) {
    findings.push({ header: 'Content-Security-Policy', severity: 'fail', message: 'Missing — no defense-in-depth against injected scripts.' });
  } else if (/'unsafe-inline'|'unsafe-eval'/i.test(csp)) {
    findings.push({ header: 'Content-Security-Policy', severity: 'warn', message: "Present but uses 'unsafe-inline'/'unsafe-eval', which undercuts the policy." });
  } else {
    findings.push({ header: 'Content-Security-Policy', severity: 'pass', message: 'Present and free of the common unsafe directives.' });
  }

  const nosniff = get('x-content-type-options');
  findings.push({
    header: 'X-Content-Type-Options',
    severity: nosniff?.toLowerCase() === 'nosniff' ? 'pass' : 'fail',
    message: nosniff ? `Set to “${nosniff}”${nosniff.toLowerCase() === 'nosniff' ? '.' : ' — the only meaningful value is nosniff.'}` : 'Missing — browsers may sniff a response into a script.',
  });

  const frame = get('x-frame-options');
  const frameAncestors = csp ? /frame-ancestors/i.test(csp) : false;
  findings.push({
    header: 'X-Frame-Options',
    severity: frame ? 'pass' : frameAncestors ? 'pass' : 'fail',
    message: frame
      ? `Set to “${frame}”.`
      : frameAncestors
        ? 'Absent, but CSP frame-ancestors covers clickjacking.'
        : 'Missing — the page can be framed for clickjacking.',
  });

  const referrer = get('referrer-policy');
  findings.push({
    header: 'Referrer-Policy',
    severity: referrer ? 'pass' : 'warn',
    message: referrer ? `Set to “${referrer}”.` : 'Missing — full URLs may leak to third parties.',
  });

  const permissions = get('permissions-policy') ?? get('feature-policy');
  findings.push({
    header: 'Permissions-Policy',
    severity: permissions ? 'pass' : 'warn',
    message: permissions ? 'Present — powerful browser features are scoped.' : 'Missing — camera, microphone, geolocation are unrestricted.',
  });

  const coop = get('cross-origin-opener-policy');
  findings.push({
    header: 'Cross-Origin-Opener-Policy',
    severity: coop ? 'pass' : 'info',
    message: coop ? `Set to “${coop}”.` : 'Optional — add same-origin to isolate the browsing context.',
  });

  if (get('x-powered-by')) {
    findings.push({ header: 'X-Powered-By', severity: 'warn', message: 'Advertises the framework version — remove it.' });
  }
  const server = get('server');
  if (server && /\d/.test(server)) {
    findings.push({ header: 'Server', severity: 'info', message: `“${server}” looks version-bearing; consider a generic banner.` });
  }
  const cookies = [...headers.entries()].filter(([name]) => name === 'set-cookie');
  for (const [, value] of cookies) {
    if (!/secure/i.test(value) || !/httponly/i.test(value)) {
      findings.push({ header: 'Set-Cookie', severity: 'warn', message: `Cookie is missing ${!value.match(/secure/i) ? 'Secure' : ''}${!value.match(/httponly/i) ? ' HttpOnly' : ''}.`.replace('  ', ' ') });
    }
  }
  return findings;
}

const SEVERITY_STYLE: Record<Severity, string> = {
  pass: 'text-[var(--os-ok)] border-[var(--os-ok)]/50',
  warn: 'text-[var(--os-warn)] border-[var(--os-warn)]/50',
  fail: 'text-[var(--os-err)] border-[var(--os-err)]/50',
  info: 'text-[var(--os-muted)] border-[var(--os-border)]',
};

const SEVERITY_GLYPH: Record<Severity, string> = { pass: '✔', warn: '⚠', fail: '✖', info: 'ℹ' };

export function SecurityHeadersTool() {
  const [input, setInput] = useState(SAMPLE);
  const findings = useMemo(() => analyze(parseHeaders(input)), [input]);
  const fails = findings.filter((finding) => finding.severity === 'fail').length;
  const warns = findings.filter((finding) => finding.severity === 'warn').length;
  const grade = fails === 0 && warns === 0 ? 'A' : fails === 0 ? 'B' : fails === 1 ? 'C' : fails <= 3 ? 'D' : 'F';

  return (
    <ToolFrame>
      <ToolColumnLayout
        left={
          <ToolCard title="Response headers" description="Paste a `curl -I` block or the headers from your browser devtools.">
            <Field label="Raw headers">
              <TextArea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="min-h-[18rem]"
              />
            </Field>
            <Hint>The status line is ignored; only `Name: value` pairs are parsed.</Hint>
          </ToolCard>
        }
        right={
          <>
            <ToolCard
              title="Grade"
              actions={<span className="font-mono text-2xl font-bold text-[var(--os-accent)]">{grade}</span>}
            >
              <OutputPane label="Summary">
                {[
                  `${findings.length} checks run`,
                  `${findings.filter((f) => f.severity === 'pass').length} passed`,
                  `${warns} warning(s)`,
                  `${fails} failing check(s)`,
                ].join('\n')}
              </OutputPane>
            </ToolCard>

            <ToolCard title="Findings">
              <ul className="flex flex-col gap-2">
                {findings.map((finding, index) => (
                  <li
                    key={`${finding.header}-${index}`}
                    className={`flex items-start gap-2 rounded-lg border bg-[var(--os-bg)]/50 px-3 py-2 ${SEVERITY_STYLE[finding.severity]}`}
                  >
                    <span className="mt-0.5 font-mono text-xs">{SEVERITY_GLYPH[finding.severity]}</span>
                    <div className="min-w-0">
                      <code className="font-mono text-[11px] font-semibold">{finding.header}</code>
                      <p className="mt-0.5 text-[11px] leading-snug text-[var(--os-muted)]">{finding.message}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </ToolCard>
          </>
        }
      />
    </ToolFrame>
  );
}

function ToolColumnLayout({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-4">{left}</div>
      <div className="flex flex-col gap-4">{right}</div>
    </div>
  );
}
