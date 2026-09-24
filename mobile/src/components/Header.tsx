import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, LayoutMetrics, Typography } from '../theme/theme';

export const Header: React.FC = () => {
  return (
    <View style={styles.header}>
      <View style={styles.logoRow}>
        <View style={styles.statusDot} />
        <Text style={styles.brandTitle}>BLIPPS</Text>
      </View>
      <View style={styles.badge}>
        <View style={styles.liveDot} />
        <Text style={styles.badgeText}>LIVE</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: LayoutMetrics.headerHeight, // 64px
    backgroundColor: colors['surface-container-lowest'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LayoutMetrics.gutter,
    borderBottomWidth: 1,
    borderBottomColor: colors['outline-variant'],
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: LayoutMetrics.radiusBadge,
    backgroundColor: colors['primary-container'],
  },
  brandTitle: {
    ...Typography.headlineMd,
    letterSpacing: 2,
    color: colors['on-surface'],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors['surface-container-high'],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: LayoutMetrics.radiusBadge, // 9999px
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: LayoutMetrics.radiusBadge,
    backgroundColor: colors.secondary,
  },
  badgeText: {
    ...Typography.labelCaps,
    fontSize: 11,
    color: colors['on-surface-variant'],
  },
});
