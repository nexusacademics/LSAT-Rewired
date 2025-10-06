import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  target_lsat_score?: number;
  test_date?: string;
  migration_completed: boolean;
}

interface Subscription {
  tier: 'free' | 'basic' | 'premium' | 'pro';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  price_id?: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  profile: Profile | null;
  subscription: Subscription | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, metadata: { username: string; first_name: string; last_name: string }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  };

  const fetchSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('tier, status, price_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Unexpected error fetching subscription:', err);
      return null;
    }
  };

  const loadUserData = async (user: SupabaseUser) => {
    const [profileData, subscriptionData] = await Promise.all([
      fetchProfile(user.id),
      fetchSubscription(user.id)
    ]);

    setProfile(profileData);
    setSubscription(subscriptionData);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (currentSession?.user) {
          setUser(currentSession.user);
          setSession(currentSession);
          try {
            await loadUserData(currentSession.user);
          } catch (loadError) {
            console.error('Error loading user data:', loadError);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const handleAuthRedirect = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      if (hashParams.get('access_token')) {
        console.log('Email confirmation successful');
      }
    };

    handleAuthRedirect();

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);

        if (event === 'SIGNED_IN' && currentSession?.user) {
          setUser(currentSession.user);
          await loadUserData(currentSession.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setSubscription(null);
        } else if (event === 'USER_UPDATED' && currentSession?.user) {
          setUser(currentSession.user);
          await loadUserData(currentSession.user);
        }
      }
    );

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    metadata: { username: string; first_name: string; last_name: string }
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: window.location.origin
        }
      });

      if (error) return { error };

      if (data.user) {
        await supabase
          .from('profiles')
          .update({
            username: metadata.username,
            first_name: metadata.first_name,
            last_name: metadata.last_name
          })
          .eq('id', data.user.id);
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (emailOrUsername: string, password: string) => {
    try {
      let loginEmail = emailOrUsername;

      if (!emailOrUsername.includes('@')) {
        const { data } = await supabase.rpc('get_email_by_username', {
          username_input: emailOrUsername
        });

        if (!data) {
          return { error: new Error('Invalid username or password') };
        }

        loginEmail = data;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password
      });

      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) return { error };

      await refreshProfile();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    subscription,
    session,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
