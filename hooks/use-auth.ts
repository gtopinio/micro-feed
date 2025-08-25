// � Unified Authentication Hook with Profile
// Merges use-auth and use-auth-with-profile for simplicity

'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/db';
import { signOut } from '@/lib/auth';

interface UserProfile {
  username: string;
}

interface UserWithProfile extends User {
  profile?: UserProfile;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Profile fetch exception:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email);

      setUser(session?.user ?? null);

      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      console.log('🔄 Signing out...');
      setLoading(true); // Show loading during sign out
      await signOut();
      console.log('✅ Sign out successful');

      // Immediately clear the state
      setUser(null);
      setProfile(null);
      setLoading(false);

      // Force a page reload to ensure clean state
      window.location.reload();
    } catch (error) {
      console.error('❌ Sign out error:', error);
      setLoading(false);
    }
  };

  // Create a combined user object for compatibility
  const userWithProfile: UserWithProfile | null = user
    ? {
        ...user,
        profile: profile || undefined,
      }
    : null;

  return {
    user: userWithProfile,
    profile,
    loading,
    isAuthenticated: !!user,
    displayName: profile?.username || user?.email?.split('@')[0] || 'User',
    signOut: handleSignOut,
  };
}
