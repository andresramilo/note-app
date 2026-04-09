import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AuthForm } from '@/components/auth/AuthForm';

export default async function AuthenticatePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const user = await getCurrentUser(await headers());
  if (user) redirect('/');

  const { mode } = await searchParams;
  const isSignUp = mode === 'signup';

  return (
    <main className='min-h-screen flex items-center justify-center bg-neutral-50'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-sm border border-neutral-200 p-8'>
        <h1 className='text-2xl font-semibold text-neutral-900 mb-6'>
          {isSignUp ? 'Create an account' : 'Sign in'}
        </h1>
        <AuthForm mode={isSignUp ? 'signup' : 'login'} />
      </div>
    </main>
  );
}
