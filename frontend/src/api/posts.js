import api from './axios';

export const createPost = (data) => api.post('/posts', data);
export const getPost = (id) => api.get(`/posts/${id}`);
export const deletePost = (id) => api.delete(`/posts/${id}`);
export const getUserPosts = (userId, page = 0) => api.get(`/posts/user/${userId}`, { params: { page, size: 20 } });
export const repost = (id) => api.post(`/posts/${id}/repost`);
export const toggleLike = (id) => api.post(`/posts/${id}/like`);
export const addComment = (id, data) => api.post(`/posts/${id}/comment`, data);
export const getComments = (id, page = 0) => api.get(`/posts/${id}/comments`, { params: { page, size: 20 } });
