import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { getDb } from '@/lib/db';

export const auth = betterAuth({
  database: getDb(),
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  trustedOrigins: ['http://localhost:3000', 'http://localhost:3001'],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;

export async function getCurrentUser(headers: Headers): Promise<Session['user'] | null> {
  const session = await auth.api.getSession({ headers });
  return session?.user ?? null;
}
