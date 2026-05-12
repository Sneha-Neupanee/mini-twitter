import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import PostCard from '../components/post/PostCard';
import { getTrending } from '../api/feed';

export default function TrendingPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrending()
      .then(r => setPosts(r.data.content || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">🔥 Trending</h1>
        <p className="text-xs text-gray-500 mt-0.5">Posts ranked by engagement score</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📊</p>
          <p className="font-medium">Nothing trending yet</p>
          <p className="text-sm mt-1">Be the first to post something!</p>
        </div>
      ) : (
        <div>
          {posts.map((post, idx) => (
            <div key={post.id} className="relative">
              <div className="absolute left-4 top-4 w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center z-10">
                <span className="text-xs font-bold text-brand-700">#{idx + 1}</span>
              </div>
              <div className="pl-8">
                <PostCard post={post} />
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
