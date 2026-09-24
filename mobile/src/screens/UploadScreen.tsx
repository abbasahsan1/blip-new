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
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { BottomNav } from '../components/BottomNav';
import { uploadBlippApi } from '../services/api';

const TOPIC_TAGS = ['Science', 'Acoustics', 'Field Audio', 'Commute', 'Cognitive', 'Ambient'];

export function UploadScreen() {
  const navigation = useNavigation<any>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTag, setSelectedTag] = useState(TOPIC_TAGS[0]);
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
    } catch (err) {
      Alert.alert('Selection Error', 'Failed to pick audio file.');
    }
  };

  const handleBroadcast = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Field', 'Please enter a dispatch title.');
      return;
    }
    if (!audioFile) {
      Alert.alert('Missing Audio', 'Please select or ingest an audio asset.');
      return;
    }

    setIsUploading(true);
    try {
      await uploadBlippApi(title.trim(), {
        uri: audioFile.uri,
        name: audioFile.name,
        type: audioFile.mimeType || 'audio/mpeg',
      });
      Alert.alert('Broadcast Complete', 'Micro-dispatch pushed to live feed.');
      setTitle('');
      setDescription('');
      setAudioFile(null);
      navigation.navigate('Feed');
    } catch (err: any) {
      Alert.alert('Upload Failed', err?.message || 'Unable to broadcast dispatch.');
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Studio Telemetry Header Deck */}
        <View style={styles.telemetryDeck}>
          <View style={styles.telemetryLeft}>
            <View style={styles.consoleIconBox}>
              <MaterialIcons name="mic-external-on" size={20} color="#00eefc" />
            </View>
            <View>
              <View style={styles.rowInline}>
                <View style={styles.pulseDot} />
                <Text style={styles.telemetryDeckTag}>STUDIO // INGESTION DOCK</Text>
              </View>
              <Text style={styles.telemetryDeckSub}>Master Ingest • 24-BIT / 96kHz PCM</Text>
            </View>
          </View>
          <View style={styles.badgeLive}>
            <Text style={styles.badgeLiveText}>ONLINE</Text>
          </View>
        </View>

        {/* Audio Cartridge / Docking Slot */}
        <View style={styles.cartridgeDeck}>
          <View style={styles.fieldHeaderRow}>
            <Text style={styles.monoSectionHeader}>01 // AUDIO INGESTION SLOT</Text>
            <Text style={styles.telemetryMonoDim}>AI-ISOLATED MIC</Text>
          </View>

          {audioFile ? (
            <View style={styles.fileSelectedBox}>
              <View style={styles.fileInfoRow}>
                <View style={styles.fileIconBox}>
                  <MaterialIcons name="graphic-eq" size={22} color="#ff6b35" />
                </View>
                <View style={styles.fileDetails}>
                  <Text style={styles.fileNameText} numberOfLines={1}>
                    {audioFile.name}
                  </Text>
                  <Text style={styles.fileSizeText}>
                    {((audioFile.size || 0) / (1024 * 1024)).toFixed(2)} MB • READY FOR MASTERING
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setAudioFile(null)}
                  style={styles.removeFileBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialIcons name="close" size={18} color="#e1bfb5" />
                </TouchableOpacity>
              </View>

              {/* Hardware VU Level Mock */}
              <View style={styles.vuMeterBar}>
                {[45, 80, 60, 95, 30, 70, 85, 40, 100, 65, 50, 75, 90, 35, 60, 80].map((h, i) => (
                  <View
                    key={i}
                    style={[
                      styles.vuSegment,
                      {
                        height: `${h}%`,
                        backgroundColor: i > 12 ? '#ff6b35' : '#00eefc',
                        opacity: i > 10 ? 1 : 0.75,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.dockEmptyContainer}
              onPress={handlePickAudio}
              activeOpacity={0.85}
            >
              <View style={styles.dockIconCircle}>
                <MaterialIcons name="cloud-upload" size={26} color="#00eefc" />
              </View>
              <Text style={styles.dockPrimaryText}>Mount Master Audio Clip</Text>
              <Text style={styles.dockSecondaryText}>WAV, FLAC, or MP3 (Max 35MB)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Dispatch Metadata Channel Strip */}
        <View style={styles.channelStripCard}>
          <View style={styles.fieldHeaderRow}>
            <Text style={styles.monoSectionHeader}>02 // DISPATCH IDENTIFIER</Text>
            <Text style={styles.telemetryMonoDim}>REQUIRED</Text>
          </View>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Synaptic Echoes in Silent Fields"
            placeholderTextColor="#594139"
            selectionColor="#ff6b35"
          />

          <View style={[styles.fieldHeaderRow, { marginTop: 18 }]}>
            <Text style={styles.monoSectionHeader}>03 // LIVE SCRIPT & FIELD NOTES</Text>
            <Text style={styles.telemetryMonoDim}>OPTIONAL</Text>
          </View>
          <TextInput
            style={styles.transcriptInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter transcript snippet or micro-dispatch context..."
            placeholderTextColor="#594139"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            selectionColor="#ff6b35"
          />
        </View>

        {/* Channel Stream Pill Selector */}
        <View style={styles.tagSection}>
          <Text style={styles.monoSectionHeader}>04 // STREAM FREQUENCY MATRIX</Text>
          <View style={styles.tagGrid}>
            {TOPIC_TAGS.map((tag) => {
              const active = selectedTag === tag;
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => setSelectedTag(tag)}
                  style={[styles.tagPill, active && styles.tagPillActive]}
                  activeOpacity={0.8}
                >
                  {active && <View style={styles.tagActiveDot} />}
                  <Text style={[styles.tagPillText, active && styles.tagPillTextActive]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Primary Tactile Transport Deck Action */}
        <TouchableOpacity
          style={[styles.broadcastButton, isUploading && styles.broadcastButtonDisabled]}
          onPress={handleBroadcast}
          disabled={isUploading}
          activeOpacity={0.9}
        >
          {isUploading ? (
            <ActivityIndicator color="#5f1900" size="small" />
          ) : (
            <View style={styles.buttonContent}>
              <MaterialIcons name="cell-tower" size={26} color="#5f1900" />
              <View style={styles.btnTextCol}>
                <Text style={styles.btnHeadline}>Broadcast Dispatch</Text>
                <Text style={styles.btnSubline}>COMMIT TO COMMUTE STREAM</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Persistent 2-Tab Navigation */}
      <BottomNav
        currentRoute="Upload"
        onNavigate={(route) => {
          if (route === 'Feed') {
            navigation.navigate('Feed');
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
    paddingTop: 16,
    paddingBottom: 24,
    gap: 14,
  },
  rowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  telemetryDeck: {
    width: '100%',
    backgroundColor: '#181c24',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  telemetryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  consoleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1c2028',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 9999,
    backgroundColor: '#00eefc',
  },
  telemetryDeckTag: {
    fontFamily: 'JetBrainsMono-SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.88,
    color: '#00eefc',
  },
  telemetryDeckSub: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 12,
    lineHeight: 16,
    color: '#bdc6dd',
    marginTop: 1,
  },
  badgeLive: {
    backgroundColor: '#0a0e16',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#00eefc33',
  },
  badgeLiveText: {
    fontFamily: 'JetBrainsMono-SemiBold',
    fontSize: 10,
    color: '#00eefc',
    letterSpacing: 0.5,
  },
  cartridgeDeck: {
    backgroundColor: '#1c2028',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monoSectionHeader: {
    fontFamily: 'JetBrainsMono-SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.88,
    color: '#ffb59d',
  },
  telemetryMonoDim: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 11,
    color: '#bdc6dd',
    opacity: 0.7,
  },
  dockEmptyContainer: {
    height: 110,
    backgroundColor: '#0a0e16',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#31353e',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dockIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#181c24',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  dockPrimaryText: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 14,
    color: '#dfe2ee',
  },
  dockSecondaryText: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 11,
    color: '#bdc6dd',
  },
  fileSelectedBox: {
    backgroundColor: '#0a0e16',
    borderRadius: 10,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#31353e',
  },
  fileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fileIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#ff6b3522',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileDetails: {
    flex: 1,
  },
  fileNameText: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 14,
    color: '#dfe2ee',
  },
  fileSizeText: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 10,
    color: '#ffb59d',
    marginTop: 2,
    letterSpacing: 0.4,
  },
  removeFileBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#1c2028',
  },
  vuMeterBar: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: '#181c24',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  vuSegment: {
    width: 6,
    borderRadius: 3,
  },
  channelStripCard: {
    backgroundColor: '#1c2028',
    borderRadius: 12,
    padding: 14,
  },
  titleInput: {
    height: 48,
    backgroundColor: '#0a0e16',
    borderRadius: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    color: '#dfe2ee',
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#31353e',
  },
  transcriptInput: {
    height: 84,
    backgroundColor: '#0a0e16',
    borderRadius: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    color: '#dfe2ee',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    borderWidth: 1,
    borderColor: '#31353e',
  },
  tagSection: {
    backgroundColor: '#1c2028',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#0a0e16',
    borderWidth: 1,
    borderColor: '#31353e',
    gap: 6,
  },
  tagPillActive: {
    backgroundColor: '#181c24',
    borderColor: '#00eefc',
  },
  tagActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
    backgroundColor: '#00eefc',
  },
  tagPillText: {
    fontFamily: 'JetBrainsMono-SemiBold',
    fontSize: 11,
    color: '#bdc6dd',
    letterSpacing: 0.5,
  },
  tagPillTextActive: {
    color: '#00eefc',
  },
  broadcastButton: {
    height: 64,
    backgroundColor: '#ff6b35',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  broadcastButtonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btnTextCol: {
    alignItems: 'flex-start',
  },
  btnHeadline: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 17,
    color: '#5f1900',
    letterSpacing: -0.2,
  },
  btnSubline: {
    fontFamily: 'JetBrainsMono-SemiBold',
    fontSize: 10,
    color: '#5f1900',
    opacity: 0.85,
    letterSpacing: 0.8,
  },
});
