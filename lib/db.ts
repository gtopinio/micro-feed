// 🔄 Supabase client setup
// This replaces Angular's HTTP services with direct database operations

import { createClient } from '@supabase/supabase-js';
import { Post } from '@/types/post';
import {
  PaginationParams,
  PaginationResult,
  createPaginationResult,
} from './pagination';

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
      profiles!posts_author_id_fkey(username),
      likes(user_id)
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
    // Calculate actual like count
    likes_count: post.likes ? post.likes.length : 0,
    // Check if current user has liked this post
    is_liked: post.likes
      ? post.likes.some(
          (like: { user_id: string }) => like.user_id === user?.id
        )
      : false,
    // Check if current user owns this post
    is_owner: user?.id === post.author_id,
  }));

  return transformedPosts;
}

// 🔄 Paginated version of getPosts for better performance
export async function getPostsPaginated(
  pagination: PaginationParams
): Promise<PaginationResult<Post>> {
  // Get current user for ownership checks
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // First, get the total count for pagination
  const { count, error: countError } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting posts:', countError);
    throw new Error('Failed to count posts');
  }

  // Then get the paginated posts with relations
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      *,
      profiles!posts_author_id_fkey(username),
      likes(user_id)
    `
    )
    .order('created_at', { ascending: false })
    .range(pagination.offset, pagination.offset + pagination.limit - 1);

  if (error) {
    console.error('Error fetching paginated posts:', error);
    throw new Error('Failed to fetch posts');
  }

  // Transform the data to match our Post interface (same logic as getPosts)
  const transformedPosts = (data || []).map((post) => ({
    ...post,
    author: post.profiles
      ? {
          id: post.author_id,
          username: post.profiles.username,
          created_at: new Date().toISOString(),
        }
      : undefined,
    likes_count: post.likes ? post.likes.length : 0,
    // Check if current user has liked this post
    is_liked: post.likes
      ? post.likes.some(
          (like: { user_id: string }) => like.user_id === user?.id
        )
      : false,
    // Check if current user owns this post
    is_owner: user?.id === post.author_id,
  }));

  return createPaginationResult(transformedPosts, count || 0, pagination);
}

// 🔄 Paginated version with filtering support
export async function getPostsPaginatedWithFilter(
  pagination: PaginationParams,
  filter: 'all' | 'my' = 'all',
  searchQuery?: string
): Promise<PaginationResult<Post>> {
  // Get current user for ownership checks
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Build query with conditional filtering
  let countQuery = supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });
  let dataQuery = supabase.from('posts').select(
    `
      *,
      profiles!posts_author_id_fkey(username),
      likes(user_id)
    `
  );

  // Apply user filter if needed
  if (filter === 'my' && user?.id) {
    countQuery = countQuery.eq('author_id', user.id);
    dataQuery = dataQuery.eq('author_id', user.id);
  }

  // Apply search filter if provided
  if (searchQuery && searchQuery.trim()) {
    const trimmedQuery = searchQuery.trim();
    // Search in post content (case-insensitive)
    countQuery = countQuery.ilike('content', `%${trimmedQuery}%`);
    dataQuery = dataQuery.ilike('content', `%${trimmedQuery}%`);
  }

  // Get the filtered count
  const { count, error: countError } = await countQuery;

  if (countError) {
    console.error('Error counting filtered posts:', countError);
    throw new Error('Failed to count posts');
  }

  // Get the paginated posts with the same filter
  const { data, error } = await dataQuery
    .order('created_at', { ascending: false })
    .range(pagination.offset, pagination.offset + pagination.limit - 1);

  if (error) {
    console.error('Error fetching filtered paginated posts:', error);
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
    likes_count: post.likes ? post.likes.length : 0,
    // Check if current user has liked this post
    is_liked: post.likes
      ? post.likes.some(
          (like: { user_id: string }) => like.user_id === user?.id
        )
      : false,
    // Check if current user owns this post
    is_owner: user?.id === post.author_id,
  }));

  return createPaginationResult(transformedPosts, count || 0, pagination);
}

// Get total count of all posts
export async function getPostsCount(): Promise<number> {
  const { count, error } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching posts count:', error);
    return 0;
  }

  return count || 0;
}

// Get count of posts by current user
export async function getMyPostsCount(): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return 0;
  }

  const { count, error } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', user.id);

  if (error) {
    console.error('Error fetching my posts count:', error);
    return 0;
  }

  return count || 0;
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
  console.log('🔄 Attempting to like post:', postId);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  console.log('🔄 Creating like for user:', user.id, 'and post:', postId);

  const { error } = await supabase.from('likes').insert([
    {
      post_id: postId,
      user_id: user.id,
    },
  ]);

  if (error) {
    console.error('❌ Error liking post:', error);
    throw new Error('Failed to like post');
  }

  console.log('✅ Successfully liked post');
}

export async function unlikePost(postId: string): Promise<void> {
  console.log('🔄 Attempting to unlike post:', postId);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  console.log('🔄 Deleting like for user:', user.id, 'and post:', postId);

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id);

  if (error) {
    console.error('❌ Error unliking post:', error);
    throw new Error('Failed to unlike post');
  }

  console.log('✅ Successfully unliked post');
}
