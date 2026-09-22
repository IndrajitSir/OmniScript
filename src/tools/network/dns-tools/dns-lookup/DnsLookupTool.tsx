import { useState } from 'react';
import { Button, Field, Hint, OutputPane, Select, TextInput, ToolCard, ToolFrame } from '../../../../components/toolkit';

const RECORD_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA', 'CAA'].map((value) => ({
  value,
  label: value,
}));

interface DohAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface DohResponse {
  Status: number;
  Answer?: DohAnswer[];
  Authority?: DohAnswer[];
  Comment?: string;
}

const TYPE_NAMES: Record<number, string> = {
  1: 'A',
  2: 'NS',
  5: 'CNAME',
  6: 'SOA',
  12: 'PTR',
  15: 'MX',
  16: 'TXT',
  28: 'AAAA',
  33: 'SRV',
  257: 'CAA',
};

const RCODE: Record<number, string> = {
  0: 'NOERROR',
  1: 'FORMERR',
  2: 'SERVFAIL',
  3: 'NXDOMAIN',
  4: 'NOTIMP',
  5: 'REFUSED',
};

export function DnsLookupTool() {
  const [name, setName] = useState('example.com');
  const [type, setType] = useState('A');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [output, setOutput] = useState('');

  async function resolve() {
    const host = name.trim();
    if (!host) {
      setStatus('error');
      setOutput('Enter a hostname to resolve.');
      return;
    }
    setStatus('loading');
    setOutput(`querying ${type} records for ${host}…`);
    try {
      const response = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(host)}&type=${encodeURIComponent(type)}`,
      );
      if (!response.ok) throw new Error(`resolver responded ${response.status}`);
      const payload = (await response.json()) as DohResponse;
      const answers = payload.Answer ?? [];
      const lines: string[] = [
        `${host}  ${type}  →  ${RCODE[payload.Status] ?? `RCODE ${payload.Status}`}`,
      ];
      if (answers.length === 0) {
        lines.push('(no answer records returned)');
      } else {
        lines.push('');
        for (const answer of answers) {
          const label = TYPE_NAMES[answer.type] ?? String(answer.type);
          lines.push(`  ${label.padEnd(6)} ${String(answer.TTL).padStart(6)}s  ${answer.data}`);
        }
      }
      if (payload.Comment) lines.push('', `# ${payload.Comment}`);
      setOutput(lines.join('\n'));
      setStatus('done');
    } catch (error) {
      setStatus('error');
      setOutput(
        `lookup failed: ${error instanceof Error ? error.message : 'unknown error'}\n` +
          'DNS-over-HTTPS needs outbound access to dns.google.',
      );
    }
  }

  return (
    <ToolFrame>
      <ToolCard
        title="Query"
        description="Queries Google Public DNS over HTTPS — nothing is installed, nothing is logged locally."
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_9rem_auto] sm:items-end">
          <Field label="Hostname">
            <TextInput
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="example.com"
              onKeyDown={(event) => {
                if (event.key === 'Enter') void resolve();
              }}
            />
          </Field>
          <Field label="Record type">
            <Select value={type} onChange={setType} options={RECORD_TYPES} />
          </Field>
          <Button variant="primary" onClick={() => void resolve()} disabled={status === 'loading'}>
            {status === 'loading' ? 'Resolving…' : 'Resolve'}
          </Button>
        </div>
        <Hint>Try a domain rooted in a mail setup (MX/TXT) or a zone apex (NS/SOA).</Hint>
      </ToolCard>

      {output ? (
        <OutputPane
          label="Resolver response"
          tone={status === 'error' ? 'err' : status === 'done' ? 'ok' : 'default'}
        >
          {output}
        </OutputPane>
      ) : null}
    </ToolFrame>
  );
}
