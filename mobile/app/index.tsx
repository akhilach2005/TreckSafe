/**
 * TrailSafe — Start Screen (Screen 1)
 *
 * User selects their activity (Hiking or Running).
 * On selection:
 *   1. Request foreground location permission
 *   2. Get current GPS coordinates
 *   3. Call backend /api/safety
 *   4. Store result in shared context
 *   5. Navigate to result screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

import { ActivityButton }              from '../components/ActivityButton';
import { useSafetyResult }             from '../context/SafetyResultContext';
import { getCurrentLocation }          from '../utils/locationService';
import { fetchSafetyAssessment }       from '../services/apiService';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

type Activity = 'hiking' | 'running';

export default function StartScreen() {
  const router = useRouter();
  const { setResult } = useSafetyResult();

  const [loadingActivity, setLoadingActivity] = useState<Activity | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const handleActivityPress = async (activity: Activity) => {
    setPermissionError(null);
    setLoadingActivity(activity);

    try {
      // ── Step 1: Get GPS location ──────────────────────────────────
      const locationResult = await getCurrentLocation();

      if (locationResult.status === 'denied') {
        setPermissionError(
          'Location permission is required to determine your current conditions.\n\nPlease enable location in your device Settings.',
        );
        setLoadingActivity(null);
        return;
      }

      if (locationResult.status === 'unavailable') {
        setPermissionError(locationResult.message);
        setLoadingActivity(null);
        return;
      }

      const { latitude, longitude } = locationResult;

      // ── Step 2: Fetch safety assessment ───────────────────────────
      const result = await fetchSafetyAssessment(latitude, longitude, activity);

      // ── Step 3: Store in context and navigate ─────────────────────
      setResult(result);
      router.push('/result');

    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again.';

      Alert.alert('Unable to Assess Conditions', message, [
        { text: 'OK' },
      ]);
    } finally {
      setLoadingActivity(null);
    }
  };

  const isLoading = loadingActivity !== null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.appIcon}>🏔️</Text>
          <Text style={styles.appName}>TrailSafe</Text>
          <Text style={styles.tagline}>Outdoor Activity Safety Assessment</Text>
        </View>

        {/* ── Divider ────────────────────────────────────────────── */}
        <View style={styles.divider} />

        {/* ── Activity selection ─────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Choose your activity</Text>
          <Text style={styles.sectionSubtitle}>
            We'll check current environmental conditions at your location
          </Text>
        </View>

        <View style={styles.activityRow}>
          <ActivityButton
            label="HIKING"
            icon="🥾"
            onPress={() => handleActivityPress('hiking')}
            isLoading={loadingActivity === 'hiking'}
            disabled={isLoading}
          />
          <ActivityButton
            label="RUNNING"
            icon="🏃"
            onPress={() => handleActivityPress('running')}
            isLoading={loadingActivity === 'running'}
            disabled={isLoading}
          />
        </View>

        {/* ── Loading status text ────────────────────────────────── */}
        {isLoading && (
          <Text style={styles.loadingText}>
            {loadingActivity === 'hiking' ? '🥾' : '🏃'} Getting your location and weather data...
          </Text>
        )}

        {/* ── Permission error ───────────────────────────────────── */}
        {permissionError && (
          <View style={styles.errorCard} accessibilityRole="alert">
            <Text style={styles.errorIcon}>📍</Text>
            <Text style={styles.errorText}>{permissionError}</Text>
            {Platform.OS !== 'web' && (
              <Text
                style={styles.errorLink}
                onPress={() => Linking.openSettings()}
              >
                Open Settings →
              </Text>
            )}
          </View>
        )}

        {/* ── Disclaimer ─────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.disclaimer}>
            ⚠️ TrailSafe is a decision-support tool, not a medical or emergency safety system.
            Always use personal judgement and consult professionals for safety-critical decisions.
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex:            1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex:            1,
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.lg,
  },

  // Header
  header: {
    alignItems:   'center',
    paddingTop:   SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  appIcon: {
    fontSize:     56,
    marginBottom: SPACING.sm,
  },
  appName: {
    fontSize:     36,
    fontWeight:   '800',
    color:        COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    ...TYPOGRAPHY.bodyMd,
    color:      COLORS.textSecondary,
    marginTop:  SPACING.xs,
  },

  // Divider
  divider: {
    height:           1,
    backgroundColor:  COLORS.border,
    marginVertical:   SPACING.lg,
  },

  // Section
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    color:     COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Activity buttons
  activityRow: {
    flexDirection:  'row',
    gap:            SPACING.md,
    marginTop:      SPACING.sm,
  },

  // Loading
  loadingText: {
    ...TYPOGRAPHY.body,
    color:      COLORS.textSecondary,
    textAlign:  'center',
    marginTop:  SPACING.lg,
    fontStyle:  'italic',
  },

  // Error card
  errorCard: {
    backgroundColor: '#1c1520',
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     '#7f1d1d',
    padding:         SPACING.md,
    marginTop:       SPACING.lg,
    alignItems:      'center',
    gap:             SPACING.sm,
  },
  errorIcon: {
    fontSize: 28,
  },
  errorText: {
    ...TYPOGRAPHY.body,
    color:     COLORS.error,
    textAlign: 'center',
  },
  errorLink: {
    ...TYPOGRAPHY.label,
    color:         COLORS.accentLight,
    textDecorationLine: 'underline',
    marginTop:     SPACING.xs,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom:   SPACING.lg,
    left:     SPACING.lg,
    right:    SPACING.lg,
  },
  disclaimer: {
    ...TYPOGRAPHY.caption,
    color:     COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
