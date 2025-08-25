// 🔄 Main Feed Page with Beautiful UI
// Matching the design reference with dark theme

'use client';

import { PostCard } from '@/components/post-card';
import { AuthForm } from '@/components/auth-form';
import { usePosts } from '@/hooks/use-posts';
import { useAuthWithProfile } from '@/hooks/use-auth-with-profile';

export default function HomePage() {
  const { posts, loading, error, refetch } = usePosts();
  const {
    isAuthenticated,
    loading: authLoading,
    displayName,
  } = useAuthWithProfile();

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
          <div className="text-sm text-slate-400 flex items-center">
            <i className="fas fa-user-circle mr-2"></i>
            Welcome, {displayName}
          </div>
        </div>

        {/* Post Composer - TODO: Add later */}
        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6 mb-6">
          <textarea
            placeholder="What's on your mind? (280 characters max)"
            className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            rows={3}
            disabled
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-slate-400">
              <i className="fas fa-info-circle mr-1"></i>
              0/280
            </span>
            <button
              disabled
              className="bg-slate-600 text-slate-400 px-6 py-2 rounded-lg font-medium cursor-not-allowed"
            >
              <i className="fas fa-paper-plane mr-2"></i>
              Post
            </button>
          </div>
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
