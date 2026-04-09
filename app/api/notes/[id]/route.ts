import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { getNoteById, updateNote, deleteNote } from '@/lib/notes';

const UpdateNoteSchema = z.object({
  title: z.string().min(1).max(255),
  content_json: z.string().min(1),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(await headers());
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = getNoteById(user.id, id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const parsed = UpdateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const note = updateNote(user.id, id, {
    title: parsed.data.title,
    contentJson: parsed.data.content_json,
  });

  return NextResponse.json(note);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(await headers());
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = getNoteById(user.id, id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  deleteNote(user.id, id);
  return new NextResponse(null, { status: 204 });
}
