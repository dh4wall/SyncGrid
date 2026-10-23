'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { AdvancedEditor } from '@/components/editor/advanced-editor';
import { VersionHistory } from '@/components/editor/version-history';
import { ActiveUsers } from '@/components/board/active-users';
import { CursorPresence } from '@/components/presence/cursor-presence';
import { getPages, updatePage, createPage } from '@/lib/actions/pages';
import { getPageClient } from '@/lib/queries/client';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/use-user';
import { extractMentionedUserIds } from '@/lib/utils/extractMentions';
import { getProject } from '@/lib/actions/projects';
import ProjectDock from '@/components/layout/project-dock';

export default function EditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const targetPageId = searchParams.get('pageId');
  const projectId = params.id as string;
  const { user } = useUser();

  const [pages, setPages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<any>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSaveTimestampRef = useRef<number>(0);
  const ignoreNextUpdateRef = useRef(false);
  const editorChannelRef = useRef<any>(null);
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const isReceivingRemoteUpdate = useRef(false);
  const mentionedUserIdsRef = useRef<string[]>([]);

  useEffect(() => {
    const loadProject = async () => {
      const p = await getProject(projectId);
      setProject(p);
    };
    loadProject();
    loadPages();
  }, [projectId]);

  // Real-time subscription for current page
  useEffect(() => {
    if (!currentPage?.id) return;

    const supabase = createClient();

    const broadcastChannel = supabase.channel(`page-presence-${currentPage.id}`, {
      config: { broadcast: { self: false } }
    });

    broadcastChannel
      .on('broadcast', { event: 'content' }, (payload: any) => {
        if (payload.payload.sessionId === sessionIdRef.current) return;
        if (payload.payload.content !== undefined) {
          isReceivingRemoteUpdate.current = true;
          setContent(payload.payload.content);
        }
      })
      .subscribe();

    editorChannelRef.current = broadcastChannel;

    return () => {
      supabase.removeChannel(broadcastChannel);
    };
  }, [currentPage?.id]);

  useEffect(() => {
    if (targetPageId && targetPageId !== currentPage?.id) {
      loadPage(targetPageId);
    }
  }, [targetPageId]);

  const loadPages = async () => {
    const data = await getPages(projectId);
    setPages(data);
    if (data.length > 0 && !currentPage) {
      const pageToLoad = targetPageId 
        ? (data.find((p) => p.id === targetPageId)?.id || data[0].id)
        : data[0].id;
      loadPage(pageToLoad);
    } else {
      setLoading(false);
    }
  };

  const loadPage = async (pageId: string) => {
    setLoading(true);
    const page = await getPageClient(pageId);
    if (page) {
      setCurrentPage(page);
      setContent(page.content || '');
    }
    setLoading(false);
  };

  const handleContentChange = useCallback(async (newContent: string) => {
    if (isReceivingRemoteUpdate.current) {
      isReceivingRemoteUpdate.current = false;
      return;
    }
    setContent(newContent);
    if (editorChannelRef.current && currentPage) {
      editorChannelRef.current.send({
        type: 'broadcast',
        event: 'content',
        payload: { content: newContent, sessionId: sessionIdRef.current }
      });
    }
    // Mention notification logic
    if (user && currentPage) {
      const prevMentioned = mentionedUserIdsRef.current;
      const currentMentioned = extractMentionedUserIds(newContent);
      const newMentions = currentMentioned.filter(
        (id) => id !== user.id && !prevMentioned.includes(id)
      );
      mentionedUserIdsRef.current = currentMentioned;
      for (const mentionedUserId of newMentions) {
        await fetch('/api/notify-mention', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mentionedUserId,
            mentionedByUserId: user.id,
            mentionedByName: user.email?.split('@')[0] || 'Anonymous',
            projectId,
            pageId: currentPage.id,
            context: newContent,
          }),
        });
      }
    }
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      if (currentPage) {
        try {
          await updatePage({
            pageId: currentPage.id,
            content: newContent,
            projectId,
            createVersion: false,
          });
        } catch (error) {
          console.error('Background save failed:', error);
        }
      }
    }, 300);
  }, [currentPage, projectId, user]);

  const handleSaveVersion = async () => {
    if (currentPage) {
      setSaving(true);
      ignoreNextUpdateRef.current = true;
      lastSaveTimestampRef.current = Date.now();
      const summary = prompt('Enter a summary for this version (optional):');
      await updatePage({
        pageId: currentPage.id,
        content,
        projectId,
        createVersion: true,
        changeSummary: summary || 'Manual save',
      });
      setSaving(false);
      loadPage(currentPage.id);
    }
  };

  const handleCreatePage = async () => {
    const title = prompt('Enter page title:');
    if (title) {
      const newPage = await createPage({
        projectId,
        title,
        content: '<p>Start writing...</p>',
      });
      await loadPages();
      loadPage(newPage.id);
    }
  };

  const handleVersionRestore = () => {
    if (currentPage) loadPage(currentPage.id);
  };

  const getUserColor = () => {
    if (!user?.id) return '#3B82F6';
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    const hash = user.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (loading && !currentPage) {
    return (
      <div className="h-full flex items-center justify-center bg-[#faf8ff]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#004ac6] border-t-transparent animate-spin" />
          <p className="text-sm text-[#434655]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#faf8ff] overflow-hidden relative">
      {/* Live Cursor Presence */}
      {user && currentPage && (
        <CursorPresence
          roomId={currentPage.id}
          roomType="editor"
          currentUser={{
            id: user.id,
            name: user.email?.split('@')[0] || 'Anonymous',
            color: getUserColor()
          }}
        />
      )}

      {/* Top utility bar */}
      <div className="flex-none border-b border-[#c3c6d7]/30 bg-white/90 backdrop-blur-md px-4 sm:px-6 h-12 flex items-center justify-between gap-4 z-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-[#434655] min-w-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <span className="text-[#737686] truncate max-w-[100px]">{project?.name || 'Project'}</span>
            <span className="text-[#c3c6d7]">/</span>
            <span className="text-[#131b2e] font-semibold truncate max-w-[160px]">
              {currentPage?.title || 'No page selected'}
            </span>
          </div>
          {/* Autosave indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Synced</span>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 shrink-0">
          {currentPage?.id && (
            <ActiveUsers roomId={currentPage.id} roomType="page" />
          )}
          <button
            onClick={handleSaveVersion}
            disabled={saving || !currentPage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] border border-[#c3c6d7]/60 hover:border-[#004ac6]/40 text-[#131b2e] text-xs font-semibold transition-all disabled:opacity-40"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            <span className="material-symbols-outlined text-[15px] text-[#004ac6]">bookmark_add</span>
            <span className="hidden sm:inline">{saving ? 'Saving…' : 'Save Version'}</span>
          </button>
          {currentPage && (
            <VersionHistory
              pageId={currentPage.id}
              projectId={projectId}
              currentVersion={currentPage.current_version}
              onRestore={handleVersionRestore}
            />
          )}
        </div>
      </div>

      {/* Editor canvas — full width */}
      <div className="flex-1 overflow-y-auto sg-scrollbar pb-32">
        {currentPage ? (
          <div className="w-full px-6 sm:px-14 lg:px-28 xl:px-40 py-8">
            <AdvancedEditor
              content={content}
              onChange={handleContentChange}
              placeholder="Start writing your document…"
              projectId={projectId}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#eaedff] to-[#dbe1ff] flex items-center justify-center mx-auto shadow-md">
                <span className="material-symbols-outlined text-[#004ac6] text-[38px]" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
              </div>
              <div>
                <p className="text-[#131b2e] font-bold text-lg" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>No document open</p>
                <p className="text-[#737686] text-sm mt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Click the dock below to create or switch pages.</p>
              </div>
              <button
                onClick={handleCreatePage}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] text-white text-sm font-semibold shadow-md shadow-blue-500/25 active:scale-95 transition-all"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Create First Page
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dock — only shown on editor, handles pages via flyout */}
      {project && (
        <ProjectDock
          project={project}
          pages={pages}
          currentPageId={currentPage?.id}
          onPageSelect={loadPage}
          onCreatePage={handleCreatePage}
        />
      )}
    </div>
  );
}
