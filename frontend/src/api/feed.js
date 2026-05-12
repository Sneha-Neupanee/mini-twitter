import api from './axios';

export const getHomeFeed = (page = 0) => api.get('/feed/home', { params: { page, size: 20 } });
export const getRankedFeed = (page = 0) => api.get('/feed/ranked', { params: { page, size: 20 } });
export const getTrending = (page = 0) => api.get('/feed/trending', { params: { page, size: 20 } });
