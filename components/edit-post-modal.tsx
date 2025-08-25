// ✏️ Edit Post Modal Component
// Modal for editing existing posts with character limit

'use client';

import { useState, useEffect, useRef } from 'react';
import { Post } from '@/types/post';

interface EditPostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (postId: string, content: string) => Promise<void>;
}

export function EditPostModal({
  post,
  isOpen,
  onClose,
  onSave,
}: EditPostModalProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset content when post changes or modal opens
  useEffect(() => {
    if (isOpen && post) {
      setContent(post.content);
      setError(null);
      // Focus textarea after a brief delay to ensure modal is rendered
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(
          post.content.length,
          post.content.length
        );
      }, 100);
    }
  }, [isOpen, post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !content.trim() || content.trim() === post.content) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave(post.id, content.trim());
      onClose();
    } catch (error) {
      console.error('Error updating post:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to update post'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (post) {
      setContent(post.content);
    }
    setError(null);
    onClose();
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > 280;
  const hasChanges = post && content.trim() !== post.content;

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Edit Post</h2>
          <button
            onClick={handleCancel}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6">
            {/* Post Author Info */}
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                {post.author?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="font-medium text-white">
                  {post.author?.username || 'Unknown User'}
                </div>
                <div className="text-sm text-slate-400">
                  {new Date(post.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              maxLength={300} // Allow a bit over 280 to show error
            />

            {/* Character Counter */}
            <div className="flex justify-between items-center mt-3">
              <div className="text-sm text-slate-400">
                {post.updated_at && post.updated_at !== post.created_at && (
                  <span className="italic">
                    Last edited:{' '}
                    {new Date(post.updated_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`text-sm ${
                    isOverLimit
                      ? 'text-red-400'
                      : characterCount > 250
                        ? 'text-yellow-400'
                        : 'text-slate-400'
                  }`}
                >
                  {characterCount}/280
                </span>
                {/* Visual progress circle */}
                <div className="relative w-8 h-8">
                  <svg
                    className="w-8 h-8 transform -rotate-90"
                    viewBox="0 0 32 32"
                  >
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-slate-600"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className={`transition-all duration-300 ${
                        isOverLimit
                          ? 'stroke-red-500'
                          : characterCount > 250
                            ? 'stroke-yellow-500'
                            : 'stroke-cyan-500'
                      }`}
                      strokeDasharray={`${(characterCount / 280) * 87.96} 87.96`}
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-700 bg-slate-900/50">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !content.trim() || isOverLimit || !hasChanges || isSubmitting
              }
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
