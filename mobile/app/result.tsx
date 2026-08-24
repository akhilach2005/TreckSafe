/**
 * TrailSafe — Result Screen (Screen 2)
 *
 * Displays the full safety assessment result:
 * - Safety score + risk level badge
 * - Current weather conditions grid
 * - Recommendation text
 * - Hydration estimate
 *
 * Data is read from SafetyResultContext (set by the Start Screen).
 * If no result is available (e.g. direct navigation), redirects to home.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';

import { RiskBadge }                   from '../components/RiskBadge';
import { WeatherGrid }                 from '../components/WeatherGrid';
import { useSafetyResult }             from '../context/SafetyResultContext';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, getRiskColors } from '../constants/theme';

export default function ResultScreen() {
  const router = useRouter();
  const { result, setResult } = useSafetyResult();

  // Guard: if no result in context, go back to start
  useEffect(() => {
    if (!result) {
      router.replace('/');
    }
  }, [result]);

  if (!result) return null;

  const { text: riskTextColor, bg: riskBg } = getRiskColors(result.riskLevel);

  const handleBack = () => {
    setResult(null);   // clear result so Start Screen is clean
    router.back();
  };

  const activityLabel = result.activity === 'hiking' ? '🥾 Hiking' : '🏃 Running';

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          id="back-button"
          style={styles.backButton}
          onPress={handleBack}
          accessibilityLabel="Back to start"
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.topBarTitle}>
          <Text style={styles.appName}>TrailSafe</Text>
          <Text style={styles.activityLabel}>{activityLabel}</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Safety Score Card ───────────────────────────────────── */}
        <View style={[styles.card, styles.scoreCard, { borderColor: riskTextColor }]}>
          <Text style={styles.cardTitle}>SAFETY SCORE</Text>
          <RiskBadge
            riskLevel={result.riskLevel}
            safetyScore={result.safetyScore}
          />
        </View>

        {/* ── Recommendation Card ─────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>RECOMMENDATION</Text>
          <View style={[styles.recommendationBox, { backgroundColor: riskBg, borderColor: riskTextColor }]}>
            <Text style={[styles.recommendationText, { color: riskTextColor }]}>
              {result.recommendation}
            </Text>
          </View>
        </View>

        {/* ── Hydration Card ──────────────────────────────────────── */}
        <View style={[styles.card, styles.hydrationCard]}>
          <Text style={styles.hydrationIcon}>💧</Text>
          <View>
            <Text style={styles.cardTitle}>ESTIMATED HYDRATION</Text>
            <Text style={styles.hydrationValue}>
              {result.hydration.minimum}–{result.hydration.maximum}{' '}
              <Text style={styles.hydrationUnit}>{result.hydration.unit}</Text>
            </Text>
            <Text style={styles.hydrationNote}>
              Estimate only — not medical advice. Adjust for your body weight, fitness, and conditions.
            </Text>
          </View>
        </View>

        {/* ── Weather Conditions Card ─────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CURRENT CONDITIONS</Text>
          <WeatherGrid
            weather={result.weather}
            heatIndex={result.heatIndex}
            heatIndexFormulaApplied={result.heatIndexFormulaApplied}
          />
        </View>

        {/* ── Location info ───────────────────────────────────────── */}
        <View style={styles.locationRow}>
          <Text style={styles.locationText}>
            📍 {result.location.latitude.toFixed(4)}°, {result.location.longitude.toFixed(4)}°
          </Text>
        </View>

        {/* ── Disclaimer ──────────────────────────────────────────── */}
        <Text style={styles.disclaimer}>
          TrailSafe is a decision-support tool, not a medical or emergency safety certification system.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex:            1,
    backgroundColor: COLORS.background,
  },

  // Top navigation bar
  topBar: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.sm,
    borderBottomWidth: 1,
    borderColor:       COLORS.border,
  },
  backButton: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            4,
    width:          80,
  },
  backArrow: {
    fontSize:   20,
    color:      COLORS.accent,
  },
  backText: {
    ...TYPOGRAPHY.label,
    color: COLORS.accent,
  },
  topBarTitle: {
    alignItems: 'center',
  },
  appName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  activityLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },

  // Scroll content
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding:       SPACING.md,
    paddingBottom: SPACING.xxl,
    gap:           SPACING.md,
  },

  // Cards
  card: {
    backgroundColor: COLORS.surface,
    borderRadius:    RADIUS.lg,
    borderWidth:     1,
    borderColor:     COLORS.border,
    padding:         SPACING.md,
    gap:             SPACING.sm,
  },
  scoreCard: {
    borderWidth: 2,
    alignItems: 'center',
  },
  cardTitle: {
    ...TYPOGRAPHY.label,
    color:        COLORS.textSecondary,
    letterSpacing: 1.5,
  },

  // Recommendation
  recommendationBox: {
    borderRadius: RADIUS.md,
    borderWidth:  1,
    padding:      SPACING.md,
  },
  recommendationText: {
    ...TYPOGRAPHY.body,
    lineHeight: 24,
  },

  // Hydration
  hydrationCard: {
    flexDirection: 'row',
    gap:           SPACING.md,
    alignItems:    'flex-start',
  },
  hydrationIcon: {
    fontSize:   36,
    marginTop:  2,
  },
  hydrationValue: {
    fontSize:   26,
    fontWeight: '700',
    color:      COLORS.textPrimary,
    marginTop:  2,
  },
  hydrationUnit: {
    fontSize:   16,
    fontWeight: '400',
    color:      COLORS.textSecondary,
  },
  hydrationNote: {
    ...TYPOGRAPHY.caption,
    color:     COLORS.textMuted,
    marginTop: SPACING.xs,
    lineHeight: 16,
  },

  // Location
  locationRow: {
    alignItems: 'center',
  },
  locationText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },

  // Disclaimer
  disclaimer: {
    ...TYPOGRAPHY.caption,
    color:     COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: SPACING.sm,
  },
});
