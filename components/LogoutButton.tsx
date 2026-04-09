'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { authClient } from '@/lib/auth-client';

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await authClient.signOut();
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className='rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50'
    >
      {isPending ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
