'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getPages, createPage } from '@/lib/actions/pages';

interface Page { id: string; title: string; }
interface Project { id: string; name: string; description?: string; icon?: string; color?: string; }

interface ProjectDockProps {
  project: Project;
  pages?: Page[];
  currentPageId?: string;
  onPageSelect?: (pageId: string) => void;
  onCreatePage?: () => void;
}

// ─── Individual magnified dock item ────────────────────────────────────────────
function DockItem({
  icon,
  label,
  isActive,
  onClick,
  mouseX,
  itemRef,
  children,
}: {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: (e: React.MouseEvent) => void;
  mouseX: number | null;
  itemRef: React.RefObject<HTMLDivElement | null>;
  children?: React.ReactNode;
}) {
  const [scale, setScale] = useState(1);
  const [showTip, setShowTip] = useState(false);

  // macOS parabolic cosine magnification
  useEffect(() => {
    if (mouseX === null || !itemRef.current) { setScale(1); return; }
    const rect = itemRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const dist = Math.abs(mouseX - cx);
    const reach = 160;
    if (dist < reach) {
      const t = Math.cos((dist / reach) * (Math.PI / 2));
      setScale(1 + 0.45 * Math.pow(t, 1.6));
    } else {
      setScale(1);
    }
  }, [mouseX, itemRef]);

  return (
    <div
      ref={itemRef}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      className="relative flex flex-col items-center justify-end"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'bottom center',
        transition: mouseX === null
          ? 'transform 250ms cubic-bezier(0.34,1.56,0.64,1)'
          : 'transform 55ms linear',
        willChange: 'transform',
      }}
    >
      {/* Tooltip */}
      <div
        className={cn(
          'absolute -top-9 left-1/2 -translate-x-1/2 z-[70]',
          'px-2.5 py-1 rounded-lg whitespace-nowrap pointer-events-none select-none',
          'bg-[#131b2e]/88 text-white text-[11px] font-semibold tracking-wide',
          'backdrop-blur-md border border-white/10 shadow-xl',
          'transition-all duration-150',
          showTip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1.5',
        )}
        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      >
        {label}
        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-[5px] border-transparent border-t-[#131b2e]/88" />
      </div>

      {/* Icon button */}
      <button
        onClick={onClick}
        className={cn(
          'relative w-12 h-12 rounded-[18px] flex items-center justify-center select-none',
          'transition-colors duration-120 active:scale-90',
          isActive
            ? [
                'bg-gradient-to-b from-[#1a65e8] to-[#004ac6]',
                'text-white shadow-[0_6px_24px_rgba(0,74,198,0.45)]',
                'ring-[1.5px] ring-white/40',
              ]
            : [
                'bg-white/30 text-[#434655]',
                'hover:bg-white/55 hover:text-[#131b2e]',
              ],
        )}
      >
        <span
          className="material-symbols-outlined text-[24px] select-none"
          style={{ fontVariationSettings: isActive ? "'FILL' 1,'wght' 500" : "'FILL' 0,'wght' 400" }}
        >
          {icon}
        </span>

        {/* Active dot */}
        {isActive && (
          <span className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-[#004ac6] ring-2 ring-white shadow-sm" />
        )}
      </button>

      {/* Slot for extra overlay content (e.g. the flyout) */}
      {children}
    </div>
  );
}

