'use client';

import { useState, useEffect } from 'react';
import { Folder, Plus, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateProjectDialog } from '@/components/project/create-project-dialog';
import { ProjectCard } from '@/components/project/project-card';
import { getProjects } from '@/lib/actions/projects';
import { Project } from '@/types';

export default function DashboardPage() {
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

  const recentPages = [
    { id: 1, title: 'Q4 Roadmap Planning', project: 'Product Documentation', updated: '10 min ago' },
    { id: 2, title: 'API Documentation v2', project: 'Engineering Wiki', updated: '1 hour ago' },
    { id: 3, title: 'Sprint Retro Notes', project: 'Product Documentation', updated: '3 hours ago' },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-sm sm:text-base text-gray-600">Here's what's happening with your projects</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Projects</CardTitle>
            <Folder className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Pages</CardTitle>
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">24</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Tasks</CardTitle>
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">18</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Team</CardTitle>
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">12</div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">Your Projects</h2>
          <Button onClick={() => setDialogOpen(true)} size="sm" className="text-sm">
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 text-sm sm:text-base">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm sm:text-base text-gray-600 mb-4">No projects yet</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Pages */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Recent Pages</h2>
        <Card>
          {recentPages.map((page, index) => (
            <div
              key={page.id}
              className={`p-3 sm:p-4 hover:bg-gray-50 cursor-pointer ${
                index !== recentPages.length - 1 ? 'border-b' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-sm sm:text-base font-medium mb-1 truncate">{page.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{page.project}</p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{page.updated}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <CreateProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}