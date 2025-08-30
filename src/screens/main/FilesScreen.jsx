import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../contexts/ThemeContext';
import { filesApi, foldersApi } from '../../services/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const FilesScreen = () => {
  const { theme } = useTheme();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ totalFiles: 0, totalSize: 0, totalFolders: 0 });

  const currentFolderPath = currentPath.length === 0 ? '' : currentPath.map(p => p.name).join('/');

  useEffect(() => {
    fetchData();
  }, [currentFolderPath]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await filesApi.listFiles(currentFolderPath);
      
      if (response.success && response.data) {
        setFiles(response.data.files || []);
        setFolders(response.data.folders || []);
        setAllItems(response.data.items || []);
        setStats(response.data.stats || { totalFiles: 0, totalSize: 0, totalFolders: 0 });
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load files'
      });
    } finally {
      setLoading(false);
    }
  }, [currentFolderPath]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const navigateToFolder = (folder) => {
    setCurrentPath(prev => [...prev, { id: folder.id, name: folder.name }]);
  };

  const navigateBack = () => {
    setCurrentPath(prev => prev.slice(0, -1));
  };

  const navigateToBreadcrumb = (index) => {
    setCurrentPath(prev => prev.slice(0, index + 1));
  };

  const downloadFile = async (file) => {
    try {
      Toast.show({
        type: 'info',
        text1: 'Downloading...',
        text2: `Preparing ${file.originalName}`
      });

      // Extract the file key from s3Key (remove users/{userId}/ prefix)
      const fileKey = file.s3Key.split('/').slice(2).join('/');
      const response = await filesApi.getDownloadUrl(fileKey);
      
      if (response.success && response.downloadUrl) {
        const fileUri = FileSystem.documentDirectory + file.originalName;
        const downloadResult = await FileSystem.downloadAsync(response.downloadUrl, fileUri);
        
        if (downloadResult.status === 200) {
          Toast.show({
            type: 'success',
            text1: 'Downloaded',
            text2: `${file.originalName} saved to device`
          });
          
          // Share the file
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(downloadResult.uri);
          }
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      Toast.show({
        type: 'error',
        text1: 'Download Failed',
        text2: 'Could not download file'
      });
    }
  };

  const deleteFile = (file) => {
    Alert.alert(
      'Delete File',
      `Are you sure you want to delete "${file.originalName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Extract the file key from s3Key (remove users/{userId}/ prefix)
              const fileKey = file.s3Key.split('/').slice(2).join('/');
              await filesApi.deleteFile(fileKey);
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: `${file.originalName} has been deleted`
              });
              fetchData();
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Delete Failed',
                text2: 'Could not delete file'
              });
            }
          }
        }
      ]
    );
  };

  const deleteFolder = (folder) => {
    Alert.alert(
      'Delete Folder',
      `Are you sure you want to delete "${folder.name}" and all its contents?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const folderPath = folder.path ? `${folder.path}/${folder.name}` : folder.name;
              await foldersApi.deleteFolder(folderPath);
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: `${folder.name} has been deleted`
              });
              fetchData();
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Delete Failed',
                text2: 'Could not delete folder'
              });
            }
          }
        }
      ]
    );
  };

  const shareFile = async (file) => {
    try {
      const response = await filesApi.shareFile(file._id || file.id);
      if (response.success && response.data.shareUrl) {
        Toast.show({
          type: 'success',
          text1: 'Share Link Created',
          text2: 'Link copied to clipboard'
        });
        
        // Copy to clipboard (for web, we'll use a simple alert with the URL)
        if (Platform.OS === 'web') {
          // For web, show the URL in an alert
          Alert.alert(
            'Share Link Created',
            `Share URL: ${response.data.shareUrl}`,
            [
              { text: 'Copy URL', onPress: () => {
                // Try to copy to clipboard on web
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(response.data.shareUrl);
                }
              }},
              { text: 'OK' }
            ]
          );
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Share Failed',
        text2: 'Could not create share link'
      });
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName || typeof fileName !== 'string') {
      return { name: 'document', color: '#6b7280' }; // Default icon
    }
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return { name: 'document-text', color: '#ef4444' };
      case 'doc':
      case 'docx':
        return { name: 'document', color: '#2563eb' };
      case 'xls':
      case 'xlsx':
        return { name: 'grid', color: '#16a34a' };
      case 'ppt':
      case 'pptx':
        return { name: 'presentation-chart-bar', color: '#dc2626' };
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
        return { name: 'photo', color: '#7c3aed' };
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
      case 'flv':
        return { name: 'video-camera', color: '#059669' };
      case 'mp3':
      case 'wav':
      case 'flac':
      case 'aac':
        return { name: 'musical-note', color: '#d97706' };
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
        return { name: 'archive-box', color: '#6b7280' };
      case 'txt':
        return { name: 'document-text', color: '#374151' };
      default:
        return { name: 'document', color: '#6b7280' };
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderBreadcrumb = () => (
    <View style={styles.breadcrumbContainer}>
      <TouchableOpacity
        style={styles.breadcrumbItem}
        onPress={() => setCurrentPath([])}
      >
        <Ionicons name="home" size={16} color={theme.colors.primary} />
        <Text style={styles.breadcrumbText}>Home</Text>
      </TouchableOpacity>
      
      {currentPath.map((folder, index) => (
        <View key={folder.id} style={styles.breadcrumbItem}>
          <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} />
          <TouchableOpacity onPress={() => navigateToBreadcrumb(index)}>
            <Text style={styles.breadcrumbText}>{folder.name}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderFolder = ({ item, index }) => (
    <Animatable.View 
      animation="fadeInUp" 
      delay={index * 100}
      style={styles.itemContainer}
    >
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigateToFolder(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemLeft}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <Ionicons name="folder" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemDetails}>
              Folder • {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deleteFolder(item)}
        >
          <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animatable.View>
  );

  const renderFile = ({ item, index }) => {
    const fileIcon = getFileIcon(item.originalName);
    
    return (
      <Animatable.View 
        animation="fadeInUp" 
        delay={(folders.length + index) * 100}
        style={styles.itemContainer}
      >
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: `${fileIcon.color}20` }]}>
              <Ionicons name={fileIcon.name} size={24} color={fileIcon.color} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.originalName}</Text>
              <Text style={styles.itemDetails}>
                {formatFileSize(item.size)} • {formatDate(item.uploadedAt)}
              </Text>
            </View>
          </View>
          
          <View style={styles.itemActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => shareFile(item)}
            >
              <Ionicons name="share-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => downloadFile(item)}
            >
              <Ionicons name="download-outline" size={20} color={theme.colors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => deleteFile(item)}
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
      <Ionicons name="folder-open-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>No files or folders</Text>
      <Text style={styles.emptySubtitle}>
        {currentPath.length > 0 ? 'This folder is empty' : 'Upload your first file to get started'}
      </Text>
    </View>
  );



  const styles = createStyles(theme);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading files...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.totalFiles}</Text>
          <Text style={styles.statLabel}>Files</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.totalFolders}</Text>
          <Text style={styles.statLabel}>Folders</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{formatFileSize(stats.totalSize)}</Text>
          <Text style={styles.statLabel}>Used</Text>
        </View>
      </View>

      {/* Breadcrumb */}
      {renderBreadcrumb()}

      {/* Files List */}
      <FlatList
        data={allItems}
        renderItem={({ item, index }) => 
          item.type === 'folder' ? renderFolder({ item, index }) : renderFile({ item, index })
        }
        keyExtractor={(item) => item._id || item.id}
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '600',
    marginHorizontal: 4,
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

export default FilesScreen; 