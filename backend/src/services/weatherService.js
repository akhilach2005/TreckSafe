const axios = require('axios');

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Converts Open-Meteo WMO weather codes into human-readable conditions.
 *
 * @param {number} weatherCode
 * @returns {{ condition: string, category: string, severity: string }}
 */
function getWeatherCondition(weatherCode) {
  const conditions = {
    0: {
      condition: 'Clear sky',
      category: 'clear',
      severity: 'none',
    },

    1: {
      condition: 'Mainly clear',
      category: 'clear',
      severity: 'none',
    },

    2: {
      condition: 'Partly cloudy',
      category: 'cloud',
      severity: 'none',
    },

    3: {
      condition: 'Overcast',
      category: 'cloud',
      severity: 'none',
    },

    45: {
      condition: 'Fog',
      category: 'fog',
      severity: 'moderate',
    },

    48: {
      condition: 'Depositing rime fog',
      category: 'fog',
      severity: 'moderate',
    },

    51: {
      condition: 'Light drizzle',
      category: 'rain',
      severity: 'low',
    },

    53: {
      condition: 'Moderate drizzle',
      category: 'rain',
      severity: 'moderate',
    },

    55: {
      condition: 'Heavy drizzle',
      category: 'rain',
      severity: 'high',
    },

    56: {
      condition: 'Light freezing drizzle',
      category: 'rain',
      severity: 'high',
    },

    57: {
      condition: 'Heavy freezing drizzle',
      category: 'rain',
      severity: 'very_high',
    },

    61: {
      condition: 'Slight rain',
      category: 'rain',
      severity: 'low',
    },

    63: {
      condition: 'Moderate rain',
      category: 'rain',
      severity: 'moderate',
    },

    65: {
      condition: 'Heavy rain',
      category: 'rain',
      severity: 'high',
    },

    66: {
      condition: 'Light freezing rain',
      category: 'rain',
      severity: 'high',
    },

    67: {
      condition: 'Heavy freezing rain',
      category: 'rain',
      severity: 'very_high',
    },

    71: {
      condition: 'Slight snowfall',
      category: 'snow',
      severity: 'moderate',
    },

    73: {
      condition: 'Moderate snowfall',
      category: 'snow',
      severity: 'high',
    },

    75: {
      condition: 'Heavy snowfall',
      category: 'snow',
      severity: 'very_high',
    },

    77: {
      condition: 'Snow grains',
      category: 'snow',
      severity: 'moderate',
    },

    80: {
      condition: 'Slight rain showers',
      category: 'rain',
      severity: 'low',
    },

    81: {
      condition: 'Moderate rain showers',
      category: 'rain',
      severity: 'moderate',
    },

    82: {
      condition: 'Violent rain showers',
      category: 'rain',
      severity: 'very_high',
    },

    85: {
      condition: 'Slight snow showers',
      category: 'snow',
      severity: 'moderate',
    },

    86: {
      condition: 'Heavy snow showers',
      category: 'snow',
      severity: 'high',
    },

    95: {
      condition: 'Thunderstorm',
      category: 'thunderstorm',
      severity: 'very_high',
    },

    96: {
      condition: 'Thunderstorm with slight hail',
      category: 'thunderstorm',
      severity: 'very_high',
    },

    99: {
      condition: 'Thunderstorm with heavy hail',
      category: 'thunderstorm',
      severity: 'very_high',
    },
  };

  return conditions[weatherCode] || {
    condition: 'Unknown weather condition',
    category: 'unknown',
    severity: 'unknown',
  };
}

