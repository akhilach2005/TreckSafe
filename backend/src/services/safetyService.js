/**
 * TrailSafe Safety Service
 *
 * Core safety-scoring engine.
 * Computes individual risk scores per environmental factor,
 * applies configurable weights, applies activity adjustment,
 * determines risk level, and identifies the primary contributing factor.
 *
 * All scoring functions are exported individually for unit testing
 * with artificial values.
 */

const { WEIGHTS, RISK_LEVELS, ACTIVITY_MULTIPLIERS } = require('../config/safetyConfig');

// ─────────────────────────────────────────────
// Individual Risk Scoring Functions (0–100)
// Each function is independently testable.
// ─────────────────────────────────────────────

/**
 * Scores heat index risk (0–100).
 * Heat index has the highest weight (30%) in the engine.
 * @param {number} heatIndex - Heat index in °C
 * @returns {number}
 */
function scoreHeatIndex(heatIndex) {
  if (heatIndex < 27)  return 0;
  if (heatIndex < 32)  return 20;
  if (heatIndex < 38)  return 50;
  if (heatIndex < 45)  return 75;
  return 100;
}

/**
 * Scores temperature risk (0–100).
 * Both extreme cold and extreme heat increase risk.
 * @param {number} temperature - Temperature in °C
 * @returns {number}
 */
function scoreTemperature(temperature) {
  if (temperature < 0)   return 80;
  if (temperature < 10)  return 50;
  if (temperature < 15)  return 20;
  if (temperature < 25)  return 0;
  if (temperature < 32)  return 30;
  if (temperature < 38)  return 65;
  return 100;
}

/**
 * Scores humidity risk (0–100).
 * High humidity impairs sweat evaporation, significantly raising exertion risk.
 * @param {number} humidity - Relative humidity (0–100)
 * @returns {number}
 */
function scoreHumidity(humidity) {
  if (humidity < 30)  return 10;
  if (humidity < 60)  return 0;
  if (humidity < 75)  return 30;
  if (humidity < 85)  return 60;
  return 90;
}

/**
 * Scores UV index risk (0–100).
 * @param {number} uvIndex
 * @returns {number}
 */
function scoreUV(uvIndex) {
  if (uvIndex <= 2)  return 0;
  if (uvIndex <= 5)  return 20;
  if (uvIndex <= 7)  return 40;
  if (uvIndex <= 10) return 65;
  return 90;
}

/**
 * Scores wind speed risk (0–100).
 * Moderate wind can help cooling; very high wind is hazardous.
 * @param {number} windSpeed - Wind speed in km/h
 * @returns {number}
 */
function scoreWind(windSpeed) {
  if (windSpeed < 20)  return 0;
  if (windSpeed < 40)  return 20;
  if (windSpeed < 60)  return 50;
  return 85;
}

/**
 * Scores precipitation risk (0–100).
 * @param {number} precipitation - Precipitation in mm
 * @returns {number}
 */
function scorePrecipitation(precipitation) {
  if (precipitation === 0)    return 0;
  if (precipitation < 0.1)    return 5;
  if (precipitation < 2)      return 20;
  if (precipitation < 10)     return 55;
  return 90;
}

// ─────────────────────────────────────────────
// Composite Score Calculation
// ─────────────────────────────────────────────

/**
 * Calculates the overall safety score and determines risk level.
 *
 * @param {Object} weather - Normalised weather object
 * @param {number} weather.temperature
 * @param {number} weather.humidity
 * @param {number} weather.windSpeed
 * @param {number} weather.precipitation
 * @param {number} weather.uvIndex
 * @param {number} heatIndex - Calculated heat index in °C
 * @param {string} activity - 'hiking' | 'running'
 * @returns {SafetyResult}
 */
function calculateSafetyScore(weather, heatIndex, activity) {
  const { temperature, humidity, windSpeed, precipitation, uvIndex } = weather;

  // Individual risk scores
  const factorScores = {
    heatIndex:     scoreHeatIndex(heatIndex),
    temperature:   scoreTemperature(temperature),
    humidity:      scoreHumidity(humidity),
    uvIndex:       scoreUV(uvIndex),
    windSpeed:     scoreWind(windSpeed),
    precipitation: scorePrecipitation(precipitation),
  };

  // Weighted sum
  const baseScore =
    factorScores.heatIndex     * WEIGHTS.heatIndex +
    factorScores.temperature   * WEIGHTS.temperature +
    factorScores.humidity      * WEIGHTS.humidity +
    factorScores.uvIndex       * WEIGHTS.uvIndex +
    factorScores.windSpeed     * WEIGHTS.windSpeed +
    factorScores.precipitation * WEIGHTS.precipitation;

  // Activity multiplier (running = slightly higher risk under stress)
  const multiplier = ACTIVITY_MULTIPLIERS[activity] || ACTIVITY_MULTIPLIERS.hiking;
  const rawScore = baseScore * multiplier;
  const safetyScore = Math.min(100, Math.round(rawScore));

  // Determine risk level
  const riskLevel = getRiskLevel(safetyScore);

  // Identify primary contributing factor (weighted contribution)
  const weightedContributions = {
    heatIndex:     factorScores.heatIndex     * WEIGHTS.heatIndex,
    temperature:   factorScores.temperature   * WEIGHTS.temperature,
    humidity:      factorScores.humidity      * WEIGHTS.humidity,
    uvIndex:       factorScores.uvIndex       * WEIGHTS.uvIndex,
    windSpeed:     factorScores.windSpeed     * WEIGHTS.windSpeed,
    precipitation: factorScores.precipitation * WEIGHTS.precipitation,
  };

  const primaryFactor = Object.entries(weightedContributions)
    .sort(([, a], [, b]) => b - a)[0][0];

  return { safetyScore, riskLevel, factorScores, primaryFactor };
}

/**
 * Maps a numeric safety score to a risk level string.
 * @param {number} score
 * @returns {string}
 */
function getRiskLevel(score) {
  for (const { max, level } of RISK_LEVELS) {
    if (score <= max) return level;
  }
  return 'VERY_HIGH';
}

module.exports = {
  calculateSafetyScore,
  getRiskLevel,
  // Export individual scorers for unit testing with artificial values:
  scoreHeatIndex,
  scoreTemperature,
  scoreHumidity,
  scoreUV,
  scoreWind,
  scorePrecipitation,
};
