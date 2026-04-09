'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, signUp } from '@/lib/auth-client';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setError(null);
  }, [mode]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result =
        mode === 'signup'
          ? await signUp.email({ name, email, password })
          : await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? 'Something went wrong.');
        return;
      }
      router.refresh();
      router.push('/');
    });
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
      {mode === 'signup' && (
        <Field
          id='name'
          label='Name'
          type='text'
          autoComplete='name'
          value={name}
          onChange={setName}
        />
      )}
      <Field
        id='email'
        label='Email'
        type='email'
        autoComplete='email'
        value={email}
        onChange={setEmail}
      />
      <Field
        id='password'
        label='Password'
        type='password'
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        value={password}
        onChange={setPassword}
      />

      {error && (
        <p
          role='alert'
          className='rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600'
        >
          {error}
        </p>
      )}

      <button
        type='submit'
        disabled={isPending}
        className='rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50'
      >
        {isPending ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
      </button>

      <Link
        href={mode === 'login' ? '/authenticate?mode=signup' : '/authenticate'}
        className='text-center text-sm text-neutral-500 hover:text-neutral-800'
      >
        {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </Link>
    </form>
  );
}

function Field({
  id,
  label,
  type,
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password';
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className='flex flex-col gap-1'>
      <label htmlFor={id} className='text-sm font-medium text-neutral-700'>
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400'
      />
    </div>
  );
}
