'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function uploadImage(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  
  // Get the file from form data
  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'No file provided' };
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return { error: 'File must be an image' };
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { error: 'File size must be less than 10MB' };
  }

  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `editor-images/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('syncgrid-uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('syncgrid-uploads')
      .getPublicUrl(filePath);

    return { url: publicUrl, path: filePath };
  } catch (error: any) {
    console.error('Upload error:', error);
    return { error: error.message || 'Failed to upload image' };
  }
}

export async function deleteImage(path: string) {
  const supabase = await createServerSupabaseClient();
  
  try {
    const { error } = await supabase.storage
      .from('syncgrid-uploads')
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return { error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Delete error:', error);
    return { error: error.message || 'Failed to delete image' };
  }
}
