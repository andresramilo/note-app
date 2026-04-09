import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { NoteForm } from '@/components/notes/NoteForm';

export const metadata: Metadata = { title: 'New Note — NextNotes' };

export default async function NewNotePage() {
  const user = await getCurrentUser(await headers());
  if (!user) redirect('/authenticate');

  return (
    <main className='mx-auto max-w-3xl px-4 py-8'>
      <Link
        href='/'
        className='mb-6 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900'
      >
        ← My Notes
      </Link>
      <h1 className='mb-6 mt-4 text-2xl font-semibold text-neutral-900'>New Note</h1>
      <NoteForm />
    </main>
  );
}
