/**
 * TrailSafe Safety Configuration
 *
 * Centralised weights, thresholds, and activity-specific adjustments.
 * All safety factor weights must add up to 1.00.
 */

const WEIGHTS = {
  heatIndex: 0.20,
  temperature: 0.15,
  humidity: 0.10,
  uvIndex: 0.10,
  wind: 0.15,
  precipitation: 0.15,
  weatherCondition: 0.15,
};

// Risk level thresholds
// Score: 0–100, higher score = higher environmental risk
const RISK_LEVELS = [
  { max: 25, level: 'LOW', label: 'Low Risk' },
  { max: 50, level: 'MODERATE', label: 'Moderate Risk' },
  { max: 75, level: 'HIGH', label: 'High Risk' },
  { max: 100, level: 'VERY_HIGH', label: 'Very High Risk' },
];

/**
 * Activity-specific adjustments.
 *
 * Running is more physically demanding, so heat, humidity,
 * and UV exposure have greater importance.
 *
 * Hiking is more affected by environmental hazards such as
 * rain and strong winds.
 */
const ACTIVITY_FACTORS = {
  hiking: {
    heatIndex: 1.0,
    temperature: 1.0,
    humidity: 1.0,
    uvIndex: 1.0,
    wind: 1.1,
    precipitation: 1.15,
    weatherCondition: 1.15,
  },

  running: {
    heatIndex: 1.15,
    temperature: 1.1,
    humidity: 1.1,
    uvIndex: 1.1,
    wind: 1.0,
    precipitation: 1.0,
    weatherCondition: 1.0,
  },
};

module.exports = {
  WEIGHTS,
  RISK_LEVELS,
  ACTIVITY_FACTORS,
};