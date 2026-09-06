
/**
 * TrailSafe Recommendation Service
 *
 * Generates short, context-aware recommendations using:
 * 1. Current weather conditions
 * 2. Recent weather history
 * 3. Upcoming weather forecast
 * 4. Current safety score and contributing factors
 *
 * Recommendations prioritize specific weather hazards instead
 * of repeatedly mentioning the heat index.
 */

/**
 * Generates a short contextual safety recommendation.
 *
 * @param {Object} context
 * @param {string} context.riskLevel
 * @param {string} context.primaryFactor
 * @param {string[]} context.contributingFactors
 * @param {Object} context.factorScores
 * @param {Object} context.currentWeather
 * @param {Array<Object>} context.recentHistory
 * @param {Array<Object>} context.upcomingForecast
 * @param {string} context.activity
 * @param {number} context.heatIndex
 *
 * @returns {string}
 */
function generateRecommendation({
  riskLevel,
  primaryFactor,
  contributingFactors = [],
  factorScores = {},
  currentWeather = {},
  recentHistory = [],
  upcomingForecast = [],
  activity,
  heatIndex,
}) {
  // ── 1. Current thunderstorm ───────────────────────────

  if (currentWeather.weatherCategory === 'thunderstorm') {
    return 'Thunderstorm conditions are unsafe. Seek shelter and avoid exposed areas.';
  }

  // ── 2. Upcoming thunderstorm ──────────────────────────

  const upcomingThunderstorm = upcomingForecast.find(
    (hour) => hour.weatherCategory === 'thunderstorm'
  );

  if (upcomingThunderstorm) {
    return 'Thunderstorms are expected soon. Consider stopping early and avoiding exposed areas.';
  }

  // ── 3. Current significant rain ───────────────────────

  if (
    currentWeather.weatherCategory === 'rain' &&
    ['moderate', 'high', 'very_high'].includes(
      currentWeather.weatherSeverity
    )
  ) {
    return 'Rain is currently affecting conditions. Watch for slippery surfaces and reduced visibility.';
  }

  if ((currentWeather.precipitation || 0) >= 2.5) {
    return 'Heavy precipitation is affecting conditions. Watch for slippery and unsafe surfaces.';
  }

  // ── 4. Recent rain ────────────────────────────────────

  const recentRain = recentHistory.some(
    (hour) =>
      (hour.precipitation || 0) > 0 ||
      hour.weatherCategory === 'rain' ||
      hour.weatherCategory === 'thunderstorm'
  );

  if (recentRain) {
    return 'Rain occurred recently. Trails and other surfaces may still be slippery.';
  }

  // ── 5. Upcoming rain ──────────────────────────────────

  const upcomingRain = upcomingForecast.find(
    (hour) =>
      (hour.precipitation || 0) > 0 ||
      hour.weatherCategory === 'rain'
  );

  if (upcomingRain) {
    return 'Rain is expected soon. Carry rain protection and watch for slippery surfaces.';
  }

  // ── 6. Current dangerous wind ──────────────────────────

  const currentEffectiveWind = Math.max(
    currentWeather.windSpeed || 0,
    currentWeather.windGusts || 0
  );

  if (currentEffectiveWind >= 65) {
    return 'Dangerous wind gusts are present. Avoid exposed routes and unstable areas.';
  }

  if (currentEffectiveWind >= 50) {
    return 'Strong winds are affecting conditions. Use extra caution in exposed areas.';
  }

  // ── 7. Upcoming strong wind ────────────────────────────

  const upcomingStrongWind = upcomingForecast.find((hour) => {
    const effectiveWind = Math.max(
      hour.windSpeed || 0,
      hour.windGusts || 0
    );

    return effectiveWind >= 50;
  });

  if (upcomingStrongWind) {
    return 'Strong winds are expected soon. Avoid exposed routes if conditions worsen.';
  }

  // ── 8. Conditions getting hotter ───────────────────────

  const currentTemperature = currentWeather.temperature || 0;

  const gettingHotter = upcomingForecast.some(
    (hour) => (hour.temperature || 0) >= currentTemperature + 4
  );

  if (gettingHotter && currentTemperature >= 28) {
    return 'Conditions are expected to get hotter soon. Reduce intensity and carry extra water.';
  }

  // ── 9. Extreme heat risk ───────────────────────────────

  if (
    primaryFactor === 'heatIndex' &&
    (factorScores.heatIndex || 0) >= 70
  ) {
    return 'Heat stress is high. Take frequent breaks and avoid prolonged exertion.';
  }

  // ── 10. Moderate heat risk ─────────────────────────────

  if (
    primaryFactor === 'heatIndex' &&
    (factorScores.heatIndex || 0) >= 40
  ) {
    return 'Warm conditions may increase fatigue. Stay hydrated and take regular breaks.';
  }

  // ── 11. High UV ────────────────────────────────────────

  if ((factorScores.uvIndex || 0) >= 70) {
    return 'UV exposure is high. Limit direct sun exposure and use sun protection.';
  }

  // ── 12. High humidity ──────────────────────────────────

  if (
    primaryFactor === 'humidity' &&
    (factorScores.humidity || 0) >= 60
  ) {
    return 'High humidity may make exertion harder. Slow down and stay hydrated.';
  }

  // ── 13. Temperature risk ───────────────────────────────

  if (
    primaryFactor === 'temperature' &&
    (factorScores.temperature || 0) >= 70
  ) {
    if (currentTemperature >= 36) {
      return 'High temperatures can quickly increase heat stress. Reduce intensity and take breaks.';
    }

    return 'Cold conditions can increase exposure risk. Dress appropriately.';
  }

  // ── 14. Current weather condition as a contributing factor ──

  if (
    primaryFactor === 'weatherCondition' &&
    currentWeather.weatherCategory === 'fog'
  ) {
    return 'Fog may reduce visibility. Slow down and stay aware of your surroundings.';
  }

  // ── 15. General fallback ────────────────────────────────

  if (riskLevel === 'VERY_HIGH') {
    return 'Conditions are unsafe for prolonged outdoor activity. Consider stopping or turning back.';
  }

  if (riskLevel === 'HIGH') {
    return 'Conditions are challenging. Reduce intensity and be prepared to stop if they worsen.';
  }

  if (riskLevel === 'MODERATE') {
    return 'Use caution and monitor conditions as you continue.';
  }

  return 'Conditions look generally favorable. Stay aware of changing weather.';
}

module.exports = {
  generateRecommendation,
};

