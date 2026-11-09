import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read Supabase environment variables from Vite or window env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl.includes('.supabase.co') &&
    !supabaseUrl.includes('your-project-id')
);

// Fallback dummy URL/key for initialization when variables aren't provided yet
const fallbackUrl = 'https://placeholder-project.supabase.co';
const fallbackKey = 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? supabaseUrl : fallbackUrl,
  isSupabaseConfigured ? supabaseAnonKey : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export interface AuthResponse {
  user: any | null;
  session: any | null;
  error: string | null;
}

// ------------------------------------------------------------------------------
// Authentication Functions (Part 21.1)
// ------------------------------------------------------------------------------

export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
  if (!isSupabaseConfigured) {
    // Demo / Offline authenticated state
    const demoUser = {
      id: 'demo-student-uuid',
      email,
      user_metadata: { name: email.split('@')[0] || 'Alex' },
    };
    return { user: demoUser, session: { access_token: 'demo-token', user: demoUser }, error: null };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data?.user || null,
    session: data?.session || null,
    error: error?.message || null,
  };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
  grade?: string,
  personalityStyle?: string
): Promise<AuthResponse> {
  if (!isSupabaseConfigured) {
    const demoUser = {
      id: 'demo-student-uuid',
      email,
      user_metadata: { name: name || 'Student', grade, personalityStyle },
    };
    return { user: demoUser, session: { access_token: 'demo-token', user: demoUser }, error: null };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        grade: grade || 'Class 11 / Grade 11',
        personalityStyle: personalityStyle || 'Friendly and Casual',
      },
    },
  });

  return {
    user: data?.user || null,
    session: data?.session || null,
    error: error?.message || null,
  };
}

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase credentials must be configured for Google OAuth.' };
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  return { error: error?.message || null };
}

export async function resetPasswordForEmail(email: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) {
    return { error: null };
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { error: error?.message || null };
}

export async function updateUserPassword(newPassword: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) {
    return { error: null };
  }
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { error: error?.message || null };
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
}

// ------------------------------------------------------------------------------
// Profile & Preferences Persistence (Part 21.2 & 21.4)
// ------------------------------------------------------------------------------

export async function fetchProfileFromDB(userId: string) {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.warn('Could not fetch profile from Supabase:', error.message);
    return null;
  }
  return data;
}

export async function updateProfileInDB(userId: string, updates: Record<string, any>) {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile in Supabase:', error);
  }
  return data;
}

// ------------------------------------------------------------------------------
// Saved Memories (Part 21.8)
// ------------------------------------------------------------------------------

export async function fetchMemoriesFromDB(userId: string) {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('saved_memories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Error fetching memories:', error.message);
    return [];
  }
  return data || [];
}

export async function insertMemoryToDB(userId: string, fact: string, category = 'General') {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('saved_memories')
    .insert([{ user_id: userId, fact, category }])
    .select()
    .single();

  return error ? null : data;
}

export async function deleteMemoryFromDB(memoryId: string) {
  if (!isSupabaseConfigured) return;

  await supabase.from('saved_memories').delete().eq('id', memoryId);
}

// ------------------------------------------------------------------------------
// Notes & Notebooks Persistence
// ------------------------------------------------------------------------------

export async function fetchNotesFromDB(userId: string) {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return error ? [] : data || [];
}

export async function insertNoteToDB(userId: string, note: {
  title: string;
  subject: string;
  topic: string;
  content: string;
  tags?: string[];
  is_favorite?: boolean;
}) {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('notes')
    .insert([{ ...note, user_id: userId }])
    .select()
    .single();

  return error ? null : data;
}

export async function deleteNoteFromDB(noteId: string) {
  if (!isSupabaseConfigured) return;
  await supabase.from('notes').delete().eq('id', noteId);
}

// ------------------------------------------------------------------------------
// Tasks & Habits Persistence
// ------------------------------------------------------------------------------

export async function fetchTasksFromDB(userId: string) {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return error ? [] : data || [];
}

export async function insertTaskToDB(userId: string, task: {
  title: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  estimated_minutes?: number;
}) {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('tasks')
    .insert([{ ...task, user_id: userId, completed: false }])
    .select()
    .single();

  return error ? null : data;
}

export async function updateTaskStatusInDB(taskId: string, completed: boolean) {
  if (!isSupabaseConfigured) return;

  await supabase
    .from('tasks')
    .update({ completed, updated_at: new Date().toISOString() })
    .eq('id', taskId);
}

export async function deleteTaskFromDB(taskId: string) {
  if (!isSupabaseConfigured) return;
  await supabase.from('tasks').delete().eq('id', taskId);
}

// ------------------------------------------------------------------------------
// Storage Upload Helper (Part 21.6)
// ------------------------------------------------------------------------------

export async function uploadDocumentToSupabase(
  userId: string,
  bucket: 'student-documents' | 'profile-avatars' | 'learning-resources',
  file: File
): Promise<{ url: string | null; error: string | null }> {
  if (!isSupabaseConfigured) {
    return { url: null, error: 'Supabase storage is not configured.' };
  }

  const filePath = `${userId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  // Also log in uploaded_files table
  await supabase.from('uploaded_files').insert([
    {
      user_id: userId,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      bucket_id: bucket,
    },
  ]);

  return { url: data.publicUrl, error: null };
}

// ------------------------------------------------------------------------------
// Account Deletion Helper (Part 21.9)
// ------------------------------------------------------------------------------

export async function deleteUserAccount(userId: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: null };

  // Cascade delete cleans up all tables referencing auth.users(id)
  const { error } = await supabase.from('profiles').delete().eq('id', userId);
  await signOut();
  return { error: error?.message || null };
}
