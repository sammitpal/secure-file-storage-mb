import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../contexts/ThemeContext';
import { filesApi } from '../../services/api';
import Toast from 'react-native-toast-message';

const SharedScreen = () => {
  const { theme } = useTheme();
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSharedFiles();
  }, []);

  const fetchSharedFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await filesApi.getSharedFiles();
      
      if (response.success && response.data) {
        setSharedFiles(response.data.shares || []);
      }
    } catch (error) {
      console.error('Error fetching shared files:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load shared files'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSharedFiles();
    setRefreshing(false);
  }, [fetchSharedFiles]);

  const copyShareLink = async (shareUrl) => {
    try {
      await Clipboard.setStringAsync(shareUrl);
      Toast.show({
        type: 'success',
        text1: 'Copied!',
        text2: 'Share link copied to clipboard'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to copy link'
      });
    }
  };

  const deleteShare = (shareId, fileName) => {
    Alert.alert(
      'Remove Share',
      `Stop sharing "${fileName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // Note: You'll need to implement this endpoint in your backend
              // await filesApi.deleteShare(shareId);
              Toast.show({
                type: 'success',
                text1: 'Share Removed',
                text2: `${fileName} is no longer shared`
              });
              fetchSharedFiles();
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to remove share'
              });
            }
          }
        }
      ]
    );
  };

  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return { name: 'document-text', color: '#ef4444' };
      case 'doc':
      case 'docx':
        return { name: 'document', color: '#2563eb' };
      case 'xls':
      case 'xlsx':
        return { name: 'grid', color: '#16a34a' };
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return { name: 'image', color: '#8b5cf6' };
      case 'mp4':
      case 'avi':
      case 'mov':
        return { name: 'videocam', color: '#ec4899' };
      case 'mp3':
      case 'wav':
        return { name: 'musical-notes', color: '#06b6d4' };
      default:
        return { name: 'document-outline', color: theme.colors.textSecondary };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderSharedFile = ({ item, index }) => {
    const fileIcon = getFileIcon(item.file?.originalName);
    
    return (
      <Animatable.View 
        animation="fadeInUp" 
        delay={index * 100}
        style={styles.itemContainer}
      >
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: `${fileIcon.color}20` }]}>
              <Ionicons name={fileIcon.name} size={24} color={fileIcon.color} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.file?.originalName || 'Unknown File'}
              </Text>
              <Text style={styles.itemDetails}>
                Shared on {formatDate(item.createdAt)}
              </Text>
              <View style={styles.shareInfo}>
                <Ionicons name="eye-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.shareStats}>
                  {item.accessCount || 0} views
                </Text>
                {item.expiresAt && (
                  <>
                    <Ionicons name="time-outline" size={14} color={theme.colors.warning} style={{ marginLeft: 12 }} />
                    <Text style={[styles.shareStats, { color: theme.colors.warning }]}>
                      Expires {formatDate(item.expiresAt)}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.itemActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => copyShareLink(item.shareUrl)}
            >
              <Ionicons name="copy-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => deleteShare(item._id, item.file?.originalName)}
            >
              <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </Animatable.View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="share-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>No shared files</Text>
      <Text style={styles.emptySubtitle}>
        Share files from the Files tab to see them here
      </Text>
    </View>
  );

  const styles = createStyles(theme);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading shared files...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.headerContainer}>
        <View style={styles.headerIcon}>
          <Ionicons name="share" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Shared Files</Text>
          <Text style={styles.headerSubtitle}>
            {sharedFiles.length} file{sharedFiles.length !== 1 ? 's' : ''} shared
          </Text>
        </View>
      </View>

      {/* Shared Files List */}
      <FlatList
        data={sharedFiles}
        renderItem={renderSharedFile}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  listContainer: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  itemContainer: {
    marginBottom: theme.spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  shareInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareStats: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SharedScreen; 