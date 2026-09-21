/**
 * ────────────────────────────────────────────────────────────────────────────
 *  Dependency registry
 * ────────────────────────────────────────────────────────────────────────────
 *  A declared dependency is a *package* name (as written in the spec:
 *  `["iproute2", "curl", "xclip"]`), but the generated wrapper has to probe for
 *  a *binary*. This registry is the translation layer: it tells the compiler
 *  which executable proves a package is installed, and which package name to
 *  put in the install hint.
 */
export interface DependencyInfo {
  /** The id used in `FlagModule.requiredDependencies`. */
  id: string;
  /** The executable probed with `command -v`. */
  probe: string;
  /** Package name used when building the install hint. */
  package: string;
  /** Human-readable note shown in the UI tooltip. */
  note: string;
}

function entry(id: string, probe: string, pkg: string, note: string): DependencyInfo {
  return { id, probe, package: pkg, note };
}

export const DEPENDENCY_REGISTRY: Record<string, DependencyInfo> = {
  iproute2: entry('iproute2', 'ip', 'iproute2', 'iproute2 suite — provides ip, ss, bridge'),
  'net-tools': entry('net-tools', 'ifconfig', 'net-tools', 'legacy ifconfig/netstat tooling'),
  curl: entry('curl', 'curl', 'curl', 'HTTP transfer client'),
  dnsutils: entry('dnsutils', 'dig', 'dnsutils', 'BIND clients — provides dig, nslookup'),
  netcat: entry('netcat', 'nc', 'netcat-openbsd', 'TCP/UDP swiss army knife'),
  traceroute: entry('traceroute', 'traceroute', 'traceroute', 'layer-3 path discovery'),
  whois: entry('whois', 'whois', 'whois', 'registry/registrar lookups'),
  'network-manager': entry('network-manager', 'nmcli', 'network-manager', 'NetworkManager CLI'),
  'wireless-tools': entry('wireless-tools', 'iwlist', 'wireless-tools', 'legacy wireless scanning'),
  'wl-clipboard': entry('wl-clipboard', 'wl-copy', 'wl-clipboard', 'Wayland clipboard'),
  xclip: entry('xclip', 'xclip', 'xclip', 'X11 clipboard'),
  coreutils: entry('coreutils', 'df', 'coreutils', 'GNU userland (df, du, sha256sum)'),
  findutils: entry('findutils', 'find', 'findutils', 'find/xargs filesystem traversal'),
  procps: entry('procps', 'ps', 'procps', 'process/uptime accounting'),
  'lm-sensors': entry('lm-sensors', 'sensors', 'lm-sensors', 'hardware temperature sensors'),
  'iputils-ping': entry('iputils-ping', 'ping', 'iputils-ping', 'ICMP reachability probes'),
  tar: entry('tar', 'tar', 'tar', 'archive creation/extraction'),
  gzip: entry('gzip', 'gzip', 'gzip', 'compression backend'),
  rsync: entry('rsync', 'rsync', 'rsync', 'incremental mirroring'),
  openssl: entry('openssl', 'openssl', 'openssl', 'AES encryption + PBKDF2'),
  'openssh-server': entry('openssh-server', 'sshd', 'openssh-server', 'SSH daemon to audit'),
};

/** Fall back to a 1:1 mapping for ad-hoc binaries (e.g. `require_dependency nproc`). */
export function dependencyInfo(id: string): DependencyInfo {
  return (
    DEPENDENCY_REGISTRY[id] ?? {
      id,
      probe: id,
      package: id,
      note: 'probed directly as an executable',
    }
  );
}

export const DEPENDENCY_IDS = Object.keys(DEPENDENCY_REGISTRY);
