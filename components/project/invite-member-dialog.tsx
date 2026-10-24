'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Check, Loader2, RefreshCw } from 'lucide-react';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

interface PlatformUser {
  id: string;
  email: string;
  full_name: string | null;
}

async function readResponse(response: Response): Promise<{ error?: string; invitationToken?: string; users?: PlatformUser[] }> {
  const text = await response.text();
  let result: { error?: string; invitationToken?: string; users?: PlatformUser[] };
  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Invitation request failed (${response.status})`);
  }
  if (!response.ok) throw new Error(result.error || `Invitation request failed (${response.status})`);
  return result;
}

export function InviteMemberDialog({ open, onOpenChange, projectId }: InviteMemberDialogProps) {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [error, setError] = useState('');

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        `${user.full_name || ''} ${user.email}`.toLowerCase().includes(search.toLowerCase())
      ),
    [users, search]
  );

  const handleInvite = async () => {
    if (!selectedUserId) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, userId: selectedUserId, role }),
      });
      await readResponse(response);

      setInviteSent(true);
      setSelectedUserId('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to create invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedUserId('');
    setSearch('');
    setInviteSent(false);
    setError('');
    onOpenChange(false);
  };

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    setError('');
    try {
      const response = await fetch('/api/invitations/users', { cache: 'no-store' });
      const result = await readResponse(response);
      setUsers(result.users || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load platform users');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      // Load the directory when the parent opens the controlled dialog.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadUsers();
    }
  }, [open, loadUsers]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) handleClose();
    else onOpenChange(true);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Invite Team Member
          </DialogTitle>
        </DialogHeader>

        {!inviteSent ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select a platform user</label>
              <Input
                type="search"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
              <div className="sg-scrollbar-dialog mt-2 max-h-56 overflow-y-auto rounded-lg border border-[#c3c6d7]/70 bg-[#faf8ff] p-1">
                {loadingUsers ? (
                  <div className="flex items-center justify-center gap-2 p-4 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading registered users...
                  </div>
                ) : filteredUsers.map((user) => (
                    <button
                      type="button"
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${selectedUserId === user.id ? 'bg-blue-100' : ''}`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
                          {(user.full_name || user.email).charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{user.full_name || user.email}</span>
                          <span className="block truncate text-xs text-gray-500">{user.email}</span>
                        </span>
                      </span>
                    </button>
                  ))}
                {!loadingUsers && users.length === 0 && !error && (
                  <div className="p-3 text-sm text-gray-500">
                    No other registered users were found in the platform directory.
                  </div>
                )}
                {!loadingUsers && users.length > 0 && filteredUsers.length === 0 && (
                  <p className="p-3 text-sm text-gray-500">No users match your search.</p>
                )}
              </div>
              {error && (
                <button
                  type="button"
                  onClick={() => void loadUsers()}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry loading users
                </button>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'editor' | 'viewer')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="viewer">Viewer - Can view content</option>
                <option value="editor">Editor - Can edit content</option>
                <option value="admin">Admin - Can manage project</option>
              </select>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleClose} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={loading || !selectedUserId}
                className="flex-1"
              >
                {loading ? 'Inviting...' : 'Send Invite'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium mb-1">Invitation Created!</h3>
              <p className="text-sm text-gray-600">The invitation is now in their Invites dropdown.</p>
            </div>

            <p className="text-xs text-gray-500">
              The user will see this invitation in the Invites section of their dashboard.
            </p>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
