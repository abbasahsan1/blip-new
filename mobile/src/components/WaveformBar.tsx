import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing, typography } from '../theme/theme';

interface WaveformBarProps {
  progress: number; // 0 to 1
  durationSeconds: number;
  currentTimeSeconds: number;
  onSeek?: (ratio: number) => void;
  isPlaying?: boolean;
}

// 34 fixed deterministic frequency bar heights matching stitch aesthetic
const WAVEFORM_BAR_HEIGHTS = [
  16, 28, 44, 22, 54, 34, 62, 38, 20, 48, 68, 42, 26, 58, 46, 30, 52, 36, 60,
  44, 24, 50, 66, 40, 22, 46, 32, 56, 38, 18, 42, 28, 50, 32,
];

function formatTime(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(mins)}:${pad(secs)}`;
}

export const WaveformBar: React.FC<WaveformBarProps> = ({
  progress = 0,
  durationSeconds = 0,
  currentTimeSeconds = 0,
  onSeek,
  isPlaying = false,
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
      {/* Waveform Telemetry Header */}
      <View style={styles.telemetryRow}>
        <Text style={styles.telemetryTitle}>LIVE INGESTION SPECTRUM</Text>
        <View style={styles.syncBadge}>
          <View
            style={[
              styles.syncDot,
              {
                backgroundColor: isPlaying
                  ? colors.secondary
                  : colors['outline-variant'],
              },
            ]}
          />
          <Text style={styles.telemetryStatus}>
            {isPlaying ? 'STREAM ACTIVE' : 'PAUSED'}
          </Text>
        </View>
      </View>

      {/* Kinetic Audio Waveform Bars Grid */}
      <Pressable onPress={handlePress} style={styles.barsContainer}>
        {WAVEFORM_BAR_HEIGHTS.map((height, idx) => {
          const isPlayed = idx < playedBarCount;
          const isScrubHead = idx === playedBarCount && clampedProgress > 0;

          let barColor: string = colors['surface-container-highest'];
          let opacity = 0.55;

          if (isPlayed) {
            barColor = colors['primary-container'];
            opacity = 1.0;
          } else if (isScrubHead) {
            barColor = colors.secondary;
            opacity = 1.0;
          }

          return (
            <View
              key={idx}
              style={[
                styles.bar,
                {
                  height,
                  backgroundColor: barColor,
                  opacity,
                },
              ]}
            />
          );
        })}
      </Pressable>

      {/* Continuous Scrubber Track & Precise Timestamps */}
      <View style={styles.trackContainer}>
        <View style={styles.trackBackground}>
          <View
            style={[
              styles.trackFill,
              { width: `${clampedProgress * 100}%` },
            ]}
          />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeElapsed}>
            {formatTime(currentTimeSeconds)}
          </Text>
          <Text style={styles.timeTotal}>
            {formatTime(durationSeconds)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors['surface-container-lowest'],
    borderRadius: radii.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    marginVertical: spacing[3],
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  telemetryTitle: {
    fontFamily: fonts.telemetry,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
  },
  telemetryStatus: {
    fontFamily: fonts.telemetry,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.secondary,
    textTransform: 'uppercase',
  },
  barsContainer: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: spacing[1],
  },
  bar: {
    width: 5,
    borderRadius: radii.full,
  },
  trackContainer: {
    marginTop: spacing[3],
    gap: spacing[1],
  },
  trackBackground: {
    height: 4,
    backgroundColor: colors['surface-container-highest'],
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
  timeElapsed: {
    ...typography['label-sm'],
    color: colors.primary,
    fontWeight: '700',
  },
  timeTotal: {
    ...typography['label-sm'],
    color: colors['on-surface-variant'],
  },
});
