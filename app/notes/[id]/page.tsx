import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getNoteById } from '@/lib/notes';
import { NoteViewer } from '@/components/notes/NoteViewer';
import { DeleteNoteButton } from '@/components/notes/DeleteNoteButton';
import { ShareToggle } from '@/components/notes/ShareToggle';

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(await headers());
  if (!user) redirect('/authenticate');

  const { id } = await params;
  const note = getNoteById(user.id, id);
  if (!note) notFound();

  return (
    <main className='mx-auto max-w-3xl px-4 py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <Link
          href='/'
          className='inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900'
        >
          ← My Notes
        </Link>
        <div className='flex gap-2'>
          <Link
            href={`/notes/${id}/edit`}
            className='rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50'
          >
            Edit
          </Link>
          <DeleteNoteButton noteId={id} />
        </div>
      </div>
      <h1 className='mb-4 text-3xl font-bold text-neutral-900'>{note.title}</h1>
      <div className='mb-8'>
        <ShareToggle noteId={id} initialIsPublic={note.isPublic} initialSlug={note.publicSlug} />
      </div>
      <NoteViewer contentJson={note.contentJson} />
    </main>
  );
}
