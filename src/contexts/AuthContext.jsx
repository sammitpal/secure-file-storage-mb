import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, getCurrentUser, isNetworkError } from '../services/api';
import Toast from 'react-native-toast-message';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const savedUser = await getCurrentUser();
      
      if (savedUser) {
        try {
          // Verify token with server
          const response = await authApi.getProfile();
          if (response.success && response.data.user) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            // Invalid token, clear data
            await authApi.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          // Token verification failed
          console.log('Token verification failed:', error.message);
          await authApi.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authApi.login(credentials);
      
      if (response.success && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: `Welcome back, ${response.data.user.username}!`
        });
        return { success: true };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      let errorMessage = 'Login failed';
      let errorTitle = 'Login Failed';
      
      if (error.isNetworkError || isNetworkError(error)) {
        errorTitle = 'Connection Error';
        errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
      } else {
        errorMessage = error.response?.data?.message || error.message || 'Login failed';
      }
      
      Toast.show({
        type: 'error',
        text1: errorTitle,
        text2: errorMessage
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authApi.register(userData);
      
      if (response.success && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: `Welcome, ${response.data.user.username}!`
        });
        return { success: true };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      let errorMessage = 'Registration failed';
      let errorTitle = 'Registration Failed';
      
      if (error.isNetworkError || isNetworkError(error)) {
        errorTitle = 'Connection Error';
        errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
      } else {
        errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      }
      
      Toast.show({
        type: 'error',
        text1: errorTitle,
        text2: errorMessage
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      setIsAuthenticated(false);
      Toast.show({
        type: 'success',
        text1: 'Logged Out',
        text2: 'You have been successfully logged out'
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    refreshAuth: initializeAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 