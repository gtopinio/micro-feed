// 🎨 Post Card Component with Beautiful Dark Theme
// Matching the design reference

import { Post } from '@/types/post';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, onLike, onEdit, onDelete }: PostCardProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:bg-slate-700/50 transition-colors">
      {/* Post Header */}
      <div className="flex items-center mb-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
          {post.author?.username?.[0]?.toUpperCase() || 'U'}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-white">
              {post.author?.username || 'Unknown User'}
            </h3>
            <span className="text-slate-400 text-sm">
              @{post.author?.username?.toLowerCase() || 'unknown'}
            </span>
            <span className="text-slate-500 text-sm">•</span>
            <span className="text-slate-400 text-sm">
              {new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-slate-100 text-base leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-600">
        <div className="flex items-center space-x-4">
          {/* Like Button */}
          <button
            onClick={() => onLike?.(post.id)}
            className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors group"
          >
            <div className="p-2 rounded-full group-hover:bg-cyan-500/10 transition-colors">
              <i
                className={`fas fa-heart ${post.is_liked ? 'text-red-500' : ''}`}
              ></i>
            </div>
            <span className="text-sm">{post.likes_count || 0}</span>
          </button>

          {/* Comment Button (placeholder) */}
          <button className="flex items-center space-x-2 text-slate-400 hover:text-blue-400 transition-colors group">
            <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
              <i className="fas fa-comment"></i>
            </div>
            <span className="text-sm">0</span>
          </button>

          {/* Share Button (placeholder) */}
          <button className="flex items-center space-x-2 text-slate-400 hover:text-green-400 transition-colors group">
            <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
              <i className="fas fa-share"></i>
            </div>
          </button>
        </div>

        {/* Owner Actions */}
        {post.is_owner && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit?.(post.id)}
              className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-full transition-colors"
              title="Edit post"
            >
              <i className="fas fa-edit"></i>
            </button>
            <button
              onClick={() => onDelete?.(post.id)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
              title="Delete post"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
