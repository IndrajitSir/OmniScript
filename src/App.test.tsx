// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from './App';

function renderAt(path: string) {
  window.history.replaceState(null, '', path);
  return render(<App />);
}

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, '', '/');
});

afterEach(() => {
  cleanup();
});

describe('platform routing', () => {
  it('renders the domain directory as the home page', () => {
    renderAt('/');
    expect(screen.getByText(/what do you want to/i)).toBeTruthy();
    expect(screen.getByText('Browse by domain')).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /Network/ }).length).toBeGreaterThan(0);
  });

  it('resolves the domain, template and tool levels', () => {
    renderAt('/network');
    expect(screen.getByText(/Templates in Network/i)).toBeTruthy();
    cleanup();

    renderAt('/network/dns-tools');
    expect(screen.getByText('DNS Lookup')).toBeTruthy();
    expect(screen.getByText('DNS Record Reference')).toBeTruthy();
    cleanup();

    renderAt('/network/dns-tools/dns-lookup');
    const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(breadcrumb.textContent).toContain('Network');
    expect(breadcrumb.textContent).toContain('DNS Tools');
    expect(breadcrumb.textContent).toContain('DNS Lookup');
    expect(screen.getByPlaceholderText('example.com')).toBeTruthy();
  });

  it('resolves a migrated composer tool into its blueprint workspace', () => {
    renderAt('/system/system-metrics/system-metrics-composer');
    expect(screen.getByText('Base Architecture')).toBeTruthy();
    expect(screen.getByTestId('os-source').textContent).toContain('-c | --cpu)');
  });

  it('shows a not-found page for unknown routes', () => {
    renderAt('/totally/unknown/route');
    expect(screen.getByText(/No route matches/i)).toBeTruthy();
  });

  it('opens the global search results from the URL query', () => {
    renderAt('/search?q=jwt');
    expect(screen.getByText(/result\(s\) for “jwt”/i)).toBeTruthy();
    expect(screen.getByText('JWT Decoder')).toBeTruthy();
  });

  it('toggles a favorite and lists it on the favorites page', () => {
    renderAt('/network/dns-tools/dns-lookup');
    fireEvent.click(screen.getByRole('button', { name: /favorite/i }));
    cleanup();

    renderAt('/favorites');
    expect(screen.getByRole('heading', { name: 'Favorites' })).toBeTruthy();
    expect(screen.getByText('DNS Lookup')).toBeTruthy();
  });

  it('records recently used tools', () => {
    renderAt('/network/dns-tools/dns-lookup');
    cleanup();
    renderAt('/recent');
    expect(screen.getByRole('heading', { name: 'Recently used' })).toBeTruthy();
    expect(screen.getByText('DNS Lookup')).toBeTruthy();
  });
});
