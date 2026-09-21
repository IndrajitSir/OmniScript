import type { FlagModule, ScriptSettings, ScriptTemplate, TerminalTheme } from '../types/script';
import { modulePrimaryPattern } from './scriptCompiler';

/**
 * Produces a plausible "what just happened" transcript for the sandbox pane.
 *
 * This is intentionally not a shell emulator: it renders representative output
 * so the user can sanity-check which modules are wired together before they
 * ever copy the script to a real machine.
 */

const SAMPLE_OUTPUT: Record<string, string[]> = {
  // network blueprint
  'active-interfaces': [
    'primary uplink wlan0',
    'lo               UNKNOWN        127.0.0.1/8 ::1/128',
    'eth0             UP             10.0.4.19/24 fe80::42:acff:fe11:13/64',
    'wlan0            UP             192.168.1.24/24 fe80::a2ce:c8ff:fe41:9d2a/64',
  ],
  'public-ip': ['➜ 203.0.113.42'],
  'dns-lookup': [
    'A     93.184.216.34',
    'AAAA  2606:2800:220:1:248:1893:25c8:1946',
    'MX    0 example-com.mail.protection.outlook.com.',
    'TXT   "v=spf1 include:spf.protection.outlook.com -all"',
  ],
  'port-sweep': ['22     open', '80     open', '443    open', '(only open ports are reported)'],
  'route-trace': [
    'traceroute to example.com (93.184.216.34), 30 hops max, 60 byte packets',
    ' 1  192.168.1.1 (192.168.1.1)  1.204 ms',
    ' 2  10.44.0.1 (10.44.0.1)  6.882 ms',
    ' 3  93.184.216.34 (93.184.216.34)  18.031 ms',
  ],
  'mac-addresses': [
    'lo               UNKNOWN        00:00:00:00:00:00',
    'eth0             UP            02:42:ac:11:00:02',
  ],
  'listen-sockets': [
    'Netid State  Local Address:Port  Process',
    'tcp   LISTEN 0.0.0.0:22          users:(("sshd",pid=712,fd=3))',
    'tcp   LISTEN 127.0.0.1:5432      users:(("postgres",pid=1180,fd=7))',
  ],
  throughput: [
    '· measuring, this takes a few seconds…',
    'connect  : 0.041s',
    'download : 10000000 bytes',
    'speed    : 41234881 B/s',
    'total    : 1.918s',
  ],
  'wifi-survey': [
    'IN-USE  SSID              SIGNAL  SECURITY',
    '*       office-5g         87      WPA2',
    '        guest             54      WPA2',
  ],
  whois: ['domain name: EXAMPLE.COM', 'registrar: RESERVED-Internet Assigned Numbers Authority'],
  'copy-ip': ['✔ copied 203.0.113.42 to the clipboard'],

  // system metrics blueprint
  cpu: [
    'model      Intel(R) Core(TM) i7-1185G7 @ 3.00GHz',
    'cores      8',
    'load 1/5/15 0.42 0.51 0.63',
    'clock      2411 MHz across 8 cores',
  ],
  memory: [
    '               total        used        free      shared  buff/cache',
    'Mem:            31Gi       9.4Gi       1.9Gi       412Mi        20Gi',
    'Swap:          2.0Gi          0B       2.0Gi',
    'available 61% of physical memory',
  ],
  disk: [
    'Filesystem      Size  Used Avail Use% Mounted on',
    '/dev/nvme0n1p2  468G  241G  204G  55% /',
    '5 largest entries under /home/dev',
    '196G  /home/dev/workspace',
    ' 41G  /home/dev/.cache',
  ],
  load: ['load 1/5/15 0.42 0.51 0.63', 'running/blocked 3 0 ', 'uptime 184223 seconds'],
  processes: [
    'PID    PPID USER    %CPU %MEM   ELAPSED COMMAND',
    '14422  14001 dev     24.8  3.1  01:12:44 node',
    ' 1180      1 postgres 4.2  1.8 12:04:19 postgres',
    'by resident memory',
    ' 1180 postgres 1.8 581232 postgres',
  ],
  kernel: [
    'Linux dev-box 6.11.0-9-generic #9-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux',
    'PRETTY_NAME="Ubuntu 24.04.2 LTS"',
    'architecture x86_64',
  ],
  temperature: ['thermal_zone0 47.0 °C', 'thermal_zone1 52.5 °C'],
  'block-io': [
    'device     reads        writes       read-pages     write-pages',
    'nvme0n1    148332       99120        3027112        4190521',
  ],
  'net-io': ['2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500', '    RX: bytes 912441200  TX: bytes 218840120'],
  snapshot: ['kernel   6.11.0-9-generic', 'load     0.42 0.51 0.63', 'Swap: 2.0Gi 0B 2.0Gi'],

  // backup blueprint
  full: ['from /home/dev/workspace', 'to   /home/dev/.snapkit/workspace/workspace-20260921T101500Z.tar.gz', '✔ 812M', 'sha256 4f9a…c17b'],
  incremental: ['linking against /home/dev/.snapkit/workspace/inc-20260920T101500Z', '✔ snapshot ready /home/dev/.snapkit/workspace/inc-20260921T101500Z'],
  encrypt: ['passphrase: ********', '✔ encrypted workspace-20260921T101500Z.tar.gz.enc'],
  verify: ['✔ archive intact — 48213 entries', 'sha256 4f9a…c17b'],
  list: ['2026-09-21 10:15  812.4M  /home/dev/.snapkit/workspace/workspace-20260921T101500Z.tar.gz'],
  prune: ['nothing to prune — retention is already satisfied'],
  restore: ['into /home/dev/restore-20260921T101500Z', '✔ restored 48213 entries', 'review, then merge manually — nothing was overwritten'],
  sync: ['dry run', 'deleting "build/tmp.js"', 'proceed with the real sync? [y/N]: ✔ mirrored'],

  // security blueprint
  audit: ['privileged accounts (uid 0)', '    root', '✔ no empty passwords found', '✔ no obvious exposure in the first 15 sockets'],
  firewall: ['Status: active', 'Default: deny (incoming), allow (outgoing)', 'To Action From -- 22/tcp ALLOW 10.0.0.0/8'],
  updates: ['apt reports 14 upgradable package(s), 3 security-flavoured', '! security updates are pending — schedule a window'],
  'ssh-policy': ['PermitRootLogin         prohibit-password', 'PasswordAuthentication    no', '✔ root login is not freely permitted'],
  suid: ['-rwsr-xr-x root:root /usr/bin/passwd', '-rwsr-xr-x root:root /usr/bin/sudo', '3 SUID binaries present — compare against your golden image'],
  'password-policy': ['PASS_MAX_DAYS 365', 'UMASK 027', 'root last change 2026-04-02, max 99999 days'],
  'failed-logins': ['last 24h — top source addresses', '   41 198.51.100.7', '    9 203.0.113.99', 'btmp summary', 'root ssh:notty 198.51.100.7'],
  harden: ['the following changes would be applied', 'dry run — re-run with: sentinel --harden apply'],
};

