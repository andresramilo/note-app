import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NoteList } from './NoteList';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const sampleNotes = [
  {
    id: 'note-1',
    title: 'First Note',
    updatedAt: '2024-06-15T10:00:00.000Z',
    isPublic: false,
  },
  {
    id: 'note-2',
    title: 'Second Note',
    updatedAt: '2024-07-20T12:00:00.000Z',
    isPublic: true,
  },
];

describe('NoteList', () => {
  it('shows empty state when there are no notes', () => {
    render(<NoteList notes={[]} />);
    expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
  });

  it('renders a link for each note', () => {
    render(<NoteList notes={sampleNotes} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/notes/note-1');
    expect(links[1]).toHaveAttribute('href', '/notes/note-2');
  });

  it('displays note titles', () => {
    render(<NoteList notes={sampleNotes} />);
    expect(screen.getByText('First Note')).toBeInTheDocument();
    expect(screen.getByText('Second Note')).toBeInTheDocument();
  });

  it('shows Public badge only for public notes', () => {
    render(<NoteList notes={sampleNotes} />);
    const badges = screen.getAllByText('Public');
    expect(badges).toHaveLength(1);
  });

  it('does not show Public badge for private notes', () => {
    render(<NoteList notes={[sampleNotes[0]]} />);
    expect(screen.queryByText('Public')).not.toBeInTheDocument();
  });
});
