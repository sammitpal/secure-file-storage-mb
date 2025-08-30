import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Animatable from 'react-native-animatable';
// import { Progress } from 'react-native-progress'; // Commented out due to web compatibility issues
import { useTheme } from '../../contexts/ThemeContext';
import { filesApi } from '../../services/api';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const UploadScreen = ({ navigation, route }) => {
  const { theme, isDarkMode } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentFolderPath, setCurrentFolderPath] = useState('');

  // Get current folder path from route params or AsyncStorage
  useEffect(() => {
    const getCurrentPath = async () => {
      try {
        // Try to get from route params first
        if (route?.params?.currentFolderPath) {
          setCurrentFolderPath(route.params.currentFolderPath);
        } else {
          // Fallback to AsyncStorage for shared state
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const savedPath = await AsyncStorage.getItem('currentFolderPath');
          setCurrentFolderPath(savedPath || '');
        }
      } catch (error) {
        console.log('Error getting current folder path:', error);
        setCurrentFolderPath('');
      }
    };
    
    getCurrentPath();
  }, [route?.params?.currentFolderPath]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        setSelectedFiles(result.assets);
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to pick document'
      });
    }
  };

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        setSelectedFiles(result.assets);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to pick image'
      });
    }
  };

  const takePhoto = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        setSelectedFiles(result.assets);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to take photo'
      });
    }
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No Files Selected',
        text2: 'Please select files to upload'
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        await filesApi.uploadFile(
          file.uri,
          file.name,
          currentFolderPath,
          (progress) => {
            const totalProgress = ((i / selectedFiles.length) + (progress / 100 / selectedFiles.length)) * 100;
            setUploadProgress(totalProgress);
          }
        );
      }

      Toast.show({
        type: 'success',
        text1: 'Upload Complete',
        text2: `${selectedFiles.length} file(s) uploaded successfully`
      });

      setSelectedFiles([]);
      setUploadProgress(0);
      
      // Navigate to Files tab to see uploaded files
      navigation.navigate('Files');
      
    } catch (error) {
      console.error('Upload error:', error);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: error.response?.data?.message || 'Failed to upload files'
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
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

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const styles = createStyles(theme, isDarkMode);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Current Folder Display */}
      <View style={styles.currentFolderContainer}>
        <Ionicons name="folder" size={20} color={theme.colors.primary} />
        <Text style={styles.currentFolderText}>
          Uploading to: {currentFolderPath || 'Root Folder'}
        </Text>
      </View>

      {/* Upload Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Upload Method</Text>
        
        <View style={styles.uploadOptions}>
          <Animatable.View animation="fadeInLeft" delay={100}>
            <TouchableOpacity
              style={styles.uploadOption}
              onPress={pickDocument}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.uploadOptionGradient}
              >
                <Ionicons name="document-outline" size={32} color="white" />
                <Text style={styles.uploadOptionText}>Documents</Text>
                <Text style={styles.uploadOptionSubtext}>PDF, DOC, XLS, etc.</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={200}>
            <TouchableOpacity
              style={styles.uploadOption}
              onPress={pickImage}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[theme.colors.secondary, '#059669']}
                style={styles.uploadOptionGradient}
              >
                <Ionicons name="images-outline" size={32} color="white" />
                <Text style={styles.uploadOptionText}>Gallery</Text>
                <Text style={styles.uploadOptionSubtext}>Photos & Videos</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View animation="fadeInRight" delay={300}>
            <TouchableOpacity
              style={styles.uploadOption}
              onPress={takePhoto}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#8b5cf6', '#7c3aed']}
                style={styles.uploadOptionGradient}
              >
                <Ionicons name="camera-outline" size={32} color="white" />
                <Text style={styles.uploadOptionText}>Camera</Text>
                <Text style={styles.uploadOptionSubtext}>Take Photo/Video</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </View>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Animatable.View animation="fadeInUp" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Selected Files ({selectedFiles.length})</Text>
            <TouchableOpacity onPress={clearAllFiles} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filesList}>
            {selectedFiles.map((file, index) => {
              const fileIcon = getFileIcon(file.name);
              
              return (
                <Animatable.View 
                  key={index} 
                  animation="fadeInUp" 
                  delay={index * 100}
                  style={styles.fileItem}
                >
                  <View style={styles.fileItemLeft}>
                    <View style={[styles.fileIcon, { backgroundColor: `${fileIcon.color}20` }]}>
                      <Ionicons name={fileIcon.name} size={24} color={fileIcon.color} />
                    </View>
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                      <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    onPress={() => removeFile(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={24} color={theme.colors.danger} />
                  </TouchableOpacity>
                </Animatable.View>
              );
            })}
          </View>
        </Animatable.View>
      )}

      {/* Upload Progress */}
      {uploading && (
        <Animatable.View animation="fadeInUp" style={styles.section}>
          <Text style={styles.sectionTitle}>Uploading Files...</Text>
          
          <View style={styles.progressContainer}>
            {/* Custom Progress Bar for Web Compatibility */}
            <View style={[styles.progressBar, { width: width - 64 }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${uploadProgress}%`,
                    backgroundColor: theme.colors.primary 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{Math.round(uploadProgress)}%</Text>
          </View>
        </Animatable.View>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && !uploading && (
        <Animatable.View animation="fadeInUp" style={styles.section}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={uploadFiles}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.uploadButtonGradient}
            >
              <Ionicons name="cloud-upload-outline" size={24} color="white" />
              <Text style={styles.uploadButtonText}>
                Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
      )}

      {/* Upload Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upload Tips</Text>
        
        <View style={styles.tipsContainer}>
          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={styles.tipText}>Maximum file size: 10MB</Text>
          </View>
          
          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={styles.tipText}>All file types are supported</Text>
          </View>
          
          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={styles.tipText}>Files are encrypted and secure</Text>
          </View>
          
          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={styles.tipText}>Multiple files can be uploaded at once</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    margin: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  uploadOption: {
    width: (width - 64) / 3 - 8,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  uploadOptionGradient: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  uploadOptionText: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  uploadOptionSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: theme.fontSize.xs,
    marginTop: 2,
    textAlign: 'center',
  },
  clearButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.danger,
    borderRadius: theme.borderRadius.md,
  },
  clearButtonText: {
    color: 'white',
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  filesList: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  fileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  fileSize: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  removeButton: {
    padding: theme.spacing.xs,
  },
  progressContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  progressText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  uploadButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  tipsContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  tipText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  currentFolderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 16,
    marginBottom: 16,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  currentFolderText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default UploadScreen; 