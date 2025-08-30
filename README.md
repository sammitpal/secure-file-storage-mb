# Secure File Storage - React Native App

A modern, secure file storage mobile application built with React Native and Expo, optimized for iPhone 14 Plus.

## Features

### 🔐 **Authentication**
- Secure JWT-based authentication
- User registration and login
- Automatic token refresh
- Secure token storage using Expo SecureStore

### 📁 **File Management**
- Upload files from device gallery, camera, or documents
- Organize files in folders with nested navigation
- Download and share files
- Delete files and folders
- Real-time file listing with pull-to-refresh

### 🎨 **Modern UI/UX**
- Glassmorphism design with blur effects
- Dark/Light theme support with system theme detection
- Smooth animations and transitions
- Optimized for iPhone 14 Plus (428×926 points)
- Responsive design for various screen sizes

### 📤 **File Upload**
- Multiple file selection
- Real-time upload progress
- Support for all file types
- Camera integration for photos/videos
- Document picker for files

### 🔗 **File Sharing**
- Generate shareable links
- Track share analytics
- Copy links to clipboard
- Manage shared files

### ⚙️ **Settings & Profile**
- User profile management
- Theme customization
- Storage usage tracking
- Account settings

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation 6
- **State Management**: React Context API
- **Styling**: Styled Components approach with StyleSheet
- **Animations**: React Native Animatable
- **Icons**: Expo Vector Icons (Ionicons)
- **Storage**: Expo SecureStore for tokens
- **HTTP Client**: Axios with interceptors
- **File Operations**: Expo FileSystem, DocumentPicker, ImagePicker
- **UI Components**: Custom components with glassmorphism effects

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Xcode (for iOS development on macOS)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SecureFileStorageRN
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure API endpoint**
   
   Update the API base URL in `src/services/api.js`:
   ```javascript
   const API_BASE_URL = __DEV__ 
     ? 'http://localhost:3001/api'  // Your local backend URL
     : 'https://your-production-api.com/api';  // Your production backend URL
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Run on iOS Simulator**
   ```bash
   npm run ios
   # or
   yarn ios
   ```

## Backend Setup

This app requires the backend server from the main project. Make sure to:

1. Start your backend server (usually on `http://localhost:3001`)
2. Ensure all API endpoints are working:
   - Authentication: `/api/auth/*`
   - Files: `/api/files/*`
   - Folders: `/api/folders/*`

## Project Structure

```
SecureFileStorageRN/
├── App.jsx                 # Main app component
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
└── src/
    ├── contexts/          # React contexts
    │   ├── AuthContext.jsx    # Authentication state
    │   └── ThemeContext.jsx   # Theme management
    ├── navigation/        # Navigation setup
    │   ├── AppNavigator.jsx   # Main navigator
    │   └── MainTabNavigator.jsx # Tab navigation
    ├── screens/          # Screen components
    │   ├── auth/         # Authentication screens
    │   │   ├── LoginScreen.jsx
    │   │   └── RegisterScreen.jsx
    │   ├── main/         # Main app screens
    │   │   ├── FilesScreen.jsx
    │   │   ├── UploadScreen.jsx
    │   │   ├── SharedScreen.jsx
    │   │   └── ProfileScreen.jsx
    │   └── LoadingScreen.jsx
    └── services/         # API and utilities
        └── api.js        # API service layer
```

## Key Components

### Authentication Flow
- **LoginScreen**: Modern login with glassmorphism design
- **RegisterScreen**: User registration with validation
- **AuthContext**: Manages authentication state and token handling

### File Management
- **FilesScreen**: Browse files and folders with breadcrumb navigation
- **UploadScreen**: Multi-method file upload (camera, gallery, documents)
- **SharedScreen**: Manage shared files and links

### Theme System
- **ThemeContext**: Light/dark theme with system detection
- **Responsive Design**: Optimized for iPhone 14 Plus
- **Glassmorphism**: Modern blur effects and transparency

## API Integration

The app integrates with your existing backend API:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get user profile
- `POST /api/auth/refresh` - Refresh JWT token

### File Management Endpoints
- `GET /api/files/list` - List files and folders
- `POST /api/files/upload` - Upload files
- `GET /api/files/download/:key` - Get download URL
- `DELETE /api/files/:key` - Delete file
- `POST /api/files/share/:fileId` - Share file

### Folder Management Endpoints
- `POST /api/folders/create` - Create folder
- `GET /api/folders/list` - List folders
- `DELETE /api/folders/:path` - Delete folder

## Configuration

### Theme Customization
Edit `src/contexts/ThemeContext.jsx` to customize colors, spacing, and typography:

```javascript
const lightTheme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#10b981',
    // ... other colors
  },
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48
  },
  // ... other theme properties
};
```

### API Configuration
Update `src/services/api.js` for custom API settings:

```javascript
// Timeout settings
timeout: 30000,

// Custom headers
headers: {
  'Content-Type': 'application/json',
  // Add custom headers here
}
```

## Building for Production

### iOS Build
1. **Configure app.json**
   ```json
   {
     "expo": {
       "ios": {
         "bundleIdentifier": "com.yourcompany.securefilestorage",
         "buildNumber": "1.0.0"
       }
     }
   }
   ```

2. **Build with EAS**
   ```bash
   npm install -g @expo/eas-cli
   eas build --platform ios
   ```

### Environment Variables
Create different configurations for development and production in `src/services/api.js`.

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **iOS Simulator not opening**
   ```bash
   npx expo run:ios
   ```

3. **Network requests failing**
   - Check API base URL configuration
   - Ensure backend server is running
   - Verify network permissions in app.json

4. **File upload issues**
   - Check file size limits (default: 10MB)
   - Verify multipart/form-data handling
   - Ensure proper permissions for camera/gallery access

### Performance Optimization

1. **Image Optimization**
   - Use appropriate image compression settings
   - Implement lazy loading for file lists

2. **Memory Management**
   - Clear file selections after upload
   - Implement proper cleanup in useEffect hooks

3. **Network Optimization**
   - Implement request caching where appropriate
   - Use proper timeout settings for large file uploads

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both iOS and Android (if applicable)
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the troubleshooting section above
- Review the backend API documentation
- Ensure all dependencies are properly installed

---

**Optimized for iPhone 14 Plus** - Designed with modern iOS design principles and optimized for the 6.7" display with 428×926 point resolution. 