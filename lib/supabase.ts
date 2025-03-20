import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function getUserProgress(userId: string) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user progress:', error);
    return null;
  }

  return data;
}

export async function updateUserProgress(userId: string, progress: Partial<any>) {
  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      ...progress,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error updating user progress:', error);
    return false;
  }

  return true;
}

export async function getUserVocabulary(userId: string) {
  const { data, error } = await supabase
    .from('vocabulary')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user vocabulary:', error);
    return [];
  }

  return data;
}

export async function addVocabularyWord(userId: string, word: any) {
  const { error } = await supabase
    .from('vocabulary')
    .insert({
      user_id: userId,
      ...word,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error adding vocabulary word:', error);
    return false;
  }

  return true;
}

export async function removeVocabularyWord(userId: string, wordId: string) {
  const { error } = await supabase
    .from('vocabulary')
    .delete()
    .eq('id', wordId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error removing vocabulary word:', error);
    return false;
  }

  return true;
}

export async function saveUserMessages(userId: string, messages: any[]) {
  const { error } = await supabase
    .from('user_messages')
    .insert(
      messages.map(message => ({
        user_id: userId,
        ...message,
        created_at: new Date().toISOString(),
      }))
    );

  if (error) {
    console.error('Error saving user messages:', error);
    return false;
  }

  return true;
}

export async function getUserMessages(userId: string) {
  const { data, error } = await supabase
    .from('user_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching user messages:', error);
    return [];
  }

  return data;
} 