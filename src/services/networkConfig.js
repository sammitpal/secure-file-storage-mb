import { Platform } from 'react-native';

/**
 * Network Configuration Helper
 * 
 * IMPORTANT: Update the IP addresses below to match your development setup
 * 
 * To find your machine's IP address:
 * - Windows: Open Command Prompt and run 'ipconfig' (look for IPv4 Address)
 * - Mac/Linux: Open Terminal and run 'ifconfig' or 'ip addr show'
 * - Look for your local network IP (usually starts with 192.168.x.x or 10.x.x.x)
 */

// Development Configuration
const DEVELOPMENT_CONFIG = {
  // Replace with your actual machine's IP address
  // Common examples: '192.168.1.100', '192.168.0.50', '10.0.0.100'
  YOUR_MACHINE_IP: 'localhost', // ⚠️ UPDATE THIS WITH YOUR ACTUAL IP
  
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
    
    // If user hasn't updated the IP, provide helpful defaults
    let machineIP = YOUR_MACHINE_IP;
    if (machineIP === 'localhost' || machineIP === 'YOUR_IP_HERE') {
      console.warn('⚠️ Network Config Warning: Please update YOUR_MACHINE_IP in networkConfig.js with your actual IP address');
      
      // Provide platform-specific fallbacks
      if (Platform.OS === 'ios') {
        machineIP = 'localhost'; // iOS simulator can use localhost
      } else if (Platform.OS === 'android') {
        machineIP = '10.0.2.2'; // Android emulator special IP
      } else {
        machineIP = 'localhost';
      }
    }
    
    const baseUrl = Platform.select({
      // iOS Simulator/Device - use your machine's IP or localhost
      ios: `${PROTOCOL}://${machineIP}:${BACKEND_PORT}/api`,
      
      // Android Emulator - special IP that maps to host machine's localhost
      android: Platform.OS === 'android' && machineIP === 'localhost' 
        ? `${PROTOCOL}://10.0.2.2:${BACKEND_PORT}/api`
        : `${PROTOCOL}://${machineIP}:${BACKEND_PORT}/api`,
      
      // Web or other platforms - use localhost
      default: `${PROTOCOL}://localhost:${BACKEND_PORT}/api`
    });
    
    console.log(`🌐 API Base URL: ${baseUrl}`);
    return baseUrl;
  }
  
  return PRODUCTION_CONFIG.API_URL;
};

/**
 * Test network connectivity to the API
 */
export const testNetworkConnection = async () => {
  const baseUrl = getApiBaseUrl();
  
  try {
    console.log(`🔍 Testing connection to: ${baseUrl}`);
    
    // Try a simple health check or any endpoint that doesn't require auth
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(baseUrl.replace('/api', '/'), {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    console.log(`✅ Connection successful: ${response.status}`);
    return {
      success: true,
      url: baseUrl,
      status: response.status,
      message: 'Connection successful'
    };
  } catch (error) {
    console.error(`❌ Connection failed: ${error.message}`);
    return {
      success: false,
      url: baseUrl,
      error: error.message,
      troubleshooting: getNetworkTroubleshootingTips()
    };
  }
};

/**
 * Get network troubleshooting tips based on the platform
 */
export const getNetworkTroubleshootingTips = () => {
  const baseUrl = getApiBaseUrl();
  const tips = [
    '🔧 TROUBLESHOOTING STEPS:',
    '',
    '1. ✅ Make sure your backend server is running',
    `   - Start your backend: cd backend && npm start`,
    `   - Server should be accessible at: ${baseUrl}`,
    '',
    '2. 🌐 Check network configuration:',
  ];
  
  if (Platform.OS === 'android') {
    tips.push(
      '   - Android Emulator: Uses 10.0.2.2 to reach host machine',
      '   - Android Device: Must use your computer\'s actual IP address',
      '   - Make sure both devices are on the same WiFi network'
    );
  } else if (Platform.OS === 'ios') {
    tips.push(
      '   - iOS Simulator: Can use localhost or your machine\'s IP',
      '   - iOS Device: Must use your computer\'s actual IP address',
      '   - Make sure both devices are on the same WiFi network'
    );
  }
  
  tips.push(
    '',
    '3. 🔥 Check firewall settings:',
    '   - Windows: Allow Node.js through Windows Firewall',
    '   - Mac: System Preferences > Security & Privacy > Firewall',
    '   - Temporarily disable firewall to test',
    '',
    '4. 🖥️ Find your machine\'s IP address:',
    '   - Windows: Open CMD and run "ipconfig"',
    '   - Mac/Linux: Open Terminal and run "ifconfig"',
    '   - Look for IPv4 address (usually 192.168.x.x)',
    '',
    '5. 📱 Test from browser first:',
    `   - Open browser and go to: ${baseUrl.replace('/api', '')}`,
    '   - If this doesn\'t work, the issue is with your backend',
    '',
    '6. 🔄 Update networkConfig.js:',
    '   - Replace YOUR_MACHINE_IP with your actual IP',
    '   - Example: YOUR_MACHINE_IP: "192.168.1.100"'
  );
  
  return tips;
};

/**
 * Debug network configuration
 */
export const debugNetworkConfig = () => {
  const config = {
    platform: Platform.OS,
    isDev: __DEV__,
    apiBaseUrl: getApiBaseUrl(),
    machineIP: DEVELOPMENT_CONFIG.YOUR_MACHINE_IP,
    port: DEVELOPMENT_CONFIG.BACKEND_PORT,
    protocol: DEVELOPMENT_CONFIG.PROTOCOL
  };
  
  console.log('🐛 Network Debug Info:', JSON.stringify(config, null, 2));
  return config;
};

export default {
  getApiBaseUrl,
  testNetworkConnection,
  getNetworkTroubleshootingTips,
  debugNetworkConfig,
  DEVELOPMENT_CONFIG,
  PRODUCTION_CONFIG
}; 