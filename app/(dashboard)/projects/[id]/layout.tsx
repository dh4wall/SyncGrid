import { getProject } from '@/lib/actions/projects';
import Navbar from '@/components/layout/navbar';
import { notFound } from 'next/navigation';

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const project = await getProject(resolvedParams.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}