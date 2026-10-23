'use client';

import { useState } from 'react';
import { ProjectMembers } from './project-members';
import { InviteMemberDialog } from './invite-member-dialog';

interface Project {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  created_by?: string;
}

interface ProjectSettingsClientProps {
  project: Project;
  isOwner: boolean;
}

export function ProjectSettingsClient({ project, isOwner }: ProjectSettingsClientProps) {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="w-full relative">
      {/* Subtle grid backdrop */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'radial-gradient(#c3c6d7 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none rounded-full blur-3xl"
        style={{ background: 'linear-gradient(to bottom, rgba(0,74,198,0.08), transparent)' }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#eaedff] text-[11px] font-bold text-[#004ac6] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6] animate-pulse" />
                Project
              </span>
              <span className="text-[#c3c6d7] text-sm">/</span>
              <span className="text-[11px] text-[#434655]">{project.name}</span>
              <span className="text-[#c3c6d7] text-sm">/</span>
              <span className="text-[11px] text-[#004ac6] font-medium">settings</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#131b2e] tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Project Settings
            </h1>
            <p className="text-[#434655] mt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Manage settings, access permissions, and team members
            </p>
          </div>
        </div>

        {/* General Settings Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#eaedff]">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-[#eaedff]">
            <div className="w-9 h-9 rounded-xl bg-[#eaedff] flex items-center justify-center text-[#004ac6]">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </div>
            <div>
              <h2 className="font-bold text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>General Settings</h2>
              <p className="text-xs text-[#434655]">Core identity and metadata for this project</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Project Icon + Name row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Icon */}
              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-[#131b2e] mb-2">Project Icon</label>
                <div className="flex items-center gap-3 mt-1">
                  <div className="relative group cursor-pointer w-14 h-14 rounded-xl bg-gradient-to-br from-[#004ac6] to-[#2563eb] text-white flex items-center justify-center shadow-md text-2xl">
                    {project.icon || '📁'}
                    <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button className="px-3 py-1 rounded-lg bg-[#eaedff] hover:bg-[#dbe1ff] text-[#131b2e] text-xs font-medium transition-colors">
                      Change Icon
                    </button>
                    <span className="text-[10px] text-[#737686]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>PNG / SVG</span>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="md:col-span-9">
                <label className="block text-sm font-semibold text-[#131b2e] mb-2" htmlFor="projectName">Project Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-[#737686]">
                    <span className="material-symbols-outlined text-[18px]">terminal</span>
                  </span>
                  <input
                    id="projectName"
                    type="text"
                    defaultValue={project.name}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f2f3ff] text-[#131b2e] text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#004ac6]/20 transition-all shadow-inner"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  />
                </div>
                <p className="text-[11px] text-[#434655] mt-1.5">Used in logs, CLI commands, and integrations.</p>
              </div>
            </div>

            {/* Workspace URL */}
            <div>
              <label className="block text-sm font-semibold text-[#131b2e] mb-2" htmlFor="workspaceSlug">Workspace URL</label>
              <div className="flex rounded-xl overflow-hidden bg-[#f2f3ff] shadow-inner">
                <span className="inline-flex items-center px-3 bg-[#eaedff] text-[#737686] text-xs border-r border-[#c3c6d7]/50" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  syncgrid.run/
                </span>
                <input
                  id="workspaceSlug"
                  type="text"
                  defaultValue={project.name?.toLowerCase().replace(/\s+/g, '-') || 'project'}
                  className="w-full px-3 py-2.5 bg-transparent text-[#131b2e] text-sm focus:outline-none"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
                <button className="px-3 bg-[#eaedff] hover:bg-[#dbe1ff] text-[#004ac6] text-xs font-medium transition-colors flex items-center gap-1 border-l border-[#c3c6d7]/50">
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-[#131b2e]" htmlFor="projectDesc">Description</label>
                <span className="text-[11px] text-[#737686]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Markdown supported</span>
              </div>
              <textarea
                id="projectDesc"
                rows={3}
                defaultValue={project.description || ''}
                placeholder="Describe your project..."
                className="w-full p-3 rounded-xl bg-[#f2f3ff] text-[#131b2e] text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#004ac6]/20 transition-all shadow-inner resize-none leading-relaxed"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              />
            </div>

            {/* Save button */}
            <div className="flex justify-end">
              <button className="px-5 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] text-white text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95">
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Team Members Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#eaedff]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-[#eaedff]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#dbe1ff] flex items-center justify-center text-[#004ac6]">
                <span className="material-symbols-outlined text-[20px]">group</span>
              </div>
              <div>
                <h2 className="font-bold text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Team Members</h2>
                <p className="text-xs text-[#434655]">Manage member permissions and role delegations</p>
              </div>
            </div>
            {isOwner && (
              <button
                onClick={() => setInviteOpen(true)}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>+ Invite Member</span>
              </button>
            )}
          </div>

          <ProjectMembers projectId={project.id} isOwner={isOwner} compact />
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl p-6 shadow-sm border border-red-200/60" style={{ background: 'rgba(255, 218, 214, 0.15)' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <div>
              <h2 className="font-bold text-red-600" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Danger Zone</h2>
              <p className="text-xs text-[#434655]">Irreversible actions for project &apos;{project.name}&apos;</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white">
              <div>
                <h3 className="font-semibold text-sm text-[#131b2e]">Transfer Ownership</h3>
                <p className="text-xs text-[#434655] mt-0.5">Transfer this workspace to another authenticated account.</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-[#eaedff] hover:bg-[#dbe1ff] text-[#131b2e] text-xs font-semibold transition-colors whitespace-nowrap active:scale-95">
                Transfer Project
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white">
              <div>
                <h3 className="font-semibold text-sm text-red-600">Archive or Delete Project</h3>
                <p className="text-xs text-[#434655] mt-0.5">Irrevocably erase all data and storage volumes.</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold transition-colors active:scale-95">
                  Archive
                </button>
                <button className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-semibold transition-colors shadow-sm active:scale-95">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        projectId={project.id}
      />
    </div>
  );
}
