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
import { colors, LayoutMetrics, Typography } from '../theme/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = SCREEN_HEIGHT - LayoutMetrics.headerHeight - LayoutMetrics.bottomNavHeight;

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

  // Load feed on mount & initialize audio session
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
      <View style={styles.cardContainer}>
        {/* Central Kinetic Audio Player Hero Card: rounded-xl (12px), bg-surface-container */}
        <View style={styles.heroCard}>
          {/* Top Telemetry & Status Badges Row */}
          <View style={styles.topTelemetryRow}>
            <View style={styles.streamBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.streamBadgeText}>COMMUTE STREAM</Text>
            </View>
            <View style={styles.bitrateBadge}>
              <Text style={styles.bitrateBadgeText}>24-BIT / 96kHz</Text>
            </View>
          </View>

          {/* Active Track Title: headlineMd (SpaceGrotesk-SemiBold, 22px, lineHeight: 28px, -0.22px) */}
          <Text style={styles.clipTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Creator Attribution: Inter type scale */}
          <View style={styles.creatorRow}>
            <View style={styles.creatorAvatar}>
              <Text style={styles.creatorAvatarText}>
                {(item.creator_username || 'U')[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.creatorInfo}>
              <Text style={styles.creatorName}>
                @{item.creator_username}
              </Text>
              <Text style={styles.creatorSub}>
                Blipp Voice Guide
              </Text>
            </View>
          </View>

          {/* Kinetic Waveform Visualizer: 96px container, 6px bars, 8px track */}
          <WaveformBar
            progress={isActive ? progressRatio : 0}
            durationSeconds={durationSec}
            currentTimeSeconds={isActive ? currentTime : 0}
            onSeek={isActive ? handleSeek : undefined}
            isPlaying={isActive && isPlaying}
          />

          {/* Chunky Transport Deck: height: 64px, col-span-2 center button, rounded-xl (12px) */}
          <View style={styles.transportDeck}>
            {/* Skip Previous Button */}
            <Pressable
              onPress={advancePrev}
              disabled={!isActive || index === 0}
              style={({ pressed }) => [
                styles.transportSideBtn,
                (!isActive || index === 0) && styles.btnDisabled,
                pressed && styles.btnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Previous track"
            >
              <MaterialCommunityIcons
                name="skip-previous"
                size={24}
                color={
                  !isActive || index === 0
                    ? colors['on-surface-variant']
                    : colors['on-surface']
                }
              />
              <Text
                style={[
                  styles.sideBtnLabel,
                  (!isActive || index === 0) && styles.sideBtnLabelDisabled,
                ]}
              >
                PREV
              </Text>
            </Pressable>

            {/* Primary Center Play / Pause Button (Center-Dominant, 2-Col Span) */}
            <Pressable
              onPress={togglePlayPause}
              disabled={!isActive || audioLoading}
              style={({ pressed }) => [
                styles.transportPrimaryBtn,
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
                <>
                  <MaterialCommunityIcons
                    name={isPlaying && isActive ? 'pause-circle' : 'play-circle'}
                    size={30}
                    color={colors['on-primary-container']}
                  />
                  <View style={styles.primaryTextCol}>
                    <Text style={styles.primaryPlayTitle}>
                      {isPlaying && isActive ? 'PLAYING' : 'PAUSED'}
                    </Text>
                    <Text style={styles.primaryPlaySubtitle}>
                      {isPlaying && isActive ? 'TAP TO PAUSE' : 'TAP TO RESUME'}
                    </Text>
                  </View>
                </>
              )}
            </Pressable>

            {/* Skip Next Button */}
            <Pressable
              onPress={advanceNext}
              disabled={!isActive || index >= blipps.length - 1}
              style={({ pressed }) => [
                styles.transportSideBtn,
                (!isActive || index >= blipps.length - 1) && styles.btnDisabled,
                pressed && styles.btnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Next track"
            >
              <MaterialCommunityIcons
                name="skip-next"
                size={24}
                color={
                  !isActive || index >= blipps.length - 1
                    ? colors['on-surface-variant']
                    : colors['on-surface']
                }
              />
              <Text
                style={[
                  styles.sideBtnLabel,
                  (!isActive || index >= blipps.length - 1) &&
                    styles.sideBtnLabelDisabled,
                ]}
              >
                NEXT
              </Text>
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
          <Text style={styles.loadingText}>Syncing audio stream…</Text>
        </View>
      ) : blipps.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>No Blipps Yet</Text>
          <Text style={styles.emptySubtitle}>
            Be the first to upload a short-form audio clip to the stream.
          </Text>
          <Pressable
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Upload')}
          >
            <Text style={styles.emptyButtonText}>Upload a Blipp</Text>
          </Pressable>
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

      {/* 2-Tab Navigation */}
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
  cardContainer: {
    height: ITEM_HEIGHT,
    paddingHorizontal: LayoutMetrics.gutter, // 16px
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    width: '100%',
    backgroundColor: colors['surface-container'], // #1c2028
    borderRadius: LayoutMetrics.radiusCard, // 12px (rounded-xl)
    padding: 16,
    borderWidth: 1,
    borderColor: colors['outline-variant'], // #424750
  },
  topTelemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  streamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors['surface-container-high'],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: LayoutMetrics.radiusBadge, // 9999px
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: LayoutMetrics.radiusBadge,
    backgroundColor: colors.secondary,
  },
  streamBadgeText: {
    ...Typography.labelCaps,
    fontSize: 10,
    color: colors.secondary,
  },
  bitrateBadge: {
    backgroundColor: colors['surface-container-lowest'],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bitrateBadgeText: {
    ...Typography.telemetryData,
    fontSize: 11,
    color: colors.secondary,
  },
  clipTitle: {
    ...Typography.headlineMd, // SpaceGrotesk-SemiBold, 22px, lineHeight: 28px, -0.22px
    color: colors['on-surface'],
    marginTop: 4,
    marginBottom: 8,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  creatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: LayoutMetrics.radiusBadge,
    backgroundColor: colors['surface-container-highest'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorAvatarText: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 13,
    color: colors['on-surface'],
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    ...Typography.transcriptHighlight, // Inter-SemiBold, 16px, lineHeight: 24px, -0.16px
    color: colors['on-surface'],
  },
  creatorSub: {
    ...Typography.bodySm, // Inter-Regular, 13px, lineHeight: 18px
    color: colors['on-surface-variant'],
  },
  transportDeck: {
    height: LayoutMetrics.transportPrimaryHeight, // 64px (h-16)
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  transportSideBtn: {
    flex: 1,
    height: LayoutMetrics.transportPrimaryHeight, // 64px (h-16)
    borderRadius: LayoutMetrics.radiusButton, // 12px (rounded-xl)
    backgroundColor: colors['surface-container-high'],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  btnDisabled: {
    opacity: 0.35,
  },
  sideBtnLabel: {
    ...Typography.labelCaps,
    fontSize: 10,
    color: colors['on-surface'],
  },
  sideBtnLabelDisabled: {
    color: colors['on-surface-variant'],
  },
  transportPrimaryBtn: {
    flex: 2,
    height: LayoutMetrics.transportPrimaryHeight, // 64px (h-16, col-span-2)
    borderRadius: LayoutMetrics.radiusButton, // 12px (rounded-xl)
    backgroundColor: colors['primary-container'], // #ff6b35
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  primaryTextCol: {
    alignItems: 'flex-start',
  },
  primaryPlayTitle: {
    ...Typography.headlineSm, // SpaceGrotesk-SemiBold, 18px, lineHeight: 24px, 0px
    color: colors['on-primary-container'],
  },
  primaryPlaySubtitle: {
    ...Typography.labelCaps,
    fontSize: 10,
    color: colors['on-primary-container'],
    opacity: 0.8,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: LayoutMetrics.gutter,
  },
  loadingText: {
    ...Typography.bodyMd,
    color: colors['on-surface-variant'],
    marginTop: 12,
  },
  emptyTitle: {
    ...Typography.headlineMd,
    color: colors['on-surface'],
    textAlign: 'center',
  },
  emptySubtitle: {
    ...Typography.bodyMd,
    color: colors['on-surface-variant'],
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: colors['primary-container'],
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: LayoutMetrics.radiusBadge,
  },
  emptyButtonText: {
    ...Typography.labelCaps,
    fontSize: 13,
    color: colors['on-primary-container'],
  },
});
