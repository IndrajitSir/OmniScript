import { useMemo, useState } from 'react';
import { Field, Hint, OutputPane, TextInput, ToolCard, ToolFrame } from '../../../../components/toolkit';

function parseIpv4(value: string): number | null {
  const parts = value.trim().split('.');
  if (parts.length !== 4) return null;
  let result = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const octet = Number(part);
    if (octet > 255) return null;
    result = ((result << 8) | octet) >>> 0;
  }
  return result >>> 0;
}

function toBinary(value: number): string {
  return [24, 16, 8, 0]
    .map((shift) => ((value >>> shift) & 0xff).toString(2).padStart(8, '0'))
    .join('.');
}

const RANGES: Array<{ cidr: string; network: number; bits: number; label: string }> = [
  { cidr: '10.0.0.0/8', network: 0x0a000000, bits: 8, label: 'private (RFC 1918)' },
  { cidr: '172.16.0.0/12', network: 0xac100000, bits: 12, label: 'private (RFC 1918)' },
  { cidr: '192.168.0.0/16', network: 0xc0a80000, bits: 16, label: 'private (RFC 1918)' },
  { cidr: '100.64.0.0/10', network: 0x64400000, bits: 10, label: 'carrier-grade NAT' },
  { cidr: '169.254.0.0/16', network: 0xa9fe0000, bits: 16, label: 'link-local (APIPA)' },
  { cidr: '127.0.0.0/8', network: 0x7f000000, bits: 8, label: 'loopback' },
  { cidr: '224.0.0.0/4', network: 0xe0000000, bits: 4, label: 'multicast' },
  { cidr: '240.0.0.0/4', network: 0xf0000000, bits: 4, label: 'reserved / experimental' },
  { cidr: '192.0.2.0/24', network: 0xc0000200, bits: 24, label: 'documentation (TEST-NET-1)' },
  { cidr: '198.51.100.0/24', network: 0xc6336400, bits: 24, label: 'documentation (TEST-NET-2)' },
  { cidr: '203.0.113.0/24', network: 0xcb007100, bits: 24, label: 'documentation (TEST-NET-3)' },
];

function classify(address: number): string {
  const mask = (bits: number) => (bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0);
  for (const range of RANGES) {
    if (((address & mask(range.bits)) >>> 0) === range.network) return range.label;
  }
  return 'public (globally routable)';
}

function ipClass(address: number): string {
  const first = (address >>> 24) & 0xff;
  if (first < 128) return 'A';
  if (first < 192) return 'B';
  if (first < 224) return 'C';
  if (first < 240) return 'D (multicast)';
  return 'E (reserved)';
}

export function IpInspectorTool() {
  const [input, setInput] = useState('192.168.1.24');
  const result = useMemo(() => {
    const address = parseIpv4(input);
    if (address === null) return 'Enter a valid dotted-quad IPv4 address.';
    return [
      `Address       ${input.trim()}`,
      `Binary        ${toBinary(address)}`,
      `Integer       ${address}`,
      `Hex           0x${address.toString(16).padStart(8, '0')}`,
      `Scope         ${classify(address)}`,
      `Class         ${ipClass(address)}`,
      `Reverse DNS   ${input.trim().split('.').reverse().join('.')}.in-addr.arpa`,
      `Range         ${((address >>> 24) & 0xff) < 128 ? 'unicast' : 'non-unicast'}`,
    ].join('\n');
  }, [input]);

  return (
    <ToolFrame>
      <ToolCard title="Address" description="Everything is computed offline — no lookup is sent anywhere.">
        <Field label="IPv4 address">
          <TextInput
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="203.0.113.7"
          />
        </Field>
        <Hint>Scope detection covers RFC 1918, CGNAT, loopback, link-local, multicast and TEST-NET blocks.</Hint>
      </ToolCard>

      <OutputPane label="Classification" tone={result.startsWith('Enter') ? 'err' : 'default'}>
        {result}
      </OutputPane>
    </ToolFrame>
  );
}
