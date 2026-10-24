'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDate } from '@/lib/utils';
import { getPageVersions, restoreVersion } from '@/lib/actions/pages';
import { Button } from '@/components/ui/button';
import { History, RotateCcw, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Version {
  id: string;
  version_number: number;
  title: string;
  content: string;
  created_at: string;
  change_summary: string;
  author: {
    full_name: string;
    email: string;
  };
}

interface VersionHistoryProps {
  pageId: string;
  projectId: string;
  currentVersion: number;
  onRestore: () => void;
}

export function VersionHistory({ pageId, projectId, currentVersion, onRestore }: VersionHistoryProps) {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [comparing, setComparing] = useState(false);

  const loadVersions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPageVersions(pageId);
      setVersions(data);
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    if (open) {
      // Load the version list when the dialog becomes visible.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadVersions();
    }
  }, [open, loadVersions]);

  const handleRestore = async (versionNumber: number) => {
    if (confirm(`Restore to version ${versionNumber}? This will create a new version with the restored content.`)) {
      await restoreVersion({ pageId, versionNumber, projectId });
      setOpen(false);
      onRestore();
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <History className="w-4 h-4" />
        Version History
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="h-[min(720px,calc(100dvh-3rem))] w-[min(1100px,100%)] max-w-none overflow-hidden bg-[#faf8ff]">
          <DialogHeader className="mb-5 shrink-0 rounded-xl border border-[#e2e7ff] bg-white/80 px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563eb] to-[#8343f4] text-white shadow-sm">
                <History className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl text-[#131b2e]">Version History</DialogTitle>
                <p className="mt-1 text-sm text-[#434655]">
              Current version: {currentVersion} • {versions.length} versions total
                </p>
              </div>
            </div>
          </DialogHeader>

          {loading ? (
            <div className="min-h-0 flex flex-1 items-center justify-center py-12">
              <p className="text-gray-500">Loading versions...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="min-h-0 flex flex-1 items-center justify-center py-12">
              <p className="text-gray-500">No versions found</p>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-hidden flex flex-col gap-4 md:flex-row">
              {/* Version List */}
              <div className="sg-scrollbar min-h-0 max-h-48 w-full shrink-0 space-y-2 overflow-y-auto rounded-xl border border-[#e2e7ff] bg-white/70 p-3 md:max-h-none md:w-[34%]">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    onClick={() => {
                      setSelectedVersion(version);
                      setComparing(true);
                    }}
                    className={`p-3 border rounded-lg cursor-pointer transition ${
                      selectedVersion?.id === version.id
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-gray-50'
                    } ${version.version_number === currentVersion ? 'ring-2 ring-green-500' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-semibold text-sm">
                        Version {version.version_number}
                        {version.version_number === currentVersion && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Current
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{version.change_summary}</p>
                    <p className="text-xs text-gray-500">
                      {version.author?.full_name || 'Unknown'} • {formatDate(version.created_at)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Version Preview */}
              <div className="sg-scrollbar min-h-0 flex-1 overflow-y-auto rounded-xl border border-[#e2e7ff] bg-white/70 p-4">
                {selectedVersion && comparing ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b">
                      <div>
                        <h3 className="font-semibold">Version {selectedVersion.version_number}</h3>
                        <p className="text-sm text-gray-600">{selectedVersion.change_summary}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedVersion.version_number !== currentVersion && (
                          <Button
                            size="sm"
                            onClick={() => handleRestore(selectedVersion.version_number)}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Restore
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setComparing(false);
                            setSelectedVersion(null);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className="prose prose-sm max-w-none">
                      <div
                        className="border rounded-lg p-4 bg-gray-50"
                        dangerouslySetInnerHTML={{ __html: selectedVersion.content }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Select a version to preview
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}