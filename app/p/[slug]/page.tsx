import { notFound } from 'next/navigation';
import { getNoteByPublicSlug } from '@/lib/notes';
import { NoteViewer } from '@/components/notes/NoteViewer';

export default async function PublicNotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = getNoteByPublicSlug(slug);
  if (!note) notFound();

  return (
    <main className='mx-auto max-w-3xl px-4 py-8'>
      <h1 className='mb-8 text-3xl font-bold text-neutral-900'>{note.title}</h1>
      <NoteViewer contentJson={note.contentJson} />
    </main>
  );
}
