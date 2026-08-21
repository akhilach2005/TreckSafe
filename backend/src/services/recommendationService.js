/**
 * TrailSafe Recommendation Service
 *
 * Generates deterministic, human-readable safety recommendations
 * based on risk level and the primary environmental contributing factor.
 *
 * No LLM/AI is used. Logic is fully transparent and auditable.
 */

// Human-readable labels for each contributing factor
const FACTOR_LABELS = {
  heatIndex:     'heat index',
  temperature:   'temperature',
  humidity:      'humidity',
  uvIndex:       'UV index',
  windSpeed:     'wind speed',
  precipitation: 'precipitation',
};

// Base recommendations by risk level
const BASE_RECOMMENDATIONS = {
  LOW:
    'Conditions are generally favorable for outdoor activity. Stay hydrated and monitor how you feel.',
  MODERATE:
    'Conditions are moderately challenging. Take regular breaks and stay hydrated.',
  HIGH:
    'Conditions may increase heat and exertion risk. Consider reducing intensity, taking longer breaks, or stopping if conditions worsen.',
  VERY_HIGH:
    'Conditions are unfavorable for prolonged outdoor activity. Consider stopping or turning back and avoid prolonged exposure.',
};

/**
 * Generates a contextualised recommendation.
 * @param {string} riskLevel - 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH'
 * @param {string} primaryFactor - The factor with the highest weighted contribution
 * @param {Object} factorScores - Individual factor scores for context
 * @returns {string}
 */
function generateRecommendation(riskLevel, primaryFactor, factorScores) {
  const base = BASE_RECOMMENDATIONS[riskLevel] || BASE_RECOMMENDATIONS.MODERATE;
  const factorLabel = FACTOR_LABELS[primaryFactor] || primaryFactor;

  // Only mention primary factor if it has a meaningful score
  const primaryScore = factorScores[primaryFactor] || 0;

  if (primaryScore >= 20 && riskLevel !== 'LOW') {
    return `${base} The ${factorLabel} is currently the primary contributing factor to the risk level.`;
  }

  return base;
}

module.exports = { generateRecommendation };
