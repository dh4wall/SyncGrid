'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Project } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProjectSidebarProps {
  project: Project;
}

const navigation = [
  { name: 'Editor', href: 'editor', icon: '📝' },
  { name: 'Board', href: 'board', icon: '📋' },
  { name: 'Settings', href: 'settings', icon: '⚙️' },
];

export default function ProjectSidebar({ project }: ProjectSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      'bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out relative',
      isCollapsed ? 'w-12 sm:w-14 md:w-16' : 'w-52 sm:w-56 md:w-64'
    )}>
      {/* Toggle Button - Always Visible */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          'absolute top-3 sm:top-4 z-10 p-1 sm:p-1.5 bg-white border border-gray-200 rounded-md shadow-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200',
          isCollapsed 
            ? 'right-1 sm:right-2 hover:scale-110' 
            : 'right-3 sm:right-4'
        )}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
        ) : (
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
        )}
      </button>

      {/* Project Header */}
      <div className={cn(
        'border-b border-gray-200 min-h-[60px] sm:min-h-[68px] md:min-h-[73px] flex items-center transition-all duration-300 ease-in-out',
        isCollapsed ? 'p-1 sm:p-2 justify-center' : 'p-3 sm:p-4 pr-10 sm:pr-12'
      )}>
        <div className="flex items-center gap-2 sm:gap-3 w-full">
          <div className={cn(
            'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-white text-base sm:text-lg shrink-0 transition-all duration-300 ease-in-out',
            project.color,
            isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          )}>
            {project.icon}
          </div>
          <div className={cn(
            'flex-1 min-w-0 transition-all duration-300 ease-in-out',
            isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
          )}>
            <h2 className="text-xs sm:text-sm font-semibold text-gray-900 truncate whitespace-nowrap">
              {project.name}
            </h2>
            <p className="text-[10px] sm:text-xs text-gray-500 truncate whitespace-nowrap">
              {project.description || 'No description'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn(
        'flex-1 transition-all duration-300 ease-in-out',
        isCollapsed ? 'p-1 sm:p-2' : 'p-3 sm:p-4'
      )}>
        <ul className="space-y-1 sm:space-y-2">
          {navigation.map((item) => {
            const href = `/projects/${project.id}/${item.href}`;
            const isActive = pathname === href;
            
            return (
              <li key={item.name}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 relative group',
                    isCollapsed 
                      ? 'justify-center p-1.5 sm:p-2 md:p-2.5' 
                      : 'gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <span className={cn(
                    'text-base sm:text-lg shrink-0',
                    isCollapsed ? 'text-sm sm:text-base' : ''
                  )}>
                    {item.icon}
                  </span>
                  <span className={cn(
                    'transition-all duration-300 ease-in-out whitespace-nowrap',
                    isCollapsed ? 'opacity-0 w-0 overflow-hidden absolute' : 'opacity-100 w-auto'
                  )}>
                    {item.name}
                  </span>
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 sm:ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Hover area for expanding when collapsed */}
      {isCollapsed && (
        <div 
          className="absolute inset-y-0 -right-2 w-4 hover:bg-transparent cursor-pointer group"
          onClick={() => setIsCollapsed(false)}
          title="Expand sidebar"
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-500 opacity-0 group-hover:opacity-50 transition-opacity duration-200 rounded-full" />
        </div>
      )}
    </div>
  );
}