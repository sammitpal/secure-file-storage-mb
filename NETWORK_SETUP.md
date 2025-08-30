# 🔧 Network Setup Guide - Fix Axios Errors

If you're getting Axios errors in all endpoints, follow this step-by-step guide to fix the network configuration.

## 🚨 Quick Fix Steps

### 1. **Find Your Machine's IP Address**

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (usually starts with 192.168.x.x or 10.x.x.x)

**Mac/Linux:**
```bash
ifconfig
```
Look for "inet" address (usually starts with 192.168.x.x or 10.x.x.x)

### 2. **Update Network Configuration**

Edit `SecureFileStorageRN/src/services/networkConfig.js`:

```javascript
const DEVELOPMENT_CONFIG = {
  // Replace 'localhost' with your actual IP address
  YOUR_MACHINE_IP: '192.168.1.100', // ⚠️ CHANGE THIS TO YOUR IP
  BACKEND_PORT: '3001',
  PROTOCOL: 'http'
};
```

### 3. **Start Your Backend Server**

Make sure your backend is running:
```bash
cd backend
npm start
```

The server should show: `Server running on port 3001`

### 4. **Test the Connection**

1. Open your React Native app
2. On the login screen, tap "Network Debug" (only visible in development)
3. Tap "Test Connection"
4. If it fails, follow the troubleshooting steps shown

## 🔍 Using the Network Debugger

The app includes a built-in network debugger to help you diagnose issues:

1. **Access the Debugger:**
   - On the login screen, look for "Network Debug" button (development only)
   - Tap it to open the network debugger

2. **Test Connection:**
   - Tap "Test Connection" to check if your backend is reachable
   - View detailed error information if the test fails

3. **View Configuration:**
   - See your current network settings
   - Copy API URLs to test in browser
   - Get platform-specific troubleshooting tips

## 🛠️ Common Issues & Solutions

### Issue 1: "Network Error" or "ECONNREFUSED"
**Solution:** Your backend server is not running or not accessible
- Start your backend: `cd backend && npm start`
- Check if server is running on port 3001
- Test in browser: `http://YOUR_IP:3001`

### Issue 2: "ENOTFOUND" or "ETIMEDOUT"
**Solution:** Wrong IP address in configuration
- Update `YOUR_MACHINE_IP` in `networkConfig.js`
- Use your actual IP address, not localhost
- Make sure device and computer are on same WiFi

### Issue 3: Works in browser but not in app
**Solution:** Platform-specific network configuration
- **iOS Simulator:** Can use localhost or your IP
- **iOS Device:** Must use your machine's IP address
- **Android Emulator:** Uses 10.0.2.2 (handled automatically)

### Issue 4: Firewall blocking connections
**Solution:** Allow Node.js through firewall
- **Windows:** Windows Defender Firewall > Allow an app
- **Mac:** System Preferences > Security & Privacy > Firewall
- **Temporary:** Disable firewall to test

## 📱 Platform-Specific Notes

### iOS Simulator
- Can use `localhost` or your machine's IP
- Usually works with default configuration
- If issues persist, try using your actual IP

### iOS Device
- **Must** use your machine's actual IP address
- Device and computer must be on same WiFi network
- Cannot use `localhost` or `127.0.0.1`

### Android Emulator
- Uses special IP `10.0.2.2` to reach host machine
- This is handled automatically in `networkConfig.js`
- Should work without additional configuration

## 🧪 Testing Your Setup

### 1. Test Backend Directly
Open browser and go to: `http://YOUR_IP:3001`
- Should show your backend server response
- If this doesn't work, the issue is with your backend

### 2. Test API Endpoint
Open browser and go to: `http://YOUR_IP:3001/api`
- Should show API response or error
- This is what your mobile app is trying to reach

### 3. Test from Mobile App
- Use the Network Debugger in the app
- Check console logs for detailed error information
- Look for specific error codes (ECONNREFUSED, ETIMEDOUT, etc.)

## 📋 Checklist

Before asking for help, make sure you've:

- [ ] Found your machine's actual IP address
- [ ] Updated `YOUR_MACHINE_IP` in `networkConfig.js`
- [ ] Started your backend server (`npm start`)
- [ ] Tested backend in browser (`http://YOUR_IP:3001`)
- [ ] Used the Network Debugger in the app
- [ ] Checked that device and computer are on same WiFi
- [ ] Temporarily disabled firewall to test
- [ ] Restarted both backend server and mobile app

## 🆘 Still Having Issues?

If you're still getting errors after following this guide:

1. **Check the Console Logs:**
   - Look for detailed error messages in Metro bundler
   - Note the specific error codes and messages

2. **Use Network Debugger:**
   - The built-in debugger provides specific troubleshooting steps
   - Copy the exact error message and configuration details

3. **Common Error Codes:**
   - `ECONNREFUSED`: Backend server not running
   - `ENOTFOUND`: Wrong IP address or DNS issue
   - `ETIMEDOUT`: Network timeout, check firewall
   - `Network Error`: General connectivity issue

## 🔄 Quick Reset

If everything is broken, try this reset:

1. **Stop everything:**
   ```bash
   # Stop backend
   Ctrl+C in backend terminal
   
   # Stop React Native
   Ctrl+C in Metro bundler
   ```

2. **Update IP address:**
   ```javascript
   // In networkConfig.js
   YOUR_MACHINE_IP: 'YOUR_ACTUAL_IP_HERE'
   ```

3. **Restart everything:**
   ```bash
   # Start backend
   cd backend && npm start
   
   # Start React Native (in new terminal)
   cd SecureFileStorageRN && npm start
   ```

4. **Test connection:**
   - Use Network Debugger in app
   - Should now work if IP is correct

---

**Need more help?** Check the console logs and use the Network Debugger for specific error details! 