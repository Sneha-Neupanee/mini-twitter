import api from './axios';

export const getUserById = (id) => api.get(`/users/${id}`);
export const getUserByUsername = (username) => api.get(`/users/profile/${username}`);
export const updateProfile = (data) => api.put('/users/me', data);
export const searchUsers = (q, page = 0) => api.get('/users/search', { params: { q, page, size: 20 } });
export const followUser = (id) => api.post(`/users/${id}/follow`);
export const unfollowUser = (id) => api.delete(`/users/${id}/unfollow`);
export const getFollowers = (id) => api.get(`/users/${id}/followers`);
export const getFollowing = (id) => api.get(`/users/${id}/following`);
