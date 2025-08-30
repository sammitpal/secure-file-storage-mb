import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { testNetworkConnection, getNetworkTroubleshootingTips, getApiBaseUrl } from '../services/networkConfig';

const NetworkTestScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const runNetworkTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await testNetworkConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        url: getApiBaseUrl()
      });
    } finally {
      setTesting(false);
    }
  };

  const showTroubleshootingTips = () => {
    const tips = getNetworkTroubleshootingTips();
    Alert.alert(
      'Troubleshooting Tips',
      tips.join('\n\n'),
      [{ text: 'OK' }]
    );
  };

  const styles = createStyles(theme, isDarkMode);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Network Test</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Configuration</Text>
          <View style={styles.configCard}>
            <Text style={styles.configLabel}>API Base URL:</Text>
            <Text style={styles.configValue}>{getApiBaseUrl()}</Text>
          </View>
        </View>

        {/* Test Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.testButton, testing && styles.testButtonDisabled]}
            onPress={runNetworkTest}
            disabled={testing}
          >
            {testing ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="wifi" size={20} color="white" />
                <Text style={styles.testButtonText}>Test Connection</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Test Results */}
        {testResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test Results</Text>
            <View style={[
              styles.resultCard,
              testResult.success ? styles.successCard : styles.errorCard
            ]}>
              <View style={styles.resultHeader}>
                <Ionicons
                  name={testResult.success ? 'checkmark-circle' : 'close-circle'}
                  size={24}
                  color={testResult.success ? theme.colors.success : theme.colors.danger}
                />
                <Text style={[
                  styles.resultTitle,
                  { color: testResult.success ? theme.colors.success : theme.colors.danger }
                ]}>
                  {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                </Text>
              </View>
              
              <Text style={styles.resultUrl}>URL: {testResult.url}</Text>
              
              {testResult.success && (
                <Text style={styles.resultStatus}>Status: {testResult.status}</Text>
              )}
              
              {testResult.error && (
                <Text style={styles.resultError}>Error: {testResult.error}</Text>
              )}
            </View>
          </View>
        )}

        {/* Troubleshooting */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={showTroubleshootingTips}
          >
            <Ionicons name="help-circle-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.helpButtonText}>Troubleshooting Tips</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Setup Instructions</Text>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionText}>
              1. Make sure your backend server is running on port 3001
            </Text>
            <Text style={styles.instructionText}>
              2. Update the IP address in src/services/networkConfig.js
            </Text>
            <Text style={styles.instructionText}>
              3. Find your IP address:
            </Text>
            <Text style={styles.instructionSubText}>
              • Windows: Run 'ipconfig' in Command Prompt
            </Text>
            <Text style={styles.instructionSubText}>
              • Mac/Linux: Run 'ifconfig' in Terminal
            </Text>
            <Text style={styles.instructionText}>
              4. Look for your local network IP (192.168.x.x or 10.x.x.x)
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  section: {
    marginVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  configCard: {
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  configLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  configValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontFamily: 'monospace',
  },
  testButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  resultCard: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
  },
  successCard: {
    backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
    borderColor: theme.colors.success,
  },
  errorCard: {
    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
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
  resultUrl: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: theme.spacing.xs,
  },
  resultStatus: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
  },
  resultError: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.danger,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'transparent',
  },
  helpButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    marginLeft: theme.spacing.sm,
  },
  instructionsCard: {
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  instructionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },
  instructionSubText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.md,
    lineHeight: 18,
  },
});

export default NetworkTestScreen; 