import type { ScriptTemplate } from '../types/script';
import { colorize } from '../utils/builder';

/**
 * Blueprint: Network Diagnostics Tool (`myip`).
 *
 * Every module is a self-contained `case` fragment. `@{TOKEN}` placeholders are
 * resolved against the active palette at compile time, so this file never has to
 * know which theme the user picked.
 */
export const networkTemplate: ScriptTemplate = {
  id: 'network-diagnostics',
  name: 'Network Diagnostics Tool (myip)',
  defaultCommandName: 'myip',
  shortDescription:
    'One wrapper for the entire network troubleshooting toolbox: interfaces, public egress IP, DNS, port sweeps, route traces, throughput and wireless visibility.',
  icon: '⇄',

  baseSystemChecks: `
# ── Template policy ─────────────────────────────────────────────────────────
# The network blueprint resolves the primary interface once and shares it with
# every module, so no module has to guess which NIC is "the" uplink.

OMNISCRIPT_PRIMARY_IFACE=""

resolve_primary_interface() {
  local route
  if have ip; then
    route="$(ip route show default 2>/dev/null | head -n1 || true)"
    OMNISCRIPT_PRIMARY_IFACE="\${route##*dev }"
    OMNISCRIPT_PRIMARY_IFACE="\${OMNISCRIPT_PRIMARY_IFACE%% *}"
  fi
  if [ -z "$OMNISCRIPT_PRIMARY_IFACE" ]; then
    OMNISCRIPT_PRIMARY_IFACE="unknown"
  fi
}

preflight() {
  case "$(uname -s)" in
    Linux) : ;;
    *)
      printf "%s! this blueprint targets Linux; modules may misbehave%s\\\\n" "@{WARN}" "@{NC}" >&2
      ;;
  esac
  resolve_primary_interface
}
`,

  modules: [
    {
      id: 'active-interfaces',
      flag: '-a | --active',
      summary: 'List active interfaces with assigned addresses',
      requiredDependencies: ['iproute2'],
      details:
        'Uses `ip -brief` when available and transparently falls back to legacy net-tools output.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -a | --active)
    banner "Active Network Interfaces"
    printf "%sprimary uplink%s %s\\\\n" "@{MUTED}" "@{NC}" "$OMNISCRIPT_PRIMARY_IFACE"
    if have ip; then
      ip -brief address show
    elif have ifconfig; then
      ifconfig -a
    else
      die "neither iproute2 nor net-tools is installed"
    fi
    ;;
`,
          colors,
        ),
    },
    {
      id: 'public-ip',
      flag: '-i | --ip',
      summary: 'Resolve the public egress IP through mirrors',
      requiredDependencies: ['curl'],
      details:
        'Tries ipify, ifconfig.me and icanhazip in order and short-circuits on the first success.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -i | --ip)
    banner "Public Egress Address"
    public_ip=""
    for endpoint in https://api.ipify.org https://ifconfig.me/ip https://icanhazip.com; do
      if public_ip="$(curl -fsS --max-time 6 "$endpoint" 2>/dev/null)"; then
        printf "  %s➜%s %s\\\\n" "@{OK}" "@{NC}" "$public_ip"
        break
      fi
      public_ip=""
    done
    if [ -z "$public_ip" ]; then
      printf "  %s! every IP echo service is unreachable%s\\\\n" "@{WARN}" "@{NC}" >&2
    fi
    ;;
`,
          colors,
        ),
    },
    {
      id: 'dns-lookup',
      flag: '-d | --dns <host>',
      summary: 'Query A, AAAA, MX and TXT records for a host',
      requiredDependencies: ['dnsutils'],
      details:
        'Requires `dig` — installed by `dnsutils` (Debian) or `bind-utils` (RHEL). The wrapper probes for the binary, not the package name.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -d | --dns)
    target="\${2:-}"
    [ -n "$target" ] || die "usage: $SCRIPT_NAME --dns <hostname>"
    require_dependency dnsutils
    banner "DNS Records :: $target"
    printf "  %sA%s     %s\\\\n" "@{TITLE}" "@{NC}" "$(dig +short "$target" A | tr '\\\\n' ' ')"
    printf "  %sAAAA%s  %s\\\\n" "@{TITLE}" "@{NC}" "$(dig +short "$target" AAAA | tr '\\\\n' ' ')"
    printf "  %sMX%s    %s\\\\n" "@{TITLE}" "@{NC}" "$(dig +short "$target" MX | tr '\\\\n' ' ')"
    printf "  %sTXT%s   %s\\\\n" "@{TITLE}" "@{NC}" "$(dig +short "$target" TXT | tr '\\\\n' ' ')"
    ;;
`,
          colors,
        ),
    },
    {
      id: 'port-sweep',
      flag: '-p | --ports <host>',
      summary: 'Sweep the common TCP ports of a remote host',
      requiredDependencies: ['netcat'],
      details: 'Uses `nc -z -w 2`; only listening ports are printed, closed ones stay silent.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -p | --ports)
    target="\${2:-}"
    [ -n "$target" ] || die "usage: $SCRIPT_NAME --ports <host>"
    require_dependency netcat
    banner "TCP Port Sweep :: $target"
    for port in 21 22 25 53 80 110 143 443 587 993 3306 5432 6379 8080 8443; do
      if nc -z -w 2 "$target" "$port" 2>/dev/null; then
        printf "  %s%-6s open%s\\\\n" "@{OK}" "$port" "@{NC}"
      fi
    done
    printf "  %s(only open ports are reported)%s\\\\n" "@{MUTED}" "@{NC}"
    ;;
`,
          colors,
        ),
    },
    {
      id: 'route-trace',
      flag: '-t | --trace <host>',
      summary: 'Trace the layer-3 path to a host',
      requiredDependencies: ['traceroute'],
      details: 'Runs a single probe per hop (`-q 1`) so results arrive fast.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -t | --trace)
    target="\${2:-}"
    [ -n "$target" ] || die "usage: $SCRIPT_NAME --trace <host>"
    require_dependency traceroute
    banner "Route Trace :: $target"
    traceroute -w 2 -q 1 "$target"
    ;;
`,
          colors,
        ),
    },
    {
      id: 'mac-addresses',
      flag: '-m | --mac',
      summary: 'Show layer-2 addresses for every interface',
      requiredDependencies: ['iproute2'],
      details: 'Handy when matching a switch port to a machine.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -m | --mac)
    banner "Link Layer Addresses"
    if have ip; then
      ip -brief link show
    elif have ifconfig; then
      ifconfig -a | grep -E "ether|HWaddr"
    else
      die "neither iproute2 nor net-tools is installed"
    fi
    ;;
`,
          colors,
        ),
    },
    {
      id: 'listen-sockets',
      flag: '-l | --listen',
      summary: 'Enumerate listening sockets and owning processes',
      requiredDependencies: ['iproute2'],
      details: 'Falls back to `netstat -tulpn` when `ss` is missing.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -l | --listen)
    banner "Listening Sockets"
    if have ss; then
      ss -tulpn
    elif have netstat; then
      netstat -tulpn
    else
      die "install iproute2 (ss) or net-tools (netstat)"
    fi
    ;;
`,
          colors,
        ),
    },
    {
      id: 'throughput',
      flag: '-s | --speed',
      summary: 'Measure connect latency and download throughput',
      requiredDependencies: ['curl'],
      details: 'Pulls a 10 MB payload from the Cloudflare speed endpoint and reports curl metrics.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -s | --speed)
    require_dependency curl
    banner "Throughput Probe (10 MB)"
    printf "  %s· measuring, this takes a few seconds…%s\\\\n" "@{MUTED}" "@{NC}"
    curl -o /dev/null -fsS -w "  connect  : %{time_connect}s\\\\n  download : %{size_download} bytes\\\\n  speed    : %{speed_download} B/s\\\\n  total    : %{time_total}s\\\\n" \\
      "https://speed.cloudflare.com/__down?bytes=10000000"
    ;;
`,
          colors,
        ),
    },
    {
      id: 'wifi-survey',
      flag: '-w | --wifi',
      summary: 'Survey nearby wireless networks and signal strength',
      requiredDependencies: ['network-manager'],
      details: 'Needs root for a raw scan; prefers `nmcli` and falls back to `iwlist`.',
      requiresRoot: true,
      bashCaseBlock: (colors) =>
        colorize(
          `
  -w | --wifi)
    require_root
    banner "Nearby Wireless Networks"
    if have nmcli; then
      nmcli -f IN-USE,SSID,SIGNAL,SECURITY dev wifi list
    elif have iwlist; then
      iwlist scan 2>/dev/null | grep -E "ESSID|Signal level|Encryption key"
    else
      die "install NetworkManager (nmcli) or wireless-tools (iwlist)"
    fi
    ;;
`,
          colors,
        ),
    },
    {
      id: 'whois',
      flag: '-W | --whois <domain>',
      summary: 'Look up domain registration and netblock ownership',
      requiredDependencies: ['whois'],
      details: 'Trims the registrar noise down to the fields people actually read.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -W | --whois)
    target="\${2:-}"
    [ -n "$target" ] || die "usage: $SCRIPT_NAME --whois <domain>"
    require_dependency whois
    banner "WHOIS :: $target"
    whois "$target" | grep -iE "^(domain name|registrar|creation date|expiry date|updated date|name server|org|netname|country|cidr)" ||
      whois "$target" | head -n 40
    ;;
`,
          colors,
        ),
    },
    {
      id: 'copy-ip',
      flag: '-c | --copy',
      summary: 'Copy the public IP straight to the clipboard',
      requiredDependencies: ['curl', 'wl-clipboard'],
      details:
        'Only reachable when the universal clipboard block is compiled in — otherwise it fails with a clear message.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -c | --copy)
    if ! declare -F copy_to_clipboard >/dev/null; then
      die "clipboard support is compiled out — enable it in the OmniScript control matrix"
    fi
    require_dependency curl
    banner "Copy Public IP To Clipboard"
    public_ip="$(curl -fsS --max-time 6 https://api.ipify.org)"
    printf "%s" "$public_ip" | copy_to_clipboard
    printf "  %s✔ copied%s %s\\\\n" "@{OK}" "@{NC}" "$public_ip"
    ;;
`,
          colors,
        ),
    },
  ],
};
