// 🔄 Main Feed Page with Beautiful UI
// Matching the design reference with dark theme

'use client';

import { useState } from 'react';
import { PostCard } from '@/components/post-card';
import { AuthForm } from '@/components/auth-form';
import { Composer } from '@/components/composer';
import { Pagination, PaginationInfo } from '@/components/pagination';
import { usePosts } from '@/hooks/use-posts';
import { usePostsPaginated } from '@/hooks/use-posts-paginated';
import { useAuth } from '@/hooks/use-auth';
import { createPost, likePost, unlikePost } from '@/lib/db';

export default function HomePage() {
  const [usePagination, setUsePagination] = useState(false);

  // Original posts hook (non-paginated)
  const originalPosts = usePosts();

  // Paginated posts hook
  const paginatedPosts = usePostsPaginated({
    initialLimit: 5, // Smaller limit for demo
    onPageChange: (page) => console.log('Page changed to:', page),
  });

  // Choose which data source to use
  const { posts, loading, error, refetch } = usePagination
    ? paginatedPosts
    : originalPosts;

  const {
    isAuthenticated,
    loading: authLoading,
    displayName,
    signOut,
  } = useAuth();

  // Handle post creation with optimistic updates
  const handleCreatePost = async (content: string) => {
    try {
      await createPost(content);
      // Refresh the posts after successful creation
      await refetch();
    } catch (error) {
      console.error('❌ handleCreatePost error:', error);
      throw error; // Re-throw so Composer can handle the error state
    }
  };

  // Handle like/unlike with optimistic updates
  const handleLikePost = async (postId: string) => {
    try {
      // Find the post to check current like status
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      console.log('🔄 Post like status before action:', {
        postId,
        is_liked: post.is_liked,
        likes_count: post.likes_count,
      });

      // Handle like/unlike based on current state
      if (post.is_liked) {
        console.log('🔄 Unliking post...');
        await unlikePost(postId);
        console.log('✅ Post unliked successfully');
      } else {
        console.log('🔄 Liking post...');
        await likePost(postId);
        console.log('✅ Post liked successfully');
      }

      // Refresh the posts to get accurate data from server
      await refetch();
    } catch (error) {
      console.error('❌ handleLikePost error:', error);
      // Refresh to revert any optimistic updates on error
      await refetch();
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show beautiful auth form if not authenticated
  if (!isAuthenticated) {
    return <AuthForm onSuccess={() => window.location.reload()} />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="text-red-400 mb-4 text-xl">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            Error: {error}
          </div>
          <button
            onClick={refetch}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <i className="fas fa-redo mr-2"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main feed view with loading state
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            <i className="fas fa-rss mr-3 text-cyan-500"></i>
            Micro Feed
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-400 flex items-center">
              <i className="fas fa-user-circle mr-2"></i>
              Welcome, {displayName}
            </div>

            {/* Pagination Toggle */}
            <button
              onClick={() => setUsePagination(!usePagination)}
              className={`text-sm px-3 py-1 rounded-lg transition-colors flex items-center ${
                usePagination
                  ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
              }`}
              title={usePagination ? 'Disable pagination' : 'Enable pagination'}
            >
              <i
                className={`fas ${usePagination ? 'fa-list' : 'fa-stream'} mr-1`}
              ></i>
              {usePagination ? 'Paginated' : 'All Posts'}
            </button>

            <button
              onClick={signOut}
              className="text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white px-3 py-1 rounded-lg transition-colors flex items-center"
              title="Sign out"
            >
              <i className="fas fa-sign-out-alt mr-1"></i>
              Sign Out
            </button>
          </div>
        </div>

        {/* Post Composer */}
        <Composer onPost={handleCreatePost} isLoading={loading} />

        {/* Posts List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4 mx-auto mb-3"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-8 text-center">
              <i className="fas fa-comments text-slate-600 text-4xl mb-4"></i>
              <p className="text-slate-400 text-lg">
                No posts yet. Be the first to post!
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLikePost}
                onEdit={(id) => console.log('Edit post:', id)}
                onDelete={(id) => console.log('Delete post:', id)}
              />
            ))
          )}
        </div>

        {/* Pagination Controls - Only show when pagination is enabled */}
        {usePagination && paginatedPosts.pagination && (
          <div className="mt-8 space-y-4">
            {/* Pagination Info */}
            <PaginationInfo
              currentPage={paginatedPosts.pagination.currentPage}
              totalPages={paginatedPosts.pagination.totalPages}
              totalItems={paginatedPosts.pagination.totalItems}
              limit={paginatedPosts.pagination.limit}
              className="text-center"
            />

            {/* Pagination Controls */}
            <Pagination
              currentPage={paginatedPosts.pagination.currentPage}
              totalPages={paginatedPosts.pagination.totalPages}
              onPageChange={paginatedPosts.setPage}
              loading={loading}
              className="mt-4"
            />
          </div>
        )}
      </div>
    </div>
  );
}
