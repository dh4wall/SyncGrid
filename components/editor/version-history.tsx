'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (open) {
      loadVersions();
    }
  }, [open, pageId]);

  const loadVersions = async () => {
    setLoading(true);
    const data = await getPageVersions(pageId);
    setVersions(data);
    setLoading(false);
  };

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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <p className="text-sm text-gray-600">
              Current version: {currentVersion} • {versions.length} versions total
            </p>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Loading versions...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">No versions found</p>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex gap-4">
              {/* Version List */}
              <div className="w-1/3 border-r overflow-y-auto space-y-2 pr-4">
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
              <div className="flex-1 overflow-y-auto">
                {selectedVersion && comparing ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b">
                      <div>
                        <h3 className="font-semibold">Version {selectedVersion.version_number}</h3>
                        <p className="text-sm text-gray-600">{selectedVersion.change_summary}</p>
                      </div>
                      <div className="flex gap-2">
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