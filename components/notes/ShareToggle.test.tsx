import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShareToggle } from './ShareToggle';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ShareToggle', () => {
  it('renders the toggle in off state when not public', () => {
    render(<ShareToggle noteId='note-1' initialIsPublic={false} initialSlug={null} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('renders the toggle in on state when public', () => {
    render(<ShareToggle noteId='note-1' initialIsPublic={true} initialSlug='abc123' />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('shows the public URL input when note is public', () => {
    render(<ShareToggle noteId='note-1' initialIsPublic={true} initialSlug='abc123' />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('http://localhost/p/abc123');
  });

  it('does not show URL input when note is private', () => {
    render(<ShareToggle noteId='note-1' initialIsPublic={false} initialSlug={null} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('calls share API and shows URL after enabling sharing', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ isPublic: true, publicSlug: 'new-slug' }),
    } as Response);

    render(<ShareToggle noteId='note-1' initialIsPublic={false} initialSlug={null} />);

    await userEvent.click(screen.getByRole('switch'));

    expect(fetch).toHaveBeenCalledWith('/api/notes/note-1/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic: true }),
    });

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toHaveValue('http://localhost/p/new-slug');
    });
  });

  it('hides URL after disabling sharing', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ isPublic: false, publicSlug: null }),
    } as Response);

    render(<ShareToggle noteId='note-1' initialIsPublic={true} initialSlug='abc123' />);

    await userEvent.click(screen.getByRole('switch'));

    await waitFor(() => {
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  it('does not update state when API call fails', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);

    render(<ShareToggle noteId='note-1' initialIsPublic={false} initialSlug={null} />);

    await userEvent.click(screen.getByRole('switch'));

    await waitFor(() => {
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    });
  });
});
