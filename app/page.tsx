// 🔄 Main Feed Page with Beautiful UI
// Matching the design reference with dark theme

'use client';

import { useState, useMemo, useEffect } from 'react';
import { PostCard } from '@/components/post-card';
import { AuthForm } from '@/components/auth-form';
import { Composer } from '@/components/composer';
import { Toolbar } from '@/components/toolbar';
import { FilterTabs, FilterType } from '@/components/filter-tabs';
import { Pagination, PaginationInfo } from '@/components/pagination';
import { usePosts } from '@/hooks/use-posts';
import { usePostsPaginated } from '@/hooks/use-posts-paginated';
import { usePostCounts } from '@/hooks/use-post-counts';
import { useAuth } from '@/hooks/use-auth';
import { createPost, likePost, unlikePost } from '@/lib/db';

export default function HomePage() {
  const [usePagination, setUsePagination] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // Original posts hook (non-paginated)
  const originalPosts = usePosts();

  // Paginated posts hook
  const paginatedPosts = usePostsPaginated(
    {
      initialLimit: 5, // Smaller limit for demo
      onPageChange: (page) => console.log('Page changed to:', page),
    },
    activeFilter === 'my-posts' ? 'my' : 'all',
    searchQuery
  );

  // Choose which data source to use
  const { posts, loading, error, refetch } = usePagination
    ? paginatedPosts
    : originalPosts;

  const {
    user,
    isAuthenticated,
    loading: authLoading,
    displayName,
    signOut,
  } = useAuth();

  // Get accurate post counts
  const {
    allPostsCount,
    myPostsCount,
    refetch: refetchCounts,
  } = usePostCounts();

  // Filter and search posts
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // In paginated mode, filtering and search is handled at the database level
    if (usePagination) {
      return posts; // No client-side filtering needed
    }

    // For non-paginated mode, apply client-side filtering
    // Apply filter (All Posts vs My Posts)
    if (activeFilter === 'my-posts' && user) {
      filtered = posts.filter((post) => post.author_id === user.id);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.content.toLowerCase().includes(query) ||
          post.author?.username?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [posts, activeFilter, searchQuery, user, usePagination]);

  // Reset to first page when search query changes in paginated mode
  useEffect(() => {
    if (usePagination && paginatedPosts.setPage) {
      paginatedPosts.setPage(1);
    }
  }, [searchQuery, usePagination, paginatedPosts]);

  // Handle post creation with optimistic updates
  const handleCreatePost = async (content: string) => {
    try {
      await createPost(content);
      // Refresh both posts and counts after successful creation
      await refetch();
      await refetchCounts();
      // Close the composer after successful post creation
      setIsComposerOpen(false);
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

  // Main feed view with new layout
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top Navigation Toolbar */}
      <Toolbar
        displayName={displayName}
        onSignOut={signOut}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onComposeToggle={() => setIsComposerOpen(!isComposerOpen)}
        isComposerOpen={isComposerOpen}
      />

      {/* Filter Tabs */}
      <FilterTabs
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        myPostsCount={myPostsCount}
        allPostsCount={allPostsCount}
      />

      {/* Main Content Area */}
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Post Composer - Conditionally rendered */}
        {isComposerOpen && (
          <Composer
            onPost={handleCreatePost}
            isLoading={loading}
            onCancel={() => setIsComposerOpen(false)}
            showCancelButton={true}
          />
        )}

        {/* Pagination Toggle (Developer Tool) */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setUsePagination(!usePagination)}
            className={`text-xs px-3 py-1 rounded-lg transition-colors flex items-center ${
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
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4 mx-auto mb-3"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-8 text-center">
              <i className="fas fa-search text-slate-600 text-4xl mb-4"></i>
              {searchQuery ? (
                <div>
                  <p className="text-slate-400 text-lg mb-2">
                    No posts found for &quot;{searchQuery}&quot;
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Clear search
                  </button>
                </div>
              ) : activeFilter === 'my-posts' ? (
                <p className="text-slate-400 text-lg">
                  You haven&apos;t posted anything yet. Create your first post!
                </p>
              ) : (
                <p className="text-slate-400 text-lg">
                  No posts yet. Be the first to post!
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Search/Filter Results Info */}
              {(searchQuery || activeFilter === 'my-posts') && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <div>
                      {searchQuery && (
                        <span>
                          <i className="fas fa-search mr-1"></i>
                          Found {filteredPosts.length} result
                          {filteredPosts.length !== 1 ? 's' : ''} for &quot;
                          {searchQuery}&quot;
                        </span>
                      )}
                      {activeFilter === 'my-posts' && !searchQuery && (
                        <span>
                          <i className="fas fa-user mr-1"></i>
                          Showing your {filteredPosts.length} post
                          {filteredPosts.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Posts */}
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLikePost}
                  onEdit={(id) => console.log('Edit post:', id)}
                  onDelete={(id) => console.log('Delete post:', id)}
                />
              ))}
            </>
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
