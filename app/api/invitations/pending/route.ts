import { NextResponse } from 'next/server';
import { getPendingInvitations } from '@/lib/invitations';

export async function GET() {
  try {
    const result = await getPendingInvitations();
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ invitations: result.invitations });
  } catch (error) {
    console.error('Pending invitations request failed:', error);
    return NextResponse.json({ error: 'Unable to load invitations' }, { status: 500 });
  }
}
