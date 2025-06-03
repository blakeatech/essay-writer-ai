import { supabase } from './supabase';

/**
 * User profile interface
 */
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  credits: number;
  created_at: string;
  updated_at: string;
}

/**
 * Gets the current user's profile including credits
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return null;
    }
    
    // Get the user's profile
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

/**
 * Gets just the user's credits
 */
export async function getUserCredits(): Promise<number> {
  try {
    const profile = await getUserProfile();
    return profile?.credits || 0;
  } catch (error) {
    console.error('Error getting user credits:', error);
    return 0;
  }
} 