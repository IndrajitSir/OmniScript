// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MainDashboard } from './MainDashboard';
import { ComposerProvider } from '../state';

function renderDashboard() {
  return render(
    <ComposerProvider>
      <MainDashboard />
    </ComposerProvider>,
  );
}

function shell() {
  return screen.getByTestId('os-shell');
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe('MainDashboard', () => {
  it('renders the three columns and the global action strip', () => {
    renderDashboard();

    expect(screen.getByText('Base Architecture')).toBeTruthy();
    expect(screen.getByText('Control Matrix')).toBeTruthy();
    expect(screen.getByText('Shell Sandbox')).toBeTruthy();
    expect(screen.getByRole('button', { name: /copy raw source/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /download executable/i })).toBeTruthy();
  });

  it('starts with three modules compiled and grows when a flag is toggled', () => {
    renderDashboard();

    const counter = () => screen.getByText('Modules compiled').parentElement!.textContent!;
    expect(counter()).toContain('3');

    const checkbox = screen.getByRole('checkbox', { name: /-w \| --wifi/i }) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);

    expect(checkbox.checked).toBe(true);
    expect(counter()).toContain('4');
  });

  it('regenerates the preview when a module is enabled', () => {
    renderDashboard();

    const preview = screen.getByTestId('os-source');
    expect(preview.textContent).toContain('-a | --active)');
    expect(preview.textContent).not.toContain('-w | --wifi)');

    fireEvent.click(screen.getByRole('checkbox', { name: /-w \| --wifi/i }));

    expect(screen.getByTestId('os-source').textContent).toContain('-w | --wifi)');
  });

  it('swaps the palette of the shell when a preset is chosen', () => {
    renderDashboard();

    const accent = () =>
      `${shell().getAttribute('style') ?? ''} ${shell().style.getPropertyValue('--os-accent')}`;
    expect(accent()).toContain('#bd93f9');

    fireEvent.click(screen.getByRole('button', { name: /cyberpunk/i }));

    expect(accent()).toContain('#ff2a6d');
    expect(screen.getByTestId('os-source').textContent).toContain("TITLE=$'\\033[1;91m'");
  });

  it('switches the foundational template and keeps per-template selections', () => {
    renderDashboard();

    // Open the custom dropdown by clicking the trigger button
    const trigger = screen.getByRole('button', { name: /utility template/i });
    fireEvent.click(trigger);

    // Click the System Monitor option
    const sysOption = screen.getByRole('option', { name: /sysinfo/i });
    fireEvent.click(sysOption);

    expect(screen.getByTestId('os-source').textContent).toContain('-c | --cpu)');

    // Switch back
    fireEvent.click(trigger);
    const netOption = screen.getByRole('option', { name: /myip/i });
    fireEvent.click(netOption);
    expect(screen.getByTestId('os-source').textContent).toContain('-a | --active)');
  });

  it('lists only the dependencies of the enabled modules', () => {
    renderDashboard();

    const manifest = screen.getByText('Dependency manifest').parentElement!;
    expect(within(manifest).getByText('iproute2')).toBeTruthy();
    expect(within(manifest).queryByText('network-manager')).toBeNull();

    fireEvent.click(screen.getByRole('checkbox', { name: /-w \| --wifi/i }));
    expect(within(manifest).getByText('network-manager')).toBeTruthy();
  });

  it('toggles strict error handling and reflects it in the header badges', () => {
    renderDashboard();

    const strict = screen.getByRole('switch', { name: /strict error handling/i });
    expect(strict.getAttribute('aria-checked')).toBe('true');

    fireEvent.click(strict);

    expect(strict.getAttribute('aria-checked')).toBe('false');
    expect(screen.getByTestId('os-source').textContent).not.toContain('set -euo pipefail');
  });

  it('follows the template default command name until it is overridden', () => {
    renderDashboard();

    const input = screen.getByPlaceholderText('myip') as HTMLInputElement;
    expect(input.value).toBe('myip');

    fireEvent.change(input, { target: { value: 'net-tool!' } });
    expect(screen.getByText(/net-tool\.sh —/)).toBeTruthy();

    // Switch to backup template
    const trigger = screen.getByRole('button', { name: /utility template/i });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('option', { name: /snapkit/i }));

    // Switch back to network
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('option', { name: /myip/i }));
    expect((screen.getByPlaceholderText('myip') as HTMLInputElement).value).toBe('net-tool!');
  });
});
