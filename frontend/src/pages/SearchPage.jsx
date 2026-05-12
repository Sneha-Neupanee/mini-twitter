import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/common/Avatar';
import { searchUsers, followUser, unfollowUser } from '../api/users';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (initialQuery) doSearch(initialQuery);
  }, []);

  const doSearch = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const { data } = await searchUsers(q);
      setResults(data.content || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: query });
    doSearch(query);
  };

  const handleFollow = async (user) => {
    try {
      if (user.isFollowedByCurrentUser) {
        await unfollowUser(user.id);
        setResults(prev => prev.map(u => u.id === user.id
          ? { ...u, isFollowedByCurrentUser: false, followersCount: u.followersCount - 1 }
          : u));
      } else {
        await followUser(user.id);
        setResults(prev => prev.map(u => u.id === user.id
          ? { ...u, isFollowedByCurrentUser: true, followersCount: u.followersCount + 1 }
          : u));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <AppLayout>
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">Search People</h1>
      </div>

      <div className="px-4 py-4 border-b border-gray-100">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by username or bio..."
            className="input-field pl-10"
            autoFocus
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results.length === 0 && initialQuery ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-medium">No users found for "{initialQuery}"</p>
        </div>
      ) : (
        <div>
          {results.map(user => (
            <div
              key={user.id}
              className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 hover:bg-surface-muted transition-colors"
            >
              <div
                onClick={() => navigate(`/profile/${user.username}`)}
                className="cursor-pointer"
              >
                <Avatar username={user.username} avatarUrl={user.avatarUrl} size="md" />
              </div>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/profile/${user.username}`)}>
                <p className="font-semibold text-gray-900 text-sm">@{user.username}</p>
                {user.bio && <p className="text-xs text-gray-500 truncate">{user.bio}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{user.followersCount} followers</p>
              </div>
              {currentUser?.username !== user.username && (
                <button
                  onClick={() => handleFollow(user)}
                  className={user.isFollowedByCurrentUser ? 'btn-outline text-sm py-1.5' : 'btn-primary text-sm py-1.5'}
                >
                  {user.isFollowedByCurrentUser ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
