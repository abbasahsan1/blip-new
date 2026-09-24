import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '../theme/theme';

export const Header: React.FC = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.brandTitle}>Blipps</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 52,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  brandTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: 22,
    letterSpacing: -0.5,
    color: colors['on-surface'],
  },
});
