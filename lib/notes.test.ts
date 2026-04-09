import { describe, it, expect, vi, beforeEach } from 'vitest';

// Must be declared before imports so vi.mock hoisting works
vi.mock('@/lib/db', () => ({
  query: vi.fn(),
  get: vi.fn(),
  run: vi.fn(),
}));

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'generated-slug'),
}));

import { query, get, run } from '@/lib/db';
import {
  getNotesByUser,
  getNoteById,
  updateNote,
  deleteNote,
  setNotePublic,
  getNoteByPublicSlug,
} from '@/lib/notes';

const mockQuery = vi.mocked(query);
const mockGet = vi.mocked(get);
const mockRun = vi.mocked(run);

const sampleRow = {
  id: 'note-1',
  user_id: 'user-1',
  title: 'Test Note',
  content_json: '{"type":"doc","content":[]}',
  is_public: 0,
  public_slug: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

const sampleNote = {
  id: 'note-1',
  userId: 'user-1',
  title: 'Test Note',
  contentJson: '{"type":"doc","content":[]}',
  isPublic: false,
  publicSlug: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getNotesByUser', () => {
  it('returns mapped notes for a user', () => {
    mockQuery.mockReturnValue([sampleRow]);
    const notes = getNotesByUser('user-1');
    expect(notes).toEqual([sampleNote]);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('WHERE user_id = ?'), [
      'user-1',
    ]);
  });

  it('returns empty array when user has no notes', () => {
    mockQuery.mockReturnValue([]);
    expect(getNotesByUser('user-1')).toEqual([]);
  });

  it('converts is_public integer to boolean', () => {
    mockQuery.mockReturnValue([{ ...sampleRow, is_public: 1, public_slug: 'abc123' }]);
    const [note] = getNotesByUser('user-1');
    expect(note.isPublic).toBe(true);
    expect(note.publicSlug).toBe('abc123');
  });
});

describe('getNoteById', () => {
  it('returns mapped note when found', () => {
    mockGet.mockReturnValue(sampleRow);
    const note = getNoteById('user-1', 'note-1');
    expect(note).toEqual(sampleNote);
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('WHERE id = ?'), [
      'note-1',
      'user-1',
    ]);
  });

  it('returns null when note not found', () => {
    mockGet.mockReturnValue(undefined);
    expect(getNoteById('user-1', 'missing')).toBeNull();
  });
});

describe('updateNote', () => {
  it('runs UPDATE query and returns updated note', () => {
    const updatedRow = { ...sampleRow, title: 'New Title' };
    mockRun.mockReturnValue(undefined as never);
    mockGet.mockReturnValue(updatedRow);

    const result = updateNote('user-1', 'note-1', {
      title: 'New Title',
      contentJson: '{"type":"doc"}',
    });

    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE notes SET title'),
      expect.arrayContaining(['New Title', '{"type":"doc"}', 'note-1', 'user-1']),
    );
    expect(result?.title).toBe('New Title');
  });
});

describe('deleteNote', () => {
  it('runs DELETE query with correct user scope', () => {
    mockRun.mockReturnValue(undefined as never);
    deleteNote('user-1', 'note-1');
    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM notes WHERE id = ?'),
      ['note-1', 'user-1'],
    );
  });
});

describe('setNotePublic', () => {
  it('returns null when note does not exist', () => {
    mockGet.mockReturnValue(undefined);
    expect(setNotePublic('user-1', 'missing', true)).toBeNull();
  });

  it('generates a new slug when making note public with no existing slug', () => {
    mockGet
      .mockReturnValueOnce(sampleRow) // getNoteById inside setNotePublic
      .mockReturnValueOnce({ ...sampleRow, is_public: 1, public_slug: 'generated-slug' }); // final getNoteById

    const note = setNotePublic('user-1', 'note-1', true);

    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE notes SET is_public = 1'),
      ['generated-slug', 'note-1', 'user-1'],
    );
    expect(note?.isPublic).toBe(true);
    expect(note?.publicSlug).toBe('generated-slug');
  });

  it('reuses existing slug when making note public again', () => {
    const publicRow = { ...sampleRow, is_public: 1, public_slug: 'existing-slug' };
    mockGet.mockReturnValue(publicRow);

    setNotePublic('user-1', 'note-1', true);

    expect(mockRun).toHaveBeenCalledWith(expect.stringContaining('is_public = 1'), [
      'existing-slug',
      'note-1',
      'user-1',
    ]);
  });

  it('sets is_public = 0 and clears slug when making note private', () => {
    mockGet
      .mockReturnValueOnce({ ...sampleRow, is_public: 1, public_slug: 'some-slug' })
      .mockReturnValueOnce(sampleRow);

    const note = setNotePublic('user-1', 'note-1', false);

    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('is_public = 0, public_slug = NULL'),
      ['note-1', 'user-1'],
    );
    expect(note?.isPublic).toBe(false);
    expect(note?.publicSlug).toBeNull();
  });
});

describe('getNoteByPublicSlug', () => {
  it('returns note when slug exists and is public', () => {
    const publicRow = { ...sampleRow, is_public: 1, public_slug: 'abc123' };
    mockGet.mockReturnValue(publicRow);

    const note = getNoteByPublicSlug('abc123');
    expect(note?.publicSlug).toBe('abc123');
    expect(note?.isPublic).toBe(true);
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('is_public = 1'), ['abc123']);
  });

  it('returns null when slug not found', () => {
    mockGet.mockReturnValue(undefined);
    expect(getNoteByPublicSlug('nonexistent')).toBeNull();
  });
});
