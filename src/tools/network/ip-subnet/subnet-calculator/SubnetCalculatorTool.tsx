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

function toIpv4(value: number): string {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 0xff).join('.');
}

interface SubnetResult {
  address: string;
  prefix: number;
  netmask: string;
  wildcard: string;
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  usable: number;
  total: number;
  cidr: string;
}

function calculate(input: string): SubnetResult | string {
  const [rawAddress, rawPrefix] = input.split('/');
  const address = parseIpv4(rawAddress ?? '');
  if (address === null) return 'Enter a valid IPv4 address, e.g. 192.168.1.10/24';
  const prefix = rawPrefix === undefined || rawPrefix.trim() === '' ? 24 : Number(rawPrefix);
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    return 'Prefix length must be an integer between 0 and 32.';
  }

  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const wildcard = ~mask >>> 0;
  const network = (address & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const total = 2 ** (32 - prefix);
  const usable = prefix === 32 ? 1 : prefix === 31 ? 2 : total - 2;
  const firstHost = prefix >= 31 ? network : (network + 1) >>> 0;
  const lastHost = prefix >= 31 ? broadcast : (broadcast - 1) >>> 0;

  return {
    address: toIpv4(address),
    prefix,
    netmask: toIpv4(mask),
    wildcard: toIpv4(wildcard),
    network: toIpv4(network),
    broadcast: toIpv4(broadcast),
    firstHost: toIpv4(firstHost),
    lastHost: toIpv4(lastHost),
    usable,
    total,
    cidr: `${toIpv4(network)}/${prefix}`,
  };
}

export function SubnetCalculatorTool() {
  const [input, setInput] = useState('192.168.1.10/24');
  const result = useMemo(() => calculate(input), [input]);

  return (
    <ToolFrame>
      <ToolCard title="CIDR block" description="IPv4 only. Prefix defaults to /24 when omitted.">
        <Field label="Address / prefix">
          <TextInput
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="10.0.0.42/20"
          />
        </Field>
        <Hint>Works for host addresses and network addresses alike — both produce the same block.</Hint>
      </ToolCard>

      {typeof result === 'string' ? (
        <OutputPane label="Result" tone="err">
          {result}
        </OutputPane>
      ) : (
        <OutputPane label="Subnet breakdown">
          {[
            `CIDR            ${result.cidr}`,
            `Address         ${result.address}`,
            `Netmask         ${result.netmask}`,
            `Wildcard        ${result.wildcard}`,
            `Network         ${result.network}`,
            `Broadcast       ${result.broadcast}`,
            `Host range      ${result.firstHost} – ${result.lastHost}`,
            `Usable hosts    ${result.usable.toLocaleString()}`,
            `Total addresses ${result.total.toLocaleString()}`,
          ].join('\n')}
        </OutputPane>
      )}
    </ToolFrame>
  );
}
