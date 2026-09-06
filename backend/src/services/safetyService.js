
/**
 * TrailSafe Safety Service
 *
 * Core environmental safety-scoring engine.
 *
 * The engine:
 * 1. Scores individual environmental risks from 0–100.
 * 2. Considers weather conditions such as rain and thunderstorms.
 * 3. Uses both average wind speed and wind gusts.
 * 4. Applies activity-specific adjustments.
 * 5. Calculates a weighted overall environmental risk score.
 * 6. Identifies the main factors contributing to the result.
 */

const {
  WEIGHTS,
  RISK_LEVELS,
  ACTIVITY_FACTORS,
} = require('../config/safetyConfig');

// ─────────────────────────────────────────────
// Individual Risk Scoring Functions
// ─────────────────────────────────────────────

/**
 * Scores heat-index risk.
 *
 * @param {number} heatIndex - Heat index in °C
 * @returns {number}
 */
function scoreHeatIndex(heatIndex) {
  if (heatIndex < 27) return 0;
  if (heatIndex < 32) return 15;
  if (heatIndex < 38) return 40;
  if (heatIndex < 45) return 70;
  return 100;
}

/**
 * Scores temperature risk.
 *
 * Both extreme cold and extreme heat increase risk.
 *
 * @param {number} temperature - Temperature in °C
 * @returns {number}
 */
function scoreTemperature(temperature) {
  if (temperature < 0) return 85;
  if (temperature < 5) return 65;
  if (temperature < 10) return 40;
  if (temperature < 15) return 15;

  if (temperature < 28) return 0;
  if (temperature < 32) return 20;
  if (temperature < 36) return 45;
  if (temperature < 40) return 70;

  return 100;
}

/**
 * Scores humidity risk.
 *
 * @param {number} humidity - Relative humidity percentage
 * @returns {number}
 */
function scoreHumidity(humidity) {
  if (humidity < 30) return 15;
  if (humidity < 60) return 0;
  if (humidity < 70) return 15;
  if (humidity < 80) return 35;
  if (humidity < 90) return 60;

  return 85;
}

/**
 * Scores UV-index risk.
 *
 * @param {number} uvIndex
 * @returns {number}
 */
function scoreUV(uvIndex) {
  if (uvIndex <= 2) return 0;
  if (uvIndex <= 5) return 20;
  if (uvIndex <= 7) return 45;
  if (uvIndex <= 10) return 70;

  return 95;
}

/**
 * Scores wind risk using BOTH average wind speed and gust speed.
 *
 * Gusts are particularly important for hikers in exposed areas.
 *
 * @param {number} windSpeed - Average wind speed in km/h
 * @param {number} windGusts - Wind gust speed in km/h
 * @returns {number}
 */
function scoreWind(windSpeed = 0, windGusts = 0) {
  const effectiveWind = Math.max(windSpeed, windGusts);

  if (effectiveWind < 20) return 0;
  if (effectiveWind < 30) return 15;
  if (effectiveWind < 40) return 35;
  if (effectiveWind < 50) return 55;
  if (effectiveWind < 65) return 75;

  return 95;
}

/**
 * Scores precipitation risk.
 *
 * @param {number} precipitation - Current precipitation in mm
 * @returns {number}
 */
function scorePrecipitation(precipitation) {
  if (precipitation <= 0) return 0;
  if (precipitation < 0.1) return 10;
  if (precipitation < 1) return 25;
  if (precipitation < 2.5) return 40;
  if (precipitation < 5) return 60;
  if (precipitation < 10) return 80;

  return 100;
}

/**
 * Scores weather-condition risk.
 *
 * This handles situations where the WMO weather code itself
 * indicates a hazardous condition such as fog, heavy rain,
 * snow, or thunderstorms.
 *
 * @param {string} category
 * @param {string} severity
 * @returns {number}
 */
function scoreWeatherCondition(category = 'unknown', severity = 'unknown') {
  // Thunderstorms are always treated as significant hazards.
  if (category === 'thunderstorm') {
    return 100;
  }

  // Weather category base risks.
  const categoryBaseScores = {
    clear: 0,
    cloud: 0,
    unknown: 10,

    fog: 45,

    rain: 40,

    snow: 60,
  };

  const baseScore = categoryBaseScores[category] ?? 10;

  // Severity can increase the category risk.
  const severityBonus = {
    none: 0,
    low: 0,
    moderate: 15,
    high: 35,
    very_high: 55,
    unknown: 0,
  };

  const bonus = severityBonus[severity] ?? 0;

  return Math.min(100, baseScore + bonus);
}

// ─────────────────────────────────────────────
// Composite Score Calculation
// ─────────────────────────────────────────────