function fallbackLines(module: FlagModule): string[] {
  return [
    `${modulePrimaryPattern(module.flag)} — ${module.summary.toLowerCase()}`,
    module.requiredDependencies.length
      ? `(would run with: ${module.requiredDependencies.join(', ')})`
      : '(pure shell — no external packages)',
  ];
}

export interface SimulationLine {
  kind: 'command' | 'output' | 'note';
  text: string;
}

export function simulateRun(
  template: ScriptTemplate,
  activeModules: FlagModule[],
  settings: ScriptSettings,
  theme: TerminalTheme,
): SimulationLine[] {
  const command = settings.commandName.trim() || template.defaultCommandName;
  const lines: SimulationLine[] = [
    { kind: 'note', text: `$ chmod +x ${command}.sh && ./${command}.sh --help` },
    { kind: 'output', text: `${command} — ${template.shortDescription.slice(0, 68)}…` },
    { kind: 'output', text: 'COMMANDS' },
  ];

  for (const module of activeModules) {
    lines.push({ kind: 'output', text: `  ${module.flag.padEnd(30)} ${module.summary}` });
  }

  if (activeModules.length === 0) {
    lines.push({ kind: 'output', text: '  (no modules enabled — the wrapper only prints help)' });
  }

  lines.push(
    { kind: 'output', text: '' },
    { kind: 'note', text: `# simulated run — theme ${theme.label}, ${settings.includeColor ? 'colored' : 'plain'} output` },
  );

  for (const module of activeModules) {
    lines.push(
      { kind: 'command', text: `$ ./${command}.sh ${modulePrimaryPattern(module.flag)}` },
      ...(SAMPLE_OUTPUT[module.id] ?? fallbackLines(module)).map((text) => ({
        kind: 'output' as const,
        text,
      })),
      { kind: 'output', text: '' },
    );
  }

  return lines;
}
