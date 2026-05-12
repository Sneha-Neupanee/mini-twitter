import { useState, useEffect, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import AppLayout from '../components/layout/AppLayout';
import PostCard from '../components/post/PostCard';
import CreatePostBox from '../components/post/CreatePostBox';
import { getHomeFeed, getRankedFeed } from '../api/feed';

const TABS = [
  { key: 'home', label: 'For You' },
  { key: 'ranked', label: 'Top Ranked' },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('home');
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async (pageNum, tab, reset = false) => {
    try {
      const fetcher = tab === 'home' ? getHomeFeed : getRankedFeed;
      const { data } = await fetcher(pageNum);
      const newPosts = data.content || [];
      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      setHasMore(!data.last);
      setPage(pageNum + 1);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setPosts([]);
    setPage(0);
    setHasMore(true);
    fetchPosts(0, activeTab, true);
  }, [activeTab, fetchPosts]);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900">Home</h1>
        </div>
        <div className="flex border-b border-gray-100">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-brand-700 border-b-2 border-brand-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Create post */}
      <CreatePostBox onPostCreated={handlePostCreated} />

      {/* Feed */}
      {loading ? (
        <FeedSkeleton />
      ) : posts.length === 0 ? (
        <EmptyFeed />
      ) : (
        <InfiniteScroll
          dataLength={posts.length}
          next={() => fetchPosts(page, activeTab)}
          hasMore={hasMore}
          loader={<LoadingSpinner />}
          endMessage={<EndMessage />}
        >
          {posts.map(post => (
            <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
          ))}
        </InfiniteScroll>
      )}
    </AppLayout>
  );
}

function EmptyFeed() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-3xl">🌱</span>
      </div>
      <h3 className="font-semibold text-gray-900 text-lg mb-2">Your feed is empty</h3>
      <p className="text-gray-500 text-sm">Follow some people to see their posts here, or create your first post!</p>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-0">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-4 py-4 border-b border-gray-100 animate-pulse">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full mb-1" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-6">
      <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function EndMessage() {
  return <p className="text-center text-xs text-gray-400 py-6">You're all caught up!</p>;
}
