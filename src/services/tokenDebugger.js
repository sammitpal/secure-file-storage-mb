import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from './api';

// Cross-platform storage
const isWeb = Platform.OS === 'web';
const storage = {
  async getItem(key) {
    try {
      if (isWeb) {
        return await AsyncStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  },
  async removeItem(key) {
    try {
      if (isWeb) {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }
};

const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'currentUser';

/**
 * Debug token storage and authentication state
 */
export const debugTokenState = async () => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    const userStr = await SecureStore.getItemAsync(USER_KEY);
    
    const tokenInfo = {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
      hasRefreshToken: !!refreshToken,
      refreshTokenLength: refreshToken?.length || 0,
      hasUser: !!userStr,
      user: userStr ? JSON.parse(userStr) : null,
      timestamp: new Date().toISOString()
    };
    
    console.log('🔍 Token Debug Info:', JSON.stringify(tokenInfo, null, 2));
    return tokenInfo;
  } catch (error) {
    console.error('❌ Token debug error:', error);
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Test token validity by making an authenticated request
 */
export const testTokenValidity = async () => {
  try {
    console.log('🧪 Testing token validity...');
    const tokenInfo = await debugTokenState();
    
    if (!tokenInfo.hasToken) {
      return {
        valid: false,
        error: 'No token found',
        tokenInfo
      };
    }
    
    // Try to get user profile to test token
    const response = await authApi.getProfile();
    
    if (response.success) {
      console.log('✅ Token is valid');
      return {
        valid: true,
        user: response.data.user,
        tokenInfo
      };
    } else {
      console.log('❌ Token is invalid');
      return {
        valid: false,
        error: 'Token validation failed',
        response,
        tokenInfo
      };
    }
  } catch (error) {
    console.error('❌ Token validity test failed:', error);
    return {
      valid: false,
      error: error.message,
      isNetworkError: error.isNetworkError,
      isAuthError: error.isAuthError,
      status: error.response?.status,
      tokenInfo: await debugTokenState()
    };
  }
};

/**
 * Clear all authentication data and verify it's cleared
 */
export const clearAndVerifyAuth = async () => {
  try {
    console.log('🧹 Clearing authentication data...');
    
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    
    // Verify it's cleared
    const verifyInfo = await debugTokenState();
    
    console.log('✅ Auth data cleared:', verifyInfo);
    return verifyInfo;
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
    return { error: error.message };
  }
};

/**
 * Decode JWT token (basic decode, no verification)
 */
export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    return {
      ...decoded,
      isExpired: decoded.exp ? (Date.now() / 1000) > decoded.exp : false,
      expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null,
      issuedAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : null
    };
  } catch (error) {
    console.error('❌ JWT decode error:', error);
    return null;
  }
};

/**
 * Comprehensive authentication debugging
 */
export const debugAuthentication = async () => {
  console.log('🔍 Starting comprehensive auth debug...');
  
  const tokenInfo = await debugTokenState();
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const decodedToken = decodeJWT(token);
  const validityTest = await testTokenValidity();
  
  const debugInfo = {
    tokenInfo,
    decodedToken,
    validityTest,
    recommendations: []
  };
  
  // Add recommendations based on findings
  if (!tokenInfo.hasToken) {
    debugInfo.recommendations.push('No token found - user needs to login');
  } else if (decodedToken?.isExpired) {
    debugInfo.recommendations.push('Token is expired - attempt refresh or re-login');
  } else if (!validityTest.valid) {
    debugInfo.recommendations.push('Token is invalid - clear auth data and re-login');
  } else {
    debugInfo.recommendations.push('Token appears valid - check API endpoint permissions');
  }
  
  console.log('🔍 Auth Debug Results:', JSON.stringify(debugInfo, null, 2));
  return debugInfo;
};

export default {
  debugTokenState,
  testTokenValidity,
  clearAndVerifyAuth,
  decodeJWT,
  debugAuthentication
}; 