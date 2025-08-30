import { Platform } from 'react-native';

/**
 * Network Configuration Helper
 * 
 * IMPORTANT: Update the IP addresses below to match your development setup
 * 
 * To find your machine's IP address:
 * - Windows: Open Command Prompt and run 'ipconfig'
 * - Mac/Linux: Open Terminal and run 'ifconfig' or 'ip addr show'
 * - Look for your local network IP (usually starts with 192.168.x.x or 10.x.x.x)
 */

// Development Configuration
const DEVELOPMENT_CONFIG = {
  // Replace 'YOUR_IP_HERE' with your actual machine's IP address
  // Example: '192.168.1.100' or '10.0.0.50'
  YOUR_MACHINE_IP: '192.168.1.100', // ⚠️ UPDATE THIS WITH YOUR ACTUAL IP
  
  // Backend server port (update if your backend runs on a different port)
  BACKEND_PORT: '3001',
  
  // Protocol (use 'https' if your backend has SSL)
  PROTOCOL: 'http'
};

// Production Configuration
const PRODUCTION_CONFIG = {
  // Your production API URL
  API_URL: 'https://your-production-api.com/api' // ⚠️ UPDATE THIS FOR PRODUCTION
};

/**
 * Get the appropriate API base URL based on the platform and environment
 */
export const getApiBaseUrl = () => {
  if (__DEV__) {
    const { YOUR_MACHINE_IP, BACKEND_PORT, PROTOCOL } = DEVELOPMENT_CONFIG;
    
    return Platform.select({
      // iOS Simulator/Device - use your machine's IP
      ios: `${PROTOCOL}://${YOUR_MACHINE_IP}:${BACKEND_PORT}/api`,
      
      // Android Emulator - special IP that maps to host machine's localhost
      android: `${PROTOCOL}://10.0.2.2:${BACKEND_PORT}/api`,
      
      // Web or other platforms - use localhost
      default: `${PROTOCOL}://localhost:${BACKEND_PORT}/api`
    });
  }
  
  return PRODUCTION_CONFIG.API_URL;
};

/**
 * Test network connectivity to the API
 */
export const testNetworkConnection = async () => {
  const baseUrl = getApiBaseUrl();
  
  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      timeout: 5000
    });
    
    return {
      success: true,
      url: baseUrl,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      url: baseUrl,
      error: error.message
    };
  }
};

/**
 * Get network troubleshooting tips based on the platform
 */
export const getNetworkTroubleshootingTips = () => {
  const tips = [
    '1. Make sure your backend server is running',
    `2. Verify the server is accessible at: ${getApiBaseUrl()}`,
    '3. Check your firewall settings',
    '4. Ensure your device/emulator and computer are on the same network'
  ];
  
  if (Platform.OS === 'android') {
    tips.push('5. For Android Emulator: Make sure you\'re using 10.0.2.2 instead of localhost');
  } else if (Platform.OS === 'ios') {
    tips.push('5. For iOS: Make sure you\'re using your machine\'s actual IP address');
  }
  
  return tips;
};

export default {
  getApiBaseUrl,
  testNetworkConnection,
  getNetworkTroubleshootingTips,
  DEVELOPMENT_CONFIG,
  PRODUCTION_CONFIG
}; 