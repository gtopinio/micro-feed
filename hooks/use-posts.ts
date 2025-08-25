// 🔄 This replaces Angular services with React hooks
// Instead of injecting PostService, you'll use: const { posts, loading } = usePosts()

'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/types/post';
import { getPosts, supabase } from '@/lib/db';

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check if user is authenticated first
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // If no user, don't try to fetch posts
        setPosts([]);
        return;
      }

      const posts = await getPosts();
      setPosts(posts);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    refetch: loadPosts,
  };
}

// 🔄 Similar to Angular's OnInit, but as a reusable hook
