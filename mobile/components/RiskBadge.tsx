/**
 * RiskBadge Component
 * Displays the risk level prominently with colour-coded styling.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, getRiskColors, getRiskLabel } from '../constants/theme';

interface RiskBadgeProps {
  riskLevel:   string;
  safetyScore: number;
}

export function RiskBadge({ riskLevel, safetyScore }: RiskBadgeProps) {
  const { text, bg } = getRiskColors(riskLevel);
  const label = getRiskLabel(riskLevel);

  return (
    <View style={styles.container}>
      {/* Large score number */}
      <Text style={[styles.score, { color: text }]}>{safetyScore}</Text>
      <Text style={styles.scoreSub}>/ 100</Text>

      {/* Risk level pill */}
      <View style={[styles.pill, { backgroundColor: bg, borderColor: text }]}>
        <Text style={[styles.pillText, { color: text }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems:    'center',
    paddingVertical: SPACING.lg,
  },
  score: {
    fontSize:   72,
    fontWeight: '800',
    lineHeight: 80,
    letterSpacing: -2,
  },
  scoreSub: {
    ...TYPOGRAPHY.h3,
    color:         COLORS.textSecondary,
    marginBottom:  SPACING.sm,
  },
  pill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.sm,
    borderRadius:      RADIUS.full,
    borderWidth:       1.5,
    marginTop:         SPACING.xs,
  },
  pillText: {
    fontSize:    14,
    fontWeight:  '700',
    letterSpacing: 2,
  },
});
