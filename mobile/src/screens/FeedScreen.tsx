import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createAudioPlayer, AudioPlayer, AudioStatus } from 'expo-audio';
import { Header } from '../components/Header';
import { WaveformBar } from '../components/WaveformBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { Blipp, fetchFeedApi } from '../services/api';
import { setupAudioMode } from '../services/audio';
import { Colors, Radius, Spacing, Typography } from '../theme/tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = SCREEN_HEIGHT - 130; // accounts for header and safe area

export const FeedScreen = ({ navigation }: any) => {
  const [blipps, setBlipps] = useState<Blipp[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Playback state
  const playerRef = useRef<AudioPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [audioLoading, setAudioLoading] = useState(false);

  const flatListRef = useRef<FlatList<Blipp>>(null);

  // Load feed on mount & init audio
  useEffect(() => {
    setupAudioMode();
    loadFeed();
    return () => {
      stopAndUnload();
    };
  }, []);

  const loadFeed = async (cursor?: string | null) => {
    try {
      const data = await fetchFeedApi(cursor, 10);
      if (cursor) {
        setBlipps((prev) => [...prev, ...data.items]);
      } else {
        setBlipps(data.items);
      }
      setNextCursor(data.next_cursor);
    } catch (err) {
      console.warn('Failed to load feed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  const handleEndReached = () => {
    if (nextCursor && !loading) {
      loadFeed(nextCursor);
    }
  };

  // Play audio for current active index
  useEffect(() => {
    if (blipps.length > 0 && activeIndex >= 0 && activeIndex < blipps.length) {
      playCurrentBlipp(blipps[activeIndex]);
    }
  }, [activeIndex, blipps.length]);

  const stopAndUnload = () => {
    if (playerRef.current) {
      try {
        playerRef.current.pause();
        playerRef.current.remove();
      } catch {
        // ignore
      }
      playerRef.current = null;
    }
  };

  const playCurrentBlipp = (blipp: Blipp) => {
    setAudioLoading(true);
    setCurrentTime(0);
    setDuration(blipp.duration_seconds || 1);
    setIsPlaying(false);

    stopAndUnload();

    try {
      const player = createAudioPlayer(blipp.audio_url, { updateInterval: 250 });
      playerRef.current = player;

      player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
        setCurrentTime(status.currentTime);
        if (status.duration > 0) {
          setDuration(status.duration);
        }
        setIsPlaying(status.playing);
        setAudioLoading(!status.isLoaded && !status.playing);

        // Auto-advance when audio finishes!
        if (status.didJustFinish) {
          advanceNext();
        }
      });

      player.play();
      setIsPlaying(true);
    } catch (err) {
      console.warn('Error loading audio stream:', err);
    } finally {
      setAudioLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pause();
        setIsPlaying(false);
      } else {
        playerRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.warn('Toggle play error:', err);
    }
  };

  const advanceNext = () => {
    if (activeIndex < blipps.length - 1) {
      const nextIdx = activeIndex + 1;
      setActiveIndex(nextIdx);
      flatListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
    }
  };

  const replay15s = async () => {
    if (!playerRef.current) return;
    const newPos = Math.max(0, currentTime - 15);
    try {
      await playerRef.current.seekTo(newPos);
      setCurrentTime(newPos);
    } catch (err) {
      console.warn('Replay error:', err);
    }
  };

  const handleSeek = async (ratio: number) => {
    if (!playerRef.current || duration <= 0) return;
    const targetSeconds = ratio * duration;
    try {
      await playerRef.current.seekTo(targetSeconds);
      setCurrentTime(targetSeconds);
    } catch (err) {
      console.warn('Seek error:', err);
    }
  };

  // Track visible index on snap scroll
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const newIndex = viewableItems[0].index;
        if (newIndex !== activeIndex) {
          setActiveIndex(newIndex);
        }
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const renderBlippCard = ({ item, index }: { item: Blipp; index: number }) => {
    const isActive = index === activeIndex;
    const progressRatio = duration > 0 ? currentTime / duration : 0;
    const durationSec = item.duration_seconds || duration;

    return (
      <View style={[styles.cardContainer, { height: ITEM_HEIGHT }]}>
        <View style={styles.card}>
          {/* Top Discovery Telemetry */}
          <View style={styles.cardTopRow}>
            <View style={styles.discoveryPill}>
              <View style={styles.fireDot} />
              <Text style={styles.discoveryText}>COMMUTE STREAM</Text>
            </View>
            <Text style={styles.audioFormatBadge}>LOSSLESS • 96kHz</Text>
          </View>

          {/* Title & Creator */}
          <View style={styles.metaBlock}>
            <Text style={styles.titleText} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.creatorRow}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarLetter}>
                  {(item.creator_username || 'U')[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.creatorName}>{item.creator_username}</Text>
            </View>
          </View>

          {/* Waveform Visualization Scrubber */}
          <WaveformBar
            progress={isActive ? progressRatio : 0}
            durationSeconds={durationSec}
            currentTimeSeconds={isActive ? currentTime : 0}
            onSeek={isActive ? handleSeek : undefined}
            isPlaying={isActive && isPlaying}
          />

          {/* Dominant Oversized Transport Controls */}
          <View style={styles.controlsRow}>
            {/* -15s Replay */}
            <Pressable
              onPress={replay15s}
              disabled={!isActive}
              style={({ pressed }) => [
                styles.auxBtn,
                pressed && styles.btnPressed,
              ]}
            >
              <Text style={styles.auxBtnText}>-15s</Text>
              <Text style={styles.auxBtnSub}>REPLAY</Text>
            </Pressable>

            {/* Big Dominant Play / Pause Button */}
            <Pressable
              onPress={togglePlayPause}
              disabled={!isActive || audioLoading}
              style={({ pressed }) => [
                styles.primaryTransportBtn,
                pressed && styles.btnPressed,
              ]}
            >
              {audioLoading ? (
                <ActivityIndicator color={Colors.onPrimaryContainer} size="large" />
              ) : (
                <>
                  <Text style={styles.transportIcon}>
                    {isPlaying && isActive ? '⏸' : '▶'}
                  </Text>
                  <View style={styles.transportTextCol}>
                    <Text style={styles.transportTitle}>
                      {isPlaying && isActive ? 'PLAYING' : 'PAUSED'}
                    </Text>
                    <Text style={styles.transportSub}>
                      {isPlaying && isActive ? 'TAP TO PAUSE' : 'TAP TO RESUME'}
                    </Text>
                  </View>
                </>
              )}
            </Pressable>

            {/* Skip Next */}
            <Pressable
              onPress={advanceNext}
              disabled={!isActive || index >= blipps.length - 1}
              style={({ pressed }) => [
                styles.auxBtn,
                index >= blipps.length - 1 && styles.btnDisabled,
                pressed && styles.btnPressed,
              ]}
            >
              <Text style={styles.auxBtnText}>NEXT</Text>
              <Text style={styles.auxBtnSub}>SKIP ⏭</Text>
            </Pressable>
          </View>

          {/* Commute Mode Footer Banner */}
          <View style={styles.footerBanner}>
            <Text style={styles.footerBannerText}>
              Hands-Free Auto-Advance Active • Audio plays with screen locked
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Feed"
        onUploadPress={() => navigation.navigate('Upload')}
        showUpload={true}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primaryContainer} />
          <Text style={styles.loadingText}>Syncing audio stream…</Text>
        </View>
      ) : blipps.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>No Blipps Yet</Text>
          <Text style={styles.emptySubtitle}>
            Be the first to upload a short-form audio clip to the stream.
          </Text>
          <PrimaryButton
            title="Upload First Blipp"
            onPress={() => navigation.navigate('Upload')}
            style={styles.emptyBtn}
          />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={blipps}
          keyExtractor={(item) => item.id}
          renderItem={renderBlippCard}
          pagingEnabled
          snapToInterval={ITEM_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          getItemLayout={(_data, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  cardContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discoveryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  fireDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondaryContainer,
  },
  discoveryText: {
    ...Typography.labelCaps,
    fontSize: 9,
    color: Colors.secondaryContainer,
  },
  audioFormatBadge: {
    ...Typography.telemetry,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  metaBlock: {
    marginVertical: Spacing.xs,
  },
  titleText: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    ...Typography.labelCaps,
    color: Colors.primaryContainer,
  },
  creatorName: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  auxBtn: {
    width: 68,
    height: 64,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  auxBtnText: {
    ...Typography.headlineSm,
    fontSize: 14,
    color: Colors.onSurface,
  },
  auxBtnSub: {
    ...Typography.labelCaps,
    fontSize: 8,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  btnDisabled: {
    opacity: 0.35,
  },
  primaryTransportBtn: {
    flex: 1,
    height: 64,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  transportIcon: {
    fontSize: 26,
    color: Colors.onPrimaryContainer,
  },
  transportTextCol: {
    flexDirection: 'column',
  },
  transportTitle: {
    ...Typography.headlineSm,
    fontSize: 16,
    color: Colors.onPrimaryContainer,
    letterSpacing: 0.5,
  },
  transportSub: {
    ...Typography.labelCaps,
    fontSize: 9,
    color: Colors.onPrimaryContainer,
    opacity: 0.85,
  },
  footerBanner: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.sm,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
  },
  footerBannerText: {
    ...Typography.telemetry,
    fontSize: 10,
    color: Colors.onSurfaceSubtle,
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.md,
  },
  emptyTitle: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyBtn: {
    minWidth: 200,
  },
});
