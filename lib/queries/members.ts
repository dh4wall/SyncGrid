import { createClient } from '@/lib/supabase/client';

export interface ProjectMember {
  id: string;
  email: string;
  full_name?: string;
}

/**
 * Get all members of a project for @mention autocomplete
 */
export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const supabase = createClient();
  
  // First, get the user IDs from project_members
  const { data: memberData, error: memberError } = await supabase
    .from('project_members')
    .select('user_id')
    .eq('project_id', projectId);
  
  if (memberError) {
    console.error('Error fetching project members:', memberError);
    return [];
  }
  
  if (!memberData || memberData.length === 0) {
    return [];
  }
  
  // Extract user IDs
  const userIds = memberData.map(m => m.user_id);
  
  // Fetch profiles for those users
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .in('id', userIds);
  
  if (profileError) {
    console.error('Error fetching profiles:', profileError);
    return [];
  }
  
  if (!profiles) return [];
  
  // Return profiles as ProjectMembers
  return profiles.map(profile => ({
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name || undefined,
  }));
}
