import type { ScriptTemplate } from '../types/script';
import { colorize } from '../utils/builder';

/**
 * Blueprint: System Performance Metrics (`sysinfo`).
 *
 * The blueprint only hard-requires procfs; every optional tool (`sensors`,
 * `iostat`, `free`) has a pure-shell fallback, so a stripped container still
 * produces useful numbers.
 */
export const sysMonTemplate: ScriptTemplate = {
  id: 'system-metrics',
  name: 'System Performance Metrics (sysinfo)',
  defaultCommandName: 'sysinfo',
  shortDescription:
    'A single pane of glass for host health: CPU topology, memory pressure, filesystem usage, scheduler load, thermal zones, block I/O and interface counters.',
  icon: '▤',

  baseSystemChecks: `
# ── Template policy ─────────────────────────────────────────────────────────
# Kernel accounting lives in /proc; everything else is best effort. The host
# label is resolved once so banners stay consistent across modules.

OMNISCRIPT_HOST="$(uname -n 2>/dev/null || echo unknown)"
OMNISCRIPT_PAGE_SIZE="$(getconf PAGESIZE 2>/dev/null || echo 4096)"

preflight() {
  if [ ! -r /proc/stat ] || [ ! -r /proc/meminfo ]; then
    die "sysinfo needs a mounted procfs at /proc"
  fi
  printf "%s%s%s %s·%s kernel %s%s\\n" "@{TITLE}" "$OMNISCRIPT_HOST" "@{NC}" "@{MUTED}" "@{NC}" "$(uname -r 2>/dev/null || echo '?')" "@{NC}"
}
`,

  modules: [
    {
      id: 'cpu',
      flag: '-c | --cpu',
      summary: 'CPU model, core count, load and clock speed',
      requiredDependencies: [],
      details: 'Reads /proc/cpuinfo only — works in containers without util-linux.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -c | --cpu)
    banner "CPU :: $OMNISCRIPT_HOST"
    cpu_model="$(awk -F': ' '/^model name|^Hardware/{print $2; exit}' /proc/cpuinfo 2>/dev/null || true)"
    cpu_cores="$(grep -c '^processor' /proc/cpuinfo 2>/dev/null || echo 0)"
    printf "  %smodel%s      %s\\\\n" "@{TITLE}" "@{NC}" "\${cpu_model:-unknown}"
    printf "  %scores%s      %s\\\\n" "@{TITLE}" "@{NC}" "$cpu_cores"
    printf "  %sload 1/5/15%s %s\\\\n" "@{TITLE}" "@{NC}" "$(cut -d' ' -f1-3 /proc/loadavg)"
    printf "  %sclock%s      %s\\\\n" "@{TITLE}" "@{NC}" "$(awk -F: '/cpu MHz/{sum+=$2; n++} END { if (n) printf "%.0f MHz across %d cores", sum/n, n; else print "unavailable" }' /proc/cpuinfo)"
    ;;
`,
          colors,
        ),
    },
    {
      id: 'memory',
      flag: '-m | --memory',
      summary: 'Physical memory and swap pressure',
      requiredDependencies: [],
      details: 'Prefers `free -h`; otherwise it derives everything from /proc/meminfo.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -m | --memory)
    banner "Memory Pressure"
    if have free; then
      free -h
    else
      awk '/MemTotal|MemFree|MemAvailable|Buffers|^Cached|SwapTotal|SwapFree/ { printf "  %-16s %10.1f MiB\\\\n", $1, $2/1024 }' /proc/meminfo
    fi
    mem_total="$(awk '/^MemTotal/{print $2}' /proc/meminfo)"
    mem_avail="$(awk '/^MemAvailable/{print $2}' /proc/meminfo)"
    if [ "\${mem_total:-0}" -gt 0 ]; then
      printf "  %savailable%s %s%% of physical memory\\\\n" "@{OK}" "@{NC}" "$((mem_avail * 100 / mem_total))"
    fi
    ;;
`,
          colors,
        ),
    },
    {
      id: 'disk',
      flag: '-d | --disk',
      summary: 'Filesystem usage plus the heaviest home directories',
      requiredDependencies: ['coreutils'],
      details: 'Skips tmpfs/devtmpfs/squashfs so the table stays readable.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -d | --disk)
    banner "Filesystem Usage"
    df -h -x tmpfs -x devtmpfs -x squashfs 2>/dev/null || df -h
    printf "\\\\n  %s5 largest entries under %s%s\\\\n" "@{TITLE}" "$HOME" "@{NC}"
    du -h -d 1 "$HOME" 2>/dev/null | sort -rh | head -n 6
    ;;
`,
          colors,
        ),
    },
    {
      id: 'load',
      flag: '-l | --load',
      summary: 'Load average, run queue and scheduler state',
      requiredDependencies: [],
      details: 'Surfaces procs_running / procs_blocked from /proc/stat.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -l | --load)
    banner "Load & Scheduler"
    printf "  %sload 1/5/15%s %s\\\\n" "@{TITLE}" "@{NC}" "$(cut -d' ' -f1-3 /proc/loadavg)"
    printf "  %srunning/blocked%s %s\\\\n" "@{TITLE}" "@{NC}" "$(awk '/^procs_running|^procs_blocked/{printf "%s ", $2}' /proc/stat)"
    printf "  %suptime%s %s\\\\n" "@{TITLE}" "@{NC}" "$(cut -d' ' -f1 /proc/uptime) seconds"
    printf "  %scontext switches%s %s\\\\n" "@{TITLE}" "@{NC}" "$(awk '/^ctxt/{print $2}' /proc/stat)"
    ;;
`,
          colors,
        ),
    },
    {
      id: 'processes',
      flag: '-p | --processes',
      summary: 'Top processes by CPU and resident memory',
      requiredDependencies: ['procps'],
      details: 'Two sorted snapshots: hottest CPU consumers, then largest RSS.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -p | --processes)
    require_dependency procps
    banner "Top Processes"
    ps -eo pid,ppid,user,%cpu,%mem,etime,comm --sort=-%cpu 2>/dev/null | head -n 12
    printf "\\\\n  %sby resident memory%s\\\\n" "@{TITLE}" "@{NC}"
    ps -eo pid,user,%mem,rss,comm --sort=-%mem 2>/dev/null | head -n 8
    ;;
`,
          colors,
        ),
    },
    {
      id: 'kernel',
      flag: '-k | --kernel',
      summary: 'Kernel release and distribution identity',
      requiredDependencies: [],
      details: 'Includes /etc/os-release fingerprints for support tickets.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -k | --kernel)
    banner "Kernel & Distribution"
    uname -a
    if [ -r /etc/os-release ]; then
      grep -E "^(PRETTY_NAME|VERSION_ID|ID|ID_LIKE)=" /etc/os-release
    fi
    printf "  %sarchitecture%s %s\\\\n" "@{TITLE}" "@{NC}" "$(uname -m)"
    ;;
`,
          colors,
        ),
    },
    {
      id: 'temperature',
      flag: '-T | --temp',
      summary: 'Thermal zones and fan readings',
      requiredDependencies: ['lm-sensors'],
      details: 'Uses `sensors` when present, otherwise raw /sys/class/thermal zones.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -T | --temp)
    banner "Thermal Sensors"
    if have sensors; then
      sensors 2>/dev/null || true
      return 0
    fi
    found=0
    for zone in /sys/class/thermal/thermal_zone*; do
      [ -r "$zone/temp" ] || continue
      found=1
      printf "  %s%-14s%s %s\\\\n" "@{TITLE}" "$(basename "$zone")" "@{NC}" "$(awk '{printf "%.1f °C", $1/1000}' "$zone/temp")"
    done
    if [ "$found" -eq 0 ]; then
      printf "  %sno thermal zones exposed by this kernel%s\\\\n" "@{WARN}" "@{NC}"
    fi
    ;;
`,
          colors,
        ),
    },
    {
      id: 'block-io',
      flag: '-i | --io',
      summary: 'Per-device block layer counters',
      requiredDependencies: [],
      details: 'Prefers `iostat -dx`; falls back to parsing /sys/block/*/stat.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -i | --io)
    banner "Block Device I/O"
    if have iostat; then
      iostat -dx 1 2 | tail -n 20
      return 0
    fi
    printf "  %s%-10s %-12s %-12s %-14s %s%s\\\\n" "@{TITLE}" "device" "reads" "writes" "read-pages" "write-pages" "@{NC}"
    for stat in /sys/block/*/stat; do
      [ -r "$stat" ] || continue
      set -- $(cat "$stat")
      printf "  %-10s %-12s %-12s %-14s %s\\\\n" "$(basename "$(dirname "$stat")")" "$1" "$5" "$3" "$7"
    done
    ;;
`,
          colors,
        ),
    },
    {
      id: 'net-io',
      flag: '-n | --netio',
      summary: 'Interface throughput and error counters',
      requiredDependencies: ['iproute2'],
      details: '`ip -s -s link` exposes both traffic and error/drop reasons.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -n | --netio)
    banner "Interface Counters"
    if have ip; then
      ip -s -s link show
    else
      cat /proc/net/dev
    fi
    ;;
`,
          colors,
        ),
    },
    {
      id: 'snapshot',
      flag: '-r | --report',
      summary: 'Compact full-host snapshot in one screen',
      requiredDependencies: ['procps'],
      details: 'Optimised for pasting into an incident ticket.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -r | --report)
    banner "Full Snapshot :: $OMNISCRIPT_HOST"
    printf "  %skernel%s   %s\\\\n" "@{TITLE}" "@{NC}" "$(uname -r)"
    printf "  %suptime%s   %s seconds\\\\n" "@{TITLE}" "@{NC}" "$(cut -d' ' -f1 /proc/uptime)"
    printf "  %sload%s     %s\\\\n" "@{TITLE}" "@{NC}" "$(cut -d' ' -f1-3 /proc/loadavg)"
    printf "\\\\n"
    if have free; then
      free -h
    else
      awk '/MemTotal|MemAvailable|SwapFree/ { printf "  %-16s %10.1f MiB\\\\n", $1, $2/1024 }' /proc/meminfo
    fi
    printf "\\\\n"
    df -h -x tmpfs -x devtmpfs -x squashfs 2>/dev/null | head -n 10
    printf "\\\\n"
    if have ps; then
      ps -eo pid,%cpu,%mem,comm --sort=-%cpu 2>/dev/null | head -n 10
    fi
    ;;
`,
          colors,
        ),
    },
  ],
};
