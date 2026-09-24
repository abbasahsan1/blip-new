import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { BottomNav } from '../components/BottomNav';
import { Blipp, fetchSavesApi, toggleSaveApi } from '../services/api';
import { setupAudioMode } from '../services/audio';
import { Colors, Metrics, Typography } from '../theme/tokens';

export const SavedScreen = ({ navigation }: any) => {
  const [saves, setSaves] = useState<Blipp[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Playback state
  const playerRef = useRef<AudioPlayer | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  // Non-blocking toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<any>(null);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  useEffect(() => {
    setupAudioMode();
    loadSaves();
    return () => {
      stopAndUnload();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const stopAndUnload = () => {
    try {
      if (playerRef.current) {
        playerRef.current.pause();
        playerRef.current.remove();
        playerRef.current = null;
      }
    } catch (e) {
      // ignore
    }
    setPlayingId(null);
    setIsPlaying(false);
  };

  const loadSaves = async (cursor?: string | null) => {
    try {
      const data = await fetchSavesApi(cursor, 15);
      if (cursor) {
        setSaves((prev) => [...prev, ...data.items]);
      } else {
        setSaves(data.items);
      }
      setNextCursor(data.next_cursor);
    } catch (err: any) {
      console.warn('Failed to load saved items:', err);
      showToast(err?.message || 'Failed to load saved items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadSaves();
  };

  const handleEndReached = () => {
    if (nextCursor && !loading) {
      loadSaves(nextCursor);
    }
  };

  const handleTogglePlay = async (item: Blipp) => {
    // If clicking on currently playing item, toggle play/pause
    if (playingId === item.id && playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
        setIsPlaying(false);
      } else {
        playerRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    // Stop current track
    stopAndUnload();
    setAudioLoading(true);
    setPlayingId(item.id);

    try {
      const newPlayer = createAudioPlayer({
        uri: item.audio_url,
      });
      playerRef.current = newPlayer;

      newPlayer.addListener('playbackStatusUpdate', (status) => {
        if (status.isLoaded) {
          setIsPlaying(status.playing);
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPlayingId(null);
          }
        }
      });

      newPlayer.play();
      setIsPlaying(true);
    } catch (err) {
      console.warn('Failed to play saved clip:', err);
      showToast('Failed to play audio clip');
      stopAndUnload();
    } finally {
      setAudioLoading(false);
    }
  };

  const handleUnsave = async (blippId: string) => {
    const targetIdx = saves.findIndex((b) => b.id === blippId);
    if (targetIdx === -1) return;
    const removedItem = saves[targetIdx];

    // Optimistically remove from list
    setSaves((prev) => prev.filter((b) => b.id !== blippId));

    // If currently playing this item, stop audio
    if (playingId === blippId) {
      stopAndUnload();
    }

    try {
      const res = await toggleSaveApi(blippId);
      if (res.saved) {
        // If server says still saved, put back
        setSaves((prev) => {
          const next = [...prev];
          next.splice(targetIdx, 0, removedItem);
          return next;
        });
      }
    } catch (err: any) {
      // Revert on error
      setSaves((prev) => {
        const next = [...prev];
        next.splice(targetIdx, 0, removedItem);
        return next;
      });
      showToast(err?.message || 'Failed to remove from saved');
    }
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const renderSavedCard = ({ item }: { item: Blipp }) => {
    const isThisPlaying = playingId === item.id && isPlaying;
    const isThisLoading = playingId === item.id && audioLoading;

    return (
      <View style={styles.card}>
        {/* Card Header Telemetry */}
        <View style={styles.cardHeader}>
          <View style={styles.creatorRow}>
            <View style={styles.avatarMini}>
              <Text style={styles.avatarMiniText}>
                {(item.creator_username || 'U')[0].toUpperCase()}
              </Text>
            </View>
            <Text style={styles.creatorUsername} numberOfLines={1}>
              @{item.creator_username}
            </Text>
          </View>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {formatDuration(item.duration_seconds)}
            </Text>
          </View>
        </View>

        {/* Card Title */}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Card Actions Row: 48px Tactile Buttons */}
        <View style={styles.cardActionsRow}>
          {/* Play/Pause Button */}
          <TouchableOpacity
            style={[
              styles.actionPlayBtn,
              isThisPlaying && styles.actionPlayBtnActive,
            ]}
            onPress={() => handleTogglePlay(item)}
            activeOpacity={0.85}
          >
            {isThisLoading ? (
              <ActivityIndicator color={Colors.primaryContainer} size="small" />
            ) : (
              <>
                <MaterialIcons
                  name={isThisPlaying ? 'pause' : 'play-arrow'}
                  size={20}
                  color={isThisPlaying ? Colors.primaryContainer : Colors.onSurface}
                />
                <Text
                  style={[
                    styles.actionPlayText,
                    isThisPlaying && styles.actionPlayTextActive,
                  ]}
                >
                  {isThisPlaying ? 'PLAYING' : 'PLAY'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Bookmark / Unsave Button */}
          <TouchableOpacity
            style={styles.actionSaveBtn}
            onPress={() => handleUnsave(item.id)}
            activeOpacity={0.85}
            accessibilityLabel="Remove from saved"
          >
            <MaterialIcons
              name="bookmark"
              size={20}
              color={Colors.secondaryContainer}
            />
            <Text style={styles.actionSaveText}>SAVED</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.archiveTagRow}>
            <Text style={styles.archiveTag}>BLIPP // ARCHIVE</Text>
            <View style={styles.pulseDot} />
          </View>
          <Text style={styles.screenTitle}>Saved</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{saves.length} SAVED</Text>
        </View>
      </View>

      {/* Non-blocking Toast Banner */}
      {toastMessage && (
        <View style={styles.toastContainer} pointerEvents="none">
          <View style={styles.toastBanner}>
            <MaterialIcons name="info-outline" size={16} color={Colors.primary} />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.secondaryContainer} />
          <Text style={styles.loadingText}>Loading saved dispatches…</Text>
        </View>
      ) : saves.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialIcons
            name="bookmark-border"
            size={48}
            color={Colors.onSurfaceVariant}
          />
          <Text style={styles.emptyTitle}>No Saved Blipps</Text>
          <Text style={styles.emptySubtitle}>
            Bookmark audio dispatches in your feed to listen to them here anytime.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Feed')}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyButtonText}>EXPLORE FEED</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={saves}
          keyExtractor={(item) => item.id}
          renderItem={renderSavedCard}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
        />
      )}

      {/* 3-Tab Bottom Navigation */}
      <BottomNav
        currentRoute="Saved"
        onNavigate={(route) => {
          if (route !== 'Saved') {
            navigation.navigate(route);
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: Metrics.headerHeight,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Metrics.gutter,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  headerLeft: {
    justifyContent: 'center',
  },
  archiveTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  archiveTag: {
    ...Typography.labelCaps,
    fontSize: 10,
    color: Colors.secondaryContainer,
    letterSpacing: 1.0,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: Metrics.radiusFull,
    backgroundColor: Colors.secondaryContainer,
  },
  screenTitle: {
    ...Typography.headlineSm,
    color: Colors.onSurface,
    marginTop: 1,
  },
  countBadge: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Metrics.radiusLg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  countText: {
    ...Typography.telemetryData,
    fontSize: 11,
    color: Colors.secondaryContainer,
  },
  listContent: {
    padding: Metrics.gutter,
    gap: 12,
    paddingBottom: Metrics.bottomPadding,
  },
  card: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Metrics.radiusXl,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  avatarMini: {
    width: 24,
    height: 24,
    borderRadius: Metrics.radiusFull,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 11,
    color: Colors.onSurface,
  },
  creatorUsername: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
    flex: 1,
  },
  durationBadge: {
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Metrics.radiusBase,
  },
  durationText: {
    ...Typography.telemetryData,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  cardTitle: {
    ...Typography.headlineSm,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.onSurface,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionPlayBtn: {
    flex: 2,
    height: Metrics.transportSecondaryHeight, // 48px
    borderRadius: Metrics.radiusXl,
    backgroundColor: Colors.surfaceContainerLow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionPlayBtnActive: {
    borderColor: 'rgba(255, 107, 53, 0.4)',
    borderWidth: 1,
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
  },
  actionPlayText: {
    ...Typography.labelCaps,
    fontSize: 11,
    color: Colors.onSurface,
  },
  actionPlayTextActive: {
    color: Colors.primaryContainer,
  },
  actionSaveBtn: {
    flex: 1,
    height: Metrics.transportSecondaryHeight, // 48px
    borderRadius: Metrics.radiusXl,
    backgroundColor: 'rgba(0, 238, 252, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 238, 252, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionSaveText: {
    ...Typography.labelCaps,
    fontSize: 11,
    color: Colors.secondaryContainer,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Metrics.gutter,
  },
  loadingText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: 12,
  },
  emptyTitle: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    maxWidth: 280,
  },
  emptyButton: {
    backgroundColor: Colors.primaryContainer,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Metrics.radiusFull,
  },
  emptyButtonText: {
    ...Typography.labelCaps,
    fontSize: 12,
    color: Colors.onPrimaryContainer,
  },
  toastContainer: {
    position: 'absolute',
    top: Metrics.headerHeight + 8,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Metrics.radiusLg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    ...Typography.telemetryData,
    color: Colors.onSurface,
    fontSize: 12,
  },
});
