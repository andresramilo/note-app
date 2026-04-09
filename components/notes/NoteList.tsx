import Link from 'next/link';
import type { Note } from '@/lib/notes';

type Props = {
  notes: Pick<Note, 'id' | 'title' | 'updatedAt' | 'isPublic'>[];
};

export function NoteList({ notes }: Props) {
  if (notes.length === 0) {
    return (
      <p className='mt-12 text-center text-sm text-neutral-400'>
        No notes yet. Create your first note!
      </p>
    );
  }

  return (
    <ul className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
      {notes.map((note) => (
        <li key={note.id}>
          <Link
            href={`/notes/${note.id}`}
            className='flex flex-col gap-1 rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-400 hover:bg-neutral-50'
          >
            <span className='truncate font-medium text-neutral-900'>{note.title}</span>
            <span className='text-xs text-neutral-400'>
              {new Date(note.updatedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
              {note.isPublic && (
                <span className='ml-2 rounded-full bg-green-100 px-2 py-0.5 text-green-700'>
                  Public
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
