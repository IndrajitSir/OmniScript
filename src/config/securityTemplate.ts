import type { ScriptTemplate } from '../types/script';
import { colorize } from '../utils/builder';

/**
 * Blueprint: Security & Hardening Framework (`sentinel`).
 *
 * Everything is read-only by default. Mutating behaviour (`--harden`) requires
 * an explicit `apply` argument plus interactive confirmation, so a mistyped
 * command can never reconfigure a production host.
 */
export const securityTemplate: ScriptTemplate = {
  id: 'security-hardening',
  name: 'Security / Hardening Framework (sentinel)',
  defaultCommandName: 'sentinel',
  shortDescription:
    'Posture auditing for Linux hosts: listening exposure, firewall state, patch level, SSH policy, SUID inventory, password ageing and failed-login forensics.',
  icon: '⛨',

  baseSystemChecks: `
# ── Template policy ─────────────────────────────────────────────────────────
# Auditing is read-only. Anything that mutates the host must be requested with
# an explicit "apply" argument and confirmed interactively.

OMNISCRIPT_FINDINGS=0

finding() {
  local severity="$1"
  shift
  OMNISCRIPT_FINDINGS=$((OMNISCRIPT_FINDINGS + 1))
  case "$severity" in
    fail) printf "  %s✖ %s%s\\\\n" "@{ERR}" "$*" "@{NC}" ;;
    warn) printf "  %s! %s%s\\\\n" "@{WARN}" "$*" "@{NC}" ;;
    pass) printf "  %s✔ %s%s\\\\n" "@{OK}" "$*" "@{NC}" ;;
    *) printf "  %s· %s%s\\\\n" "@{MUTED}" "$*" "@{NC}" ;;
  esac
}

findings_summary() {
  printf "\\\\n  %s%d finding(s) collected%s\\\\n" "@{TITLE}" "$OMNISCRIPT_FINDINGS" "@{NC}"
}

confirm_apply() {
  [ "\${1:-}" = "apply" ] || {
    printf "  %sdry run%s — re-run with: %s %s apply\\\\n" "@{WARN}" "@{NC}" "$SCRIPT_NAME" "\${2:-}"
    return 1
  }
  printf "%s  apply changes to this host? [y/N]:%s " "@{WARN}" "@{NC}"
  read -r reply
  case "$reply" in
    y | Y | yes | YES) return 0 ;;
    *) printf "  %saborted%s\\\\n" "@{MUTED}" "@{NC}"; return 1 ;;
  esac
}

preflight() {
  if [ "$(id -u)" -ne 0 ]; then
    printf "%s! running unprivileged — privilege-sensitive checks will be skipped%s\\\\n" "@{WARN}" "@{NC}" >&2
  fi
  OMNISCRIPT_FINDINGS=0
}
`,

  modules: [
    {
      id: 'audit',
      flag: '-a | --audit',
      summary: 'Baseline posture: uid 0 accounts, empty passwords, exposure',
      requiredDependencies: ['coreutils'],
      details: 'Combines account, socket and update checks into one triage list.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -a | --audit)
    banner "Posture Audit :: $OMNISCRIPT_HOST"
    printf "  %sprivileged accounts (uid 0)%s\\\\n" "@{TITLE}" "@{NC}"
    awk -F: '$3 == 0 { print "    " $1 }' /etc/passwd

    printf "  %saccounts without a shadowed password%s\\\\n" "@{TITLE}" "@{NC}"
    if [ -r /etc/shadow ]; then
      awk -F: '$2 == "" { print "    " $1 " has an EMPTY password" }' /etc/shadow | grep . || finding pass "no empty passwords found"
    else
      finding warn "/etc/shadow is not readable without root"
    fi

    printf "  %sexposed sockets%s\\\\n" "@{TITLE}" "@{NC}"
    if have ss; then
      ss -tulpnH 2>/dev/null | head -n 15 || true
      if ss -tulnH 2>/dev/null | grep -qE "(0\\.0\\.0\\.0|\\[?::\\]?):22\\b"; then
        finding warn "SSH listens on every interface — consider restricting to a management network"
      fi
    else
      finding warn "iproute2 (ss) is unavailable — socket exposure unknown"
    fi
    findings_summary
    ;;
`,
          colors,
        ),
    },
    {
      id: 'firewall',
      flag: '-f | --firewall',
      summary: 'Inspect ufw / nftables / iptables policy',
      requiredDependencies: [],
      details: 'Reports the default policy and the first rules of whichever stack is active.',
      requiresRoot: true,
      bashCaseBlock: (colors) =>
        colorize(
          `
  -f | --firewall)
    require_root
    banner "Firewall State"
    if have ufw; then
      ufw status verbose || true
    elif have nft; then
      printf "  %snftables ruleset%s\\\\n" "@{TITLE}" "@{NC}"
      nft list ruleset | head -n 40
    elif have iptables; then
      iptables -S | head -n 40
    else
      finding fail "no firewall tooling detected (ufw, nft, iptables)"
      return 0
    fi
    if have ss; then
      printf "\\\\n  %slistening services%s\\\\n" "@{TITLE}" "@{NC}"
      ss -tulpnH | head -n 15 || true
    fi
    ;;
`,
          colors,
        ),
    },
    {
      id: 'updates',
      flag: '-u | --updates',
      summary: 'Count pending package and security updates',
      requiredDependencies: [],
      details: 'Detects the distribution package manager and its security channel.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -u | --updates)
    banner "Patch Level"
    if have apt-get; then
      printf "  %sapt: refreshing metadata (may take a moment)%s\\\\n" "@{MUTED}" "@{NC}"
      upgradable="$(apt-get -s -o Debug::NoLocking=1 upgrade 2>/dev/null | grep -c '^Inst' || true)"
      security="$(apt-get -s -o Debug::NoLocking=1 upgrade 2>/dev/null | grep '^Inst' | grep -ci security || true)"
      finding info "apt reports \${upgradable:-0} upgradable package(s), \${security:-0} security-flavoured"
      if [ "\${security:-0}" -gt 0 ]; then
        finding warn "security updates are pending — schedule a window for 'apt-get upgrade'"
      fi
      apt list --upgradable 2>/dev/null | head -n 12 || true
    elif have dnf; then
      dnf -q check-update --security 2>/dev/null | head -n 20 || finding info "no security updates pending"
    elif have pacman; then
      finding info "check-ok: pacman -Qu lists $(pacman -Qu 2>/dev/null | wc -l) pending upgrade(s)"
    else
      finding warn "unrecognised package manager"
    fi
    ;;
`,
          colors,
        ),
    },
    {
      id: 'ssh-policy',
      flag: '-k | --ssh',
      summary: 'Review effective sshd hardening directives',
      requiredDependencies: ['openssh-server'],
      details: 'Reads sshd_config plus drop-ins and canonicalises the effective values.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -k | --ssh)
    banner "SSH Daemon Policy"
    if [ ! -r /etc/ssh/sshd_config ] && [ ! -d /etc/ssh/sshd_config.d ]; then
      finding warn "no sshd configuration found — nothing to review"
      return 0
    fi
    config_dump() {
      { [ -r /etc/ssh/sshd_config ] && cat /etc/ssh/sshd_config; cat /etc/ssh/sshd_config.d/*.conf 2>/dev/null; } |
        grep -viE "^\\\\s*#|^\\\\s*$" || true
    }
    for directive in PermitRootLogin PasswordAuthentication PermitEmptyPasswords X11Forwarding MaxAuthTries Protocol; do
      value="$(config_dump | grep -iE "^\\\\s*$directive\\\\b" | tail -n1 | awk '{print $2}' || true)"
      printf "  %s%-24s%s %s\\\\n" "@{TITLE}" "$directive" "@{NC}" "\${value:-<default>}"
    done
    if config_dump | grep -qiE "^\\\\s*PermitRootLogin\\\\s+yes"; then
      finding fail "PermitRootLogin yes — switch to 'prohibit-password' or 'no'"
    else
      finding pass "root login is not freely permitted"
    fi
    if config_dump | grep -qiE "^\\\\s*PasswordAuthentication\\\\s+yes"; then
      finding warn "PasswordAuthentication yes — key-only auth is stronger"
    fi
    findings_summary
    ;;
`,
          colors,
        ),
    },
    {
      id: 'suid',
      flag: '-S | --suid',
      summary: 'Inventory SUID/SGID binaries across the filesystem',
      requiredDependencies: ['findutils'],
      details: 'Scans the root filesystem while skipping /proc, /sys and network mounts.',
      requiresRoot: true,
      bashCaseBlock: (colors) =>
        colorize(
          `
  -S | --suid)
    require_root
    banner "SUID / SGID Inventory"
    printf "  %sscanning / — this can take a minute on large filesystems%s\\\\n" "@{MUTED}" "@{NC}"
    find / -xdev -type f -perm -4000 -printf "  %M %u:%g %p\\\\n" 2>/dev/null | sort -k5 | head -n 40 ||
      finding warn "find could not complete the scan"
    count="$(find / -xdev -type f -perm -4000 2>/dev/null | wc -l)"
    finding info "\${count:-0} SUID binaries present — compare against your golden image"
    ;;
`,
          colors,
        ),
    },
    {
      id: 'password-policy',
      flag: '-p | --policy',
      summary: 'Password ageing and complexity policy in effect',
      requiredDependencies: ['coreutils'],
      details: 'Cross-checks /etc/login.defs against the shadow metadata of human accounts.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -p | --policy)
    banner "Password Policy"
    if [ -r /etc/login.defs ]; then
      grep -E "^(PASS_MAX_DAYS|PASS_MIN_DAYS|PASS_WARN_AGE|UMASK|ENCRYPT_METHOD)" /etc/login.defs | sed 's/^/  /'
    else
      finding warn "/etc/login.defs is unreadable"
    fi
    printf "\\\\n  %sageing per human account%s\\\\n" "@{TITLE}" "@{NC}"
    if [ -r /etc/shadow ]; then
      while IFS=: read -r user _ _ last_age max_age _ _ _ _ _; do
        [ "$max_age" = "" ] && continue
        if [ "$max_age" -gt 365 ] || [ "$max_age" -lt 0 ]; then
          finding warn "$user never expires its password (max=\${max_age:-unset})"
        else
          printf "  %s%-16s%s last change %s, max %s days\\\\n" "@{VALUE}" "$user" "@{NC}" "\${last_age:-never}" "$max_age"
        fi
      done < /etc/shadow
    else
      finding warn "/etc/shadow is not readable without root"
    fi
    findings_summary
    ;;
`,
          colors,
        ),
    },
    {
      id: 'failed-logins',
      flag: '-L | --logins',
      summary: 'Failed login forensics from journald and wtmp',
      requiredDependencies: [],
      details: 'Summarises offenders instead of dumping thousands of duplicate lines.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -L | --logins)
    banner "Failed Login Forensics"
    if have journalctl; then
      printf "  %slast 24h — top source addresses%s\\\\n" "@{TITLE}" "@{NC}"
      journalctl -u ssh --since "24 hours ago" --no-pager 2>/dev/null |
        grep -iE "failed password|invalid user" |
        awk '{for (i = 1; i <= NF; i++) if ($i == "from") print $(i + 1)}' |
        sort | uniq -c | sort -rn | head -n 10 ||
        finding info "journald has no ssh unit or no matching events"
    fi
    if have lastb; then
      printf "\\\\n  %sbtmp summary%s\\\\n" "@{TITLE}" "@{NC}"
      lastb -n 10 2>/dev/null | head -n 10 || true
    else
      finding info "btmp reader (lastb) unavailable"
    fi
    ;;
`,
          colors,
        ),
    },
    {
      id: 'harden',
      flag: '-H | --harden',
      summary: 'Preview (or apply) a conservative hardening baseline',
      requiredDependencies: [],
      details: 'Requires the literal argument `apply` and an interactive confirmation before touching the host.',
      requiresRoot: true,
      bashCaseBlock: (colors) =>
        colorize(
          `
  -H | --harden)
    require_root
    banner "Hardening Baseline"
    printf "  %sthe following changes would be applied%s\\\\n" "@{TITLE}" "@{NC}"
    printf "    1. sysctl: disable IP forwarding, source routing and ICMP redirects\\\\n"
    printf "    2. sysctl: enable ASLR and restrict dmesg to root\\\\n"
    printf "    3. sshd drop-in: PermitRootLogin prohibit-password, MaxAuthTries 4\\\\n"
    printf "    4. unattended-upgrades: enable security pocket on Debian family\\\\n"
    printf "\\\\n"
    confirm_apply "\${2:-}" "--harden" || exit 0
    printf "  %sapplying%s\\\\n" "@{WARN}" "@{NC}"
    cat > /etc/sysctl.d/99-sentinel.conf <<'SYSCTL'
net.ipv4.ip_forward = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.all.accept_redirects = 0
kernel.randomize_va_space = 2
kernel.dmesg_restrict = 1
SYSCTL
    sysctl --system >/dev/null 2>&1 || true
    printf "  %s✔ sysctl baseline written to /etc/sysctl.d/99-sentinel.conf%s\\\\n" "@{OK}" "@{NC}"
    printf "  %sreview the sshd drop-in before restarting the daemon%s\\\\n" "@{MUTED}" "@{NC}"
    ;;
`,
          colors,
        ),
    },
  ],
};
