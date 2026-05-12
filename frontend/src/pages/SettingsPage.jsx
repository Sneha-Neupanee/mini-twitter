import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/users';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/common/Avatar';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ bio: '', avatarUrl: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
      navigate(`/profile/${user?.username}`);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout hideRightSidebar>
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost p-1.5">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">Edit Profile</h1>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex justify-center mb-8">
          <Avatar username={user?.username} size="xl" />
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Tell people about yourself..."
              rows={3}
              maxLength={300}
              className="input-field resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{300 - form.bio.length} characters remaining</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Avatar URL</label>
            <input
              type="url"
              value={form.avatarUrl}
              onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))}
              placeholder="https://example.com/avatar.jpg"
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full py-3"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
