import { useMemo, useState } from 'react';
import { Field, Hint, TextInput, ToolCard, ToolFrame } from '../../../../components/toolkit';

interface PortEntry {
  port: number;
  protocol: 'tcp' | 'udp' | 'tcp/udp';
  service: string;
  description: string;
}

const PORTS: PortEntry[] = [
  { port: 20, protocol: 'tcp', service: 'ftp-data', description: 'FTP data transfer' },
  { port: 21, protocol: 'tcp', service: 'ftp', description: 'FTP control channel' },
  { port: 22, protocol: 'tcp', service: 'ssh', description: 'Secure Shell / SFTP / SCP' },
  { port: 23, protocol: 'tcp', service: 'telnet', description: 'Unencrypted remote shell' },
  { port: 25, protocol: 'tcp', service: 'smtp', description: 'Mail transfer between servers' },
  { port: 53, protocol: 'tcp/udp', service: 'dns', description: 'Domain name resolution' },
  { port: 67, protocol: 'udp', service: 'dhcp-server', description: 'DHCP server' },
  { port: 68, protocol: 'udp', service: 'dhcp-client', description: 'DHCP client' },
  { port: 80, protocol: 'tcp', service: 'http', description: 'Plain HTTP' },
  { port: 110, protocol: 'tcp', service: 'pop3', description: 'POP3 mail retrieval' },
  { port: 123, protocol: 'udp', service: 'ntp', description: 'Network time synchronisation' },
  { port: 143, protocol: 'tcp', service: 'imap', description: 'IMAP mail retrieval' },
  { port: 161, protocol: 'udp', service: 'snmp', description: 'SNMP monitoring' },
  { port: 389, protocol: 'tcp', service: 'ldap', description: 'Lightweight directory access' },
  { port: 443, protocol: 'tcp', service: 'https', description: 'HTTP over TLS' },
  { port: 445, protocol: 'tcp', service: 'smb', description: 'Windows file sharing' },
  { port: 465, protocol: 'tcp', service: 'smtps', description: 'SMTP over implicit TLS' },
  { port: 514, protocol: 'udp', service: 'syslog', description: 'System log shipping' },
  { port: 587, protocol: 'tcp', service: 'submission', description: 'Authenticated mail submission' },
  { port: 636, protocol: 'tcp', service: 'ldaps', description: 'LDAP over TLS' },
  { port: 993, protocol: 'tcp', service: 'imaps', description: 'IMAP over TLS' },
  { port: 995, protocol: 'tcp', service: 'pop3s', description: 'POP3 over TLS' },
  { port: 1194, protocol: 'udp', service: 'openvpn', description: 'OpenVPN tunnel' },
  { port: 1433, protocol: 'tcp', service: 'mssql', description: 'Microsoft SQL Server' },
  { port: 1521, protocol: 'tcp', service: 'oracle', description: 'Oracle database listener' },
  { port: 2049, protocol: 'tcp/udp', service: 'nfs', description: 'Network File System' },
  { port: 2375, protocol: 'tcp', service: 'docker', description: 'Docker daemon (unencrypted)' },
  { port: 2376, protocol: 'tcp', service: 'docker-tls', description: 'Docker daemon over TLS' },
  { port: 3000, protocol: 'tcp', service: 'http-alt', description: 'Common dev server / Grafana' },
  { port: 3306, protocol: 'tcp', service: 'mysql', description: 'MySQL / MariaDB' },
  { port: 3389, protocol: 'tcp', service: 'rdp', description: 'Windows Remote Desktop' },
  { port: 5432, protocol: 'tcp', service: 'postgresql', description: 'PostgreSQL' },
  { port: 5601, protocol: 'tcp', service: 'kibana', description: 'Kibana UI' },
  { port: 5672, protocol: 'tcp', service: 'amqp', description: 'RabbitMQ / AMQP' },
  { port: 6379, protocol: 'tcp', service: 'redis', description: 'Redis' },
  { port: 8080, protocol: 'tcp', service: 'http-proxy', description: 'Alternate HTTP / Tomcat' },
  { port: 8443, protocol: 'tcp', service: 'https-alt', description: 'Alternate HTTPS' },
  { port: 9200, protocol: 'tcp', service: 'elasticsearch', description: 'Elasticsearch REST' },
  { port: 11211, protocol: 'tcp/udp', service: 'memcached', description: 'Memcached' },
  { port: 27017, protocol: 'tcp', service: 'mongodb', description: 'MongoDB' },
];

export function PortReferenceTool() {
  const [query, setQuery] = useState('');
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return PORTS;
    return PORTS.filter(
      (entry) =>
        String(entry.port).includes(needle) ||
        entry.service.includes(needle) ||
        entry.description.toLowerCase().includes(needle),
    );
  }, [query]);

  return (
    <ToolFrame>
      <ToolCard title="Search" description={`${PORTS.length} well-known and common registered ports.`}>
        <div className="max-w-sm">
          <Field label="Port or service">
            <TextInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="443, redis, mail…"
            />
          </Field>
        </div>
        <Hint>Filter matches the port number, service name and description.</Hint>
      </ToolCard>

      <ToolCard title={`Matches (${matches.length})`} className="p-0">
        <ul className="os-scroll flex max-h-[26rem] flex-col divide-y divide-[var(--os-border)] overflow-auto rounded-lg border border-[var(--os-border)]">
          {matches.map((entry) => (
            <li key={`${entry.port}-${entry.service}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2">
              <code className="w-12 shrink-0 font-mono text-sm text-[var(--os-accent)]">{entry.port}</code>
              <code className="w-24 shrink-0 font-mono text-[11px] text-[var(--os-muted)] uppercase">
                {entry.protocol}
              </code>
              <span className="font-mono text-xs text-[var(--os-text)]">{entry.service}</span>
              <span className="ml-auto text-[11px] text-[var(--os-muted)]">{entry.description}</span>
            </li>
          ))}
          {matches.length === 0 ? (
            <li className="px-3 py-4 text-xs text-[var(--os-muted)]">No port matches “{query}”.</li>
          ) : null}
        </ul>
      </ToolCard>
    </ToolFrame>
  );
}
