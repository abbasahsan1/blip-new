import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../theme/tokens';

interface WaveformBarProps {
  progress: number; // 0 to 1
  durationSeconds: number;
  currentTimeSeconds: number;
  onSeek?: (ratio: number) => void;
  isPlaying?: boolean;
}

// Deterministic mock frequency bar heights for dynamic visualizer aesthetics
const BAR_HEIGHTS = [
  34, 52, 28, 64, 42, 70, 48, 60, 30, 75, 45, 68, 54, 38, 72, 50, 62, 32, 58, 44,
  66, 36, 48, 28,
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
  const playedBarCount = Math.floor(clampedProgress * BAR_HEIGHTS.length);

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
      {/* Header Telemetry */}
      <View style={styles.telemetryRow}>
        <Text style={styles.telemetryAmber}>LIVE SPECTRUM</Text>
        <View style={styles.syncBadge}>
          <View
            style={[
              styles.syncDot,
              { backgroundColor: isPlaying ? Colors.secondaryContainer : Colors.outline },
            ]}
          />
          <Text style={styles.telemetryCyan}>
            {isPlaying ? 'ACTIVE STREAM' : 'PAUSED'}
          </Text>
        </View>
      </View>

      {/* Waveform Bars Container */}
      <Pressable onPress={handlePress} style={styles.barsContainer}>
        {BAR_HEIGHTS.map((height, idx) => {
          const isPlayed = idx < playedBarCount;
          const isCurrent = idx === playedBarCount;

          let barColor: string = Colors.surfaceBright;
          if (isPlayed) {
            barColor = Colors.primaryContainer; // Electric Amber for played
          } else if (isCurrent) {
            barColor = Colors.secondaryContainer; // Electric Cyan cursor
          }

          return (
            <View
              key={idx}
              style={[
                styles.bar,
                {
                  height,
                  backgroundColor: barColor,
                  opacity: isPlayed ? 1 : 0.6,
                },
              ]}
            />
          );
        })}
      </Pressable>

      {/* Progress Track & Timestamps */}
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
          <Text style={styles.timeElapsed}>{formatTime(currentTimeSeconds)}</Text>
          <Text style={styles.timeTotal}>{formatTime(durationSeconds)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  telemetryAmber: {
    ...Typography.telemetry,
    fontSize: 10,
    color: Colors.primaryContainer,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  telemetryCyan: {
    ...Typography.telemetry,
    fontSize: 10,
    color: Colors.secondaryContainer,
  },
  barsContainer: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  bar: {
    width: 6,
    borderRadius: 3,
  },
  trackContainer: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  trackBackground: {
    height: 4,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 2,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: Colors.primaryContainer,
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeElapsed: {
    ...Typography.telemetry,
    color: Colors.primaryContainer,
    fontWeight: '700',
  },
  timeTotal: {
    ...Typography.telemetry,
    color: Colors.onSurfaceVariant,
  },
});
