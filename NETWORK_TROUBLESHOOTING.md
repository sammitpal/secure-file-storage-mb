# Network Troubleshooting Guide

This guide helps you resolve network connection issues when trying to login or register in the Secure File Storage app.

## 🚨 Common Network Errors

- "Network Error" or "Connection failed"
- "Unable to connect to server"
- "Request timeout"
- "ECONNREFUSED" or "ENOTFOUND"

## 🔧 Quick Fixes

### 1. Update Network Configuration

The most common issue is using `localhost` which doesn't work on mobile devices/emulators.

**Step 1:** Find your computer's IP address
- **Windows:** Open Command Prompt and run `ipconfig`
- **Mac/Linux:** Open Terminal and run `ifconfig` or `ip addr show`
- Look for your local network IP (usually starts with `192.168.x.x` or `10.x.x.x`)

**Step 2:** Update the configuration
1. Open `src/services/networkConfig.js`
2. Replace `'192.168.1.100'` with your actual IP address:
```javascript
YOUR_MACHINE_IP: '192.168.1.50', // Replace with your actual IP
```

### 2. Platform-Specific Solutions

#### Android Emulator
- Uses special IP `10.0.2.2` to access host machine's localhost
- This is automatically configured in the app

#### iOS Simulator
- Must use your computer's actual IP address
- Cannot use `localhost` or `127.0.0.1`

#### Physical Devices
- Must be on the same WiFi network as your development machine
- Use your computer's actual IP address
- Check firewall settings

### 3. Backend Server Setup

Make sure your backend server is:
1. **Running** on port 3001
2. **Accessible** from your network
3. **Configured** to accept connections from your IP

Example backend server configuration:
```javascript
// Express.js example
app.listen(3001, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:3001');
});
```

## 🧪 Testing Your Connection

The app includes a built-in network test tool:

1. On the login screen, look for "Network Test" link (development mode only)
2. Tap it to open the network test screen
3. Tap "Test Connection" to check connectivity
4. Review results and follow troubleshooting tips

## 🔍 Advanced Troubleshooting

### Check Firewall Settings

**Windows Firewall:**
1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Make sure Node.js or your backend server is allowed

**Mac Firewall:**
1. System Preferences → Security & Privacy → Firewall
2. Add your backend server to allowed apps

### Network Connectivity Issues

1. **Same Network:** Ensure your device and computer are on the same WiFi network
2. **Port Blocking:** Some networks block certain ports
3. **VPN Issues:** Disable VPN if connection fails
4. **Corporate Networks:** May have restrictions - try personal hotspot

### Using ngrok (Alternative Solution)

If IP configuration doesn't work, use ngrok to create a public tunnel:

1. Install ngrok: `npm install -g ngrok`
2. Start your backend server on port 3001
3. In another terminal: `ngrok http 3001`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Update `networkConfig.js`:
```javascript
YOUR_MACHINE_IP: 'abc123.ngrok.io',
BACKEND_PORT: '',
PROTOCOL: 'https'
```

## 📱 Platform-Specific Instructions

### Expo Development Build
```bash
# Start with specific host
npx expo start --host tunnel
# or
npx expo start --host lan
```

### React Native CLI
```bash
# Android
npx react-native run-android --host 192.168.1.100

# iOS
npx react-native run-ios --host 192.168.1.100
```

## 🐛 Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | Server not running or wrong port | Check server is running on correct port |
| `ENOTFOUND` | Wrong IP/hostname | Update IP address in config |
| `Network Error` | No internet or firewall blocking | Check internet and firewall settings |
| `Timeout` | Server too slow or unreachable | Check server performance and network |

## 📞 Still Having Issues?

1. **Check the console logs** in your development tools
2. **Verify backend server** is running and accessible
3. **Test with a simple curl command:**
   ```bash
   curl http://YOUR_IP:3001/api/health
   ```
4. **Try the network test tool** in the app
5. **Use ngrok** as a fallback solution

## 🔄 Configuration Files

Key files to check:
- `src/services/networkConfig.js` - Main network configuration
- `src/services/api.js` - API client setup
- `src/contexts/AuthContext.jsx` - Authentication error handling

## ✅ Verification Checklist

- [ ] Backend server is running
- [ ] Correct IP address in networkConfig.js
- [ ] Device and computer on same network
- [ ] Firewall allows connections
- [ ] Network test passes
- [ ] Can access server from browser at `http://YOUR_IP:3001`

---

**Need more help?** Check the network test tool in the app or review the server logs for more detailed error information. 