import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteNoteButton } from './DeleteNoteButton';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  mockPush.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DeleteNoteButton', () => {
  it('renders the Delete button', () => {
    render(<DeleteNoteButton noteId='note-1' />);
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('opens confirmation dialog on click', async () => {
    render(<DeleteNoteButton noteId='note-1' />);
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
  });

  it('closes dialog when Cancel is clicked', async () => {
    render(<DeleteNoteButton noteId='note-1' />);
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    // Closed <dialog> loses its ARIA role, so query by element tag
    expect(document.querySelector('dialog')).not.toHaveAttribute('open');
  });

  it('calls DELETE API and redirects on confirm', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

    render(<DeleteNoteButton noteId='note-1' />);
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    // Use within(dialog) to disambiguate from the outer Delete button
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/notes/note-1', { method: 'DELETE' });
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
