import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import NetworkDebugger from '../../components/NetworkDebugger';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { login, loading } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showNetworkDebugger, setShowNetworkDebugger] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    const result = await login(formData);
    if (!result.success) {
      // Error is already shown via Toast in AuthContext
    }
  };

  const styles = createStyles(theme, isDarkMode);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={isDarkMode 
          ? ['#0f172a', '#1e293b', '#334155'] 
          : ['#f8fafc', '#e2e8f0', '#cbd5e1']
        }
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Background Pattern */}
          <View style={styles.backgroundPattern}>
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
          </View>

          {/* Header */}
          <Animatable.View 
            animation="fadeInDown" 
            duration={1000}
            style={styles.header}
          >
            <View style={styles.iconContainer}>
              <Ionicons 
                name="shield-checkmark" 
                size={48} 
                color={theme.colors.primary} 
              />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to your secure file storage account
            </Text>
            
            {/* Network Debug Button - Development Only */}
            {__DEV__ && (
              <TouchableOpacity
                style={styles.debugButton}
                onPress={() => setShowNetworkDebugger(true)}
              >
                <Ionicons name="bug-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.debugButtonText}>Network Debug</Text>
              </TouchableOpacity>
            )}
          </Animatable.View>

          {/* Login Form */}
          <Animatable.View 
            animation="fadeInUp" 
            duration={1000} 
            delay={200}
            style={styles.formContainer}
          >
            <BlurView 
              intensity={isDarkMode ? 20 : 80} 
              tint={isDarkMode ? 'dark' : 'light'}
              style={styles.formCard}
            >
              <View style={styles.form}>
                {/* Email/Username Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <Ionicons 
                      name="person-outline" 
                      size={20} 
                      color={theme.colors.textSecondary} 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        errors.identifier && styles.inputError
                      ]}
                      placeholder="Email or username"
                      placeholderTextColor={theme.colors.placeholder}
                      value={formData.identifier}
                      onChangeText={(text) => handleInputChange('identifier', text)}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                    />
                  </View>
                  {errors.identifier && (
                    <Text style={styles.errorText}>{errors.identifier}</Text>
                  )}
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <Ionicons 
                      name="lock-closed-outline" 
                      size={20} 
                      color={theme.colors.textSecondary} 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        errors.password && styles.inputError
                      ]}
                      placeholder="Password"
                      placeholderTextColor={theme.colors.placeholder}
                      value={formData.password}
                      onChangeText={(text) => handleInputChange('password', text)}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color={theme.colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryDark]}
                    style={styles.loginButtonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <Text style={styles.loginButtonText}>Sign In</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Register Link */}
                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>Don't have an account?</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Register')}
                    style={styles.registerLink}
                  >
                    <Text style={styles.registerLinkText}>Create Account</Text>
                    <Ionicons 
                      name="arrow-forward" 
                      size={16} 
                      color={theme.colors.primary} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Network Debug Link (Development Only) */}
                {__DEV__ && (
                  <View style={styles.networkTestContainer}>
                    <TouchableOpacity
                      onPress={() => setShowNetworkDebugger(true)}
                      style={styles.networkTestLink}
                    >
                      <Ionicons 
                        name="bug-outline" 
                        size={16} 
                        color={theme.colors.textSecondary} 
                      />
                      <Text style={styles.networkTestText}>Network Debug</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </BlurView>
          </Animatable.View>
        </ScrollView>
      </LinearGradient>
      
      {/* Network Debugger - Development Only */}
      <NetworkDebugger 
        visible={showNetworkDebugger}
        onClose={() => setShowNetworkDebugger(false)}
      />
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.1,
  },
  circle1: {
    width: 300,
    height: 300,
    backgroundColor: theme.colors.primary,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    backgroundColor: theme.colors.secondary,
    bottom: -50,
    left: -50,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  formCard: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)',
  },
  form: {
    padding: theme.spacing.xl,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.8)',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingLeft: 48,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: '500',
  },
  passwordInput: {
    paddingRight: 48,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  inputIcon: {
    position: 'absolute',
    left: theme.spacing.md,
    top: '50%',
    marginTop: -10,
    zIndex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: theme.spacing.md,
    top: '50%',
    marginTop: -10,
    zIndex: 1,
    padding: 4,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  loginButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    paddingVertical: theme.spacing.md + 2,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginRight: theme.spacing.sm,
  },
  registerContainer: {
    alignItems: 'center',
  },
  registerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.sm,
  },
  registerLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerLinkText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginRight: theme.spacing.xs,
  },
  networkTestContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  networkTestLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  networkTestText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginLeft: theme.spacing.xs,
  },
});

export default LoginScreen; 