import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function Header() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <View style={styles.headerContent}>
        <View style={styles.brandRow}>
          <Text style={styles.brandTag}>BLIPP // LIVE</Text>
          <Text style={styles.brandTitle}>Feed</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.headerActionBtn}
            activeOpacity={0.85}
            accessibilityLabel="Commute Mode"
          >
            <MaterialIcons name="directions-car" size={20} color="#bdc6dd" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerActionBtn}
            activeOpacity={0.85}
            accessibilityLabel="Lock Screen Audio"
          >
            <MaterialIcons name="lock-clock" size={20} color="#bdc6dd" />
          </TouchableOpacity>
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarInitial}>B</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'rgba(15, 19, 28, 0.92)',
    borderBottomWidth: 1,
    borderBottomColor: '#1c2028',
    zIndex: 50,
  },
  headerContent: {
    height: 64, // Exact h-16
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'column',
  },
  brandTag: {
    fontFamily: 'JetBrainsMono-SemiBold',
    fontSize: 10,
    letterSpacing: 0.88,
    color: '#00eefc',
  },
  brandTitle: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 18,
    color: '#dfe2ee',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    width: 44, // Exact w-11
    height: 44, // Exact h-11
    borderRadius: 12, // Exact rounded-xl (NOT rounded-full)
    backgroundColor: '#181c24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#262a33',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  avatarInitial: {
    fontFamily: 'JetBrainsMono-SemiBold',
    fontSize: 13,
    color: '#dfe2ee',
  },
});
