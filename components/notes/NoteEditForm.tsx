'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { EditorToolbar } from '@/components/notes/EditorToolbar';
import type { Note } from '@/lib/notes';

export function NoteEditForm({ note }: { note: Note }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(note.title);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } })],
    content: JSON.parse(note.contentJson),
    immediatelyRender: false,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editor) return;
    setError(null);

    const content_json = JSON.stringify(editor.getJSON());

    startTransition(async () => {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content_json }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === 'string' ? data.error : 'Failed to save note.');
        return;
      }

      router.push(`/notes/${note.id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
      <div className='flex flex-col gap-1'>
        <label htmlFor='title' className='text-sm font-medium text-neutral-700'>
          Title
        </label>
        <input
          id='title'
          type='text'
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Note title'
          className='rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400'
        />
      </div>

      <div className='flex flex-col gap-1'>
        <span className='text-sm font-medium text-neutral-700'>Content</span>
        <div className='rounded-lg border border-neutral-300 focus-within:ring-2 focus-within:ring-neutral-400'>
          <EditorToolbar editor={editor} />
          <EditorContent
            editor={editor}
            className='min-h-48 px-3 py-2 text-sm focus-visible:outline-none [&_.tiptap]:outline-none'
          />
        </div>
      </div>

      {error && (
        <p
          role='alert'
          className='rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600'
        >
          {error}
        </p>
      )}

      <div className='flex gap-3'>
        <button
          type='submit'
          disabled={isPending || !editor}
          className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isPending ? 'Saving…' : 'Save Changes'}
        </button>
        <button
          type='button'
          onClick={() => router.push(`/notes/${note.id}`)}
          disabled={isPending}
          className='rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 disabled:opacity-50'
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
