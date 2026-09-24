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
import { colors, fonts, radii, spacing } from '../theme/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
// Card height accounts for header (52px), bottom nav (64px), and system safe areas
const ITEM_HEIGHT = SCREEN_HEIGHT - 116;

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
        {/* Audio Visual Anchor (Generous cover art space, human and unboxed) */}
        <View style={styles.artAnchor}>
          <View style={styles.artVisual}>
            <MaterialCommunityIcons
              name="waveform"
              size={56}
              color={isActive ? colors['primary-container'] : colors['on-surface-variant']}
            />
          </View>
        </View>

        {/* Clean Editorial Title & Author Hierarchy */}
        <View style={styles.metaContainer}>
          <Text style={styles.clipTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.creatorName}>
            @{item.creator_username}
          </Text>
        </View>

        {/* Unboxed Waveform Scrubber (Breathes directly on page) */}
        <WaveformBar
          progress={isActive ? progressRatio : 0}
          durationSeconds={durationSec}
          currentTimeSeconds={isActive ? currentTime : 0}
          onSeek={isActive ? handleSeek : undefined}
          isPlaying={isActive && isPlaying}
        />

        {/* Standard, Restrained Media Transport Controls */}
        <View style={styles.controlsRow}>
          {/* Skip Previous Button */}
          <Pressable
            onPress={advancePrev}
            disabled={!isActive || index === 0}
            style={({ pressed }) => [
              styles.secondaryControlBtn,
              (!isActive || index === 0) && styles.controlDisabled,
              pressed && styles.btnPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Previous track"
          >
            <MaterialCommunityIcons
              name="skip-previous"
              size={28}
              color={
                !isActive || index === 0
                  ? 'rgba(255, 255, 255, 0.25)'
                  : colors['on-surface']
              }
            />
          </Pressable>

          {/* Center Play / Pause Button */}
          <Pressable
            onPress={togglePlayPause}
            disabled={!isActive || audioLoading}
            style={({ pressed }) => [
              styles.primaryPlayBtn,
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
                size={34}
                color={colors['on-primary-container']}
              />
            )}
          </Pressable>

          {/* Skip Next Button */}
          <Pressable
            onPress={advanceNext}
            disabled={!isActive || index >= blipps.length - 1}
            style={({ pressed }) => [
              styles.secondaryControlBtn,
              (!isActive || index >= blipps.length - 1) && styles.controlDisabled,
              pressed && styles.btnPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Next track"
          >
            <MaterialCommunityIcons
              name="skip-next"
              size={28}
              color={
                !isActive || index >= blipps.length - 1
                  ? 'rgba(255, 255, 255, 0.25)'
                  : colors['on-surface']
              }
            />
          </Pressable>
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
          <Text style={styles.loadingText}>Loading audio feed…</Text>
        </View>
      ) : blipps.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>No Blipps Yet</Text>
          <Text style={styles.emptySubtitle}>
            Be the first to upload a short-form audio clip.
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
    paddingHorizontal: spacing[6],
    justifyContent: 'center',
    alignItems: 'center',
  },
  artAnchor: {
    marginBottom: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  artVisual: {
    width: 160,
    height: 160,
    borderRadius: radii.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaContainer: {
    width: '100%',
    marginBottom: spacing[2],
  },
  clipTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
    color: '#ffffff',
    textAlign: 'left',
  },
  creatorName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    lineHeight: 22,
    color: colors['on-surface-variant'],
    marginTop: spacing[1],
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[8],
    marginTop: spacing[5],
  },
  secondaryControlBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlDisabled: {
    opacity: 0.35,
  },
  primaryPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors['primary-container'],
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors['on-surface-variant'],
    marginTop: spacing[3],
  },
  emptyTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: 22,
    lineHeight: 28,
    color: '#ffffff',
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
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors['on-primary-container'],
  },
});