/**
 * Fetches current weather, recent historical data,
 * and upcoming forecast data from Open-Meteo.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Object>}
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
      'wind_gusts_10m',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'cloud_cover',
      'uv_index',
    ].join(','),

    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'wind_speed_10m',
      'wind_gusts_10m',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'cloud_cover',
      'uv_index',
    ].join(','),

    past_hours: 3,
    forecast_hours: 6,

    wind_speed_unit: 'kmh',
    temperature_unit: 'celsius',
    timezone: 'auto',
  };

  let response;

  try {
    response = await axios.get(OPEN_METEO_BASE_URL, {
      params,
      timeout: 10000,
    });
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      throw new Error(
        'Weather service request timed out. Please try again.'
      );
    }

    throw new Error(
      'Unable to retrieve weather conditions. Please try again.'
    );
  }

  const data = response.data;

  if (!data || !data.current || !data.hourly) {
    throw new Error(
      'Unexpected response from weather service. Please try again.'
    );
  }

  const current = data.current;
  const hourly = data.hourly;

  const weatherCondition = getWeatherCondition(
    current.weather_code
  );

  const currentWeather = {
    // Basic weather
    temperature: roundTo1(current.temperature_2m),
    humidity: Math.round(current.relative_humidity_2m),
    apparentTemperature: roundTo1(current.apparent_temperature),
    pressure: roundTo1(current.surface_pressure),

    // Wind
    windSpeed: roundTo1(current.wind_speed_10m),
    windGusts: roundTo1(current.wind_gusts_10m),

    // Precipitation
    precipitation: roundTo1(current.precipitation),
    rain: roundTo1(current.rain),
    showers: roundTo1(current.showers),
    snowfall: roundTo1(current.snowfall),

    // Weather condition
    weatherCode: current.weather_code,
    condition: weatherCondition.condition,
    weatherCategory: weatherCondition.category,
    weatherSeverity: weatherCondition.severity,

    // Other data
    cloudCover: Math.round(current.cloud_cover),
    uvIndex: roundTo1(current.uv_index),

    // Current weather timestamp
    time: current.time,
  };

  const hourlyData = buildHourlyWeatherData(hourly);

  const {
    recentHistory,
    upcomingForecast,
  } = splitHourlyData(
    hourlyData,
    current.time
  );

  return {
    ...currentWeather,

    // Previous hours
    recentHistory,

    // Upcoming hours
    upcomingForecast,
  };
}

/**
 * Converts Open-Meteo hourly arrays into an array
 * of easier-to-use weather objects.
 *
 * @param {Object} hourly
 * @returns {Array<Object>}
 */
function buildHourlyWeatherData(hourly) {
  const results = [];

  const length = hourly.time?.length || 0;

  for (let i = 0; i < length; i++) {
    const weatherCode = hourly.weather_code?.[i];

    const weatherCondition = getWeatherCondition(
      weatherCode
    );

    results.push({
      time: hourly.time[i],

      temperature: roundTo1(
        hourly.temperature_2m?.[i]
      ),

      humidity: Math.round(
        hourly.relative_humidity_2m?.[i] || 0
      ),

      apparentTemperature: roundTo1(
        hourly.apparent_temperature?.[i]
      ),

      windSpeed: roundTo1(
        hourly.wind_speed_10m?.[i]
      ),

      windGusts: roundTo1(
        hourly.wind_gusts_10m?.[i]
      ),

      precipitation: roundTo1(
        hourly.precipitation?.[i]
      ),

      rain: roundTo1(
        hourly.rain?.[i]
      ),

      showers: roundTo1(
        hourly.showers?.[i]
      ),

      snowfall: roundTo1(
        hourly.snowfall?.[i]
      ),

      weatherCode,

      condition: weatherCondition.condition,

      weatherCategory: weatherCondition.category,

      weatherSeverity: weatherCondition.severity,

      cloudCover: Math.round(
        hourly.cloud_cover?.[i] || 0
      ),

      uvIndex: roundTo1(
        hourly.uv_index?.[i]
      ),
    });
  }

  return results;
}

/**
 * Separates hourly data into previous hours
 * and future forecast hours.
 *
 * @param {Array<Object>} hourlyData
 * @param {string} currentTime
 * @returns {{
 *   recentHistory: Array<Object>,
 *   upcomingForecast: Array<Object>
 * }}
 */
function splitHourlyData(hourlyData, currentTime) {
  const currentDate = new Date(currentTime).getTime();

  const recentHistory = hourlyData
    .filter((hour) => {
      return new Date(hour.time).getTime() < currentDate;
    })
    .slice(-3);

  const upcomingForecast = hourlyData
    .filter((hour) => {
      return new Date(hour.time).getTime() > currentDate;
    })
    .slice(0, 6);

  return {
    recentHistory,
    upcomingForecast,
  };
}

/**
 * Rounds a number to 1 decimal place.
 *
 * @param {number|null|undefined} value
 * @returns {number}
 */
function roundTo1(value) {
  if (
    value === null ||
    value === undefined ||
    isNaN(value)
  ) {
    return 0;
  }

  return Math.round(value * 10) / 10;
}

module.exports = {
  fetchWeather,
  getWeatherCondition,
};