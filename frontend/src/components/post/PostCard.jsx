import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { toggleLike, repost, deletePost } from '../../api/posts';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import toast from 'react-hot-toast';

export default function PostCard({ post: initialPost, onDelete }) {
  const [post, setPost] = useState(initialPost);
  const [isLiking, setIsLiking] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);
    try {
      const { data } = await toggleLike(post.id);
      setPost(prev => ({
        ...prev,
        likedByCurrentUser: data.liked,
        likesCount: data.liked ? prev.likesCount + 1 : prev.likesCount - 1,
      }));
    } catch {
      toast.error('Failed to like post');
    } finally {
      setIsLiking(false);
    }
  };

  const handleRepost = async (e) => {
    e.stopPropagation();
    try {
      await repost(post.id);
      setPost(prev => ({ ...prev, repostsCount: prev.repostsCount + 1 }));
      toast.success('Reposted!');
    } catch {
      toast.error('Failed to repost');
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm('Delete this post?')) return;
    try {
      await deletePost(post.id);
      onDelete?.(post.id);
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const timeAgo = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : '';

  const isOwner = user?.userId === post.authorId;

  return (
    <article
      className="px-4 py-4 border-b border-gray-100 hover:bg-surface-muted transition-colors cursor-pointer"
      onClick={() => navigate(`/post/${post.id}`)}
    >
      {post.repost && (
        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          <RepeatIcon className="w-3 h-3" /> Reposted
        </p>
      )}
      <div className="flex gap-3">
        <div onClick={e => { e.stopPropagation(); navigate(`/profile/${post.authorUsername}`); }}>
          <Avatar username={post.authorUsername} avatarUrl={post.authorAvatarUrl} size="md" className="cursor-pointer hover:opacity-80" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <button
                onClick={e => { e.stopPropagation(); navigate(`/profile/${post.authorUsername}`); }}
                className="font-semibold text-gray-900 hover:underline text-sm"
              >
                @{post.authorUsername}
              </button>
              <span className="text-xs text-gray-400">{timeAgo}</span>
            </div>
            {isOwner && (
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="mt-1 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
            {post.content}
          </p>

          {/* Engagement row */}
          <div className="flex items-center gap-6 mt-3">
            <EngagementBtn
              icon={<HeartIcon filled={post.likedByCurrentUser} />}
              count={post.likesCount}
              onClick={handleLike}
              active={post.likedByCurrentUser}
              activeColor="text-red-500"
            />
            <EngagementBtn
              icon={<CommentIcon />}
              count={post.commentsCount}
              onClick={e => { e.stopPropagation(); navigate(`/post/${post.id}`); }}
            />
            <EngagementBtn
              icon={<RepeatIcon className="w-4 h-4" />}
              count={post.repostsCount}
              onClick={handleRepost}
            />
            <div className="text-xs text-gray-400 ml-auto">
              Score: {post.engagementScore?.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function EngagementBtn({ icon, count, onClick, active, activeColor = 'text-brand-600' }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 text-xs ${active ? activeColor : 'text-gray-500 hover:text-brand-600'} hover:scale-110 transition-all`}
    >
      {icon}
      <span>{count}</span>
    </button>
  );
}

function HeartIcon({ filled }) {
  return filled ? (
    <svg className="w-4 h-4 fill-red-500 text-red-500" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"/>
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}
function CommentIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
function RepeatIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  );
}
function TrashIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}
