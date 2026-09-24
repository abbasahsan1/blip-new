import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { BottomNav } from '../components/BottomNav';
import { uploadBlippApi } from '../services/api';

export function UploadScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAudioFile(result.assets[0]);
      }
    } catch {
      Alert.alert('File Selection', 'Unable to access the audio file.');
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for this dispatch.');
      return;
    }
    if (!audioFile) {
      Alert.alert('Missing Audio', 'Please select an audio file to ingest.');
      return;
    }

    setIsUploading(true);
    try {
      await uploadBlippApi(title.trim(), {
        uri: audioFile.uri,
        name: audioFile.name,
        type: audioFile.mimeType || 'audio/mpeg',
      });

      Alert.alert('Broadcast Complete', 'Dispatch pushed to commute feed.');
      setTitle('');
      setDescription('');
      setAudioFile(null);
      navigation.navigate('Feed');
    } catch (err: any) {
      Alert.alert('Upload Error', err?.message || 'Failed to upload dispatch.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top > 0 ? insets.top + 16 : 28,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 110 : 130,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Editorial Top Bar (Flat, Aligned, Below Dynamic Island) */}
        <View style={styles.headerBlock}>
          <Text style={styles.screenTitle}>Studio Dispatch</Text>
          <Text style={styles.screenSubtitle}>
            Ingest master voice dispatches for commute stream
          </Text>
        </View>

        {/* Section 1: Audio Asset Slot (Single Clean Recessed Dock) */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>AUDIO ASSET</Text>

          {audioFile ? (
            <View style={styles.audioFileDock}>
              <View style={styles.audioFileInfo}>
                <MaterialIcons name="audiotrack" size={20} color="#ff6b35" />
                <View style={styles.audioFileTextCol}>
                  <Text style={styles.audioFileName} numberOfLines={1}>
                    {audioFile.name}
                  </Text>
                  <Text style={styles.audioFileMeta}>
                    {((audioFile.size || 0) / (1024 * 1024)).toFixed(2)} MB • READY FOR MASTERING
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setAudioFile(null)}
                style={styles.removeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Remove audio file"
              >
                <MaterialIcons name="close" size={18} color="#bdc6dd" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.dropZone}
              onPress={handlePickAudio}
              activeOpacity={0.8}
            >
              <MaterialIcons name="file-upload" size={24} color="#00eefc" />
              <Text style={styles.dropZoneTitle}>Select Audio File</Text>
              <Text style={styles.dropZoneSub}>WAV, MP3, or AAC up to 50MB</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Section 2: Title Field (Directly on canvas, no card wrapper) */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>DISPATCH TITLE</Text>
          <TextInput
            style={styles.headlineInput}
            value={title}
            onChangeText={setTitle}
            placeholder="The Physics of Silence in Deep Space"
            placeholderTextColor="#31353e"
            selectionColor="#ff6b35"
          />
        </View>

        {/* Section 3: Field Notes / Transcript (Continuous Surface) */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>TRANSCRIPT NOTES</Text>
          <TextInput
            style={styles.notesInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Add context, key quotes, or reference transcript..."
            placeholderTextColor="#31353e"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            selectionColor="#ff6b35"
          />
        </View>

        {/* Tactile Hardware Transport Button (Exact 64px, 12px Radius) */}
        <TouchableOpacity
          style={[styles.publishBtn, isUploading && styles.publishBtnDisabled]}
          onPress={handlePublish}
          disabled={isUploading}
          activeOpacity={0.9}
        >
          {isUploading ? (
            <ActivityIndicator color="#5f1900" size="small" />
          ) : (
            <View style={styles.publishBtnContent}>
              <MaterialIcons name="podcasts" size={24} color="#5f1900" />
              <View>
                <Text style={styles.publishBtnTitle}>Broadcast to Feed</Text>
                <Text style={styles.publishBtnSub}>COMMIT AUDIO DISPATCH</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Persistent 3-Tab Bottom Navigation */}
      <BottomNav
        currentRoute="Upload"
        onNavigate={(route) => {
          if (route !== 'Upload') {
            navigation.navigate(route);
          }
        }}
      />
    </KeyboardAvoidingView>
  );
}

export default UploadScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f131c',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 24, // Generous spacing without nested containers
  },
  headerBlock: {
    gap: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#1c2028',
  },
  screenTitle: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.56,
    color: '#dfe2ee',
  },
  screenSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#bdc6dd',
  },
  sectionBlock: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: 'JetBrainsMono-SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.88,
    color: '#ffb59d',
  },
  dropZone: {
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262a33',
    borderStyle: 'dashed',
    backgroundColor: '#141822',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dropZoneTitle: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 14,
    color: '#dfe2ee',
  },
  dropZoneSub: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 11,
    color: '#bdc6dd',
    opacity: 0.7,
  },
  audioFileDock: {
    height: 58,
    borderRadius: 12,
    backgroundColor: '#181c24',
    borderWidth: 1,
    borderColor: '#262a33',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  audioFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  audioFileTextCol: {
    flex: 1,
  },
  audioFileName: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 14,
    color: '#dfe2ee',
  },
  audioFileMeta: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 10,
    color: '#ffb59d',
    marginTop: 1,
  },
  removeBtn: {
    padding: 6,
  },
  headlineInput: {
    height: 52,
    backgroundColor: '#181c24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262a33',
    paddingHorizontal: 14,
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 16,
    color: '#dfe2ee',
  },
  notesInput: {
    height: 96,
    backgroundColor: '#181c24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262a33',
    paddingHorizontal: 14,
    paddingTop: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#dfe2ee',
  },
  publishBtn: {
    height: 64, // Exact reference transport height (h-16)
    backgroundColor: '#ff6b35',
    borderRadius: 12, // Exact rounded-xl
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  publishBtnDisabled: {
    opacity: 0.5,
  },
  publishBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  publishBtnTitle: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 16,
    lineHeight: 20,
    color: '#5f1900',
  },
  publishBtnSub: {
    fontFamily: 'JetBrainsMono-SemiBold',
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.88,
    color: '#5f1900',
    opacity: 0.85,
  },
});
