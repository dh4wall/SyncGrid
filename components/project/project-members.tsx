'use client';

import { useState, useEffect } from 'react';
import { getProjectMembers, updateMemberRole, removeMember } from '@/lib/actions/members';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InviteMemberDialog } from './invite-member-dialog';
import { Users, Crown, Shield, Edit, Eye, MoreVertical, Trash2 } from 'lucide-react';

interface ProjectMembersProps {
  projectId: string;
  isOwner: boolean;
}

const ROLE_ICONS = {
  owner: Crown,
  admin: Shield,
  editor: Edit,
  viewer: Eye,
};

const ROLE_COLORS = {
  owner: 'text-yellow-600 bg-yellow-50',
  admin: 'text-purple-600 bg-purple-50',
  editor: 'text-blue-600 bg-blue-50',
  viewer: 'text-gray-600 bg-gray-50',
};

export function ProjectMembers({ projectId, isOwner }: ProjectMembersProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, [projectId]);

  const loadMembers = async () => {
    try {
      const data = await getProjectMembers(projectId);
      console.log('Loaded members in component:', data);
      setMembers(data);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, role: 'admin' | 'editor' | 'viewer') => {
    try {
      await updateMemberRole({ projectId, memberId, role });
      await loadMembers();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Remove this member from the project?')) {
      try {
        await removeMember(projectId, memberId);
        await loadMembers();
      } catch (error) {
        console.error('Error removing member:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading members...</div>;
  }

  const activeMembers = members.filter(m => m.invitation_status === 'active');
  const pendingMembers = members.filter(m => m.invitation_status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Team Members</h2>
          <p className="text-sm text-gray-600">
            Manage who has access to this project
          </p>
        </div>
        {isOwner && (
          <Button onClick={() => setInviteOpen(true)}>
            <Users className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Active Members */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Members ({activeMembers.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeMembers.map((member) => {
            const RoleIcon = ROLE_ICONS[member.role as keyof typeof ROLE_ICONS];
            const isExpanded = expandedMember === member.id;
            
            return (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    {member.profiles?.full_name?.charAt(0) || member.profiles?.email?.charAt(0)?.toUpperCase() || member.invited_email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.profiles?.full_name || member.profiles?.email || member.invited_email || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600">{member.profiles?.email || member.invited_email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${ROLE_COLORS[member.role as keyof typeof ROLE_COLORS]}`}>
                    <RoleIcon className="w-3 h-3" />
                    {member.role}
                  </div>
                  
                  {isOwner && member.role !== 'owner' && (
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedMember(isExpanded ? null : member.id)}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                      
                      {isExpanded && (
                        <div className="absolute right-0 top-8 bg-white border rounded-md shadow-lg z-10 py-1 w-32">
                          <select
                            value={member.role}
                            onChange={(e) => {
                              handleRoleChange(member.id, e.target.value as any);
                              setExpandedMember(null);
                            }}
                            className="w-full px-2 py-1 text-sm border-none outline-none"
                          >
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <button
                            onClick={() => {
                              handleRemoveMember(member.id);
                              setExpandedMember(null);
                            }}
                            className="w-full px-2 py-1 text-sm text-red-600 hover:bg-red-50 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {pendingMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Invitations ({pendingMembers.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
                    {member.profiles?.full_name?.charAt(0) || member.invited_email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.profiles?.full_name || member.invited_email || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {member.profiles?.email || member.invited_email}
                    </p>
                    <p className="text-xs text-yellow-600">
                      Invited by {member.inviter?.full_name || 'Unknown'} • {member.profiles ? 'Pending acceptance' : 'User not signed up'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-yellow-600 text-sm">
                    {member.role}
                  </div>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        projectId={projectId}
      />
    </div>
  );
}
