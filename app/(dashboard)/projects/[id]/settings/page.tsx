import { getProject } from '@/lib/actions/projects';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ProjectDock from '@/components/layout/project-dock';
import { ProjectSettingsClient } from '@/components/project/project-settings-client';

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

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === project.created_by;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#faf8ff]">
      <div className="flex-1 overflow-y-auto sg-scrollbar pb-28">
        <ProjectSettingsClient project={project} isOwner={isOwner} />
      </div>
      <ProjectDock project={project} />
    </div>
  );
}

