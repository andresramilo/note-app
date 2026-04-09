import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getNotesByUser } from '@/lib/notes';
import { NoteList } from '@/components/notes/NoteList';

export default async function Home() {
  const user = await getCurrentUser(await headers());
  if (!user) redirect('/authenticate');

  const notes = await getNotesByUser(user.id);

  return (
    <main className='mx-auto max-w-5xl px-4 py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-semibold text-neutral-900'>My Notes</h1>
        <Link
          href='/notes/new'
          className='rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700'
        >
          New Note
        </Link>
      </div>
      <NoteList notes={notes} />
    </main>
  );
}
