/**
 * TrailSafe Heat Index Service
 *
 * Implements the Rothfusz regression equation published by the
 * U.S. National Weather Service (NWS).
 *
 * Source: https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml
 *
 * The formula applies when:
 *   - Temperature >= 80°F (≈ 26.67°C)
 *   - Relative Humidity >= 40%
 *
 * IMPORTANT: If conditions are outside the valid range,
 * Heat Index = temperature (NOT apparent_temperature).
 * apparent_temperature (feels-like) is a different measurement and must
 * not be used as a substitute for heat index.
 */

/**
 * Converts Celsius to Fahrenheit.
 * @param {number} celsius
 * @returns {number}
 */
function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

/**
 * Converts Fahrenheit to Celsius.
 * @param {number} fahrenheit
 * @returns {number}
 */
function fahrenheitToCelsius(fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
}

/**
 * Applies the full Rothfusz regression equation.
 * Input temperature must be in °F.
 * @param {number} T - Temperature in Fahrenheit
 * @param {number} RH - Relative humidity (0–100)
 * @returns {number} Heat index in Fahrenheit
 */
function rothfuszEquation(T, RH) {
  return (
    -42.379
    + 2.04901523 * T
    + 10.14333127 * RH
    - 0.22475541 * T * RH
    - 0.00683783 * T * T
    - 0.05481717 * RH * RH
    + 0.00122874 * T * T * RH
    + 0.00085282 * T * RH * RH
    - 0.00000199 * T * T * RH * RH
  );
}

/**
 * Calculates the heat index in Celsius.
 *
 * Valid range: T >= 26.67°C (80°F) and RH >= 40%.
 * Outside this range: returns temperature as-is (not apparent_temperature).
 *
 * @param {number} temperatureCelsius - Current temperature in °C
 * @param {number} humidity - Relative humidity (0–100)
 * @returns {{ heatIndex: number, formulaApplied: boolean }}
 */
function calculateHeatIndex(temperatureCelsius, humidity) {
  const MIN_TEMP_CELSIUS = 26.67;  // 80°F
  const MIN_HUMIDITY = 40;

  // Check if conditions are within valid formula range
  if (temperatureCelsius < MIN_TEMP_CELSIUS || humidity < MIN_HUMIDITY) {
    return {
      heatIndex: Math.round(temperatureCelsius * 10) / 10,
      formulaApplied: false,
    };
  }

  const T  = celsiusToFahrenheit(temperatureCelsius);
  const RH = humidity;

  let hiF = rothfuszEquation(T, RH);

  // NWS Adjustment 1: low humidity correction
  // When RH < 13% and T between 80–112°F, subtract adjustment
  if (RH < 13 && T >= 80 && T <= 112) {
    const adjustment = ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    hiF -= adjustment;
  }

  // NWS Adjustment 2: high humidity / cool correction
  // When RH > 85% and T between 80–87°F, add adjustment
  if (RH > 85 && T >= 80 && T <= 87) {
    const adjustment = ((RH - 85) / 10) * ((87 - T) / 5);
    hiF += adjustment;
  }

  const heatIndexCelsius = fahrenheitToCelsius(hiF);

  return {
    heatIndex: Math.round(heatIndexCelsius * 10) / 10,
    formulaApplied: true,
  };
}

module.exports = { calculateHeatIndex };
