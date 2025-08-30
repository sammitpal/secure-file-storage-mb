import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// API Configuration - Update this to your backend URL
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001/api' 
  : 'https://your-production-api.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Token management
const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'currentUser';

// Get auth token from secure storage
const getAuthToken = async () => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Set auth token in secure storage
const setAuthToken = async (token) => {
  try {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

// Get refresh token
const getRefreshToken = async () => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

// Set refresh token
const setRefreshToken = async (token) => {
  try {
    if (token) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error setting refresh token:', error);
  }
};

// Get current user
const getCurrentUser = async () => {
  try {
    const userStr = await SecureStore.getItemAsync(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Set current user
const setCurrentUser = async (user) => {
  try {
    if (user) {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } else {
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  } catch (error) {
    console.error('Error setting current user:', error);
  }
};

// Clear all auth data
const clearAuthData = async () => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

// Request interceptor to add authentication token
api.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;
      
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: refreshToken
          });
          
          if (response.data.success && response.data.data.accessToken) {
            await setAuthToken(response.data.data.accessToken);
            if (response.data.data.refreshToken) {
              await setRefreshToken(response.data.data.refreshToken);
            }
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          await clearAuthData();
        }
      } else {
        await clearAuthData();
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success && response.data.data) {
      await setAuthToken(response.data.data.accessToken);
      await setRefreshToken(response.data.data.refreshToken);
      await setCurrentUser(response.data.data.user);
    }
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success && response.data.data) {
      await setAuthToken(response.data.data.accessToken);
      await setRefreshToken(response.data.data.refreshToken);
      await setCurrentUser(response.data.data.user);
    }
    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.log('Logout API call failed, clearing local data anyway');
    } finally {
      await clearAuthData();
    }
    return { success: true };
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/me');
    if (response.data.success && response.data.data.user) {
      await setCurrentUser(response.data.data.user);
    }
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');
    
    const response = await api.post('/auth/refresh', { refreshToken });
    if (response.data.success && response.data.data) {
      await setAuthToken(response.data.data.accessToken);
      if (response.data.data.refreshToken) {
        await setRefreshToken(response.data.data.refreshToken);
      }
    }
    return response.data;
  }
};

// Files API
export const filesApi = {
  // Upload file
  uploadFile: async (fileUri, fileName, folderPath = '', onProgress) => {
    const formData = new FormData();
    formData.append('files', {
      uri: fileUri,
      type: 'application/octet-stream',
      name: fileName,
    });
    
    if (folderPath) {
      formData.append('folderPath', folderPath);
    }

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes for uploads
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    });
    
    return response.data;
  },

  // List files and folders
  listFiles: async (folderPath = '') => {
    const params = {};
    if (folderPath) {
      params.path = folderPath;
    }
    const response = await api.get('/files/list', { params });
    return response.data;
  },

  // Get download URL
  getDownloadUrl: async (fileKey) => {
    const response = await api.get(`/files/download/${encodeURIComponent(fileKey)}`);
    return response.data;
  },

  // Delete file
  deleteFile: async (fileKey) => {
    const response = await api.delete(`/files/${encodeURIComponent(fileKey)}`);
    return response.data;
  },

  // Get file info
  getFileInfo: async (fileKey) => {
    const response = await api.get(`/files/info/${encodeURIComponent(fileKey)}`);
    return response.data;
  },

  // Share file
  shareFile: async (fileId) => {
    const response = await api.post(`/files/share/${fileId}`);
    return response.data;
  },

  // Get shared files
  getSharedFiles: async () => {
    const response = await api.get('/files/shares');
    return response.data;
  }
};

// Folders API
export const foldersApi = {
  // Create folder
  createFolder: async (name, path = '') => {
    const response = await api.post('/folders/create', { name, path });
    return response.data;
  },

  // List folders
  listFolders: async (path = '') => {
    const params = {};
    if (path) {
      params.path = path;
    }
    const response = await api.get('/folders/list', { params });
    return response.data;
  },

  // Delete folder
  deleteFolder: async (folderPath) => {
    const response = await api.delete(`/folders/${encodeURIComponent(folderPath)}`);
    return response.data;
  },

  // Get folder info
  getFolderInfo: async (folderPath) => {
    const response = await api.get(`/folders/info/${encodeURIComponent(folderPath)}`);
    return response.data;
  }
};

// Export utility functions
export {
  getAuthToken,
  setAuthToken,
  getCurrentUser,
  setCurrentUser,
  clearAuthData
}; 