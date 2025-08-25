// 🔄 Supabase client setup
// This replaces Angular's HTTP services with direct database operations

import { createClient } from '@supabase/supabase-js';
import { Post } from '@/types/post';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// 🔄 Database functions (like Angular services but simpler)
// Instead of Angular's: this.postService.getPosts()
// We have: await getPosts()

export async function getPosts(): Promise<Post[]> {
  // Get current user for ownership checks
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      *,
      profiles!posts_author_id_fkey(username)
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    throw new Error('Failed to fetch posts');
  }

  // Transform the data to match our Post interface
  const transformedPosts = (data || []).map((post) => ({
    ...post,
    author: post.profiles
      ? {
          id: post.author_id,
          username: post.profiles.username,
          created_at: new Date().toISOString(),
        }
      : undefined,
    likes_count: 0, // We'll calculate this later
    is_liked: false,
    // Check if current user owns this post
    is_owner: user?.id === post.author_id,
  }));

  return transformedPosts;
}

export async function createPost(content: string): Promise<Post> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('posts')
    .insert([
      {
        content,
        author_id: user.id,
      },
    ])
    .select(
      `
      *,
      profiles!posts_author_id_fkey(username)
    `
    )
    .single();

  if (error) {
    console.error('❌ Error creating post:', error);
    throw new Error(`Failed to create post: ${error.message}`);
  } // Transform the data to match our Post interface (same as getPosts)
  const transformedPost = {
    ...data,
    author: data.profiles
      ? {
          id: data.author_id,
          username: data.profiles.username,
          created_at: new Date().toISOString(),
        }
      : undefined,
    likes_count: 0,
    is_liked: false,
    is_owner: true, // User just created this post
  };

  return transformedPost;
}

export async function likePost(postId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase.from('likes').insert([
    {
      post_id: postId,
      user_id: user.id,
    },
  ]);

  if (error) {
    console.error('Error liking post:', error);
    throw new Error('Failed to like post');
  }
}

export async function unlikePost(postId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error unliking post:', error);
    throw new Error('Failed to unlike post');
  }
}
