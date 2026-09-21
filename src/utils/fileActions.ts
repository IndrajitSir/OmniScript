/**
 * Browser-side transfer helpers.
 *
 * Browsers refuse to persist the executable bit, so the download path always
 * pairs the blob with the exact permission-mapping the user has to run.
 */

const SHELL_MIME = 'application/x-shellscript;charset=utf-8';

export type CopyMethod = 'clipboard-api' | 'execCommand' | 'unsupported';

export async function copyTextToClipboard(text: string): Promise<CopyMethod> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return 'clipboard-api';
    } catch {
      // fall through to the legacy path (permissions, insecure context, …)
    }
  }

  if (typeof document === 'undefined') return 'unsupported';

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.top = '-1000px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const ok = document.execCommand('copy');
    return ok ? 'execCommand' : 'unsupported';
  } catch {
    return 'unsupported';
  } finally {
    document.body.removeChild(textarea);
  }
}

/** Trigger a real file download from an in-memory blob (no server round trip). */
export function downloadScriptFile(filename: string, source: string): void {
  const blob = new Blob([source], { type: SHELL_MIME });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Revoke on the next tick so Safari has time to start the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** The permission-mapping instructions printed under the action strip. */
export function permissionSteps(filename: string, commandName: string): string[] {
  return [
    `chmod +x ${filename}`,
    `sudo install -m 755 ${filename} /usr/local/bin/${commandName}`,
    `${commandName} --help`,
  ];
}

export function commandNameFromFileName(filename: string): string {
  return filename.replace(/\.sh$/, '');
}