/**
 * Calculates the overall environmental safety score.
 *
 * @param {Object} weather
 * @param {number} heatIndex
 * @param {string} activity - 'hiking' | 'running'
 *
 * @returns {{
 *   safetyScore: number,
 *   riskLevel: string,
 *   factorScores: Object,
 *   primaryFactor: string,
 *   contributingFactors: string[]
 * }}
 */
/**
 * Applies minimum score floors for critical environmental hazards.
 *
 * A weighted average alone can hide a single dangerous condition.
 * For example, extremely dangerous wind gusts or thunderstorms
 * should never result in an overall LOW risk assessment.
 */
function applyCriticalHazardFloor(
  safetyScore,
  weather,
  factorScores
) {
  let minimumScore = safetyScore;

  // Thunderstorms are a significant immediate outdoor hazard.
  if (weather.weatherCategory === 'thunderstorm') {
    minimumScore = Math.max(minimumScore, 55);
  }

  // Very dangerous sustained wind or gusts.
  const effectiveWind = Math.max(
    weather.windSpeed || 0,
    weather.windGusts || 0
  );

  if (effectiveWind >= 65) {
    minimumScore = Math.max(minimumScore, 30);
  }

  // Extreme heat index should not appear as a low/moderate condition.
  if (factorScores.heatIndex >= 100) {
    minimumScore = Math.max(minimumScore, 55);
  }

  // Extremely heavy precipitation.
  if (factorScores.precipitation >= 100) {
    minimumScore = Math.max(minimumScore, 30);
  }

  return Math.min(100, minimumScore);
}

function calculateSafetyScore(weather, heatIndex, activity) {
  const activityFactors =
    ACTIVITY_FACTORS[activity] || ACTIVITY_FACTORS.hiking;

  // ── 1. Calculate raw individual risk scores ────────────────

  const factorScores = {
    heatIndex: scoreHeatIndex(heatIndex),

    temperature: scoreTemperature(weather.temperature),

    humidity: scoreHumidity(weather.humidity),

    uvIndex: scoreUV(weather.uvIndex),

    wind: scoreWind(
      weather.windSpeed,
      weather.windGusts
    ),

    precipitation: scorePrecipitation(
      weather.precipitation
    ),

    weatherCondition: scoreWeatherCondition(
      weather.weatherCategory,
      weather.weatherSeverity
    ),
  };

  // ── 2. Apply activity-specific adjustments ────────────────

  const adjustedScores = {};

  for (const factor of Object.keys(factorScores)) {
    const multiplier = activityFactors[factor] || 1;

    adjustedScores[factor] = Math.min(
      100,
      Math.round(factorScores[factor] * multiplier)
    );
  }

  // ── 3. Calculate weighted contributions ───────────────────

  const weightedContributions = {};

  for (const factor of Object.keys(adjustedScores)) {
    weightedContributions[factor] =
      adjustedScores[factor] * WEIGHTS[factor];
  }

  // ── 4. Calculate final risk score ─────────────────────────

  const rawScore = Object.values(
    weightedContributions
  ).reduce((total, value) => total + value, 0);

  const weightedScore = Math.min(
  100,
  Math.round(rawScore)
  );

  const safetyScore = applyCriticalHazardFloor(
    weightedScore,
    weather,
    factorScores
  );

  // ── 5. Determine risk level ───────────────────────────────

  const riskLevel = getRiskLevel(safetyScore);

  // ── 6. Sort factors by actual weighted contribution ───────

  const sortedFactors = Object.entries(
    weightedContributions
  )
    .sort(([, a], [, b]) => b - a)
    .map(([factor]) => factor);

  const primaryFactor = sortedFactors[0];

  // Return up to 3 factors that meaningfully contributed.
  const contributingFactors = sortedFactors
    .filter((factor) => adjustedScores[factor] >= 15)
    .slice(0, 3);

  return {
    safetyScore,
    riskLevel,

    // Raw scores are returned for transparency.
    factorScores,

    // Activity-adjusted scores can be useful for debugging/UI.
    adjustedScores,

    primaryFactor,
    contributingFactors,
  };
}

/**
 * Maps a numeric score to a risk level.
 *
 * @param {number} score
 * @returns {string}
 */
function getRiskLevel(score) {
  for (const { max, level } of RISK_LEVELS) {
    if (score <= max) {
      return level;
    }
  }

  return 'VERY_HIGH';
}

module.exports = {
  calculateSafetyScore,
  getRiskLevel,

  // Individual scorers exported for unit testing.
  scoreHeatIndex,
  scoreTemperature,
  scoreHumidity,
  scoreUV,
  scoreWind,
  scorePrecipitation,
  scoreWeatherCondition,
};

