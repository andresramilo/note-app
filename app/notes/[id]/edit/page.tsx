import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getNoteById } from '@/lib/notes';
import { NoteEditForm } from '@/components/notes/NoteEditForm';

export default async function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(await headers());
  if (!user) redirect('/authenticate');

  const { id } = await params;
  const note = getNoteById(user.id, id);
  if (!note) notFound();

  return (
    <main className='mx-auto max-w-3xl px-4 py-8'>
      <Link
        href={`/notes/${id}`}
        className='mb-6 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900'
      >
        ← Back to note
      </Link>
      <h1 className='mb-8 text-2xl font-bold text-neutral-900'>Edit note</h1>
      <NoteEditForm note={note} />
    </main>
  );
}
