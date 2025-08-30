import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getApiBaseUrl, testNetworkConnection, debugNetworkConfig } from './networkConfig';

// API Configuration
const API_BASE_URL = getApiBaseUrl();

// Debug network configuration on app start
if (__DEV__) {
  console.log('🚀 Initializing API service...');
  debugNetworkConfig();
}

// Network error helper
const isNetworkError = (error) => {
  return !error.response && (
    error.code === 'NETWORK_ERROR' ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ENOTFOUND' ||
    error.code === 'ECONNABORTED' ||
    error.message?.includes('Network Error') ||
    error.message?.includes('timeout') ||
    error.message?.includes('connect ECONNREFUSED') ||
    error.message?.includes('connect ETIMEDOUT')
  );
};

// Enhanced error handler
const handleApiError = (error, context = '') => {
  if (__DEV__) {
    console.error(`🚨 API Error ${context}:`, {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method
    });
  }

  if (isNetworkError(error)) {
    const networkError = new Error('Network connection failed. Please check your internet connection and backend server.');
    networkError.isNetworkError = true;
    networkError.originalError = error;
    networkError.troubleshooting = [
      '1. Make sure your backend server is running',
      '2. Check your network configuration in networkConfig.js',
      '3. Verify your machine\'s IP address is correct',
      '4. Test the connection from your browser first'
    ];
    return networkError;
  }

  return error;
};

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Add retry configuration
  retry: 3,
  retryDelay: 1000,
});

