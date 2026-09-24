import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title?: string;
  onUploadPress?: () => void;
  showUpload?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Feed',
  onUploadPress,
  showUpload = true,
}) => {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      {/* Brand logo & title */}
      <View style={styles.brand}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>BLIPP // LIVE</Text>
          <View style={styles.liveDot} />
        </View>
        <Text style={styles.titleText}>{title}</Text>
      </View>

      {/* Action buttons: Upload and Logout */}
      <View style={styles.actions}>
        {showUpload && onUploadPress && (
          <Pressable
            onPress={onUploadPress}
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && styles.actionBtnPressed,
            ]}
          >
            <Text style={styles.actionBtnText}>+ UPLOAD</Text>
          </Pressable>
        )}

        <Pressable
          onPress={logout}
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && styles.actionBtnPressed,
          ]}
        >
          <Text style={styles.logoutBtnText}>LOGOUT</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  brand: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondaryContainer,
  },
  badgeText: {
    ...Typography.labelCaps,
    fontSize: 9,
    color: Colors.secondaryContainer,
  },
  titleText: {
    ...Typography.headlineSm,
    color: Colors.onSurface,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionBtn: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryContainer,
  },
  actionBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  actionBtnText: {
    ...Typography.labelCaps,
    color: Colors.onPrimaryContainer,
    fontSize: 10,
  },
  logoutBtn: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  logoutBtnText: {
    ...Typography.labelCaps,
    color: Colors.onSurfaceVariant,
    fontSize: 10,
  },
});
