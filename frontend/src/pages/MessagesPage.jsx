import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { getConversations, getConversation, sendMessage } from '../api/messages';
import { searchUsers } from '../api/users';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/common/Avatar';
import toast from 'react-hot-toast';

export default function MessagesPage() {
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getConversations().then(r => setConversations(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    setLoadingMessages(true);
    getConversation(selectedUserId)
      .then(r => setMessages(r.data || []))
      .finally(() => setLoadingMessages(false));
  }, [selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const currentUsername = currentUser?.username;
  const currentUserId = currentUser?.userId;

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    try {
      const { data } = await searchUsers(q);
      setSearchResults(data.content?.slice(0, 6) || []);
    } catch { setSearchResults([]); }
  };

  const openConversation = (user) => {
    setSelectedUserId(user.id);
    setSelectedUser(user);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || sending || !selectedUserId) return;
    setSending(true);
    try {
      const { data } = await sendMessage({ receiverId: selectedUserId, content: messageText.trim() });
      setMessages(prev => [...prev, data]);
      setMessageText('');

      setConversations(prev => {
        const exists = prev.find(c => c.userId === selectedUserId);
        if (exists) {
          return prev.map(c => c.userId === selectedUserId ? { ...c, lastMessage: data } : c);
        }
        return [{ userId: selectedUserId, username: selectedUser?.username, avatarUrl: selectedUser?.avatarUrl, lastMessage: data, unreadCount: 0 }, ...prev];
      });
    } catch { toast.error('Failed to send message'); }
    finally { setSending(false); }
  };

  return (
    <AppLayout hideRightSidebar>
      <div className="flex h-screen">
        {/* Conversations list */}
        <div className="w-80 border-r border-gray-100 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <h1 className="text-lg font-bold text-gray-900 mb-2">Messages</h1>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search people..."
                className="input-field pl-9 text-sm"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            {searchResults.length > 0 && (
              <div className="absolute z-50 mt-1 w-72 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {searchResults.map(user => (
                  <div
                    key={user.id}
                    onClick={() => openConversation(user)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-muted cursor-pointer"
                  >
                    <Avatar username={user.username} size="sm" />
                    <span className="text-sm font-medium">@{user.username}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm px-4">
                <p className="text-3xl mb-2">💬</p>
                <p>No conversations yet. Search for someone to message!</p>
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.userId}
                  onClick={() => openConversation({ id: conv.userId, username: conv.username, avatarUrl: conv.avatarUrl })}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors ${
                    selectedUserId === conv.userId ? 'bg-brand-50' : 'hover:bg-surface-muted'
                  }`}
                >
                  <Avatar username={conv.username} avatarUrl={conv.avatarUrl} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-gray-900">@{conv.username}</p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-brand-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-xs text-gray-500 truncate">{conv.lastMessage.content}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat window */}
        {selectedUser ? (
          <div className="flex-1 flex flex-col min-h-0 bg-white">
            {/* Chat header */}
            <div className="sticky top-0 z-10 px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3 bg-white/95 backdrop-blur">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar username={selectedUser.username} avatarUrl={selectedUser.avatarUrl} size="md" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    Chat with <span className="text-gray-900">@{selectedUser.username}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 bg-surface-muted">
              {loadingMessages ? (
                <div className="flex justify-center py-10">
                  <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  <p>Start the conversation!</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMe =
                    (msg.senderId != null && currentUserId != null && msg.senderId === currentUserId) ||
                    (msg.senderUsername && currentUsername && msg.senderUsername === currentUsername);

                  const otherUsername =
                    msg.senderUsername ||
                    (isMe ? currentUsername : selectedUser.username) ||
                    'user';

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] sm:max-w-[70%]`}>
                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                          <span className={`text-[11px] font-medium ${
                            isMe ? 'text-brand-700' : 'text-gray-600'
                          }`}>
                            {isMe ? 'You' : `@${otherUsername}`}
                          </span>
                        </div>

                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm border ${
                            isMe
                              ? 'bg-brand-50 text-gray-900 border-brand-100 rounded-br-sm'
                              : 'bg-white text-gray-900 border-gray-100 rounded-bl-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            isMe ? 'text-brand-700/70' : 'text-gray-500'
                          }`}>
                            {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="sticky bottom-0 px-4 py-3 border-t border-gray-100 bg-white flex gap-3">
              <input
                type="text"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Type a message..."
                maxLength={1000}
                className="input-field flex-1 py-2.5"
              />
              <button
                type="submit"
                disabled={!messageText.trim() || sending}
                className="btn-primary px-5"
              >
                {sending ? '...' : 'Send'}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-surface-muted border border-gray-100 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 0 1-4-.8L3 20l1.2-3.2A7.53 7.53 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" />
                </svg>
              </div>
              <p className="font-medium text-gray-600">Select a conversation</p>
              <p className="text-sm mt-1">or search for someone to message</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
