import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrending } from '../../api/feed';
import { searchUsers } from '../../api/users';
import { formatDistanceToNow } from 'date-fns';

export default function RightSidebar() {
  const [trending, setTrending] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getTrending().then(r => setTrending(r.data.content?.slice(0, 5) || [])).catch(() => {});
    searchUsers('a').then(r => setSuggestedUsers(r.data.content?.slice(0, 5) || [])).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <aside className="w-80 flex-shrink-0 space-y-5 py-6 pr-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder="Search people..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="input-field pl-10 pr-4"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </form>

      {/* Trending */}
      {trending.length > 0 && (
        <div className="card p-4">
          <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide text-brand-700">
            🔥 Trending Posts
          </h3>
          <div className="space-y-3">
            {trending.map(post => (
              <div
                key={post.id}
                onClick={() => navigate(`/post/${post.id}`)}
                className="cursor-pointer hover:bg-surface-hover rounded-lg p-2 -mx-2 transition-colors"
              >
                <p className="text-sm text-gray-800 line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>@{post.authorUsername}</span>
                  <span>❤️ {post.likesCount}</span>
                  <span>💬 {post.commentsCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Users */}
      {suggestedUsers.length > 0 && (
        <div className="card p-4">
          <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide text-brand-700">
            👥 Who to Follow
          </h3>
          <div className="space-y-3">
            {suggestedUsers.map(user => (
              <div
                key={user.id}
                onClick={() => navigate(`/profile/${user.username}`)}
                className="flex items-center gap-3 cursor-pointer hover:bg-surface-hover rounded-lg p-2 -mx-2 transition-colors"
              >
                <UserAvatar username={user.username} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">@{user.username}</p>
                  <p className="text-xs text-gray-500">{user.followersCount} followers</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

function UserAvatar({ username }) {
  const colors = ['#c0602a', '#a04b24', '#823d22', '#d4783a'];
  let hash = 0;
  for (let c of (username || '')) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
      style={{ backgroundColor: colors[Math.abs(hash) % colors.length] }}
    >
      {(username || 'U')[0].toUpperCase()}
    </div>
  );
}
