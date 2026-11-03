// Weekly Google Safe Browsing re-check of every link (see src/lib/linkCheck.ts).
// Vercel Cron calls it on the schedule in vercel.json and sends CRON_SECRET as
// a bearer token; any other caller is turned away.
import { runLinkCheck } from '@/lib/linkCheck';

// the most Vercel Hobby allows without Fluid compute; a run takes seconds
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  return Response.json(await runLinkCheck());
}
