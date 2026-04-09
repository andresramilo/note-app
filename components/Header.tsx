import Link from 'next/link';
import { headers } from 'next/headers';
import { unstable_noStore as noStore } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { LogoutButton } from '@/components/LogoutButton';

export async function Header() {
  noStore();
  const user = await getCurrentUser(await headers());

  return (
    <header className='border-b border-neutral-200 bg-white'>
      <div className='mx-auto flex max-w-5xl items-center justify-between px-4 py-3'>
        <Link
          href='/'
          className='text-lg font-semibold text-neutral-900 transition-colors hover:text-neutral-600'
        >
          NextNotes
        </Link>
        {user && <LogoutButton />}
      </div>
    </header>
  );
}
