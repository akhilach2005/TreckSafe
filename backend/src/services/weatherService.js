/**
 * TrailSafe Weather Service
 * Fetches current weather data from Open-Meteo and returns a normalised object.
 * Open-Meteo is free for non-commercial use and requires no API key.
 * Docs: https://open-meteo.com/en/docs
 */

const axios = require('axios');

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Fetches current weather conditions from Open-Meteo.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<NormalisedWeather>}
 * @throws {Error} if Open-Meteo is unavailable or returns unexpected data
 */
async function fetchWeather(latitude, longitude) {
  const params = {
    latitude,
    longitude,
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'surface_pressure',
      'wind_speed_10m',
      'precipitation',
      'uv_index',
    ].join(','),
    wind_speed_unit: 'kmh',
    temperature_unit: 'celsius',
  };

  let response;
  try {
    response = await axios.get(OPEN_METEO_BASE_URL, { params, timeout: 10000 });
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      throw new Error('Weather service request timed out. Please try again.');
    }
    throw new Error('Unable to retrieve current weather conditions. Please try again.');
  }

  const data = response.data;

  if (!data || !data.current) {
    throw new Error('Unexpected response from weather service. Please try again.');
  }

  const current = data.current;

  // Normalise to a clean application-specific object
  return {
    temperature:         roundTo1(current.temperature_2m),
    humidity:            Math.round(current.relative_humidity_2m),
    apparentTemperature: roundTo1(current.apparent_temperature),
    pressure:            roundTo1(current.surface_pressure),
    windSpeed:           roundTo1(current.wind_speed_10m),
    precipitation:       roundTo1(current.precipitation),
    uvIndex:             roundTo1(current.uv_index),
  };
}

/**
 * Rounds a number to 1 decimal place.
 * @param {number|null|undefined} value
 * @returns {number}
 */
function roundTo1(value) {
  if (value === null || value === undefined || isNaN(value)) return 0;
  return Math.round(value * 10) / 10;
}

module.exports = { fetchWeather };
