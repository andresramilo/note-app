import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  run: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Headers()),
}));

import { NextRequest } from 'next/server';
import { POST } from './route';
import { getCurrentUser } from '@/lib/auth';
import { run } from '@/lib/db';

const mockGetCurrentUser = vi.mocked(getCurrentUser);
const mockRun = vi.mocked(run);

const mockUser = { id: 'user-1', email: 'test@example.com', name: 'Test User' };

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/notes', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const res = await POST(makeRequest({ title: 'Test', content_json: '{}' }));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 400 for missing title', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser as never);
    const res = await POST(makeRequest({ content_json: '{"type":"doc"}' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing content_json', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser as never);
    const res = await POST(makeRequest({ title: 'My Note' }));
    expect(res.status).toBe(400);
  });

  it('creates a note and returns 201 with id', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser as never);
    mockRun.mockReturnValue(undefined as never);

    const res = await POST(makeRequest({ title: 'My Note', content_json: '{"type":"doc"}' }));

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBeTypeOf('string');
    expect(data.id).not.toBe('');

    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO notes'),
      expect.arrayContaining([expect.any(String), 'user-1', 'My Note', '{"type":"doc"}']),
    );
  });
});
