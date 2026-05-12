import api from './axios';

export const sendMessage = (data) => api.post('/messages', data);
export const getConversation = (userId) => api.get(`/messages/${userId}`);
export const getConversations = () => api.get('/messages/conversations');
