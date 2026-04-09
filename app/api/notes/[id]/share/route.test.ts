import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('@/lib/notes', () => ({
  getNoteById: vi.fn(),
  setNotePublic: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Headers()),
}));

import { NextRequest } from 'next/server';
import { POST } from './route';
import { getCurrentUser } from '@/lib/auth';
import { getNoteById, setNotePublic } from '@/lib/notes';

const mockGetCurrentUser = vi.mocked(getCurrentUser);
const mockGetNoteById = vi.mocked(getNoteById);
const mockSetNotePublic = vi.mocked(setNotePublic);

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

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/notes/note-1/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/notes/:id/share', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const res = await POST(makeRequest({ isPublic: true }), { params });
    expect(res.status).toBe(401);
  });

  it('returns 404 when note not found', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser as never);
    mockGetNoteById.mockReturnValue(null);
    const res = await POST(makeRequest({ isPublic: true }), { params });
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid body', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser as never);
    mockGetNoteById.mockReturnValue(mockNote);
    const res = await POST(makeRequest({ isPublic: 'yes' }), { params });
    expect(res.status).toBe(400);
  });

  it('enables sharing and returns note share info', async () => {
    const publicNote = { ...mockNote, isPublic: true, publicSlug: 'abc123' };
    mockGetCurrentUser.mockResolvedValue(mockUser as never);
    mockGetNoteById.mockReturnValue(mockNote);
    mockSetNotePublic.mockReturnValue(publicNote);

    const res = await POST(makeRequest({ isPublic: true }), { params });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ id: 'note-1', isPublic: true, publicSlug: 'abc123' });
    expect(mockSetNotePublic).toHaveBeenCalledWith('user-1', 'note-1', true);
  });

  it('disables sharing and returns updated share info', async () => {
    const privateNote = { ...mockNote, isPublic: false, publicSlug: null };
    mockGetCurrentUser.mockResolvedValue(mockUser as never);
    mockGetNoteById.mockReturnValue({ ...mockNote, isPublic: true, publicSlug: 'abc123' });
    mockSetNotePublic.mockReturnValue(privateNote);

    const res = await POST(makeRequest({ isPublic: false }), { params });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.isPublic).toBe(false);
    expect(data.publicSlug).toBeNull();
  });
});
