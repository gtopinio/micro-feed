// 🔄 Authentication utilities
// Similar to Angular's AuthService but using Supabase

import { supabase } from './db';
import type { User } from '@supabase/supabase-js';

// Get current user (like Angular's getCurrentUser())
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      // This is expected when not logged in
      return null;
    }

    return user;
  } catch {
    // This is also expected when not logged in
    return null;
  }
}

// Sign up with email/password
export async function signUp(
  email: string,
  password: string,
  username: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.user) {
    // If no session (email confirmation required), return early
    if (!data.session) {
      throw new Error('Please check your email and confirm your account.');
    }

    // Try to create profile with a retry mechanism
    let retries = 3;
    while (retries > 0) {
      try {
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            username,
          },
        ]);

        if (!profileError) {
          break; // Success!
        }

        if (profileError && retries === 1) {
          console.error('Profile creation error:', profileError);
          throw new Error('Failed to create profile: ' + profileError.message);
        }
      } catch (err) {
        if (retries === 1) {
          throw err;
        }
      }

      retries--;
      await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms before retry
    }
  }

  return data;
}

// Sign in with email/password
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

// Listen to auth state changes (like Angular's auth guard)
export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
}
