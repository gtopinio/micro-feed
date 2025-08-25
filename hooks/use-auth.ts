// 🔄 Authentication hook with user profile
// Similar to Angular's AuthService but as a React hook

'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, onAuthStateChange } from '@/lib/auth';
import { supabase } from '@/lib/db';

interface UserWithProfile extends User {
  profile?: {
    username: string;
  };
}

export function useAuth() {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserWithProfile = async (authUser: User | null) => {
    if (!authUser) {
      setUser(null);
      return;
    }

    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', authUser.id)
        .single();

      setUser({
        ...authUser,
        profile: profile ? { username: profile.username } : undefined,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(authUser as UserWithProfile);
    }
  };

  useEffect(() => {
    // Get initial user
    getCurrentUser()
      .then((user) => {
        fetchUserWithProfile(user);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Auth error (expected if not logged in):', error);
        setUser(null);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = onAuthStateChange((user) => {
      fetchUserWithProfile(user);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}
