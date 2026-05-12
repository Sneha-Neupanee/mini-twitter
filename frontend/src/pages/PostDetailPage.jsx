import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { getPost, getComments, addComment, toggleLike, repost, deletePost } from '../api/posts';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/common/Avatar';
import toast from 'react-hot-toast';

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getPost(id), getComments(id)])
      .then(([p, c]) => {
        setPost(p.data);
        setComments(c.data.content || []);
      })
      .catch(() => navigate('/home'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    try {
      const { data } = await toggleLike(post.id);
      setPost(prev => ({
        ...prev,
        likedByCurrentUser: data.liked,
        likesCount: data.liked ? prev.likesCount + 1 : prev.likesCount - 1,
      }));
    } catch { toast.error('Failed'); }
  };

  const handleRepost = async () => {
    try {
      await repost(post.id);
      setPost(prev => ({ ...prev, repostsCount: prev.repostsCount + 1 }));
      toast.success('Reposted!');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await deletePost(post.id);
      navigate('/home');
    } catch { toast.error('Failed'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const { data } = await addComment(post.id, { text: commentText.trim() });
      setComments(prev => [data, ...prev]);
      setPost(prev => ({ ...prev, commentsCount: prev.commentsCount + 1 }));
      setCommentText('');
    } catch { toast.error('Failed to comment'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <AppLayout>
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </AppLayout>
  );

  if (!post) return null;

  const isOwner = currentUser?.userId === post.authorId;

  return (
    <AppLayout>
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost p-1.5">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">Post</h1>
      </div>

      {/* Post body */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex gap-3">
          <Avatar username={post.authorUsername} avatarUrl={post.authorAvatarUrl} size="md" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(`/profile/${post.authorUsername}`)}
                className="font-semibold text-gray-900 hover:underline text-sm"
              >
                @{post.authorUsername}
              </button>
              {isOwner && (
                <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 p-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-base text-gray-800 mt-2 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            <p className="text-xs text-gray-400 mt-3">
              {post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
          <span><b className="text-gray-900">{post.likesCount}</b> Likes</span>
          <span><b className="text-gray-900">{post.commentsCount}</b> Comments</span>
          <span><b className="text-gray-900">{post.repostsCount}</b> Reposts</span>
        </div>

        {/* Actions */}
        <div className="flex gap-6 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm transition-all ${post.likedByCurrentUser ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
          >
            {post.likedByCurrentUser ? '❤️' : '🤍'} Like
          </button>
          <button onClick={handleRepost} className="text-gray-500 hover:text-brand-600 text-sm">
            🔁 Repost
          </button>
        </div>
      </div>

      {/* Add comment */}
      <div className="px-4 py-3 border-b border-gray-100">
        <form onSubmit={handleComment} className="flex gap-3">
          <Avatar username={currentUser?.username} size="sm" />
          <div className="flex-1">
            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Write a reply..."
              maxLength={500}
              className="w-full text-sm border-0 focus:outline-none bg-transparent placeholder-gray-400 py-2"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!commentText.trim() || submitting}
                className="btn-primary text-xs py-1.5 px-4"
              >
                {submitting ? '...' : 'Reply'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Comments */}
      {comments.map(comment => (
        <div key={comment.id} className="flex gap-3 px-4 py-3 border-b border-gray-50">
          <Avatar username={comment.authorUsername} avatarUrl={comment.authorAvatarUrl} size="sm" />
          <div>
            <div className="flex items-baseline gap-2">
              <button
                onClick={() => navigate(`/profile/${comment.authorUsername}`)}
                className="text-sm font-semibold text-gray-900 hover:underline"
              >
                @{comment.authorUsername}
              </button>
              <span className="text-xs text-gray-400">
                {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : ''}
              </span>
            </div>
            <p className="text-sm text-gray-700 mt-0.5">{comment.text}</p>
          </div>
        </div>
      ))}
    </AppLayout>
  );
}
