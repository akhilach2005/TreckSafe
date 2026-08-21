/**
 * TrailSafe Hydration Estimation Service
 *
 * Provides a simple, transparent hydration estimate based on
 * environmental conditions and activity type.
 *
 * IMPORTANT: This is an estimate for decision support only.
 * It is NOT medical advice. Users should consult a doctor or
 * certified sports-medicine professional for personalised guidance.
 *
 * Method:
 *   1. Base rate differs by activity (hiking vs. running)
 *   2. Bonus added for elevated heat index
 *   3. Bonus added for high humidity
 *   4. Result expressed as a range (midpoint ± 100 ml/hr)
 */

/**
 * Calculates a hydration estimate range.
 * @param {number} temperature - Current temperature in °C
 * @param {number} humidity - Relative humidity (0–100)
 * @param {number} heatIndex - Calculated heat index in °C
 * @param {string} activity - 'hiking' | 'running'
 * @returns {{ minimum: number, maximum: number, unit: string }}
 */
function calculateHydration(temperature, humidity, heatIndex, activity) {
  // Base rate by activity (ml/hr)
  const baseRate = activity === 'running' ? 600 : 500;

  // Heat index bonus
  let heatBonus = 50;
  if (heatIndex > 45)      heatBonus = 250;
  else if (heatIndex > 38) heatBonus = 200;
  else if (heatIndex > 32) heatBonus = 150;
  else if (heatIndex > 27) heatBonus = 100;

  // Humidity bonus
  let humidityBonus = 0;
  if (humidity > 85)       humidityBonus = 100;
  else if (humidity > 75)  humidityBonus = 75;
  else if (humidity > 60)  humidityBonus = 40;

  const midpoint = baseRate + heatBonus + humidityBonus;
  const margin   = 100;

  return {
    minimum: midpoint - margin,
    maximum: midpoint + margin,
    unit:    'ml/hour',
  };
}

module.exports = { calculateHydration };
