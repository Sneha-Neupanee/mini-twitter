import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserByUsername } from '../api/users';
import { getUserPosts } from '../api/posts';
import { followUser, unfollowUser } from '../api/users';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import PostCard from '../components/post/PostCard';
import Avatar from '../components/common/Avatar';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postLoading, setPostLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    setLoading(true);
    getUserByUsername(username)
      .then(r => setProfile(r.data))
      .catch(() => navigate('/home'))
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    if (!profile) return;
    setPostLoading(true);
    getUserPosts(profile.id)
      .then(r => setPosts(r.data.content || []))
      .finally(() => setPostLoading(false));
  }, [profile]);

  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (profile.isFollowedByCurrentUser) {
        await unfollowUser(profile.id);
        setProfile(p => ({
          ...p,
          isFollowedByCurrentUser: false,
          followersCount: p.followersCount - 1,
        }));
        toast.success(`Unfollowed @${profile.username}`);
      } else {
        await followUser(profile.id);
        setProfile(p => ({
          ...p,
          isFollowedByCurrentUser: true,
          followersCount: p.followersCount + 1,
        }));
        toast.success(`Following @${profile.username}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setFollowLoading(false);
    }
  };

  const isOwnProfile = currentUser?.username === username;

  if (loading) return <AppLayout><ProfileSkeleton /></AppLayout>;
  if (!profile) return null;

  return (
    <AppLayout>
      {/* Cover + Avatar */}
      <div className="h-36 bg-gradient-to-r from-brand-600 to-brand-800 relative">
        <div className="absolute -bottom-10 left-6">
          <Avatar
            username={profile.username}
            avatarUrl={profile.avatarUrl}
            size="xl"
            className="ring-4 ring-white shadow-lg"
          />
        </div>
      </div>

      {/* Profile info */}
      <div className="pt-14 px-6 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">@{profile.username}</h1>
            {profile.bio && (
              <p className="text-sm text-gray-600 mt-1 max-w-sm leading-relaxed">{profile.bio}</p>
            )}
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => navigate(`/profile/${username}/following`)}
                className="text-sm hover:underline"
              >
                <span className="font-bold text-gray-900">{profile.followingCount}</span>
                <span className="text-gray-500 ml-1">Following</span>
              </button>
              <button
                onClick={() => navigate(`/profile/${username}/followers`)}
                className="text-sm hover:underline"
              >
                <span className="font-bold text-gray-900">{profile.followersCount}</span>
                <span className="text-gray-500 ml-1">Followers</span>
              </button>
            </div>
          </div>

          {!isOwnProfile && (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={profile.isFollowedByCurrentUser ? 'btn-outline' : 'btn-primary'}
            >
              {followLoading ? '...' : profile.isFollowedByCurrentUser ? 'Following' : 'Follow'}
            </button>
          )}
          {isOwnProfile && (
            <button
              onClick={() => navigate('/settings')}
              className="btn-outline text-sm"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {['posts'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? 'text-brand-700 border-b-2 border-brand-600' : 'text-gray-500'
            }`}
          >
            Posts
          </button>
        ))}
      </div>

      {/* Posts */}
      {postLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-sm">No posts yet</p>
        </div>
      ) : (
        posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onDelete={id => setPosts(prev => prev.filter(p => p.id !== id))}
          />
        ))
      )}
    </AppLayout>
  );
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-36 bg-gray-200" />
      <div className="pt-14 px-6 pb-6">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}
