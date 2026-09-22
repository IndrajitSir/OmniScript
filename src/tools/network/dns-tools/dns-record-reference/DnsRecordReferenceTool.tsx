import { useMemo, useState } from 'react';
import { Field, Hint, TextInput, ToolCard, ToolFrame } from '../../../../components/toolkit';

interface RecordInfo {
  type: string;
  purpose: string;
  example: string;
}

const RECORDS: RecordInfo[] = [
  { type: 'A', purpose: 'Maps a hostname to an IPv4 address.', example: 'example.com. 3600 IN A 93.184.216.34' },
  { type: 'AAAA', purpose: 'Maps a hostname to an IPv6 address.', example: 'example.com. 3600 IN AAAA 2606:2800::1' },
  { type: 'CNAME', purpose: 'Aliases one name to another canonical name.', example: 'www IN CNAME example.com.' },
  { type: 'MX', purpose: 'Declares mail exchangers, with a preference number.', example: 'example.com. IN MX 10 mail.example.com.' },
  { type: 'TXT', purpose: 'Arbitrary text — SPF, DKIM, site verification.', example: 'example.com. IN TXT "v=spf1 -all"' },
  { type: 'NS', purpose: 'Delegates a zone to authoritative name servers.', example: 'example.com. IN NS ns1.example.com.' },
  { type: 'SOA', purpose: 'Start of authority: primary NS, serial and timers.', example: 'example.com. IN SOA ns1 hostmaster 2026010101 7200 3600 1209600 3600' },
  { type: 'PTR', purpose: 'Reverse lookup: address to hostname.', example: '34.216.184.93.in-addr.arpa. IN PTR example.com.' },
  { type: 'SRV', purpose: 'Service location: host and port for a protocol.', example: '_sip._tcp IN SRV 10 5 5060 sip.example.com.' },
  { type: 'CAA', purpose: 'Restricts which CAs may issue certificates.', example: 'example.com. IN CAA 0 issue "letsencrypt.org"' },
  { type: 'AAAA / APL', purpose: 'Address prefix lists for advanced IP matching.', example: 'example.com. IN APL 1:192.168.32.0/21' },
  { type: 'DS / DNSKEY', purpose: 'DNSSEC trust anchors and public keys.', example: 'example.com. IN DS 12345 8 2 ABCD…' },
  { type: 'TLSA', purpose: 'Pins a certificate for a service (DANE).', example: '_443._tcp IN TLSA 3 1 1 ABCD…' },
  { type: 'NAPTR', purpose: 'Regex-based URI mapping, used by ENUM.', example: 'IN NAPTR 100 10 "u" "E2U+sip" "!^.*$!sip:info@example.com!" .' },
];

export function DnsRecordReferenceTool() {
  const [query, setQuery] = useState('');
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return RECORDS;
    return RECORDS.filter(
      (record) =>
        record.type.toLowerCase().includes(needle) ||
        record.purpose.toLowerCase().includes(needle),
    );
  }, [query]);

  return (
    <ToolFrame>
      <ToolCard title="Search" description="A quick answer to “which record do I actually need?”.">
        <div className="max-w-sm">
          <Field label="Record type or topic">
            <TextInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="MX, DNSSEC, mail…"
            />
          </Field>
        </div>
        <Hint>Examples are shown in zone-file syntax.</Hint>
      </ToolCard>

      <ToolCard title={`Records (${matches.length})`}>
        <div className="flex flex-col gap-2">
          {matches.map((record) => (
            <div
              key={record.type}
              className="rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)]/60 px-3 py-2.5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <code className="font-mono text-xs font-semibold text-[var(--os-accent)]">{record.type}</code>
                <span className="text-[11px] text-[var(--os-muted)]">{record.purpose}</span>
              </div>
              <code className="mt-1.5 block font-mono text-[11px] break-all text-[var(--os-accent-alt)]">
                {record.example}
              </code>
            </div>
          ))}
          {matches.length === 0 ? (
            <p className="text-xs text-[var(--os-muted)]">No record matches “{query}”.</p>
          ) : null}
        </div>
      </ToolCard>
    </ToolFrame>
  );
}
