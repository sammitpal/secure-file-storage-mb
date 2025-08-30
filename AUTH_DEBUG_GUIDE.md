# 🔐 Authentication Debug Guide - Fix 401 Errors

Since login is working but other endpoints return 401 errors, this indicates a token handling issue. Follow this guide to diagnose and fix the problem.

## 🚨 Quick Diagnosis

### Step 1: Use the Built-in Auth Debugger

1. **Open the app and login successfully**
2. **Go to Profile tab** (bottom navigation)
3. **Scroll down to find "Auth Debugger"** (only visible in development)
4. **Tap "Debug Auth"** to run comprehensive authentication tests

The debugger will show you:
- ✅/❌ Token present in storage
- ✅/❌ Token validity
- ✅/❌ Token expiration status
- 📋 Specific recommendations

### Step 2: Check Console Logs

Look for these log messages in your Metro bundler console:

```
🔐 Adding auth token to GET /api/files/list
📥 401 GET /api/files/list
🚨 401 Unauthorized Error: {...}
```

## 🛠️ Common 401 Error Causes & Fixes

### Issue 1: Token Not Being Sent
**Symptoms:** Console shows "No auth token found for GET /api/..."
**Cause:** Token not stored properly after login
**Fix:**
```javascript
// Check if login response structure matches expected format
// Backend should return: { success: true, data: { accessToken, refreshToken, user } }
```

### Issue 2: Token Format Mismatch
**Symptoms:** Console shows token being sent but still 401
**Cause:** Backend expects different token format
**Fix:** Check if backend expects `Bearer TOKEN` vs just `TOKEN`

### Issue 3: Token Expired Immediately
**Symptoms:** Auth debugger shows token is expired right after login
**Cause:** Server/client time mismatch or very short token expiry
**Fix:** Check token expiration time in debugger

### Issue 4: Wrong API Endpoint Authentication
**Symptoms:** Some endpoints work, others don't
**Cause:** Backend routes not properly protected or different auth requirements
**Fix:** Check backend route middleware

## 🔍 Detailed Debugging Steps

### 1. Verify Login Response Structure

Add this to your login success handler to see the exact response:

```javascript
// In AuthContext.jsx login function
console.log('🔍 Login Response Structure:', JSON.stringify(response, null, 2));
```

Expected structure:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "...",
      "username": "...",
      "email": "..."
    }
  }
}
```

### 2. Check Token Storage

Use the Auth Debugger or add this to check token storage:

```javascript
import { debugTokenState } from '../services/tokenDebugger';

// After login
const tokenInfo = await debugTokenState();
console.log('Token Storage:', tokenInfo);
```

### 3. Verify Token in Requests

Check if tokens are being attached to requests:

```javascript
// Look for these logs in console:
// 🔐 Adding auth token to GET /api/files/list
// If you see: ⚠️ No auth token found for GET /api/files/list
// Then token storage/retrieval is broken
```

### 4. Test Token Manually

Use the Auth Debugger's "Test Authentication" feature or:

```javascript
import { testTokenValidity } from '../services/tokenDebugger';

const result = await testTokenValidity();
console.log('Token Validity:', result);
```

## 🔧 Common Fixes

### Fix 1: Backend Response Structure Issue

If your backend returns a different structure, update the API service:

```javascript
// In src/services/api.js - authApi.login
if (response.data.success && response.data.token) { // Different structure
  await setAuthToken(response.data.token); // Adjust field name
  await setCurrentUser(response.data.user);
}
```

### Fix 2: Token Prefix Issue

If backend expects token without "Bearer" prefix:

```javascript
// In src/services/api.js - request interceptor
config.headers.Authorization = token; // Instead of `Bearer ${token}`
```

### Fix 3: Clear and Re-authenticate

If tokens are corrupted:

1. Use Auth Debugger's "Clear Auth" button
2. Login again
3. Test endpoints

### Fix 4: Backend Route Protection

Check your backend routes have proper authentication middleware:

```javascript
// Backend route should look like:
router.get('/files/list', authenticateToken, async (req, res) => {
  // Route handler
});
```

## 🧪 Testing Checklist

After implementing fixes, test these scenarios:

- [ ] Login successfully
- [ ] Use Auth Debugger - should show valid token
- [ ] Navigate to Files tab - should load files
- [ ] Try upload - should work
- [ ] Try create folder - should work
- [ ] Check console logs - should show tokens being sent
- [ ] Wait a few minutes and try again - token refresh should work

## 📋 Debug Information to Collect

If you're still having issues, collect this information:

1. **Auth Debugger Results:**
   - Token present: Yes/No
   - Token valid: Yes/No
   - Token expired: Yes/No
   - Recommendations shown

2. **Console Logs:**
   - Login response structure
   - Token attachment logs
   - 401 error details
   - Any error messages

3. **Network Tab (if using browser):**
   - Request headers showing Authorization
   - Response status and body

4. **Backend Logs:**
   - Authentication middleware logs
   - Token verification results

## 🆘 Quick Reset

If everything is broken:

1. **Clear all auth data:**
   - Use Auth Debugger "Clear Auth" button
   - Or manually: Clear app data/reinstall

2. **Restart backend server:**
   ```bash
   cd backend
   npm start
   ```

3. **Login again and test immediately**

4. **Check Auth Debugger results**

## 🎯 Most Likely Causes

Based on "login works but other endpoints fail":

1. **Token storage issue** (70% likely)
   - Login saves token incorrectly
   - Token retrieval fails for subsequent requests

2. **Backend response format mismatch** (20% likely)
   - Backend returns different structure than expected
   - Token field name different

3. **Token format issue** (10% likely)
   - Backend expects different Authorization header format

Use the Auth Debugger to quickly identify which category your issue falls into!

---

**The Auth Debugger is your best friend for solving 401 errors!** 🔐 