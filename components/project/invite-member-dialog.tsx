'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { inviteMemberByEmail } from '@/lib/actions/members';
import { Users, Mail, Copy, Check } from 'lucide-react';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function InviteMemberDialog({ open, onOpenChange, projectId }: InviteMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleInvite = async () => {
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    try {
      const { invitationToken } = await inviteMemberByEmail({
        projectId,
        email: email.trim(),
        role
      });

      // Create shareable invite link
      const link = `${window.location.origin}/invite/${invitationToken}`;
      setInviteLink(link);
      setEmail('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setEmail('');
    setInviteLink('');
    setError('');
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Invite Team Member
          </DialogTitle>
        </DialogHeader>

        {!inviteLink ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email Address</label>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
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
                disabled={loading || !email.trim()}
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
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium mb-1">Invitation Created!</h3>
              <p className="text-sm text-gray-600">Share this link with your team member</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="flex-1 text-xs"
                />
                <Button
                  onClick={copyLink}
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>• The user must have an account to accept the invitation</p>
              <p>• Link expires when the invitation is accepted or declined</p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