// Add request logging in development
if (__DEV__) {
  api.interceptors.request.use(
    (config) => {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
        baseURL: config.baseURL,
        headers: config.headers,
        data: config.data ? 'Data present' : 'No data'
      });
      return config;
    },
    (error) => {
      console.error('📤 Request Error:', error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      console.log(`📥 ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
      return response;
    },
    (error) => {
      console.error(`📥 Response Error:`, {
        status: error.response?.status,
        message: error.message,
        url: error.config?.url
      });
      return Promise.reject(error);
    }
  );
}

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
      if (__DEV__) {
        console.log(`🔐 Adding auth token to ${config.method?.toUpperCase()} ${config.url}`, {
          tokenLength: token.length,
          tokenPreview: token.substring(0, 20) + '...'
        });
      }
    } else {
      if (__DEV__) {
        console.log(`⚠️ No auth token found for ${config.method?.toUpperCase()} ${config.url}`);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(handleApiError(error, 'Request'));
  }
);

// Response interceptor to handle auth errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const handledError = handleApiError(error, 'Response');
    
    // Handle network errors specifically
    if (handledError.isNetworkError) {
      return Promise.reject(handledError);
    }

    const originalRequest = error.config;
    
    // Handle 401 errors with detailed logging
    if (error.response?.status === 401) {
      if (__DEV__) {
        console.error('🚨 401 Unauthorized Error:', {
          url: originalRequest.url,
          method: originalRequest.method,
          hasAuthHeader: !!originalRequest.headers.Authorization,
          authHeaderPreview: originalRequest.headers.Authorization?.substring(0, 30) + '...',
          responseData: error.response.data,
          isRetry: originalRequest._retry
        });
      }
      
      if (!originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
        originalRequest._retry = true;
        
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          try {
            if (__DEV__) {
              console.log('🔄 Attempting token refresh...');
            }
            
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken: refreshToken
            });
            
            if (response.data.success && response.data.data.accessToken) {
              await setAuthToken(response.data.data.accessToken);
              if (response.data.data.refreshToken) {
                await setRefreshToken(response.data.data.refreshToken);
              }
              
              if (__DEV__) {
                console.log('✅ Token refresh successful, retrying original request');
              }
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            await clearAuthData();
            
            // Add a flag to indicate auth failure
            const authError = new Error('Authentication expired. Please login again.');
            authError.isAuthError = true;
            authError.requiresLogin = true;
            return Promise.reject(authError);
          }
        } else {
          if (__DEV__) {
            console.log('❌ No refresh token available, clearing auth data');
          }
          await clearAuthData();
          
          // Add a flag to indicate auth failure
          const authError = new Error('No authentication token. Please login again.');
          authError.isAuthError = true;
          authError.requiresLogin = true;
          return Promise.reject(authError);
        }
      }
    }
    
    return Promise.reject(handledError);
  }
);

// Auth API
export const authApi = {
  // Test connection
  testConnection: async () => {
    try {
      const result = await testNetworkConnection();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        troubleshooting: [
          'Check if backend server is running',
          'Verify network configuration',
          'Update IP address in networkConfig.js'
        ]
      };
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success && response.data.data) {
        await setAuthToken(response.data.data.accessToken);
        await setRefreshToken(response.data.data.refreshToken);
        await setCurrentUser(response.data.data.user);
      }
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Register');
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.success && response.data.data) {
        await setAuthToken(response.data.data.accessToken);
        await setRefreshToken(response.data.data.refreshToken);
        await setCurrentUser(response.data.data.user);
      }
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Login');
    }
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
    try {
      const response = await api.get('/auth/me');
      if (response.data.success && response.data.data.user) {
        await setCurrentUser(response.data.data.user);
      }
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Get Profile');
    }
  },

  // Refresh token
  refreshToken: async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');
    
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      if (response.data.success && response.data.data) {
        await setAuthToken(response.data.data.accessToken);
        if (response.data.data.refreshToken) {
          await setRefreshToken(response.data.data.refreshToken);
        }
      }
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Refresh Token');
    }
  }
};

// Files API
export const filesApi = {
  // Upload file
  uploadFile: async (fileUri, fileName, folderPath = '', onProgress) => {
    try {
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
    } catch (error) {
      throw handleApiError(error, 'Upload File');
    }
  },

  // List files and folders
  listFiles: async (folderPath = '') => {
    try {
      const params = {};
      if (folderPath) {
        params.path = folderPath;
      }
      const response = await api.get('/files/list', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'List Files');
    }
  },

  // Get download URL
  getDownloadUrl: async (fileKey) => {
    try {
      const response = await api.get(`/files/download/${encodeURIComponent(fileKey)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Get Download URL');
    }
  },

  // Delete file
  deleteFile: async (fileKey) => {
    try {
      const response = await api.delete(`/files/${encodeURIComponent(fileKey)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Delete File');
    }
  },

  // Get file info
  getFileInfo: async (fileKey) => {
    try {
      const response = await api.get(`/files/info/${encodeURIComponent(fileKey)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Get File Info');
    }
  },

  // Share file
  shareFile: async (fileId) => {
    try {
      const response = await api.post(`/files/share/${fileId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Share File');
    }
  },

  // Get shared files
  getSharedFiles: async () => {
    try {
      const response = await api.get('/files/shares');
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Get Shared Files');
    }
  }
};

// Folders API
export const foldersApi = {
  // Create folder
  createFolder: async (name, path = '') => {
    try {
      const response = await api.post('/folders/create', { name, path });
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Create Folder');
    }
  },

  // List folders
  listFolders: async (path = '') => {
    try {
      const params = {};
      if (path) {
        params.path = path;
      }
      const response = await api.get('/folders/list', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'List Folders');
    }
  },

  // Delete folder
  deleteFolder: async (folderPath) => {
    try {
      const response = await api.delete(`/folders/${encodeURIComponent(folderPath)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Delete Folder');
    }
  },

  // Get folder info
  getFolderInfo: async (folderPath) => {
    try {
      const response = await api.get(`/folders/info/${encodeURIComponent(folderPath)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Get Folder Info');
    }
  }
};

// Export utility functions
export {
  getAuthToken,
  setAuthToken,
  getCurrentUser,
  setCurrentUser,
  clearAuthData,
  isNetworkError,
  handleApiError,
  API_BASE_URL
}; 