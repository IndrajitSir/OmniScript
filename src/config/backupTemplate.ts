import type { ScriptTemplate } from '../types/script';
import { colorize } from '../utils/builder';

/**
 * Blueprint: Backup Engine (`snapkit`).
 *
 * Archive naming is centralised in the preflight so every module (create,
 * prune, verify, restore) agrees on the same layout:
 *   $SNAPKIT_DEST/<name>/<name>-<timestamp>.tar.gz
 */
export const backupTemplate: ScriptTemplate = {
  id: 'backup-engine',
  name: 'Backup Engine (snapkit)',
  defaultCommandName: 'snapkit',
  shortDescription:
    'Timestamped tar.gz snapshots, rsync link-dest incrementals, AES encryption, checksum verification, retention pruning and safe restores — one script, no cron spaghetti.',
  icon: '⛁',

  baseSystemChecks: `
# ── Template policy ─────────────────────────────────────────────────────────
# Destination layout: $SNAPKIT_DEST/<source-name>/<source-name>-<stamp>.tar.gz
# Override with SNAPKIT_DEST=/mnt/backups SNAPKIT_KEEP=14 ./snapkit.sh ...

SNAPKIT_DEST="\${SNAPKIT_DEST:-$HOME/.snapkit}"
SNAPKIT_KEEP="\${SNAPKIT_KEEP:-7}"

snapkit_stamp() {
  date -u +%Y%m%dT%H%M%SZ
}

snapkit_ensure_dest() {
  mkdir -p "$SNAPKIT_DEST" || die "cannot create destination $SNAPKIT_DEST"
}

snapkit_archive_path() {
  local src="$1" name
  name="$(basename "$(cd "$src" 2>/dev/null && pwd || echo "$src")")"
  printf "%s/%s/%s-%s.tar.gz" "$SNAPKIT_DEST" "$name" "$name" "$(snapkit_stamp)"
}

snapkit_require_arg() {
  [ -n "\${2:-}" ] || die "usage: $1"
}

preflight() {
  if ! have tar; then
    die "tar is required by every snapkit module"
  fi
  [ -n "$SNAPKIT_DEST" ] || die "SNAPKIT_DEST resolved to an empty path"
}
`,

  modules: [
    {
      id: 'full',
      flag: '-f | --full <path>',
      summary: 'Create a timestamped, gzip-compressed full archive',
      requiredDependencies: ['tar', 'gzip'],
      details: 'Excludes VCS internals, node_modules and caches by default.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -f | --full)
    source="\${2:-}"
    snapkit_require_arg "$SCRIPT_NAME --full <path>" "$source"
    [ -e "$source" ] || die "no such path: $source"
    snapkit_ensure_dest
    archive="$(snapkit_archive_path "$source")"
    banner "Full Backup"
    printf "  %sfrom%s %s\\\\n" "@{TITLE}" "@{NC}" "$(cd "$source" && pwd)"
    printf "  %sto%s   %s\\\\n" "@{TITLE}" "@{NC}" "$archive"
    tar \\
      --exclude-vcs \\
      --exclude='node_modules' \\
      --exclude='*.cache' \\
      -czf "$archive" \\
      -C "$(dirname "$(cd "$source" && pwd)")" "$(basename "$(cd "$source" && pwd)")"
    printf "  %s✔ %s%s\\\\n" "@{OK}" "$(du -h "$archive" | cut -f1)" "@{NC}"
    printf "  %ssha256%s %s\\\\n" "@{MUTED}" "@{NC}" "$(sha256sum "$archive" | cut -d' ' -f1)"
    ;;
`,
          colors,
        ),
    },
    {
      id: 'incremental',
      flag: '-i | --incremental <path>',
      summary: 'Hardlink-based incremental snapshot via rsync',
      requiredDependencies: ['rsync'],
      details: 'Uses `--link-dest` against the newest snapshot, so unchanged files cost no space.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -i | --incremental)
    source="\${2:-}"
    snapkit_require_arg "$SCRIPT_NAME --incremental <path>" "$source"
    require_dependency rsync
    snapkit_ensure_dest
    name="$(basename "$(cd "$source" && pwd)")"
    target="$SNAPKIT_DEST/$name/inc-$(snapkit_stamp)"
    link_dest="$(ls -1dt "$SNAPKIT_DEST/$name"/inc-* 2>/dev/null | head -n1 || true)"
    banner "Incremental Snapshot"
    if [ -n "$link_dest" ]; then
      printf "  %slinking against%s %s\\\\n" "@{TITLE}" "@{NC}" "$link_dest"
    else
      printf "  %sfirst run — creating the baseline%s\\\\n" "@{MUTED}" "@{NC}"
    fi
    mkdir -p "$target"
    rsync -a --delete --info=stats2 \\
      \${link_dest:+--link-dest="$link_dest"} \\
      "$source/" "$target/"
    printf "  %s✔ snapshot ready%s %s\\\\n" "@{OK}" "@{NC}" "$target"
    ;;
`,
          colors,
        ),
    },
    {
      id: 'encrypt',
      flag: '-e | --encrypt <archive>',
      summary: 'Encrypt an archive with AES-256-CBC + PBKDF2',
      requiredDependencies: ['openssl'],
      details: 'Prompts for a passphrase without echoing it, and never persists the key.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -e | --encrypt)
    archive="\${2:-}"
    snapkit_require_arg "$SCRIPT_NAME --encrypt <archive>" "$archive"
    [ -r "$archive" ] || die "cannot read archive: $archive"
    require_dependency openssl
    banner "Encrypt Archive"
    printf "%s  passphrase:%s " "@{TITLE}" "@{NC}"
    read -rs passphrase
    printf "\\\\n"
    [ -n "$passphrase" ] || die "empty passphrase refused"
    openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt \\
      -in "$archive" -out "$archive.enc" -pass stdin <<< "$passphrase"
    unset passphrase
    printf "  %s✔ encrypted%s %s\\\\n" "@{OK}" "@{NC}" "$archive.enc"
    printf "  %sdecrypt with%s openssl enc -d -aes-256-cbc -pbkdf2 -in %s.enc -out %s\\\\n" "@{MUTED}" "@{NC}" "$archive" "$archive"
    ;;
`,
          colors,
        ),
    },
    {
      id: 'verify',
      flag: '-v | --verify <archive>',
      summary: 'Checksum and integrity-check an archive',
      requiredDependencies: ['tar', 'coreutils'],
      details: 'Verifies gzip framing with `tar -tzf` and prints the SHA-256 digest.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -v | --verify)
    archive="\${2:-}"
    snapkit_require_arg "$SCRIPT_NAME --verify <archive>" "$archive"
    [ -r "$archive" ] || die "cannot read archive: $archive"
    banner "Verify Archive"
    entries="$(tar -tzf "$archive" 2>/dev/null | wc -l)"
    if [ "$entries" -gt 0 ]; then
      printf "  %s✔ archive intact%s — %s entries\\\\n" "@{OK}" "@{NC}" "$entries"
    else
      printf "  %s✖ archive unreadable or empty%s\\\\n" "@{ERR}" "@{NC}" >&2
      exit 1
    fi
    printf "  %ssha256%s %s\\\\n" "@{MUTED}" "@{NC}" "$(sha256sum "$archive" | cut -d' ' -f1)"
    ;;
`,
          colors,
        ),
    },
    {
      id: 'list',
      flag: '-l | --list [path]',
      summary: 'List stored snapshots with size and age',
      requiredDependencies: ['coreutils', 'findutils'],
      details: 'Defaults to the configured destination directory.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -l | --list)
    root="\${2:-$SNAPKIT_DEST}"
    [ -d "$root" ] || die "no snapshot store at $root"
    banner "Snapshot Inventory :: $root"
    find "$root" -maxdepth 2 -type f -name '*.tar.gz*' -printf '%TY-%Tm-%Td %TH:%TM  %-10s  %p\\\\n' 2>/dev/null |
      sort -r | head -n 40 ||
      ls -lh "$root"
    ;;
`,
          colors,
        ),
    },
    {
      id: 'prune',
      flag: '-p | --prune <days>',
      summary: 'Delete snapshots older than N days',
      requiredDependencies: ['coreutils', 'findutils'],
      details: 'Always prints what it is about to remove unless PRUNE=force is set.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -p | --prune)
    days="\${2:-}"
    snapkit_require_arg "$SCRIPT_NAME --prune <days>" "$days"
    case "$days" in
      '' | *[!0-9]*) die "prune expects a whole number of days, got: $days" ;;
    esac
    banner "Prune Snapshots Older Than $days day(s)"
    victims="$(find "$SNAPKIT_DEST" -maxdepth 2 -type f -name '*.tar.gz*' -mtime "+$days" 2>/dev/null || true)"
    if [ -z "$victims" ]; then
      printf "  %snothing to prune — retention is already satisfied%s\\\\n" "@{OK}" "@{NC}"
      return 0
    fi
    printf "%s\\\\n" "$victims"
    if [ "\${PRUNE:-preview}" != "force" ]; then
      printf "  %spreview only%s — re-run with PRUNE=force to delete\\\\n" "@{WARN}" "@{NC}"
      return 0
    fi
    printf "%s\\\\n" "$victims" | while IFS= read -r victim; do
      rm -f -- "$victim"
      printf "  %s✖ removed%s %s\\\\n" "@{ERR}" "@{NC}" "$victim"
    done
    ;;
`,
          colors,
        ),
    },
    {
      id: 'restore',
      flag: '-r | --restore <archive> [dir]',
      summary: 'Safely extract an archive into a staging directory',
      requiredDependencies: ['tar'],
      details: 'Never overwrites in place: extracts to the target and reports what appeared.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -r | --restore)
    archive="\${2:-}"
    snapkit_require_arg "$SCRIPT_NAME --restore <archive> [dir]" "$archive"
    [ -r "$archive" ] || die "cannot read archive: $archive"
    target="\${3:-$PWD/restore-$(snapkit_stamp)}"
    banner "Restore Archive"
    mkdir -p "$target"
    printf "  %sinto%s %s\\\\n" "@{TITLE}" "@{NC}" "$target"
    tar -xzf "$archive" -C "$target"
    printf "  %s✔ restored%s %s entries\\\\n" "@{OK}" "@{NC}" "$(find "$target" -mindepth 1 | wc -l)"
    printf "  %sreview, then merge manually — nothing was overwritten%s\\\\n" "@{MUTED}" "@{NC}"
    ;;
`,
          colors,
        ),
    },
    {
      id: 'sync',
      flag: '-s | --sync <src> <dest>',
      summary: 'Mirror a directory to a remote or local destination',
      requiredDependencies: ['rsync'],
      details: 'Dry-runs first, then asks for confirmation before deleting at the destination.',
      bashCaseBlock: (colors) =>
        colorize(
          `
  -s | --sync)
    source="\${2:-}"
    dest="\${3:-}"
    snapkit_require_arg "$SCRIPT_NAME --sync <src> <dest>" "$source"
    [ -n "$dest" ] || die "usage: $SCRIPT_NAME --sync <src> <dest>"
    require_dependency rsync
    banner "Mirror :: $(basename "$source")"
    printf "  %sdry run%s\\\\n" "@{TITLE}" "@{NC}"
    rsync -ain --delete --stats "$source/" "$dest/" | tail -n 12
    printf "%s  proceed with the real sync? [y/N]:%s " "@{WARN}" "@{NC}"
    read -r answer
    case "$answer" in
      y | Y | yes | YES)
        rsync -a --delete --progress "$source/" "$dest/"
        printf "  %s✔ mirrored%s\\\\n" "@{OK}" "@{NC}"
        ;;
      *)
        printf "  %saborted — destination untouched%s\\\\n" "@{MUTED}" "@{NC}"
        ;;
    esac
    ;;
`,
          colors,
        ),
    },
  ],
};
