import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { createAudioPlayer, AudioPlayer, AudioStatus } from 'expo-audio';
import { Header } from '../components/Header';
import { WaveformBar } from '../components/WaveformBar';
import { BottomNav } from '../components/BottomNav';
import { Blipp, fetchFeedApi, toggleLikeApi, toggleSaveApi } from '../services/api';
import { setupAudioMode } from '../services/audio';
import { Colors, Metrics, Typography } from '../theme/tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = SCREEN_HEIGHT - Metrics.headerHeight - Metrics.bottomNavHeight;

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

  // Non-blocking toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<any>(null);

  const flatListRef = useRef<FlatList<Blipp>>(null);
  const activeIndexRef = useRef(0);
  const blippsRef = useRef<Blipp[]>([]);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleToggleLike = async (blippId: string) => {
    const currentItem = blipps.find((b) => b.id === blippId);
    const previousLiked = !!currentItem?.liked;
    const nextLiked = !previousLiked;

    // Optimistic UI toggle
    setBlipps((prev) =>
      prev.map((b) => (b.id === blippId ? { ...b, liked: nextLiked } : b))
    );

    try {
      const res = await toggleLikeApi(blippId);
      if (res.liked !== nextLiked) {
        setBlipps((prev) =>
          prev.map((b) => (b.id === blippId ? { ...b, liked: res.liked } : b))
        );
      }
    } catch (err: any) {
      // Revert optimistic update on failure
      setBlipps((prev) =>
        prev.map((b) => (b.id === blippId ? { ...b, liked: previousLiked } : b))
      );
      showToast(err?.message || 'Failed to update like');
    }
  };

  const handleToggleSave = async (blippId: string) => {
    const currentItem = blipps.find((b) => b.id === blippId);
    const previousSaved = !!currentItem?.saved;
    const nextSaved = !previousSaved;

    // Optimistic UI toggle
    setBlipps((prev) =>
      prev.map((b) => (b.id === blippId ? { ...b, saved: nextSaved } : b))
    );

    try {
      const res = await toggleSaveApi(blippId);
      if (res.saved !== nextSaved) {
        setBlipps((prev) =>
          prev.map((b) => (b.id === blippId ? { ...b, saved: res.saved } : b))
        );
      }
    } catch (err: any) {
      // Revert optimistic update on failure
      setBlipps((prev) =>
        prev.map((b) => (b.id === blippId ? { ...b, saved: previousSaved } : b))
      );
      showToast(err?.message || 'Failed to update save');
    }
  };

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
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
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

  const replay15s = async () => {
    if (!playerRef.current) return;
    const target = Math.max(0, currentTime - 15);
    try {
      await playerRef.current.seekTo(target);
      setCurrentTime(target);
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

          {/* Commute Touch Transport Deck (64px & 48px Rectangles, NOT Circles) */}
          <View style={styles.transportContainer}>
            {/* Primary Transport Row: 64px Rectangular Blocks */}
            <View style={styles.transportRowPrimary}>
              {/* -15s Replay: 1 Column Rectangular Block */}
              <TouchableOpacity
                style={styles.transportBtnSecondary}
                onPress={replay15s}
                disabled={!isActive}
                activeOpacity={0.85}
              >
                <MaterialIcons name="replay-10" size={24} color="#dfe2ee" />
                <Text style={styles.transportBtnSubtext}>-15S</Text>
              </TouchableOpacity>

              {/* Center Play/Pause: 2 Column Wide Dominant Rectangular Block */}
              <TouchableOpacity
                style={[
                  styles.transportBtnPrimary,
                  isPlaying && isActive && styles.transportBtnPrimaryGlow,
                ]}
                onPress={togglePlayPause}
                disabled={!isActive || audioLoading}
                activeOpacity={0.9}
              >
                {audioLoading ? (
                  <ActivityIndicator color="#5f1900" size="small" />
                ) : (
                  <>
                    <MaterialIcons
                      name={isPlaying && isActive ? 'pause' : 'play-arrow'}
                      size={30}
                      color="#5f1900"
                    />
                    <View style={styles.primaryBtnTextCol}>
                      <Text style={styles.primaryBtnTitle}>
                        {isPlaying && isActive ? 'PLAYING' : 'PAUSED'}
                      </Text>
                      <Text style={styles.primaryBtnSubtitle}>
                        {isPlaying && isActive ? 'TAP TO PAUSE' : 'TAP TO RESUME'}
                      </Text>
                    </View>
                  </>
                )}
              </TouchableOpacity>

              {/* Next Blip: 1 Column Rectangular Block */}
              <TouchableOpacity
                style={[
                  styles.transportBtnSecondary,
                  (!isActive || index >= blipps.length - 1) && styles.btnDisabled,
                ]}
                onPress={advanceNext}
                disabled={!isActive || index >= blipps.length - 1}
                activeOpacity={0.85}
              >
                <MaterialIcons name="skip-next" size={24} color="#dfe2ee" />
                <Text style={styles.transportBtnSubtext}>NEXT</Text>
              </TouchableOpacity>
            </View>

            {/* Secondary Glanceable Action Row: 48px Rectangles */}
            <View style={styles.transportRowSecondary}>
              {/* Like Button */}
              <TouchableOpacity
                style={[
                  styles.deckActionBtn,
                  item.liked && styles.deckActionBtnLiked,
                ]}
                onPress={() => handleToggleLike(item.id)}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name={item.liked ? 'favorite' : 'favorite-border'}
                  size={18}
                  color={item.liked ? Colors.primaryContainer : Colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.deckActionText,
                    item.liked && styles.deckActionTextLiked,
                  ]}
                >
                  {item.liked ? 'LIKED' : 'LIKE'}
                </Text>
              </TouchableOpacity>

              {/* Save Button */}
              <TouchableOpacity
                style={[
                  styles.deckActionBtn,
                  item.saved && styles.deckActionBtnSaved,
                ]}
                onPress={() => handleToggleSave(item.id)}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name={item.saved ? 'bookmark' : 'bookmark-border'}
                  size={18}
                  color={item.saved ? Colors.secondaryContainer : Colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.deckActionText,
                    item.saved && styles.deckActionTextSaved,
                  ]}
                >
                  {item.saved ? 'SAVED' : 'SAVE'}
                </Text>
              </TouchableOpacity>

              {/* Queue Indicator */}
              <View style={styles.deckActionBtn}>
                <MaterialIcons name="queue-music" size={18} color={Colors.onSurfaceVariant} />
                <Text style={styles.deckActionText}>QUEUE ({blipps.length})</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />

      {/* Non-blocking Toast Notification */}
      {toastMessage && (
        <View style={styles.toastContainer} pointerEvents="none">
          <View style={styles.toastBanner}>
            <MaterialIcons name="info-outline" size={16} color={Colors.primary} />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}

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
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Upload')}
          >
            <Text style={styles.emptyButtonText}>Upload a Blipp</Text>
          </TouchableOpacity>
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
          contentContainerStyle={{ paddingBottom: Metrics.bottomPadding }}
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
    backgroundColor: Colors.background,
  },
  cardContainer: {
    height: ITEM_HEIGHT,
    paddingHorizontal: Metrics.gutter, // 16px
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    width: '100%',
    backgroundColor: Colors.surfaceContainer, // #1c2028
    borderRadius: Metrics.radiusXl, // 12px (rounded-xl)
    padding: Metrics.spaceMd, // 16px
    borderWidth: 1,
    borderColor: Colors.outlineVariant, // #594139
  },
  topTelemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.spaceSm,
  },
  streamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Metrics.radiusFull, // 9999px
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: Metrics.radiusFull,
    backgroundColor: Colors.secondaryContainer,
  },
  streamBadgeText: {
    ...Typography.labelCaps,
    fontSize: 10,
    color: Colors.secondaryContainer,
  },
  bitrateBadge: {
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Metrics.radiusLg, // 8px
  },
  bitrateBadgeText: {
    ...Typography.telemetryData,
    fontSize: 11,
    color: Colors.secondaryContainer,
  },
  clipTitle: {
    ...Typography.headlineMd, // SpaceGrotesk-SemiBold, 22px, lineHeight: 28px, -0.22px (NO fontWeight)
    color: Colors.onSurface,
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
    borderRadius: Metrics.radiusFull,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorAvatarText: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 13,
    color: Colors.onSurface,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    ...Typography.transcriptHighlight, // Inter-SemiBold, 16px, lineHeight: 24px, -0.16px
    color: Colors.onSurface,
  },
  creatorSub: {
    ...Typography.bodySm, // Inter-Regular, 13px, lineHeight: 18px
    color: Colors.onSurfaceVariant,
  },
  // Commute Touch Transport Deck (64px & 48px Rectangles, NOT Circles)
  transportContainer: {
    gap: 8,
    width: '100%',
    marginTop: 4,
  },
  transportRowPrimary: {
    flexDirection: 'row',
    height: Metrics.transportPrimaryHeight, // 64px (Exact h-16)
    gap: 8,
  },
  // Columns 1 and 4 (Flex 1 each)
  transportBtnSecondary: {
    flex: 1,
    height: Metrics.transportPrimaryHeight, // 64px
    borderRadius: Metrics.radiusXl, // 12px (rounded-xl, NOT circular)
    backgroundColor: Colors.surfaceContainer, // #1c2028
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  transportBtnSubtext: {
    ...Typography.labelCaps,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  // Columns 2-3 (Flex 2 span)
  transportBtnPrimary: {
    flex: 2,
    height: Metrics.transportPrimaryHeight, // 64px
    borderRadius: Metrics.radiusXl, // 12px (rounded-xl, NOT circular)
    backgroundColor: Colors.primaryContainer, // #ff6b35
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  transportBtnPrimaryGlow: {
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtnTextCol: {
    alignItems: 'flex-start',
  },
  primaryBtnTitle: {
    ...Typography.headlineSm,
    fontSize: 15,
    color: Colors.onPrimaryContainer, // #5f1900
    lineHeight: 18,
  },
  primaryBtnSubtitle: {
    ...Typography.labelCaps,
    fontSize: 9,
    color: 'rgba(95, 25, 0, 0.8)',
    lineHeight: 12,
  },
  // Secondary Row: 48px Rectangles (Exact h-12)
  transportRowSecondary: {
    flexDirection: 'row',
    height: Metrics.transportSecondaryHeight, // 48px
    gap: 8,
  },
  deckActionBtn: {
    flex: 1,
    height: Metrics.transportSecondaryHeight, // 48px
    borderRadius: Metrics.radiusXl, // 12px (rounded-xl, NOT circular)
    backgroundColor: Colors.surfaceContainerLow, // #181c24
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deckActionText: {
    ...Typography.labelCaps,
    fontSize: 10,
    color: Colors.onSurface,
  },
  btnDisabled: {
    opacity: 0.35,
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
  },
  emptySubtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: Colors.primaryContainer,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Metrics.radiusFull,
  },
  emptyButtonText: {
    ...Typography.labelCaps,
    fontSize: 13,
    color: Colors.onPrimaryContainer,
  },
  deckActionBtnLiked: {
    borderColor: 'rgba(255, 107, 53, 0.4)',
    borderWidth: 1,
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
  },
  deckActionTextLiked: {
    color: Colors.primary,
  },
  deckActionBtnSaved: {
    borderColor: 'rgba(0, 238, 252, 0.4)',
    borderWidth: 1,
    backgroundColor: 'rgba(0, 238, 252, 0.08)',
  },
  deckActionTextSaved: {
    color: Colors.secondaryContainer,
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
