'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createProject(data: {
  name: string;
  description?: string;
  icon: string;
  color: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('You must be logged in to create a project');
    }

    console.log('Creating project for user:', user.id);

    // Step 1: Create the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
        created_by: user.id,
      })
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      throw new Error(`Failed to create project: ${projectError.message}`);
    }

    console.log('Project created:', project.id);

    // Step 2: Add the creator as owner
    const { error: memberError } = await supabase
      .from('project_members')
      .insert({
        project_id: project.id,
        user_id: user.id,
        role: 'owner',
        invitation_status: 'active',
        joined_at: new Date().toISOString(),
      });

    if (memberError) {
      console.error('Member addition error:', memberError);
      throw new Error(`Failed to add project owner: ${memberError.message}`);
    }

    console.log('Project owner added successfully');

    // Step 3: Create a board for the project
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .insert({
        project_id: project.id,
        name: `${data.name} Board`,
      })
      .select()
      .single();

    if (boardError) {
      console.error('Board creation error:', boardError);
    } else {
      console.log('Board created:', board.id);

      // Step 4: Create default columns
      const defaultColumns = [
        { title: 'To Do', position: 0 },
        { title: 'In Progress', position: 1 },
        { title: 'Done', position: 2 },
      ];

      const { error: columnsError } = await supabase
        .from('columns')
        .insert(
          defaultColumns.map((col) => ({
            board_id: board.id,
            title: col.title,
            position: col.position,
          }))
        );

      if (columnsError) {
        console.error('Columns creation error:', columnsError);
      } else {
        console.log('Default columns created');
      }
    }

    revalidatePath('/dashboard');
    return project;
  } catch (error: any) {
    console.error('Full error:', error);
    throw error;
  }
}

export async function getProjects() {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    // Get owned projects
    const { data: ownedProjects } = await supabase
      .from('projects')
      .select('*')
      .eq('created_by', user.id);

    // Get member projects  
    const { data: memberProjects } = await supabase
      .from('project_members')
      .select('project_id, projects(*)')
      .eq('user_id', user.id)
      .eq('invitation_status', 'active')
      .neq('projects.created_by', user.id); // Exclude owned projects

    // Combine both lists
    const allProjects = [
      ...(ownedProjects || []),
      ...(memberProjects?.map(m => m.projects).filter(Boolean) || [])
    ];

    // Sort by updated_at
    allProjects.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return allProjects;
  } catch (error) {
    console.error('Get projects error:', error);
    return [];
  }
}

export async function getProject(projectId: string) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Get project error:', error);
      return null;
    }

    return project;
  } catch (error) {
    console.error('Get project error:', error);
    return null;
  }
}