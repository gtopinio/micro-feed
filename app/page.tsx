// 🔄 Main Feed Page with Beautiful UI
// Matching the design reference with dark theme

'use client';

import { PostCard } from '@/components/post-card';
import { AuthForm } from '@/components/auth-form';
import { Composer } from '@/components/composer';
import { usePosts } from '@/hooks/use-posts';
import { useAuth } from '@/hooks/use-auth';
import { createPost } from '@/lib/db';

export default function HomePage() {
  const { posts, loading, error, refetch } = usePosts();
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
                onLike={(id) => console.log('Like post:', id)}
                onEdit={(id) => console.log('Edit post:', id)}
                onDelete={(id) => console.log('Delete post:', id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
