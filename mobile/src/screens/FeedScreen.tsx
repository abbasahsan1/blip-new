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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createAudioPlayer, AudioPlayer, AudioStatus } from 'expo-audio';
import { Header } from '../components/Header';
import { WaveformBar } from '../components/WaveformBar';
import { BottomNav } from '../components/BottomNav';
import { Blipp, fetchFeedApi } from '../services/api';
import { setupAudioMode } from '../services/audio';
import { colors, fonts, radii, spacing, typography } from '../theme/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
// Card height accounts for header (56px), bottom nav (64px), and system safe areas
const CARD_HEIGHT = SCREEN_HEIGHT - 170;

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
  const activeIndexRef = useRef(0);
  const blippsRef = useRef<Blipp[]>([]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    blippsRef.current = blipps;
  }, [blipps]);

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
      const data = await fetchFeedApi(cursor, 15);
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
        // ignore unload error
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

        // Auto-advance to next clip when audio completes
        if (status.didJustFinish) {
          if (activeIndexRef.current < blippsRef.current.length - 1) {
            const nextIdx = activeIndexRef.current + 1;
            setActiveIndex(nextIdx);
            flatListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
          }
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

  const advancePrev = () => {
    if (activeIndex > 0) {
      const prevIdx = activeIndex - 1;
      setActiveIndex(prevIdx);
      flatListRef.current?.scrollToIndex({ index: prevIdx, animated: true });
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
        if (newIndex !== activeIndexRef.current) {
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
      <View style={styles.cardWrapper}>
        {/* Central Kinetic Audio Player Hero */}
        <View style={styles.heroCard}>
          {/* Audio Telemetry Badge */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.telemetryBadge}>
              <Text style={styles.telemetryBadgeText}>24-BIT / 96kHz</Text>
            </View>
          </View>

          {/* Title & Creator Attribution */}
          <View style={styles.metaBlock}>
            <Text style={styles.clipTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.creatorRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>
                  {(item.creator_username || 'U')[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.creatorUsername}>
                @{item.creator_username}
              </Text>
            </View>
          </View>

          {/* Realtime Waveform Visualization Scrubber */}
          <WaveformBar
            progress={isActive ? progressRatio : 0}
            durationSeconds={durationSec}
            currentTimeSeconds={isActive ? currentTime : 0}
            onSeek={isActive ? handleSeek : undefined}
            isPlaying={isActive && isPlaying}
          />

          {/* Minimal 3-Button Player Controls: Prev, Play/Pause, Next */}
          <View style={styles.controlsRow}>
            {/* Skip Previous Button */}
            <Pressable
              onPress={advancePrev}
              disabled={!isActive || index === 0}
              style={({ pressed }) => [
                styles.navBtn,
                (!isActive || index === 0) && styles.navBtnDisabled,
                pressed && styles.btnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Previous Clip"
            >
              <MaterialCommunityIcons
                name="skip-previous"
                size={26}
                color={
                  !isActive || index === 0
                    ? colors['on-surface-variant']
                    : colors['on-surface']
                }
              />
            </Pressable>

            {/* Big Dominant Play / Pause Button */}
            <Pressable
              onPress={togglePlayPause}
              disabled={!isActive || audioLoading}
              style={({ pressed }) => [
                styles.playPauseBtn,
                pressed && styles.btnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={isPlaying && isActive ? 'Pause' : 'Play'}
            >
              {audioLoading ? (
                <ActivityIndicator
                  color={colors['on-primary-container']}
                  size="small"
                />
              ) : (
                <MaterialCommunityIcons
                  name={isPlaying && isActive ? 'pause' : 'play'}
                  size={32}
                  color={colors['on-primary-container']}
                />
              )}
            </Pressable>

            {/* Skip Next Button */}
            <Pressable
              onPress={advanceNext}
              disabled={!isActive || index >= blipps.length - 1}
              style={({ pressed }) => [
                styles.navBtn,
                (!isActive || index >= blipps.length - 1) && styles.navBtnDisabled,
                pressed && styles.btnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Next Clip"
            >
              <MaterialCommunityIcons
                name="skip-next"
                size={26}
                color={
                  !isActive || index >= blipps.length - 1
                    ? colors['on-surface-variant']
                    : colors['on-surface']
                }
              />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors['primary-container']} />
          <Text style={styles.loadingText}>Loading audio stream…</Text>
        </View>
      ) : blipps.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>NO BLIPPS YET</Text>
          <Text style={styles.emptySubtitle}>
            Be the first creator to upload a short-form audio clip.
          </Text>
          <Pressable
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Upload')}
          >
            <Text style={styles.emptyButtonText}>PUBLISH FIRST BLIPP</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={blipps}
          keyExtractor={(item) => item.id}
          renderItem={renderBlippCard}
          pagingEnabled
          snapToInterval={CARD_HEIGHT}
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
            length: CARD_HEIGHT,
            offset: CARD_HEIGHT * index,
            index,
          })}
        />
      )}

      {/* Exactly 2 tabs: Feed & Upload */}
      <BottomNav
        currentRoute="Feed"
        onNavigate={(route) => {
          if (route === 'Upload') {
            navigation.navigate('Upload');
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cardWrapper: {
    height: CARD_HEIGHT,
    paddingHorizontal: spacing[4],
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    width: '100%',
    backgroundColor: colors['surface-container'],
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    borderRadius: radii['2xl'],
    padding: spacing[6],
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  telemetryBadge: {
    backgroundColor: colors['surface-container-highest'],
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius: radii.md,
  },
  telemetryBadgeText: {
    fontFamily: fonts.telemetry,
    fontSize: 11,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
    color: colors['on-surface-variant'],
  },
  metaBlock: {
    marginVertical: spacing[2],
  },
  clipTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: 20,
    lineHeight: 26,
    color: colors['on-surface'],
    marginBottom: spacing[2],
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  avatarCircle: {
    width: 26,
    height: 26,
    borderRadius: radii.full,
    backgroundColor: colors['surface-container-high'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: fonts.headline,
    fontSize: 12,
    color: colors['on-surface'],
  },
  creatorUsername: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors['on-surface-variant'],
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[6],
    marginTop: spacing[4],
  },
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors['surface-container-high'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: {
    opacity: 0.35,
  },
  navBtnIcon: {
    fontSize: 18,
    color: colors['on-surface'],
  },
  navBtnIconDisabled: {
    color: colors['on-surface-variant'],
  },
  playPauseBtn: {
    width: 62,
    height: 62,
    borderRadius: radii.full,
    backgroundColor: colors['primary-container'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseIcon: {
    fontSize: 24,
    color: colors['on-primary-container'],
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  loadingText: {
    fontFamily: fonts.telemetry,
    fontSize: 12,
    color: colors['on-surface-variant'],
    marginTop: spacing[3],
  },
  emptyTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 1.2,
    color: colors['on-surface'],
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors['on-surface-variant'],
    textAlign: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[6],
  },
  emptyButton: {
    backgroundColor: colors['primary-container'],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: radii.full,
  },
  emptyButtonText: {
    fontFamily: fonts.label,
    fontSize: 12,
    letterSpacing: 1.2,
    color: colors['on-primary-container'],
  },
});
