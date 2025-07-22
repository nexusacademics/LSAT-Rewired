// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types/user';

interface SupabaseUser {
  id: string;
  email?: string;
}

interface SubscriptionData {
  subscription_status: string;
  price_id: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = async (): Promise<SubscriptionData | null> => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status, price_id')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }
      
      setSubscription(data);
      return data;
    } catch (err) {
      console.error('Unexpected error fetching subscription:', err);
      return null;
    }
  };

  const createUserProfile = async (supabaseUser: SupabaseUser) => {
    // Fetch user profile from the new 'profiles' table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('username, first_name, last_name')
      .eq('id', supabaseUser.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      // Fallback if there's a real error (e.g., network issue, malformed query)
      const mockUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.email?.split('@')[0] || 'User',
        stats: {
          circuitsCreated: 50,
          testsCompleted: 10,
          averageAnalysisScore: 88,
          rank: 100
        }
      };
      setUser(mockUser);
      return;
    }

    // If profile is null (no row found by maybeSingle), use mock data
    if (!profile) {
      console.warn('No profile found for user, using mock data.');
      const mockUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.email?.split('@')[0] || 'User',
        stats: {
          circuitsCreated: 50,
          testsCompleted: 10,
          averageAnalysisScore: 88,
          rank: 100
        }
      };
      setUser(mockUser);
      return;
    }

    const userProfile: User = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: profile.first_name || profile.username || supabaseUser.email?.split('@')[0] || 'User', // Use first name or username for display
      firstName: profile.first_name,
      lastName: profile.last_name,
      username: profile.username,
      stats: {
        circuitsCreated: 50,
        testsCompleted: 10,
        averageAnalysisScore: 88,
        rank: 100
      }
    };
    setUser(userProfile);
  };

  const handleAuthSuccess = async (user: SupabaseUser) => {
    setSupabaseUser(user);
    await createUserProfile(user); // Ensure profile is created/fetched before checking subscription
    await fetchSubscription(); // No need to pass userId, RLS handles it
  };

  // Check for authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await handleAuthSuccess(session.user);
        } else {
          // If no session, create a mock user for dashboard display
          const mockSupabaseUser: SupabaseUser = {
            id: 'mock-user-id', // A consistent mock ID for development
            email: 'mock@example.com',
          };
          const mockUser: User = {
            id: mockSupabaseUser.id,
            email: mockSupabaseUser.email || '',
            name: mockSupabaseUser.email?.split('@')[0] || 'User',
            firstName: 'Mock',
            lastName: 'User',
            username: 'mockuser',
            stats: {
              circuitsCreated: 50,
              testsCompleted: 10,
              averageAnalysisScore: 88,
              rank: 100
            }
          };
          setSupabaseUser(mockSupabaseUser);
          setUser(mockUser); // Directly set the mock user
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await handleAuthSuccess(session.user);
      } else if (event === 'SIGNED_OUT') {
        setSupabaseUser(null);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    supabaseUser,
    subscription,
    isLoading
  };
}