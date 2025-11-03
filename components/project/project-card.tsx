import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project & { member_count?: number };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}/editor`}>
      <Card className="hover:shadow-lg transition cursor-pointer h-full">
        <CardContent className="p-4 sm:p-5 md:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 ${project.color} rounded-lg flex items-center justify-center text-xl sm:text-2xl shrink-0`}
            >
              {project.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold mb-1 truncate">{project.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                {project.description || 'No description'}
              </p>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t flex items-center justify-between">
            <p className="text-[10px] sm:text-xs text-gray-500">
              {project.member_count || 1} member{project.member_count !== 1 ? 's' : ''}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500">{formatDate(project.updated_at)}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}