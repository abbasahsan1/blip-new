import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Metrics, Typography } from '../theme/tokens';

export const Header: React.FC = () => {
  return (
    <View style={styles.header}>
      {/* Brand & Feed Title */}
      <View style={styles.leftCol}>
        <View style={styles.liveRow}>
          <Text style={styles.liveTag}>BLIPP // LIVE</Text>
          <View style={styles.pulseDot} />
        </View>
        <Text style={styles.screenTitle}>Feed</Text>
      </View>

      {/* Header Action Buttons (44px Rounded-xl 12px hardware blocks) */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={styles.headerActionBtn}
          activeOpacity={0.85}
          accessibilityLabel="Commute Mode"
        >
          <MaterialIcons name="directions-car" size={20} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerActionBtn}
          activeOpacity={0.85}
          accessibilityLabel="Lock Screen Audio"
        >
          <MaterialIcons name="lock-clock" size={20} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>

        <View style={styles.profileAvatar}>
          <Text style={styles.avatarInitial}>B</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: Metrics.headerHeight, // 64px (h-16)
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Metrics.gutter,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  leftCol: {
    justifyContent: 'center',
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveTag: {
    ...Typography.labelCaps,
    fontSize: 10,
    color: Colors.secondaryContainer, // #00eefc
    letterSpacing: 1.0,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: Metrics.radiusFull,
    backgroundColor: Colors.secondaryContainer,
  },
  screenTitle: {
    ...Typography.headlineSm,
    color: Colors.onSurface,
    marginTop: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Exact 44px rounded-xl hardware action blocks (NOT rounded-full)
  headerActionBtn: {
    width: 44,       // Exact w-11
    height: 44,      // Exact h-11
    borderRadius: Metrics.radiusXl, // Exact rounded-xl (12px)
    backgroundColor: Colors.surfaceContainerLow, // #181c24
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Only the profile avatar itself remains circular
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16, // rounded-full
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  avatarInitial: {
    ...Typography.labelCaps,
    fontSize: 13,
    color: Colors.onSurface,
  },
});
