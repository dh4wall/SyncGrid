import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createInvitation, type InvitationRole } from '@/lib/invitations';

const invitationRoles: InvitationRole[] = ['admin', 'editor', 'viewer'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (
      typeof body.projectId !== 'string' ||
      typeof body.userId !== 'string' ||
      !invitationRoles.includes(body.role)
    ) {
      return NextResponse.json({ error: 'Invalid invitation details' }, { status: 400 });
    }

    const result = await createInvitation({
      projectId: body.projectId,
      userId: body.userId,
      role: body.role,
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    revalidatePath(`/projects/${body.projectId}/settings`);
    return NextResponse.json({ invitationToken: result.invitationToken });
  } catch (error) {
    console.error('Invitation request failed:', error);
    return NextResponse.json(
      { error: 'Unable to create invitation. Please try again.' },
      { status: 500 }
    );
  }
}
