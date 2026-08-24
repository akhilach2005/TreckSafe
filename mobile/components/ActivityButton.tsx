/**
 * ActivityButton Component
 * Large, tappable activity selection button with icon and label.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';

interface ActivityButtonProps {
  label:     string;
  icon:      string;           // emoji icon
  onPress:   () => void;
  isLoading?: boolean;
  disabled?:  boolean;
}

export function ActivityButton({
  label,
  icon,
  onPress,
  isLoading = false,
  disabled  = false,
}: ActivityButtonProps) {
  return (
    <TouchableOpacity
      id={`activity-btn-${label.toLowerCase()}`}
      style={[styles.button, (disabled || isLoading) && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.75}
    >
      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.accent} />
      ) : (
        <View style={styles.inner}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.subLabel}>Tap to assess conditions</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex:            1,
    backgroundColor: COLORS.surface,
    borderRadius:    RADIUS.xl,
    borderWidth:     1.5,
    borderColor:     COLORS.border,
    paddingVertical: SPACING.xl,
    alignItems:      'center',
    justifyContent:  'center',
    marginHorizontal: SPACING.xs,
    minHeight:        180,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  inner: {
    alignItems: 'center',
    gap:        SPACING.sm,
  },
  icon: {
    fontSize:     52,
    marginBottom: SPACING.xs,
  },
  label: {
    ...TYPOGRAPHY.h2,
    color:        COLORS.textPrimary,
    letterSpacing: 1,
  },
  subLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
