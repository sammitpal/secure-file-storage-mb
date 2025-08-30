import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../contexts/ThemeContext';

const LoadingScreen = () => {
  const { theme, isDarkMode } = useTheme();

  const styles = createStyles(theme, isDarkMode);

  return (
    <LinearGradient
      colors={isDarkMode 
        ? ['#0f172a', '#1e293b', '#334155'] 
        : ['#f8fafc', '#e2e8f0', '#cbd5e1']
      }
      style={styles.container}
    >
      <View style={styles.content}>
        <Animatable.View 
          animation="pulse" 
          iterationCount="infinite"
          style={styles.iconContainer}
        >
          <Ionicons 
            name="shield-checkmark" 
            size={64} 
            color={theme.colors.primary} 
          />
        </Animatable.View>
        
        <Animatable.Text 
          animation="fadeInUp" 
          delay={500}
          style={styles.title}
        >
          Secure File Storage
        </Animatable.Text>
        
        <Animatable.View 
          animation="fadeInUp" 
          delay={800}
          style={styles.loadingContainer}
        >
          <ActivityIndicator 
            size="large" 
            color={theme.colors.primary} 
            style={styles.spinner}
          />
          <Text style={styles.loadingText}>Loading...</Text>
        </Animatable.View>
      </View>
    </LinearGradient>
  );
};

const createStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  spinner: {
    marginBottom: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});

export default LoadingScreen; 