import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { debugAuthentication, testTokenValidity, clearAndVerifyAuth } from '../services/tokenDebugger';

const AuthDebugger = () => {
  const { theme } = useTheme();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);

  const runAuthDebug = async () => {
    setTesting(true);
    try {
      const result = await debugAuthentication();
      setResults(result);
      
      // Show a summary alert
      const summary = result.validityTest?.valid 
        ? 'Authentication is working correctly'
        : `Auth issue: ${result.recommendations?.[0] || 'Unknown error'}`;
        
      Alert.alert('Auth Debug Results', summary);
    } catch (error) {
      Alert.alert('Debug Error', error.message);
    } finally {
      setTesting(false);
    }
  };

  const clearAuth = async () => {
    Alert.alert(
      'Clear Authentication',
      'This will log you out and clear all auth data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAndVerifyAuth();
              Alert.alert('Success', 'Authentication data cleared');
              setResults(null);
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Auth Debugger</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.debugButton]}
          onPress={runAuthDebug}
          disabled={testing}
        >
          {testing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Ionicons name="bug-outline" size={16} color="white" />
          )}
          <Text style={styles.buttonText}>
            {testing ? 'Testing...' : 'Debug Auth'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearAuth}
        >
          <Ionicons name="trash-outline" size={16} color="white" />
          <Text style={styles.buttonText}>Clear Auth</Text>
        </TouchableOpacity>
      </View>

      {results && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Debug Results:</Text>
          
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Token Status:</Text>
            <Text style={[
              styles.resultValue,
              { color: results.tokenInfo?.hasToken ? theme.colors.success : theme.colors.danger }
            ]}>
              {results.tokenInfo?.hasToken ? '✅ Present' : '❌ Missing'}
            </Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Token Valid:</Text>
            <Text style={[
              styles.resultValue,
              { color: results.validityTest?.valid ? theme.colors.success : theme.colors.danger }
            ]}>
              {results.validityTest?.valid ? '✅ Valid' : '❌ Invalid'}
            </Text>
          </View>

          {results.decodedToken && (
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Token Expired:</Text>
              <Text style={[
                styles.resultValue,
                { color: results.decodedToken.isExpired ? theme.colors.danger : theme.colors.success }
              ]}>
                {results.decodedToken.isExpired ? '❌ Expired' : '✅ Valid'}
              </Text>
            </View>
          )}

          {results.recommendations && results.recommendations.length > 0 && (
            <View style={styles.recommendationsContainer}>
              <Text style={styles.recommendationsTitle}>Recommendations:</Text>
              {results.recommendations.map((rec, index) => (
                <Text key={index} style={styles.recommendation}>
                  • {rec}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    margin: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    minWidth: 100,
    justifyContent: 'center',
  },
  debugButton: {
    backgroundColor: theme.colors.primary,
  },
  clearButton: {
    backgroundColor: theme.colors.danger,
  },
  buttonText: {
    color: 'white',
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  resultsContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  resultsTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  resultLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  resultValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  recommendationsContainer: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  recommendationsTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  recommendation: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    lineHeight: 16,
  },
});

export default AuthDebugger; 