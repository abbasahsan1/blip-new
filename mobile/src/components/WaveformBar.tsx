import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, LayoutMetrics, Typography } from '../theme/theme';

interface WaveformBarProps {
  progress: number; // 0 to 1
  durationSeconds: number;
  currentTimeSeconds: number;
  onSeek?: (ratio: number) => void;
  isPlaying?: boolean;
}

// Fixed deterministic frequency bar heights scaled for 96px container
const WAVEFORM_BAR_HEIGHTS = [
  24, 43, 65, 28, 74, 48, 86, 52, 28, 66, 92, 58, 34, 76, 60, 40, 70, 48, 82,
  60, 32, 68, 88, 54, 30, 62, 44, 75, 52, 26, 58, 38, 70, 48, 80, 42,
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
      {/* Telemetry Header */}
      <View style={styles.telemetryRow}>
        <Text style={styles.telemetryAmber}>LIVE SPECTRUM</Text>
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
          <Text style={styles.telemetryCyan}>
            {isPlaying ? 'ACTIVE STREAM' : 'PAUSED'}
          </Text>
        </View>
      </View>

      {/* Kinetic Audio Waveform Bars Grid: h-24 (96px), w-1.5 (6px), gap: 3px */}
      <Pressable onPress={handlePress} style={styles.barsContainer}>
        {WAVEFORM_BAR_HEIGHTS.map((height, idx) => {
          const isPlayed = idx < playedBarCount;
          const isScrubHead = idx === playedBarCount && clampedProgress > 0;

          let barColor: string = colors['surface-bright'];
          let opacity = 0.6;

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

      {/* Scrubber Track & Precise Timestamps */}
      <View style={styles.trackContainer}>
        {/* Track: h-2 (8px), rounded-full */}
        <View style={styles.trackBackground}>
          <View
            style={[styles.trackFill, { width: `${clampedProgress * 100}%` }]}
          />
        </View>
        {/* Timestamps: telemetryData font scale (12px, JetBrainsMono-Medium) */}
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
    width: '100%',
    backgroundColor: colors['surface-container-lowest'],
    borderRadius: LayoutMetrics.radiusCard, // 12px (rounded-xl)
    padding: 10,
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    marginVertical: 12,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  telemetryAmber: {
    ...Typography.telemetryData,
    fontFamily: 'JetBrainsMono-SemiBold',
    fontSize: 10,
    color: colors.primary,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: LayoutMetrics.radiusBadge,
  },
  telemetryCyan: {
    ...Typography.telemetryData,
    fontSize: 10,
    color: colors.secondary,
  },
  barsContainer: {
    height: LayoutMetrics.waveformHeight, // 96px (h-24)
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  bar: {
    width: LayoutMetrics.waveformBarWidth, // 6px (w-1.5)
    borderRadius: LayoutMetrics.radiusBadge, // 9999px
  },
  trackContainer: {
    marginTop: 8,
    gap: 6,
  },
  trackBackground: {
    height: 8, // h-2 (8px)
    backgroundColor: colors['surface-container-high'],
    borderRadius: LayoutMetrics.radiusBadge, // 9999px
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: colors['primary-container'],
    borderRadius: LayoutMetrics.radiusBadge,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeElapsed: {
    ...Typography.telemetryData,
    fontFamily: 'JetBrainsMono-SemiBold',
    color: colors.primary,
  },
  timeTotal: {
    ...Typography.telemetryData,
    color: colors['on-surface-variant'],
  },
});
