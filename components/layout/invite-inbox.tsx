'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Inbox, Mail, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Invitation {
  id: string;
  project_id: string;
  role: string;
  projects: { id: string; name: string; icon: string | null } | null;
  inviter: { full_name: string | null; email: string } | null;
}

async function readJson(response: Response) {
  const text = await response.text();
  let result: { error?: string; invitations?: Invitation[] };
  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Invitation request failed (${response.status})`);
  }
  if (!response.ok) throw new Error(result.error || `Invitation request failed (${response.status})`);
  return result;
}

export function InviteInbox() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadInvitations = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await readJson(await fetch('/api/invitations/pending'));
      setInvitations(result.invitations || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load the inbox once when the navbar mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInvitations();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const acceptInvitation = async (invitation: Invitation) => {
    setBusyId(invitation.id);
    setError('');
    try {
      const response = await fetch(`/api/invitations/${invitation.id}`, { method: 'POST' });
      await readJson(response);
      setInvitations((current) => current.filter((item) => item.id !== invitation.id));
      router.push(`/projects/${invitation.project_id}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to accept invitation');
      setBusyId(null);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setOpen((current) => !current);
          if (!open) loadInvitations();
        }}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Invites"
      >
        <Mail className="w-5 h-5 text-gray-600" />
        {invitations.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
            {invitations.length > 9 ? '9+' : invitations.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(24rem,calc(100vw-2rem))] bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <h3 className="font-semibold text-gray-900">Invites</h3>
              <p className="text-xs text-gray-500">Project invitations for you</p>
            </div>
            <Inbox className="w-5 h-5 text-blue-600" />
          </div>

          {error && <p className="mx-4 mt-3 rounded bg-red-50 p-2 text-xs text-red-700">{error}</p>}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : invitations.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">No pending invitations.</div>
            ) : (
              invitations.map((invitation) => (
                <div key={invitation.id} className="p-4 border-b last:border-b-0">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                      {invitation.projects?.icon || '📁'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{invitation.projects?.name || 'Project invitation'}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {invitation.inviter?.full_name || invitation.inviter?.email || 'A team member'} invited you as {invitation.role}.
                      </p>
                      <button
                        onClick={() => acceptInvitation(invitation)}
                        disabled={busyId === invitation.id}
                        className="mt-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        {busyId === invitation.id ? 'Joining...' : 'Join project'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
