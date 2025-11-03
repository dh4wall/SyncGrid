'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getPages(projectId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: pages, error } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Get pages error:', error);
    return [];
  }

  return pages || [];
}

export async function getPage(pageId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: page, error } = await supabase
    .from('pages')
    .select('*')
    .eq('id', pageId)
    .single();

  if (error) {
    console.error('Get page error:', error);
    return null;
  }

  return page;
}

export async function createPage(data: {
  projectId: string;
  title: string;
  content?: string;
  parentId?: string;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: page, error } = await supabase
    .from('pages')
    .insert({
      project_id: data.projectId,
      title: data.title,
      content: data.content || '',
      parent_id: data.parentId,
      created_by: user.id,
      current_version: 1,
    })
    .select()
    .single();

  if (error) {
    console.error('Create page error:', error);
    throw new Error(error.message);
  }

  // Create initial version
  await supabase.from('page_versions').insert({
    page_id: page.id,
    version_number: 1,
    title: data.title,
    content: data.content || '',
    created_by: user.id,
    change_summary: 'Initial version',
  });

  revalidatePath(`/projects/${data.projectId}/editor`);
  return page;
}

export async function updatePage(data: {
  pageId: string;
  title?: string;
  content?: string;
  projectId: string;
  createVersion?: boolean;
  changeSummary?: string;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get current page
  const { data: currentPage } = await supabase
    .from('pages')
    .select('*')
    .eq('id', data.pageId)
    .single();

  if (!currentPage) {
    throw new Error('Page not found');
  }

  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;

  // Check if we should create a new version
  // Create version if content changed significantly or createVersion is explicitly true
  const shouldCreateVersion = data.createVersion || 
    (data.content && data.content !== currentPage.content && data.content.length > 0);

  if (shouldCreateVersion) {
    updateData.current_version = currentPage.current_version + 1;

    // Create new version
    await supabase.from('page_versions').insert({
      page_id: data.pageId,
      version_number: currentPage.current_version + 1,
      title: data.title || currentPage.title,
      content: data.content || currentPage.content,
      created_by: user.id,
      change_summary: data.changeSummary || 'Content updated',
    });
  }

  // Update page
  const { error } = await supabase
    .from('pages')
    .update(updateData)
    .eq('id', data.pageId);

  if (error) {
    console.error('Update page error:', error);
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${data.projectId}/editor`);
}

export async function getPageVersions(pageId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: versions, error } = await supabase
    .from('page_versions')
    .select(`
      *,
      author:profiles(id, full_name, email)
    `)
    .eq('page_id', pageId)
    .order('version_number', { ascending: false });

  if (error) {
    console.error('Get versions error:', error);
    return [];
  }

  return versions || [];
}

export async function restoreVersion(data: {
  pageId: string;
  versionNumber: number;
  projectId: string;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get the version to restore
  const { data: version, error: versionError } = await supabase
    .from('page_versions')
    .select('*')
    .eq('page_id', data.pageId)
    .eq('version_number', data.versionNumber)
    .single();

  if (versionError || !version) {
    throw new Error('Version not found');
  }

  // Get current page
  const { data: currentPage } = await supabase
    .from('pages')
    .select('*')
    .eq('id', data.pageId)
    .single();

  if (!currentPage) {
    throw new Error('Page not found');
  }

  const newVersionNumber = currentPage.current_version + 1;

  // Create a new version with the restored content
  await supabase.from('page_versions').insert({
    page_id: data.pageId,
    version_number: newVersionNumber,
    title: version.title,
    content: version.content,
    created_by: user.id,
    change_summary: `Restored from version ${data.versionNumber}`,
  });

  // Update the page
  await supabase
    .from('pages')
    .update({
      title: version.title,
      content: version.content,
      current_version: newVersionNumber,
    })
    .eq('id', data.pageId);

  revalidatePath(`/projects/${data.projectId}/editor`);
}

export async function deletePage(pageId: string, projectId: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', pageId);

  if (error) {
    console.error('Delete page error:', error);
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${projectId}/editor`);
}