import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('@/lib/notes', () => ({
  getNoteById: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Headers()),
}));

import { NextRequest } from 'next/server';
import { PUT, DELETE } from './route';
import { getCurrentUser } from '@/lib/auth';
import { getNoteById, updateNote, deleteNote } from '@/lib/notes';

const mockGetCurrentUser = vi.mocked(getCurrentUser);
const mockGetNoteById = vi.mocked(getNoteById);
const mockUpdateNote = vi.mocked(updateNote);
const mockDeleteNote = vi.mocked(deleteNote);

const mockUser = { id: 'user-1', email: 'test@example.com', name: 'Test User' };
const mockNote = {
  id: 'note-1',
  userId: 'user-1',
  title: 'Test Note',
  contentJson: '{"type":"doc"}',
  isPublic: false,
  publicSlug: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const params = Promise.resolve({ id: 'note-1' });

function makePutRequest(body: unknown) {
  return new NextRequest('http://localhost/api/notes/note-1', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PUT /api/notes/:id', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const res = await PUT(makePutRequest({}), { params });
    expect(res.status).toBe(401);
  });

  it('returns 404 when note not found', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser as never);
    mockGetNoteById.mockReturnValue(null);
    const res = await PUT(makePutRequest({ title: 'X', content_json: '{}' }), { params });
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid body', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser as never);
    mockGetNoteById.mockReturnValue(mockNote);
    const res = await PUT(makePutRequest({ title: '' }), { params });
    expect(res.status).toBe(400);
  });

  it('updates note and returns 200', async () => {
    const updatedNote = { ...mockNote, title: 'Updated Title' };
    mockGetCurrentUser.mockResolvedValue(mockUser as never);
    mockGetNoteById.mockReturnValue(mockNote);
    mockUpdateNote.mockReturnValue(updatedNote);

    const res = await PUT(
      makePutRequest({ title: 'Updated Title', content_json: '{"type":"doc"}' }),
      { params },
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.title).toBe('Updated Title');
    expect(mockUpdateNote).toHaveBeenCalledWith('user-1', 'note-1', {
      title: 'Updated Title',
      contentJson: '{"type":"doc"}',
    });
  });
});

describe('DELETE /api/notes/:id', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/notes/note-1', { method: 'DELETE' });
    const res = await DELETE(req, { params });
    expect(res.status).toBe(401);
  });

  it('returns 404 when note not found', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser as never);
    mockGetNoteById.mockReturnValue(null);
    const req = new NextRequest('http://localhost/api/notes/note-1', { method: 'DELETE' });
    const res = await DELETE(req, { params });
    expect(res.status).toBe(404);
  });

  it('deletes note and returns 204', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser as never);
    mockGetNoteById.mockReturnValue(mockNote);
    mockDeleteNote.mockReturnValue(undefined);

    const req = new NextRequest('http://localhost/api/notes/note-1', { method: 'DELETE' });
    const res = await DELETE(req, { params });

    expect(res.status).toBe(204);
    expect(mockDeleteNote).toHaveBeenCalledWith('user-1', 'note-1');
  });
});
