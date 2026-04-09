import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { run } from '@/lib/db';

const CreateNoteSchema = z.object({
  title: z.string().min(1).max(255),
  content_json: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(await headers());
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CreateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, content_json } = parsed.data;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  run(
    `INSERT INTO notes (id, user_id, title, content_json, is_public, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, ?, ?)`,
    [id, user.id, title, content_json, now, now],
  );

  return NextResponse.json({ id }, { status: 201 });
}
