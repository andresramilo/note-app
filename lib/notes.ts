import { nanoid } from 'nanoid';
import { query, get, run } from '@/lib/db';

export type Note = {
  id: string;
  userId: string;
  title: string;
  contentJson: string;
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
};

type NoteRow = {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: number;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
};

function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    contentJson: row.content_json,
    isPublic: row.is_public === 1,
    publicSlug: row.public_slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getNotesByUser(userId: string): Note[] {
  const rows = query<NoteRow>('SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC', [
    userId,
  ]);
  return rows.map(rowToNote);
}

export function getNoteById(userId: string, noteId: string): Note | null {
  const row = get<NoteRow>('SELECT * FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);
  return row ? rowToNote(row) : null;
}

export function updateNote(
  userId: string,
  noteId: string,
  data: { title: string; contentJson: string },
): Note | null {
  const now = new Date().toISOString();
  run(
    `UPDATE notes SET title = ?, content_json = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`,
    [data.title, data.contentJson, now, noteId, userId],
  );
  return getNoteById(userId, noteId);
}

export function deleteNote(userId: string, noteId: string): void {
  run('DELETE FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);
}

export function setNotePublic(userId: string, noteId: string, isPublic: boolean): Note | null {
  const existing = getNoteById(userId, noteId);
  if (!existing) return null;

  if (isPublic) {
    const slug = existing.publicSlug ?? nanoid();
    run('UPDATE notes SET is_public = 1, public_slug = ? WHERE id = ? AND user_id = ?', [
      slug,
      noteId,
      userId,
    ]);
  } else {
    run('UPDATE notes SET is_public = 0, public_slug = NULL WHERE id = ? AND user_id = ?', [
      noteId,
      userId,
    ]);
  }

  return getNoteById(userId, noteId);
}

export function getNoteByPublicSlug(slug: string): Note | null {
  const row = get<NoteRow>('SELECT * FROM notes WHERE public_slug = ? AND is_public = 1', [slug]);
  return row ? rowToNote(row) : null;
}
