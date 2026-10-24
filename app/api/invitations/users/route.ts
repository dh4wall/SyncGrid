import { NextResponse } from 'next/server';
import { getPlatformUsers } from '@/lib/invitations';

export async function GET() {
  try {
    const result = await getPlatformUsers();
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ users: result.users });
  } catch (error) {
    console.error('Platform users request failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load platform users' },
      { status: 500 }
    );
  }
}
