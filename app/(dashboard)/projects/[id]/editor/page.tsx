'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { AdvancedEditor } from '@/components/editor/advanced-editor';
import { VersionHistory } from '@/components/editor/version-history';
import { ActiveUsers } from '@/components/board/active-users';
import { CursorPresence } from '@/components/presence/cursor-presence';
import { getPages, updatePage, createPage } from '@/lib/actions/pages';
import { getPageClient } from '@/lib/queries/client';
import { Button } from '@/components/ui/button';
import { Plus, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/use-user';
import { cn } from '@/lib/utils';
import { extractMentionedUserIds } from '@/lib/utils/extractMentions';
import { createMentionNotification } from '@/lib/actions/notifications';

export default function EditorPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { user } = useUser();

  const [pages, setPages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<any>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]); // Track other users typing
  const [remoteCursors, setRemoteCursors] = useState<Map<string, { position: number; user: any }>>(new Map());
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSaveTimestampRef = useRef<number>(0);
  const ignoreNextUpdateRef = useRef(false);
  const editorChannelRef = useRef<any>(null);
  const sessionIdRef = useRef<string>(crypto.randomUUID()); // Unique session ID
  const isReceivingRemoteUpdate = useRef(false); // Flag for remote updates
  const mentionedUserIdsRef = useRef<string[]>([]);

  // Auto-collapse sidebar on small screens (< 1024px = lg breakpoint)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) { // lg breakpoint
        setIsSidebarCollapsed(true);
      }
    };
    
    // Check on mount
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadPages();
  }, [projectId]);

  // Real-time subscription for current page
  useEffect(() => {
    if (!currentPage?.id) return;

    const supabase = createClient();

    // BROADCAST ONLY for instant updates
    const broadcastChannel = supabase.channel(`page-presence-${currentPage.id}`, {
      config: { broadcast: { self: false } }
    });

    broadcastChannel
      .on('broadcast', { event: 'content' }, (payload: any) => {
        // Ignore own broadcasts (extra safety)
        if (payload.payload.sessionId === sessionIdRef.current) {
          return;
        }
        
        // INSTANT UPDATE - other user typed
        if (payload.payload.content !== undefined) {
          // Set flag to prevent re-broadcasting
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

  const loadPages = async () => {
    const data = await getPages(projectId);
    setPages(data);
    if (data.length > 0 && !currentPage) {
      loadPage(data[0].id);
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
    // Skip if this change is from a remote update
    if (isReceivingRemoteUpdate.current) {
      isReceivingRemoteUpdate.current = false; // Reset flag
      return;
    }
    setContent(newContent);
    if (editorChannelRef.current && currentPage) {
      editorChannelRef.current.send({
        type: 'broadcast',
        event: 'content',
        payload: { 
          content: newContent,
          sessionId: sessionIdRef.current
        }
      });
    }
    // --- Mention notification logic ---
    if (user && currentPage) {
      const prevMentioned = mentionedUserIdsRef.current;
      const currentMentioned = extractMentionedUserIds(newContent);
      // Find new mentions
      const newMentions = currentMentioned.filter(
        (id) => id !== user.id && !prevMentioned.includes(id)
      );
      mentionedUserIdsRef.current = currentMentioned;
      for (const mentionedUserId of newMentions) {
        // Call API route instead of server action directly
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
    // --- End mention notification logic ---
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
      ignoreNextUpdateRef.current = true; // Mark to ignore next realtime update
      lastSaveTimestampRef.current = Date.now(); // Record save time
      const summary = prompt('Enter a summary for this version (optional):');
      await updatePage({
        pageId: currentPage.id,
        content,
        projectId,
        createVersion: true,
        changeSummary: summary || 'Manual save',
      });
      setSaving(false);
      // Reload page to get updated version number
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
    // Reload the page after restore
    if (currentPage) {
      loadPage(currentPage.id);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Loading editor...</p>
      </div>
    );
  }

  // Generate consistent user color
  const getUserColor = () => {
    if (!user?.id) return '#3B82F6';
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    const hash = user.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="h-full flex relative">
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

      {/* Page List Sidebar */}
      <div className={cn(
        'border-r bg-white overflow-y-auto transition-all duration-300 ease-in-out relative',
        isSidebarCollapsed ? 'w-12 sm:w-14' : 'w-52 sm:w-56 md:w-64'
      )}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={cn(
            'absolute top-3 sm:top-4 z-10 p-1 sm:p-1.5 bg-white border border-gray-200 rounded-md shadow-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300',
            isSidebarCollapsed 
              ? 'right-1 sm:right-2 hover:scale-110' 
              : 'right-3 sm:right-4'
          )}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          ) : (
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          )}
        </button>

        {/* Header Section - Matches Project Sidebar Height */}
        <div className={cn(
          'border-b border-gray-200 min-h-[60px] sm:min-h-[68px] md:min-h-[73px] flex items-center transition-all duration-300 ease-in-out',
          isSidebarCollapsed ? 'p-1 sm:p-2 justify-center' : 'p-3 sm:p-4 pr-10 sm:pr-12'
        )}>
          {!isSidebarCollapsed && (
            <div className="flex items-center justify-between w-full">
              <h3 className="font-semibold text-sm sm:text-base">Pages</h3>
              <Button size="sm" onClick={handleCreatePage}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
          {isSidebarCollapsed && (
            <button
              onClick={handleCreatePage}
              className="p-1.5 hover:bg-gray-100 rounded-md transition focus:outline-none focus:ring-2 focus:ring-gray-300"
              title="Create New Page"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>

        {/* Sidebar Content - Expanded State */}
        {!isSidebarCollapsed && (
          <div className="p-3 sm:p-4">
            <div className="space-y-1">
              {pages.map((page) => (
                <div
                  key={page.id}
                  onClick={() => loadPage(page.id)}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition ${
                    currentPage?.id === page.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="text-sm truncate">{page.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collapsed State - Show Icons Only */}
        {isSidebarCollapsed && (
          <div className="p-1 sm:p-2 space-y-1 sm:space-y-2">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => loadPage(page.id)}
                className={cn(
                  'w-full p-1.5 sm:p-2 rounded-md transition focus:outline-none focus:ring-2 focus:ring-gray-300',
                  currentPage?.id === page.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-100 text-gray-600'
                )}
                title={page.title}
              >
                <FileText className="w-4 h-4 mx-auto" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {currentPage ? (
          <>
            <div className="border-b p-4 bg-white flex items-center justify-between">
              <div className="flex-1 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold truncate">{currentPage.title}</h1>
                  <p className="text-sm text-gray-600">Version {currentPage.current_version}</p>
                </div>
                {currentPage.id && (
                  <div className="shrink-0">
                    <ActiveUsers roomId={currentPage.id} roomType="page" />
                  </div>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <Button variant="outline" size="sm" onClick={handleSaveVersion}>
                  Save Version
                </Button>
                <VersionHistory
                  pageId={currentPage.id}
                  projectId={projectId}
                  currentVersion={currentPage.current_version}
                  onRestore={handleVersionRestore}
                />
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-hidden">
              <AdvancedEditor
                content={content}
                onChange={handleContentChange}
                placeholder="Start writing your document..."
                projectId={projectId}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-4">No page selected</p>
              <Button onClick={handleCreatePage}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Page
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}