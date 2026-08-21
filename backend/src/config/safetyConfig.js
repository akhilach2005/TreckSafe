/**
 * TrailSafe Safety Configuration
 * Centralised weights, thresholds, and risk levels.
 * Modify values here to tune the safety engine — no other files need changing.
 */

const WEIGHTS = {
  heatIndex:     0.30,
  temperature:   0.20,
  humidity:      0.15,
  uvIndex:       0.15,
  windSpeed:     0.10,
  precipitation: 0.10,
};

// Risk level thresholds (score 0–100, higher = more dangerous)
const RISK_LEVELS = [
  { max: 25,  level: 'LOW',       label: 'Low Risk' },
  { max: 50,  level: 'MODERATE',  label: 'Moderate Risk' },
  { max: 75,  level: 'HIGH',      label: 'High Risk' },
  { max: 100, level: 'VERY_HIGH', label: 'Very High Risk' },
];

// Activity adjustment multipliers
const ACTIVITY_MULTIPLIERS = {
  hiking:  1.00,  // Baseline
  running: 1.05,  // +5% for higher exertion under environmental stress
};

module.exports = { WEIGHTS, RISK_LEVELS, ACTIVITY_MULTIPLIERS };
