import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { theme, isDarkMode, isSystemTheme, toggleTheme, setSystemTheme, setLightTheme, setDarkTheme } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderSettingItem = ({ icon, title, subtitle, onPress, rightComponent, color }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: `${color || theme.colors.primary}20` }]}>
          <Ionicons name={icon} size={20} color={color || theme.colors.primary} />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />}
    </TouchableOpacity>
  );

  const styles = createStyles(theme, isDarkMode);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <Animatable.View animation="fadeInDown" style={styles.profileHeader}>
        <LinearGradient
          colors={isDarkMode 
            ? ['#1e293b', '#334155'] 
            : [theme.colors.primary, theme.colors.primaryDark]
          }
          style={styles.profileGradient}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color="white" />
            </View>
          </View>
          
          <Text style={styles.userName}>{user?.username || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          
          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>-</Text>
              <Text style={styles.statLabel}>Files</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>-</Text>
              <Text style={styles.statLabel}>Storage</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>-</Text>
              <Text style={styles.statLabel}>Shared</Text>
            </View>
          </View>
        </LinearGradient>
      </Animatable.View>

      {/* Account Section */}
      <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <View style={styles.settingsContainer}>
          {renderSettingItem({
            icon: 'person-outline',
            title: 'Profile Information',
            subtitle: 'Update your personal details',
            onPress: () => {
              Alert.alert('Coming Soon', 'Profile editing will be available in a future update');
            }
          })}
          
          {renderSettingItem({
            icon: 'key-outline',
            title: 'Change Password',
            subtitle: 'Update your account password',
            onPress: () => {
              Alert.alert('Coming Soon', 'Password change will be available in a future update');
            }
          })}
          
          {renderSettingItem({
            icon: 'shield-checkmark-outline',
            title: 'Security',
            subtitle: 'Two-factor authentication, login history',
            onPress: () => {
              Alert.alert('Coming Soon', 'Security settings will be available in a future update');
            }
          })}
        </View>
      </Animatable.View>

      {/* Appearance Section */}
      <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <View style={styles.settingsContainer}>
          {renderSettingItem({
            icon: 'moon-outline',
            title: 'Dark Mode',
            subtitle: isSystemTheme ? 'Following system settings' : (isDarkMode ? 'Enabled' : 'Disabled'),
            rightComponent: (
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={isDarkMode ? 'white' : theme.colors.surface}
              />
            )
          })}
          
          {renderSettingItem({
            icon: 'phone-portrait-outline',
            title: 'Follow System Theme',
            subtitle: 'Automatically switch based on device settings',
            rightComponent: (
              <Switch
                value={isSystemTheme}
                onValueChange={(value) => {
                  if (value) {
                    setSystemTheme();
                  } else {
                    // Keep current theme but disable system following
                    if (isDarkMode) {
                      setDarkTheme();
                    } else {
                      setLightTheme();
                    }
                  }
                }}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={isSystemTheme ? 'white' : theme.colors.surface}
              />
            )
          })}
        </View>
      </Animatable.View>

      {/* Storage Section */}
      <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
        <Text style={styles.sectionTitle}>Storage</Text>
        
        <View style={styles.settingsContainer}>
          {renderSettingItem({
            icon: 'cloud-outline',
            title: 'Storage Usage',
            subtitle: 'View your storage usage and manage files',
            onPress: () => {
              Alert.alert('Coming Soon', 'Storage management will be available in a future update');
            }
          })}
          
          {renderSettingItem({
            icon: 'download-outline',
            title: 'Offline Files',
            subtitle: 'Manage files available offline',
            onPress: () => {
              Alert.alert('Coming Soon', 'Offline file management will be available in a future update');
            }
          })}
        </View>
      </Animatable.View>

      {/* Support Section */}
      <Animatable.View animation="fadeInUp" delay={500} style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <View style={styles.settingsContainer}>
          {renderSettingItem({
            icon: 'help-circle-outline',
            title: 'Help & FAQ',
            subtitle: 'Get help and find answers',
            onPress: () => {
              Alert.alert('Coming Soon', 'Help section will be available in a future update');
            }
          })}
          
          {renderSettingItem({
            icon: 'mail-outline',
            title: 'Contact Support',
            subtitle: 'Get in touch with our support team',
            onPress: () => {
              Alert.alert('Coming Soon', 'Contact support will be available in a future update');
            }
          })}
          
          {renderSettingItem({
            icon: 'information-circle-outline',
            title: 'About',
            subtitle: 'App version and legal information',
            onPress: () => {
              Alert.alert('About', 'Secure File Storage v1.0.0\n\nA secure and modern file storage solution.');
            }
          })}
        </View>
      </Animatable.View>

      {/* Account Actions */}
      <Animatable.View animation="fadeInUp" delay={600} style={styles.section}>
        <View style={styles.settingsContainer}>
          {renderSettingItem({
            icon: 'log-out-outline',
            title: 'Logout',
            subtitle: 'Sign out of your account',
            onPress: handleLogout,
            color: theme.colors.danger
          })}
        </View>
      </Animatable.View>

      {/* Account Info */}
      <View style={styles.accountInfo}>
        <Text style={styles.accountInfoText}>
          Account created: {formatDate(user?.createdAt)}
        </Text>
        <Text style={styles.accountInfoText}>
          Last login: {formatDate(user?.lastLogin)}
        </Text>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  profileHeader: {
    marginBottom: theme.spacing.lg,
  },
  profileGradient: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: theme.spacing.lg,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  statNumber: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: 'white',
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  settingsContainer: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  accountInfo: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  accountInfoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
});

export default ProfileScreen; 