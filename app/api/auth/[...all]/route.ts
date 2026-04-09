import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/lib/auth';

export const GET = toNextJsHandler(auth).GET;
export async function POST(request: Request) {
  try {
    const result = await auth.handler(request);
    return result;
  } catch (e) {
    const msg = e instanceof Error ? e.message + '\n' + e.stack : String(e);
    console.error('[AUTH SIGN-OUT ERROR]', msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
