/**
 * TrailSafe Safety Controller
 * Orchestrates the full safety assessment pipeline.
 */

const { validateLatitude, validateLongitude, validateActivity } = require('../utils/validators');
const { fetchWeather }           = require('../services/weatherService');
const { calculateHeatIndex }     = require('../services/heatIndexService');
const { calculateSafetyScore }   = require('../services/safetyService');
const { calculateHydration }     = require('../services/hydrationService');
const { generateRecommendation } = require('../services/recommendationService');

/**
 * GET /api/safety
 * Query params: latitude, longitude, activity
 */
async function getSafetyAssessment(req, res) {
  // ── 1. Validate inputs ────────────────────────────────────────
  const latResult  = validateLatitude(req.query.latitude);
  const lonResult  = validateLongitude(req.query.longitude);
  const actResult  = validateActivity(req.query.activity);

  const errors = [];
  if (!latResult.valid)  errors.push(latResult.error);
  if (!lonResult.valid)  errors.push(lonResult.error);
  if (!actResult.valid)  errors.push(actResult.error);

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const latitude  = latResult.value;
  const longitude = lonResult.value;
  const activity  = actResult.value;

  try {
    // ── 2. Fetch weather ─────────────────────────────────────────
    const weather = await fetchWeather(latitude, longitude);

    // ── 3. Calculate heat index ───────────────────────────────────
    const { heatIndex, formulaApplied } = calculateHeatIndex(
      weather.temperature,
      weather.humidity
    );

    // ── 4. Calculate safety score ─────────────────────────────────
    const { safetyScore, riskLevel, factorScores, primaryFactor } =
      calculateSafetyScore(weather, heatIndex, activity);

    // ── 5. Hydration estimate ─────────────────────────────────────
    const hydration = calculateHydration(
      weather.temperature,
      weather.humidity,
      heatIndex,
      activity
    );

    // ── 6. Recommendation ─────────────────────────────────────────
    const recommendation = generateRecommendation(riskLevel, primaryFactor, factorScores);

    // ── 7. Return normalised response ─────────────────────────────
    return res.json({
      location: { latitude, longitude },
      activity,
      weather,
      heatIndex,
      heatIndexFormulaApplied: formulaApplied,
      safetyScore,
      riskLevel,
      recommendation,
      hydration,
      // Include factor breakdown for transparency
      factorScores,
    });

  } catch (err) {
    console.error('Safety assessment error:', err.message);
    return res.status(502).json({
      error: 'Weather service unavailable',
      message: err.message,
    });
  }
}

module.exports = { getSafetyAssessment };
