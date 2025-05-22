import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getSession, getCurrentUser, signIn, signOut, signUp } from '../lib/supabaseClient';

// Define the Auth context types
type AuthUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
} | null;

type AuthContextType = {
  user: AuthUser;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
};

// Create context with initial default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  isAdmin: false,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
});

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on initial load
  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        
        // Get current user if there's an active session
        const session = await getSession();
        
        if (session) {
          const currentUser = await getCurrentUser();
          
          // Get additional user data from the database
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          
          setUser({
            id: currentUser.id,
            email: currentUser.email || '',
            firstName: data?.first_name,
            lastName: data?.last_name,
            isAdmin: data?.is_admin
          });
        } else {
          setUser(null);
        }
      } catch (err: any) {
        console.error('Auth check error:', err);
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // User signed in, update user state
          try {
            const { data } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              firstName: data?.first_name,
              lastName: data?.last_name,
              isAdmin: data?.is_admin
            });
          } catch (err) {
            console.error('Error fetching user data:', err);
          }
        } else if (event === 'SIGNED_OUT') {
          // User signed out, clear user state
          setUser(null);
        }
      }
    );
    
    // Cleanup subscription on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        throw error;
      }
      
      // User data will be set by the auth state listener
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await signOut();
      
      if (error) {
        throw error;
      }
      
      // User data will be cleared by the auth state listener
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Register function
  const register = async (email: string, password: string, firstName?: string, lastName?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await signUp(email, password, firstName, lastName);
      
      if (error) {
        throw error;
      }
      
      // After registration, the user needs to verify their email
      // The auth state change listener will update the user data once verified
    } catch (err: any) {
      setError(err.message || 'Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate derived state
  const isAuthenticated = !!user;
  const isAdmin = !!user?.isAdmin;
  
  // Create the context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    register,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};