import { useState } from 'react';
import { createPost } from '../../api/posts';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import toast from 'react-hot-toast';

export default function CreatePostBox({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      const { data } = await createPost({ content: content.trim() });
      setContent('');
      onPostCreated?.(data);
      toast.success('Posted!');
    } catch {
      toast.error('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = 280 - content.length;

  return (
    <div className="px-4 py-4 border-b border-gray-100">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Avatar username={user?.username} size="md" />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's happening?"
            maxLength={280}
            rows={3}
            className="w-full resize-none text-base text-gray-900 placeholder-gray-400 border-0 focus:outline-none bg-transparent leading-relaxed"
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <span className={`text-xs ${remaining < 20 ? 'text-red-500' : 'text-gray-400'}`}>
              {remaining} characters left
            </span>
            <button
              type="submit"
              disabled={!content.trim() || submitting || content.length > 280}
              className="btn-primary text-sm py-1.5 px-5"
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