// ─── Main Dock ─────────────────────────────────────────────────────────────────
export default function ProjectDock({
  project,
  pages: initialPages,
  currentPageId,
  onPageSelect,
  onCreatePage,
}: ProjectDockProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [mouseX, setMouseX] = useState<number | null>(null);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [internalPages, setInternalPages] = useState<Page[]>(initialPages || []);
  const [isCreating, setIsCreating] = useState(false);

  const dockRef = useRef<HTMLDivElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const editorItemRef = useRef<HTMLDivElement>(null!);
  const boardItemRef = useRef<HTMLDivElement>(null!);
  const settingsItemRef = useRef<HTMLDivElement>(null!);

  const activeView = pathname.includes('/board')
    ? 'board'
    : pathname.includes('/settings')
    ? 'settings'
    : 'editor';

  // Fetch pages if not supplied
  useEffect(() => {
    if (initialPages && initialPages.length > 0) {
      setInternalPages(initialPages);
    } else if (project?.id) {
      getPages(project.id).then((p) => { if (p) setInternalPages(p); });
    }
  }, [initialPages, project?.id]);

  // Sync supplied pages
  useEffect(() => {
    if (initialPages) setInternalPages(initialPages);
  }, [initialPages]);

  // Click outside to close flyout
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!dockRef.current?.contains(t) && !flyoutRef.current?.contains(t)) {
        setFlyoutOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Navigation helpers
  const goEditor = (e: React.MouseEvent) => {
    e.preventDefault();
    if (activeView === 'editor') {
      setFlyoutOpen((p) => !p);
    } else {
      setFlyoutOpen(true);
      router.push(`/projects/${project.id}/editor`);
    }
  };
  const goBoard = (e: React.MouseEvent) => {
    e.preventDefault();
    setFlyoutOpen(false);
    router.push(`/projects/${project.id}/board`);
  };
  const goSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    setFlyoutOpen(false);
    router.push(`/projects/${project.id}/settings`);
  };

  const selectPage = (pageId: string) => {
    setFlyoutOpen(false);
    if (onPageSelect) {
      onPageSelect(pageId);
    } else {
      router.push(`/projects/${project.id}/editor?pageId=${pageId}`);
    }
  };

  const createNewPage = async () => {
    if (onCreatePage) { setFlyoutOpen(false); onCreatePage(); return; }
    const title = prompt('Page title:');
    if (!title?.trim()) return;
    try {
      setIsCreating(true);
      const np = await createPage({ projectId: project.id, title: title.trim(), content: '<p>Start writing…</p>' });
      setInternalPages((p) => [...p, np]);
      setFlyoutOpen(false);
      router.push(`/projects/${project.id}/editor?pageId=${np.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      {/* ── Upward Pages Flyout ── */}
      <div
        ref={flyoutRef}
        className={cn(
          'fixed z-[65] left-1/2 -translate-x-1/2',
          'bottom-[96px]',
          'w-[340px]',
          // Glassmorphism
          'bg-white/70 backdrop-blur-3xl',
          'border border-white/50 border-b-[#c3c6d7]/30',
          'shadow-[0_32px_72px_rgba(15,23,42,0.22),0_0_0_1px_rgba(255,255,255,0.55)_inset]',
          'rounded-2xl p-3 flex flex-col gap-2.5',
          'transition-all duration-200 ease-out origin-bottom',
          flyoutOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-[0.94] translate-y-4 pointer-events-none',
        )}
      >
        {/* Header */}
        <div className="px-1.5 flex items-center justify-between pb-2 border-b border-[#c3c6d7]/25">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#eaedff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#004ac6] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>folder_copy</span>
            </div>
            <span className="text-[11px] font-bold text-[#131b2e] uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Pages &amp; Documents
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#eaedff] text-[#004ac6] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {internalPages.length}
          </span>
        </div>

        {/* + New Page */}
        <button
          onClick={createNewPage}
          disabled={isCreating}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#0053db] to-[#004ac6] hover:from-[#1a65e8] hover:to-[#0053db] text-white text-[12px] font-bold shadow-[0_4px_16px_rgba(0,74,198,0.35)] active:scale-[0.97] transition-all disabled:opacity-50"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          <span className="material-symbols-outlined text-[17px]">add_circle</span>
          <span>{isCreating ? 'Creating…' : '+ New Page'}</span>
        </button>

        {/* Pages list */}
        <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto sg-scrollbar-thin">
          <div className="text-[9px] text-[#737686] px-2 pt-1 pb-0.5 font-extrabold uppercase tracking-[0.12em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Switch Document
          </div>
          {internalPages.length === 0 ? (
            <div className="py-4 text-center text-[12px] text-[#737686]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              No documents yet. Create one above.
            </div>
          ) : internalPages.map((page) => {
            const active = page.id === currentPageId;
            return (
              <button
                key={page.id}
                onClick={() => selectPage(page.id)}
                className={cn(
                  'flex items-center justify-between px-2.5 py-2 rounded-xl text-left group w-full transition-all',
                  active
                    ? 'bg-[#004ac6]/10 border border-[#004ac6]/25'
                    : 'hover:bg-[#f2f3ff] border border-transparent',
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn('material-symbols-outlined text-[17px] shrink-0', active ? 'text-[#004ac6]' : 'text-[#737686] group-hover:text-[#004ac6]')}
                    style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0", transition: 'font-variation-settings 200ms' }}
                  >description</span>
                  <span className={cn('text-[12px] truncate', active ? 'font-bold text-[#004ac6]' : 'font-medium text-[#131b2e]')} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {page.title}
                  </span>
                </div>
                {active
                  ? <span className="w-2 h-2 rounded-full bg-[#004ac6] animate-pulse shrink-0 ml-2" />
                  : <span className="text-[10px] text-[#737686] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Open</span>
                }
              </button>
            );
          })}
        </div>

        {/* Quick nav shortcuts */}
        <div className="border-t border-[#c3c6d7]/20 pt-2 grid grid-cols-2 gap-1.5">
          <button
            onClick={goBoard}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-colors',
              activeView === 'board' ? 'bg-[#eaedff] text-[#004ac6]' : 'hover:bg-[#f2f3ff] text-[#434655]',
            )}
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <span className="material-symbols-outlined text-[16px] text-[#004ac6]">view_kanban</span>
            <span>Kanban</span>
          </button>
          <button
            onClick={goSettings}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-colors',
              activeView === 'settings' ? 'bg-[#eaedff] text-[#004ac6]' : 'hover:bg-[#f2f3ff] text-[#434655]',
            )}
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <span className="material-symbols-outlined text-[16px] text-[#004ac6]">tune</span>
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* ── Floating Dock Bar ── */}
      <div className="fixed bottom-5 inset-x-0 z-50 flex justify-center pointer-events-none">
        <div
          ref={dockRef}
          onMouseMove={(e) => setMouseX(e.clientX)}
          onMouseLeave={() => setMouseX(null)}
          className={cn(
            'pointer-events-auto flex items-end gap-3',
            // Large glassy pill
            'px-5 py-3 rounded-[28px]',
            'bg-white/55 backdrop-blur-3xl',
            'border border-white/60',
            'shadow-[0_24px_56px_rgba(15,23,42,0.16),0_0_0_1px_rgba(255,255,255,0.7)_inset]',
          )}
        >
          {/* Editor */}
          <DockItem
            icon="description"
            label="Editor & Pages"
            isActive={activeView === 'editor' || flyoutOpen}
            onClick={goEditor}
            mouseX={mouseX}
            itemRef={editorItemRef}
          />

          {/* Kanban */}
          <DockItem
            icon="view_kanban"
            label="Kanban Board"
            isActive={activeView === 'board'}
            onClick={goBoard}
            mouseX={mouseX}
            itemRef={boardItemRef}
          />

          {/* Settings */}
          <DockItem
            icon="tune"
            label="Project Settings"
            isActive={activeView === 'settings'}
            onClick={goSettings}
            mouseX={mouseX}
            itemRef={settingsItemRef}
          />
        </div>
      </div>
    </>
  );
}
