'use client';

import { useState, useTransition } from 'react';

type Props = {
  noteId: string;
  initialIsPublic: boolean;
  initialSlug: string | null;
};

export function ShareToggle({ noteId, initialIsPublic, initialSlug }: Props) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [slug, setSlug] = useState(initialSlug);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const publicUrl = slug ? `${window.location.origin}/p/${slug}` : null;

  function toggle() {
    startTransition(async () => {
      const res = await fetch(`/api/notes/${noteId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setIsPublic(data.isPublic);
      setSlug(data.publicSlug);
    });
  }

  function copyLink() {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className='flex flex-col gap-2 rounded-lg border border-neutral-200 p-4'>
      <div className='flex items-center justify-between gap-3'>
        <span className='text-sm font-medium text-neutral-700'>Public sharing</span>
        <button
          type='button'
          role='switch'
          aria-checked={isPublic}
          onClick={toggle}
          disabled={isPending}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:opacity-50 ${isPublic ? 'bg-neutral-900' : 'bg-neutral-300'}`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${isPublic ? 'translate-x-4.5' : 'translate-x-0.5'}`}
          />
        </button>
      </div>

      {isPublic && publicUrl && (
        <div className='flex items-center gap-2'>
          <input
            readOnly
            value={publicUrl}
            className='min-w-0 flex-1 rounded border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs text-neutral-600'
          />
          <button
            type='button'
            onClick={copyLink}
            className='shrink-0 rounded border border-neutral-200 px-2 py-1 text-xs text-neutral-600 transition-colors hover:bg-neutral-100'
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  );
}
