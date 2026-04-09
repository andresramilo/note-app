import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { getNoteById, setNotePublic } from '@/lib/notes';

const ShareSchema = z.object({
  isPublic: z.boolean(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(await headers());
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = getNoteById(user.id, id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const parsed = ShareSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const note = setNotePublic(user.id, id, parsed.data.isPublic);
  return NextResponse.json({
    id: note!.id,
    isPublic: note!.isPublic,
    publicSlug: note!.publicSlug,
  });
}
