import { getProject } from '@/lib/actions/projects';
import { ProjectMembers } from '@/components/project/project-members';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const project = await getProject(resolvedParams.id);

  if (!project) {
    notFound();
  }

  // Check if current user is the owner
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === project.created_by;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Project Settings</h1>
        <p className="text-gray-600">Manage your project settings and team members</p>
      </div>

      <ProjectMembers projectId={resolvedParams.id} isOwner={isOwner} />
    </div>
  );
}