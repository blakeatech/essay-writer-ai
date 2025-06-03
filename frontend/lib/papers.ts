import { supabase } from './supabase';

export interface Paper {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  title: string;
  content?: string;
  status: 'draft' | 'complete' | 'archived';
  word_count: number;
  citation_format?: string;
  metadata?: any;
}

export interface CreatePaperInput {
  title: string;
  content?: string;
  status?: 'draft' | 'complete' | 'archived';
  word_count?: number;
  citation_format?: string;
  metadata?: any;
}

export interface UpdatePaperInput {
  title?: string;
  content?: string;
  status?: 'draft' | 'complete' | 'archived';
  word_count?: number;
  citation_format?: string;
  metadata?: any;
}

/**
 * Creates a new paper for the current user
 */
export async function createPaper(input: CreatePaperInput): Promise<Paper | null> {
  try {
    // Get the current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Insert the paper with the current user ID
    const { data, error } = await supabase
      .from('papers')
      .insert({
        user_id: user.id,
        title: input.title,
        content: input.content || '',
        status: input.status || 'draft',
        word_count: input.word_count || 0,
        citation_format: input.citation_format,
        metadata: input.metadata || {},
        created_at: new Date(),
        updated_at: new Date()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating paper:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createPaper:', error);
    return null;
  }
}

/**
 * Gets all papers for the current user
 */
export async function getUserPapers(): Promise<Paper[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('papers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching papers:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getUserPapers:', error);
    return [];
  }
}

/**
 * Gets a single paper by ID
 */
export async function getPaperById(id: string): Promise<Paper | null> {
  try {
    const { data, error } = await supabase
      .from('papers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching paper:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getPaperById:', error);
    return null;
  }
}

/**
 * Updates a paper by ID
 */
export async function updatePaper(id: string, input: UpdatePaperInput): Promise<Paper | null> {
  try {
    const updates: any = {
      ...input,
      updated_at: new Date()
    };
    
    const { data, error } = await supabase
      .from('papers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating paper:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updatePaper:', error);
    return null;
  }
}

/**
 * Deletes a paper by ID
 */
export async function deletePaper(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('papers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting paper:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deletePaper:', error);
    return false;
  }
}

/**
 * Count user's papers
 */
export async function countUserPapers(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { count, error } = await supabase
      .from('papers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error counting papers:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error in countUserPapers:', error);
    return 0;
  }
} 