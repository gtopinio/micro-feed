// 🔄 Post Composer Component
// Following Sina's recommended modular structure

'use client';

import { useState } from 'react';

interface ComposerProps {
  onPost: (content: string) => Promise<void>;
  isLoading?: boolean;
}

export function Composer({ onPost, isLoading = false }: ComposerProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const characterCount = content.length;
  const maxCharacters = 280;
  const isOverLimit = characterCount > maxCharacters;
  const isEmpty = content.trim().length === 0;

  const handleSubmit = async () => {
    if (isEmpty || isOverLimit || isSubmitting) return;

    console.log('🔄 Starting post submission...');
    setIsSubmitting(true);
    try {
      console.log('🔄 Calling onPost with content:', content.trim());
      await onPost(content.trim());
      console.log('✅ Post submitted successfully');
      setContent(''); // Clear the composer after successful post
    } catch (error) {
      console.error('❌ Failed to create post:', error);
      // Keep the content so user can retry
    } finally {
      console.log('🔄 Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6 mb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What's on your mind? (280 characters max)"
        className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
        rows={3}
        disabled={isLoading || isSubmitting}
      />
      <div className="flex justify-between items-center mt-4">
        <span
          className={`text-sm ${
            isOverLimit ? 'text-red-400' : 'text-slate-400'
          }`}
        >
          <i
            className={`fas ${isOverLimit ? 'fa-exclamation-triangle' : 'fa-info-circle'} mr-1`}
          ></i>
          {characterCount}/{maxCharacters}
        </span>
        <button
          onClick={handleSubmit}
          disabled={isEmpty || isOverLimit || isSubmitting || isLoading}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isEmpty || isOverLimit || isSubmitting || isLoading
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
              : 'bg-cyan-500 hover:bg-cyan-600 text-white'
          }`}
        >
          <i
            className={`fas ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'} mr-2`}
          ></i>
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>

      {/* Helpful hint */}
      <div className="mt-2 text-xs text-slate-500">
        <i className="fas fa-lightbulb mr-1"></i>
        Tip: Press Ctrl+Enter to post quickly
      </div>
    </div>
  );
}
