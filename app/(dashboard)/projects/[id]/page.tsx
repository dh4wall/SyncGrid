import { redirect } from 'next/navigation';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  // Redirect to editor by default
  redirect(`/projects/${resolvedParams.id}/editor`);
}