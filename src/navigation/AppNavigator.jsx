import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main App Screens
import MainTabNavigator from './MainTabNavigator';
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
        animationEnabled: true,
        gestureEnabled: true,
      }}
    >
      {isAuthenticated ? (
        // Authenticated screens
        <Stack.Screen 
          name="MainApp" 
          component={MainTabNavigator}
          options={{ animationTypeForReplace: 'push' }}
        />
      ) : (
        // Authentication screens
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ animationTypeForReplace: 'pop' }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{
              presentation: 'modal',
              animationTypeForReplace: 'push'
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator; 