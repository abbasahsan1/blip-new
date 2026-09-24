import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing, typography } from '../theme/theme';

export const Header: React.FC = () => {
  return (
    <View style={styles.header}>
      <View style={styles.logoRow}>
        <View style={styles.statusIndicator} />
        <Text style={styles.logoText}>BLIPPS</Text>
      </View>
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>AUDIO STREAM</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: colors['surface-container-lowest'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors['outline-variant'],
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors['primary-container'],
  },
  logoText: {
    ...typography['headline-md'],
    letterSpacing: 4.4, // 0.2em * 22
    color: colors['on-surface'],
    textTransform: 'uppercase',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors['surface-container-high'],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radii.md,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.secondary,
  },
  liveText: {
    ...typography['label-sm'],
    color: colors['on-surface-variant'],
    letterSpacing: 0.8,
  },
});
