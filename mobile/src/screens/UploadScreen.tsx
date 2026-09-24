import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { PrimaryButton } from '../components/PrimaryButton';
import { uploadBlippApi, ApiRequestError } from '../services/api';
import { Colors, Radius, Spacing, Typography } from '../theme/tokens';

interface SelectedFile {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export const UploadScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePickAudio = async () => {
    setErrorMessage(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
          mimeType: asset.mimeType || 'audio/mpeg',
        });
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not access file picker.');
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      setErrorMessage('Please provide a title for your Blipp.');
      return;
    }
    if (!selectedFile) {
      setErrorMessage('Please select an audio file to upload.');
      return;
    }

    setUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const newBlipp = await uploadBlippApi(title, {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType,
      });

      setSuccessMessage(`✓ Published: "${newBlipp.title}"`);
      // Return to feed after brief success confirmation
      setTimeout(() => {
        navigation.navigate('Feed');
      }, 1200);
    } catch (err: any) {
      if (err instanceof ApiRequestError) {
        setErrorMessage(err.message || 'Upload failed. Please verify format.');
      } else {
        setErrorMessage(err?.message || 'Upload failed. Check network connection.');
      }
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Minimal Navigation Bar */}
        <View style={styles.topNav}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
          >
            <Text style={styles.backBtnText}>← BACK</Text>
          </Pressable>
          <View style={styles.topNavBadge}>
            <View style={styles.cyanDot} />
            <Text style={styles.topNavBadgeText}>CREATOR STUDIO</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Publish New Blipp</Text>
            <Text style={styles.subtitle}>
              Upload a short-form audio clip. Your track will be processed and
              streamed across all commuter channels.
            </Text>
          </View>

          {/* Success Banner */}
          {successMessage && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Upload Ingestion Card */}
          <View style={styles.card}>
            {/* Audio File Picker Section */}
            <View style={styles.section}>
              <Text style={styles.label}>AUDIO SOURCE FILE</Text>
              {selectedFile ? (
                <View style={styles.selectedFileBox}>
                  <View style={styles.fileIconBox}>
                    <Text style={styles.fileIcon}>🎵</Text>
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {selectedFile.name}
                    </Text>
                    <Text style={styles.fileMeta}>
                      {formatFileSize(selectedFile.size)} • {selectedFile.mimeType}
                    </Text>
                  </View>
                  <Pressable
                    onPress={handlePickAudio}
                    style={styles.changeFileBtn}
                  >
                    <Text style={styles.changeFileText}>CHANGE</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={handlePickAudio}
                  style={({ pressed }) => [
                    styles.dropzone,
                    pressed && styles.dropzonePressed,
                  ]}
                >
                  <Text style={styles.dropzoneIcon}>🎙️</Text>
                  <Text style={styles.dropzoneTitle}>Select Audio File</Text>
                  <Text style={styles.dropzoneSubtitle}>
                    MP3, M4A, WAV, AAC, FLAC (Lossless supported)
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Title Input */}
            <View style={styles.section}>
              <Text style={styles.label}>BLIPP TITLE</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. The Physics of Silence in Deep Space"
                placeholderTextColor={Colors.onSurfaceSubtle}
                value={title}
                onChangeText={setTitle}
                maxLength={200}
              />
              <Text style={styles.charCount}>{title.length}/200</Text>
            </View>

            {/* Ingestion Spec Pill */}
            <View style={styles.specPill}>
              <Text style={styles.specPillText}>
                DIRECT S3 INGESTION • BACKBLAZE B2 PROTECTED
              </Text>
            </View>

            {/* Submit Action Button */}
            <PrimaryButton
              title={uploading ? 'UPLOADING TO STREAM…' : 'PUBLISH BLIPP'}
              onPress={handleUpload}
              loading={uploading}
              disabled={uploading || !selectedFile || !title.trim()}
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  topNav: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  btnPressed: {
    opacity: 0.7,
  },
  backBtnText: {
    ...Typography.labelCaps,
    color: Colors.onSurfaceVariant,
    fontSize: 10,
  },
  topNavBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cyanDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondaryContainer,
  },
  topNavBadgeText: {
    ...Typography.labelCaps,
    color: Colors.secondaryContainer,
    fontSize: 9,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.headlineLg,
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  successBanner: {
    backgroundColor: '#064E3B',
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  successText: {
    ...Typography.bodyMd,
    color: Colors.success,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: Colors.errorContainer,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  errorText: {
    ...Typography.bodyMd,
    color: Colors.error,
    fontWeight: '500',
  },
  card: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  section: {
    gap: Spacing.xs + 2,
  },
  label: {
    ...Typography.labelCaps,
    color: Colors.onSurfaceVariant,
  },
  dropzone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.outline,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropzonePressed: {
    borderColor: Colors.primaryContainer,
    backgroundColor: Colors.surfaceContainerLow,
  },
  dropzoneIcon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  dropzoneTitle: {
    ...Typography.headlineSm,
    color: Colors.onSurface,
    marginBottom: 4,
  },
  dropzoneSubtitle: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  selectedFileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.secondaryContainer,
    gap: Spacing.sm,
  },
  fileIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileIcon: {
    fontSize: 20,
  },
  fileInfo: {
    flex: 1,
    minWidth: 0,
  },
  fileName: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
    fontWeight: '600',
  },
  fileMeta: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  changeFileBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  changeFileText: {
    ...Typography.labelCaps,
    fontSize: 9,
    color: Colors.secondaryContainer,
  },
  input: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.outline,
    height: 48,
    paddingHorizontal: Spacing.md,
    color: Colors.onSurface,
    ...Typography.bodyLg,
  },
  charCount: {
    ...Typography.telemetry,
    fontSize: 10,
    color: Colors.onSurfaceSubtle,
    textAlign: 'right',
  },
  specPill: {
    backgroundColor: Colors.surfaceContainerLowest,
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  specPillText: {
    ...Typography.telemetry,
    fontSize: 9,
    color: Colors.onSurfaceSubtle,
    letterSpacing: 0.8,
  },
  submitBtn: {
    marginTop: Spacing.xs,
  },
});
