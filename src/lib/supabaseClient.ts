import { createClient } from '@supabase/supabase-js';

// Create a Supabase client for the browser
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Authentication will not work properly.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
);

// Auth helper functions
export const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName
      }
    }
  });
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw error;
  }
  return data.user;
};

export const resetPassword = async (email: string) => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
};

export const updatePassword = async (newPassword: string) => {
  return await supabase.auth.updateUser({
    password: newPassword
  });
};

// Session management
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return data.session;
};

// Returns subscription that can be used to listen for auth state changes
// Usage: const subscription = onAuthStateChange((event, session) => { ... });
// Cleanup: subscription.unsubscribe();
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};