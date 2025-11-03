'use client';

import { useState, useEffect } from 'react';
import { Home, Plus, Folder } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getProjects } from '@/lib/actions/projects';
import { Project } from '@/types';
import { CreateProjectDialog } from '@/components/project/create-project-dialog';
import { Button } from '@/components/ui/button';

export default function Sidebar() {
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const data = await getProjects();
    setProjects(data);
    setLoading(false);
  };

  const handleProjectCreated = () => {
    loadProjects();
    setDialogOpen(false);
  };

  return (
    <aside className="w-16 sm:w-56 md:w-64 border-r bg-white p-2 sm:p-4 overflow-y-auto flex flex-col">
      {/* Dashboard Link */}
      <div className="space-y-1 mb-6">
        <Link href="/dashboard">
          <div
            className={`flex items-center gap-3 px-2 sm:px-3 py-2 rounded-lg cursor-pointer transition ${
              pathname === '/dashboard'
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="font-medium hidden sm:inline">Dashboard</span>
          </div>
        </Link>
      </div>

      {/* Projects Section */}
      <div className="flex-1">
        <div className="flex items-center justify-between px-2 sm:px-3 mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase hidden sm:inline">
            Projects
          </span>
          <Folder className="w-4 h-4 text-gray-500 sm:hidden" />
        </div>

        {loading ? (
          <div className="text-xs text-gray-500 px-3 hidden sm:block">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="text-xs text-gray-500 px-3 hidden sm:block">No projects yet</div>
        ) : (
          <div className="space-y-1 mb-4">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}/editor`}>
                <div className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition">
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 ${project.color} rounded flex items-center justify-center text-sm shrink-0`}
                  >
                    {project.icon}
                  </div>
                  <span className="text-sm truncate hidden sm:inline">{project.name}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Button
          onClick={() => setDialogOpen(true)}
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs sm:text-sm mt-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">New Project</span>
        </Button>
      </div>

      <CreateProjectDialog 
        open={dialogOpen} 
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) loadProjects();
        }} 
      />
    </aside>
  );
}