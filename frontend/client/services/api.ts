import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Token management
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email: string, password: string, role: 'admin' | 'user' = 'user', fullName: string = '') =>
    apiClient.post('/register/', { email, password, role, full_name: fullName }),
  
  login: (email: string, password: string, captchaId?: string, captchaAnswer?: number) =>
    apiClient.post('/login/', { 
      email, 
      password, 
      captcha_id: captchaId, 
      captcha_answer: captchaAnswer 
    }),
  
  getCaptcha: () =>
    apiClient.get('/captcha/'),

  verifyEmail: (email: string, code: string) =>
    apiClient.post('/verify-email/', { email, code }),

  forgotPassword: (email: string) =>
    apiClient.post('/forgot-password/', { email }),

  resetPassword: (data: any) =>
    apiClient.post('/reset-password/', data),
};

// Resources API
export const resourcesAPI = {
  upload: (formData: FormData) =>
    apiClient.post('/resources/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  getApproved: (page?: number, pageSize?: number) =>
    apiClient.get('/resources/', { params: { page, page_size: pageSize } }),
  
  search: (query: string) =>
    apiClient.get('/resources/', { params: { q: query } }),
  
  download: (resourceId: number) =>
    apiClient.post(`/resources/download/${resourceId}/`),
    
  // New Features
  getBookmarks: (page?: number, pageSize?: number) =>
    apiClient.get('/resources/bookmarks/', { params: { page, page_size: pageSize } }),
    
  toggleBookmark: (resourceId: number) =>
    apiClient.post(`/resources/${resourceId}/bookmark/`),
    
  getReviews: (resourceId: number) =>
    apiClient.get(`/resources/${resourceId}/reviews/`),
    
  postReview: (resourceId: number, rating: number, comment: string) =>
    apiClient.post(`/resources/${resourceId}/reviews/`, { rating, comment }),
    
  reportResource: (resourceId: number, reason: string) =>
    apiClient.post(`/resources/${resourceId}/report/`, { reason }),

  getResource: (resourceId: number) =>
    apiClient.get(`/resources/${resourceId}/`),
};

// Admin API
export const adminAPI = {
  getPendingResources: (page?: number, pageSize?: number) =>
    apiClient.get('/admin/resources/pending/', { params: { page, page_size: pageSize } }),
  
  approveResource: (resourceId: number) =>
    apiClient.post(`/admin/resources/${resourceId}/approve/`),
  
  rejectResource: (resourceId: number) =>
    apiClient.post(`/admin/resources/${resourceId}/reject/`),
  
  deleteResource: (resourceId: number) =>
    apiClient.delete(`/resources/${resourceId}/`),
  
  updateResource: (resourceId: number, data: any) =>
    apiClient.patch(`/resources/${resourceId}/`, data),
    
  getAnalytics: () =>
    apiClient.get('/admin/analytics/'),

  getUsers: () =>
    apiClient.get('/admin/users/'),
  
  deleteUser: (userId: number) =>
    apiClient.delete(`/admin/users/${userId}/`),
};

// Users API
export const usersAPI = {
  getProfile: (userId: number) =>
    apiClient.get(`/users/${userId}/`),
  toggleFollow: (userId: number) =>
    apiClient.post(`/users/${userId}/follow/`),
  updateProfile: (data: FormData) =>
    apiClient.patch('/me/update/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  updatePassword: (data: any) =>
    apiClient.patch('/me/password/', data),
  getUserHeatmap: (userId: number) =>
    apiClient.get(`/users/${userId}/heatmap/`),
  getNotifications: () =>
    apiClient.get('/notifications/'),
  getLeaderboard: () =>
    apiClient.get('/users/leaderboard/'),
  markNotificationsRead: (notificationId?: number) =>
    apiClient.patch('/notifications/mark-read/', { notification_id: notificationId }),
};

// Collections API
export const collectionsAPI = {
  getCollections: () => apiClient.get('/resources/collections/'),
  createCollection: (name: string, description: string = '', is_public: boolean = true) =>
    apiClient.post('/resources/collections/', { name, description, is_public }),
  getCollection: (id: number) => apiClient.get(`/resources/collections/${id}/`),
  addToCollection: (collectionId: number, resourceId: number) =>
    apiClient.post(`/resources/collections/${collectionId}/`, { resource_id: resourceId }),
  deleteCollection: (id: number) => apiClient.delete(`/resources/collections/${id}/`),
};

// Requests API
export const requestsAPI = {
  getRequests: (page?: number) => apiClient.get('/resources/requests/', { params: { page } }),
  createRequest: (title: string, description: string) =>
    apiClient.post('/resources/requests/', { title, description }),
  fulfillRequest: (requestId: number, resourceId: number) =>
    apiClient.post(`/resources/requests/${requestId}/fulfill/`, { resource_id: resourceId }),
  getPublicStats: () =>
    apiClient.get('/resources/public-stats/'),
  getMyStats: () =>
    apiClient.get('/resources/my-stats/'),
  suggestTags: (data: { title: string; description: string }) =>
    apiClient.post('/resources/suggest-tags/', data),
};

// Threads API
export const threadsAPI = {
  getThreads: (resourceId: number) => apiClient.get(`/resources/${resourceId}/threads/`),
  createThread: (resourceId: number, question: string) =>
    apiClient.post(`/resources/${resourceId}/threads/`, { question }),
  replyToThread: (threadId: number, reply: string) =>
    apiClient.post(`/resources/threads/${threadId}/reply/`, { reply }),
  deleteThread: (threadId: number) =>
    apiClient.delete(`/resources/threads/${threadId}/`),
  deleteReply: (replyId: number) =>
    apiClient.delete(`/resources/replies/${replyId}/`),
};

// Utility functions
export { getToken, setToken, removeToken };

export default apiClient;
