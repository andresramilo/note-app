'use client';

import { useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function DeleteNoteButton({ noteId }: { noteId: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function handleDelete() {
    startTransition(async () => {
      await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      router.push('/');
    });
  }

  return (
    <>
      <button
        onClick={openDialog}
        className='rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50'
      >
        Delete
      </button>

      <dialog
        ref={dialogRef}
        className='rounded-xl border border-neutral-200 bg-white p-6 shadow-lg backdrop:bg-black/40 open:flex open:flex-col open:gap-4'
      >
        <h2 className='text-lg font-semibold text-neutral-900'>Delete note?</h2>
        <p className='text-sm text-neutral-600'>
          This action cannot be undone. The note will be permanently deleted.
        </p>
        <div className='flex justify-end gap-3'>
          <button
            onClick={closeDialog}
            disabled={isPending}
            className='rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className='rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </dialog>
    </>
  );
}
