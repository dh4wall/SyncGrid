'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { AdvancedEditor } from '@/components/editor/advanced-editor';
import { VersionHistory } from '@/components/editor/version-history';
import { getPages, getPage, updatePage, createPage } from '@/lib/actions/pages';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';

export default function EditorPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [pages, setPages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<any>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    loadPages();
  }, [projectId]);

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
    const page = await getPage(pageId);
    if (page) {
      setCurrentPage(page);
      setContent(page.content || '');
    }
    setLoading(false);
  };

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Auto-save after 2 seconds of inactivity
    saveTimeoutRef.current = setTimeout(async () => {
      if (currentPage) {
        setSaving(true);
        try {
          await updatePage({
            pageId: currentPage.id,
            content: newContent,
            projectId,
            createVersion: false, // Don't create version on every auto-save
          });
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
        setSaving(false);
      }
    }, 2000);
  }, [currentPage, projectId]);

  const handleSaveVersion = async () => {
    if (currentPage) {
      setSaving(true);
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

  return (
    <div className="h-full flex">
      {/* Page List Sidebar */}
      <div className="w-64 border-r bg-white p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Pages</h3>
          <Button size="sm" onClick={handleCreatePage}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
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
              <FileText className="w-4 h-4" />
              <span className="text-sm truncate">{page.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {currentPage ? (
          <>
            <div className="border-b p-4 bg-white flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{currentPage.title}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {saving ? 'Saving...' : 'Saved'} • Version {currentPage.current_version}
                </p>
              </div>
              <div className="flex gap-2">
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