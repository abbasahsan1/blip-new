import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing } from '../theme/theme';

interface WaveformBarProps {
  progress: number; // 0 to 1
  durationSeconds: number;
  currentTimeSeconds: number;
  onSeek?: (ratio: number) => void;
  isPlaying?: boolean;
}

// 34 deterministic frequency bar heights for audio visual scrub
const WAVEFORM_BAR_HEIGHTS = [
  14, 26, 40, 20, 48, 30, 56, 34, 18, 44, 62, 38, 24, 52, 42, 28, 48, 32, 54,
  40, 22, 46, 58, 36, 20, 42, 28, 50, 34, 16, 38, 24, 46, 28,
];

function formatTime(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '0:00';
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${mins}:${pad(secs)}`;
}

export const WaveformBar: React.FC<WaveformBarProps> = ({
  progress = 0,
  durationSeconds = 0,
  currentTimeSeconds = 0,
  onSeek,
}) => {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const totalBars = WAVEFORM_BAR_HEIGHTS.length;
  const playedBarCount = Math.floor(clampedProgress * totalBars);

  const handlePress = (e: any) => {
    if (!onSeek) return;
    const { locationX } = e.nativeEvent;
    e.target.measure((_x: number, _y: number, width: number) => {
      if (width > 0) {
        const ratio = Math.max(0, Math.min(1, locationX / width));
        onSeek(ratio);
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Waveform Bars Grid (Breathes directly on canvas) */}
      <Pressable onPress={handlePress} style={styles.barsContainer}>
        {WAVEFORM_BAR_HEIGHTS.map((height, idx) => {
          const isPlayed = idx < playedBarCount;

          return (
            <View
              key={idx}
              style={[
                styles.bar,
                {
                  height,
                  backgroundColor: isPlayed
                    ? colors['primary-container']
                    : 'rgba(255, 255, 255, 0.16)',
                },
              ]}
            />
          );
        })}
      </Pressable>

      {/* Scrub Track & Numeric Time Counters */}
      <View style={styles.trackContainer}>
        <View style={styles.trackBackground}>
          <View
            style={[styles.trackFill, { width: `${clampedProgress * 100}%` }]}
          />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeCounter}>
            {formatTime(currentTimeSeconds)}
          </Text>
          <Text style={styles.timeCounter}>
            {formatTime(durationSeconds)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: spacing[4],
  },
  barsContainer: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: spacing[1],
  },
  bar: {
    width: 4,
    borderRadius: radii.full,
  },
  trackContainer: {
    marginTop: spacing[3],
    gap: spacing[1],
  },
  trackBackground: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: colors['primary-container'],
    borderRadius: radii.full,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  timeCounter: {
    fontFamily: fonts.telemetry, // JetBrains Mono reserved specifically for numeric time
    fontSize: 12,
    color: colors['on-surface-variant'],
    letterSpacing: 0.2,
  },
});
