import React from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts, radii, spacing } from '../theme/theme';

interface BottomNavProps {
  currentRoute: 'Feed' | 'Upload';
  onNavigate: (route: 'Feed' | 'Upload') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, onNavigate }) => {
  return (
    <View style={styles.container}>
      {/* Feed Tab */}
      <Pressable
        style={styles.tab}
        onPress={() => onNavigate('Feed')}
        accessibilityRole="button"
        accessibilityLabel="Feed Tab"
      >
        <MaterialCommunityIcons
          name="waveform"
          size={22}
          color={
            currentRoute === 'Feed'
              ? colors['primary-container']
              : colors['on-surface-variant']
          }
          style={styles.tabIcon}
        />
        <Text
          style={[
            styles.tabText,
            {
              color:
                currentRoute === 'Feed'
                  ? colors['primary-container']
                  : colors['on-surface-variant'],
            },
          ]}
        >
          FEED
        </Text>
        {currentRoute === 'Feed' && <View style={styles.activeIndicator} />}
      </Pressable>

      {/* Upload Tab */}
      <Pressable
        style={styles.tab}
        onPress={() => onNavigate('Upload')}
        accessibilityRole="button"
        accessibilityLabel="Upload Tab"
      >
        <MaterialCommunityIcons
          name="cloud-upload-outline"
          size={22}
          color={
            currentRoute === 'Upload'
              ? colors['primary-container']
              : colors['on-surface-variant']
          }
          style={styles.tabIcon}
        />
        <Text
          style={[
            styles.tabText,
            {
              color:
                currentRoute === 'Upload'
                  ? colors['primary-container']
                  : colors['on-surface-variant'],
            },
          ]}
        >
          UPLOAD
        </Text>
        {currentRoute === 'Upload' && <View style={styles.activeIndicator} />}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: colors['surface-container-lowest'],
    borderTopWidth: 1,
    borderTopColor: colors['outline-variant'],
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
    position: 'relative',
  },
  tabIcon: {
    marginBottom: spacing[1],
  },
  tabText: {
    fontFamily: fonts.label,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -spacing[1],
    width: 20,
    height: 2,
    backgroundColor: colors['primary-container'],
    borderRadius: radii.full,
  },
});
