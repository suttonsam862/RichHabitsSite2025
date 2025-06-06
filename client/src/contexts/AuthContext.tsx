import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface AuthContextType {
  user: any | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Set to false immediately for debugging

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Set a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.warn('Auth initialization timeout - proceeding without authentication');
          setUser(null);
          setIsLoading(false);
        }, 5000);

        // Check if there's an existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        clearTimeout(timeoutId);
        
        if (error) {
          console.error('Supabase session error:', error);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        setUser(session?.user ?? null);
        if (session?.access_token) {
          localStorage.setItem('supabase_auth_token', session.access_token);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Supabase connection failed:', error);
        setUser(null);
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.access_token) {
          localStorage.setItem('supabase_auth_token', session.access_token);
        } else {
          localStorage.removeItem('supabase_auth_token');
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.session?.access_token) {
        localStorage.setItem('supabase_auth_token', data.session.access_token);
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('supabase_auth_token');
    setUser(null);
  };

  // Check if current user is admin
  const isAdmin = user?.email === 'samsutton@rich-habits.com';

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}