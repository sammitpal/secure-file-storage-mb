import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Clipboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { authApi, API_BASE_URL } from '../services/api';
import { debugNetworkConfig, getNetworkTroubleshootingTips } from '../services/networkConfig';
import { debugAuthentication, testTokenValidity } from '../services/tokenDebugger';

const NetworkDebugger = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);
  const [networkConfig, setNetworkConfig] = useState(null);
  const [authTesting, setAuthTesting] = useState(false);
  const [authResults, setAuthResults] = useState(null);

  useEffect(() => {
    if (visible) {
      setNetworkConfig(debugNetworkConfig());
    }
  }, [visible]);

  const testConnection = async () => {
    setTesting(true);
    setResults(null);

    try {
      const result = await authApi.testConnection();
      setResults(result);
    } catch (error) {
      setResults({
        success: false,
        error: error.message,
        troubleshooting: getNetworkTroubleshootingTips()
      });
    } finally {
      setTesting(false);
    }
  };

  const testAuthentication = async () => {
    setAuthTesting(true);
    setAuthResults(null);

    try {
      const result = await debugAuthentication();
      setAuthResults(result);
    } catch (error) {
      setAuthResults({
        error: error.message,
        recommendations: ['Check console logs for detailed error information']
      });
    } finally {
      setAuthTesting(false);
    }
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Information copied to clipboard');
  };

  const styles = createStyles(theme);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Network Debugger</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Network Configuration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📡 Network Configuration</Text>
            {networkConfig && (
              <View style={styles.configContainer}>
                <Text style={styles.configItem}>Platform: {networkConfig.platform}</Text>
                <Text style={styles.configItem}>Development Mode: {networkConfig.isDev ? 'Yes' : 'No'}</Text>
                <TouchableOpacity 
                  onPress={() => copyToClipboard(networkConfig.apiBaseUrl)}
                  style={styles.copyableItem}
                >
                  <Text style={styles.configItem}>API URL: {networkConfig.apiBaseUrl}</Text>
                  <Ionicons name="copy-outline" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={styles.configItem}>Machine IP: {networkConfig.machineIP}</Text>
                <Text style={styles.configItem}>Port: {networkConfig.port}</Text>
                <Text style={styles.configItem}>Protocol: {networkConfig.protocol}</Text>
              </View>
            )}
          </View>

          {/* Connection Test */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔍 Connection Test</Text>
            
            <TouchableOpacity
              style={[styles.testButton, testing && styles.testButtonDisabled]}
              onPress={testConnection}
              disabled={testing}
            >
              {testing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Ionicons name="wifi-outline" size={20} color="white" />
              )}
              <Text style={styles.testButtonText}>
                {testing ? 'Testing...' : 'Test Connection'}
              </Text>
            </TouchableOpacity>

            {results && (
              <View style={[
                styles.resultsContainer,
                results.success ? styles.successContainer : styles.errorContainer
              ]}>
                <View style={styles.resultHeader}>
                  <Ionicons 
                    name={results.success ? 'checkmark-circle' : 'close-circle'} 
                    size={20} 
                    color={results.success ? theme.colors.success : theme.colors.danger} 
                  />
                  <Text style={[
                    styles.resultTitle,
                    { color: results.success ? theme.colors.success : theme.colors.danger }
                  ]}>
                    {results.success ? 'Connection Successful' : 'Connection Failed'}
                  </Text>
                </View>

                {results.success ? (
                  <View>
                    <Text style={styles.resultText}>✅ Backend server is reachable</Text>
                    <Text style={styles.resultText}>Status: {results.status}</Text>
                    <Text style={styles.resultText}>URL: {results.url}</Text>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.errorText}>❌ {results.error}</Text>
                    {results.troubleshooting && (
                      <View style={styles.troubleshootingContainer}>
                        <Text style={styles.troubleshootingTitle}>Troubleshooting Steps:</Text>
                        {results.troubleshooting.map((tip, index) => (
                          <Text key={index} style={styles.troubleshootingText}>
                            {tip}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Authentication Test */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔐 Authentication Test</Text>
            
            <TouchableOpacity
              style={[styles.testButton, authTesting && styles.testButtonDisabled]}
              onPress={testAuthentication}
              disabled={authTesting}
            >
              {authTesting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Ionicons name="key-outline" size={20} color="white" />
              )}
              <Text style={styles.testButtonText}>
                {authTesting ? 'Testing Auth...' : 'Test Authentication'}
              </Text>
            </TouchableOpacity>

            {authResults && (
              <View style={[
                styles.resultsContainer,
                authResults.validityTest?.valid ? styles.successContainer : styles.errorContainer
              ]}>
                <View style={styles.resultHeader}>
                  <Ionicons 
                    name={authResults.validityTest?.valid ? 'checkmark-circle' : 'close-circle'} 
                    size={20} 
                    color={authResults.validityTest?.valid ? theme.colors.success : theme.colors.danger} 
                  />
                  <Text style={[
                    styles.resultTitle,
                    { color: authResults.validityTest?.valid ? theme.colors.success : theme.colors.danger }
                  ]}>
                    {authResults.validityTest?.valid ? 'Authentication Valid' : 'Authentication Issue'}
                  </Text>
                </View>

                <View style={styles.authDebugContainer}>
                  <Text style={styles.authDebugTitle}>Token Status:</Text>
                  <Text style={styles.authDebugText}>
                    Has Token: {authResults.tokenInfo?.hasToken ? '✅' : '❌'}
                  </Text>
                  <Text style={styles.authDebugText}>
                    Token Length: {authResults.tokenInfo?.tokenLength || 0} chars
                  </Text>
                  <Text style={styles.authDebugText}>
                    Has User: {authResults.tokenInfo?.hasUser ? '✅' : '❌'}
                  </Text>
                  
                  {authResults.decodedToken && (
                    <>
                      <Text style={styles.authDebugText}>
                        Token Expired: {authResults.decodedToken.isExpired ? '❌ Yes' : '✅ No'}
                      </Text>
                      {authResults.decodedToken.expiresAt && (
                        <Text style={styles.authDebugText}>
                          Expires: {new Date(authResults.decodedToken.expiresAt).toLocaleString()}
                        </Text>
                      )}
                    </>
                  )}
                </View>

                {authResults.recommendations && authResults.recommendations.length > 0 && (
                  <View style={styles.troubleshootingContainer}>
                    <Text style={styles.troubleshootingTitle}>Recommendations:</Text>
                    {authResults.recommendations.map((rec, index) => (
                      <Text key={index} style={styles.troubleshootingText}>
                        • {rec}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Quick Fixes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔧 Quick Fixes</Text>
            
            <View style={styles.fixesContainer}>
              <Text style={styles.fixTitle}>1. Update IP Address</Text>
              <Text style={styles.fixText}>
                Edit SecureFileStorageRN/src/services/networkConfig.js and update YOUR_MACHINE_IP with your computer's actual IP address.
              </Text>
              
              <Text style={styles.fixTitle}>2. Start Backend Server</Text>
              <Text style={styles.fixText}>
                Make sure your backend server is running:
                {'\n'}cd backend && npm start
              </Text>
              
              <Text style={styles.fixTitle}>3. Check Firewall</Text>
              <Text style={styles.fixText}>
                Temporarily disable your firewall or allow Node.js through it.
              </Text>
              
              <Text style={styles.fixTitle}>4. Test in Browser</Text>
              <TouchableOpacity 
                onPress={() => copyToClipboard(API_BASE_URL.replace('/api', ''))}
                style={styles.copyableItem}
              >
                <Text style={styles.fixText}>
                  Open browser and go to: {API_BASE_URL.replace('/api', '')}
                </Text>
                <Ionicons name="copy-outline" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Platform Specific Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📱 Platform Specific</Text>
            
            <View style={styles.platformContainer}>
              <Text style={styles.platformTitle}>iOS Simulator:</Text>
              <Text style={styles.platformText}>
                • Can use localhost or your machine's IP{'\n'}
                • Make sure backend is accessible from your machine
              </Text>
              
              <Text style={styles.platformTitle}>iOS Device:</Text>
              <Text style={styles.platformText}>
                • Must use your machine's actual IP address{'\n'}
                • Device and computer must be on same WiFi network
              </Text>
              
              <Text style={styles.platformTitle}>Android Emulator:</Text>
              <Text style={styles.platformText}>
                • Uses 10.0.2.2 to reach host machine's localhost{'\n'}
                • This is handled automatically in networkConfig.js
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    margin: theme.spacing.lg,
    maxHeight: '90%',
    width: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  configContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  configItem: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontFamily: 'monospace',
  },
  copyableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  testButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  testButtonDisabled: {
    opacity: 0.7,
  },
  testButtonText: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  resultsContainer: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
  },
  successContainer: {
    backgroundColor: `${theme.colors.success}10`,
    borderColor: theme.colors.success,
  },
  errorContainer: {
    backgroundColor: `${theme.colors.danger}10`,
    borderColor: theme.colors.danger,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  resultTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  resultText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.danger,
    marginBottom: theme.spacing.sm,
  },
  troubleshootingContainer: {
    marginTop: theme.spacing.sm,
  },
  troubleshootingTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  troubleshootingText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    lineHeight: 16,
  },
  fixesContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  fixTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  fixText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  platformContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  platformTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  platformText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
});

export default NetworkDebugger; 