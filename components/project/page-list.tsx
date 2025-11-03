'use client';

import { FileText, Kanban, Settings, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Project } from '@/types';

interface ProjectSidebarProps {
  project: Project;
  projectId: string;
}

export default function ProjectSidebar({ project, projectId }: ProjectSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { icon: FileText, label: 'Editor', href: `/projects/${projectId}/editor` },
    { icon: Kanban, label: 'Board', href: `/projects/${projectId}/board` },
    { icon: Settings, label: 'Settings', href: `/projects/${projectId}/settings` },
  ];

  // Mock pages for now
  const pages = [
    { id: 1, title: 'Getting Started', updated: '2 hours ago' },
    { id: 2, title: 'API Documentation', updated: '1 day ago' },
    { id: 3, title: 'Team Guidelines', updated: '3 days ago' },
  ];

  return (
    <aside className="w-64 border-r bg-white p-4 overflow-y-auto">
      {/* Project Info */}
      <div className="mb-6 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${project.color} rounded-lg flex items-center justify-center text-xl`}>
            {project.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate">{project.name}</h2>
            <p className="text-xs text-gray-500">Workspace</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="space-y-1 mb-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition',
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-100 text-gray-700'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pages Section */}
      <div>
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">Pages</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
        <div className="space-y-1">
          {pages.map((page) => (
            <div
              key={page.id}
              className="px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{page.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-500">{page.updated}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}