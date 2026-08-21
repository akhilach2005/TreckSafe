/**
 * TrailSafe Input Validators
 * Validates incoming query parameters for the /api/safety endpoint.
 */

/**
 * Validates latitude (-90 to 90)
 * @param {any} lat
 * @returns {{ valid: boolean, value?: number, error?: string }}
 */
function validateLatitude(lat) {
  const value = parseFloat(lat);
  if (isNaN(value)) return { valid: false, error: 'latitude must be a number' };
  if (value < -90 || value > 90) return { valid: false, error: 'latitude must be between -90 and 90' };
  return { valid: true, value };
}

/**
 * Validates longitude (-180 to 180)
 * @param {any} lon
 * @returns {{ valid: boolean, value?: number, error?: string }}
 */
function validateLongitude(lon) {
  const value = parseFloat(lon);
  if (isNaN(value)) return { valid: false, error: 'longitude must be a number' };
  if (value < -180 || value > 180) return { valid: false, error: 'longitude must be between -180 and 180' };
  return { valid: true, value };
}

/**
 * Validates activity type
 * @param {any} activity
 * @returns {{ valid: boolean, value?: string, error?: string }}
 */
function validateActivity(activity) {
  const allowed = ['hiking', 'running'];
  if (!activity || typeof activity !== 'string') return { valid: false, error: 'activity is required' };
  const normalized = activity.toLowerCase().trim();
  if (!allowed.includes(normalized)) return { valid: false, error: `activity must be one of: ${allowed.join(', ')}` };
  return { valid: true, value: normalized };
}

module.exports = { validateLatitude, validateLongitude, validateActivity };
