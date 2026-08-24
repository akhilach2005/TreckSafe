/**
 * WeatherGrid Component
 * Displays a 2-column grid of weather metrics.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import type { WeatherData } from '../services/apiService';

interface WeatherGridProps {
  weather:    WeatherData;
  heatIndex:  number;
  heatIndexFormulaApplied: boolean;
}

interface MetricItem {
  label:  string;
  value:  string;
  icon:   string;
}

export function WeatherGrid({ weather, heatIndex, heatIndexFormulaApplied }: WeatherGridProps) {
  const metrics: MetricItem[] = [
    { label: 'Temperature',       value: `${weather.temperature}°C`,         icon: '🌡️' },
    { label: 'Feels Like',        value: `${weather.apparentTemperature}°C`,  icon: '🤔' },
    { label: 'Heat Index',        value: `${heatIndex}°C${heatIndexFormulaApplied ? '' : ' *'}`, icon: '🔥' },
    { label: 'Humidity',          value: `${weather.humidity}%`,              icon: '💧' },
    { label: 'UV Index',          value: `${weather.uvIndex}`,                icon: '☀️' },
    { label: 'Wind Speed',        value: `${weather.windSpeed} km/h`,         icon: '💨' },
    { label: 'Pressure',          value: `${weather.pressure} hPa`,           icon: '📊' },
    { label: 'Precipitation',     value: `${weather.precipitation} mm`,       icon: '🌧️' },
  ];

  return (
    <View>
      <View style={styles.grid}>
        {metrics.map((item) => (
          <View key={item.label} style={styles.cell}>
            <Text style={styles.cellIcon}>{item.icon}</Text>
            <Text style={styles.cellValue}>{item.value}</Text>
            <Text style={styles.cellLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
      {!heatIndexFormulaApplied && (
        <Text style={styles.footnote}>
          * Heat index shown as temperature — Rothfusz formula not applicable at current conditions (T&lt;27°C or RH&lt;40%).
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection:  'row',
    flexWrap:       'wrap',
  },
  cell: {
    width:           '50%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    alignItems:      'center',
    borderBottomWidth: 1,
    borderColor:     COLORS.border,
  },
  cellIcon: {
    fontSize:     24,
    marginBottom: 4,
  },
  cellValue: {
    ...TYPOGRAPHY.h3,
    color:        COLORS.textPrimary,
    marginBottom: 2,
  },
  cellLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  footnote: {
    ...TYPOGRAPHY.caption,
    color:      COLORS.textMuted,
    marginTop:  SPACING.sm,
    paddingHorizontal: SPACING.sm,
    fontStyle:  'italic',
  },
});
