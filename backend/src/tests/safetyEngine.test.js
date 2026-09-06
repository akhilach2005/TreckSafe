/**
 * TrailSafe Safety Engine — Unit Tests
 *
 * Tests individual scoring functions and complete safety scenarios
 * using artificial weather values.
 *
 * Run with:
 * node src/tests/safetyEngine.test.js
 */

const {
  scoreHeatIndex,
  scoreTemperature,
  scoreHumidity,
  scoreUV,
  scoreWind,
  scorePrecipitation,
  scoreWeatherCondition,
  calculateSafetyScore,
} = require('../services/safetyService');

const { calculateHeatIndex } = require('../services/heatIndexService');
const { calculateHydration } = require('../services/hydrationService');

let passed = 0;
let failed = 0;

// ─────────────────────────────────────────────────────────────────────
// Test Helpers
// ─────────────────────────────────────────────────────────────────────

function assert(description, actual, expected) {
  if (actual === expected) {
    console.log(`  ✅ ${description}: ${actual}`);
    passed++;
  } else {
    console.error(
      `  ❌ ${description}: expected ${expected}, got ${actual}`
    );
    failed++;
  }
}

function assertRange(description, actual, min, max) {
  if (actual >= min && actual <= max) {
    console.log(
      `  ✅ ${description}: ${actual} (within ${min}–${max})`
    );
    passed++;
  } else {
    console.error(
      `  ❌ ${description}: ${actual} NOT in range ${min}–${max}`
    );
    failed++;
  }
}

// ─────────────────────────────────────────────────────────────────────
// Heat Index Scoring
// ─────────────────────────────────────────────────────────────────────

console.log('\n── scoreHeatIndex ──────────────────────────────────────');

assert('< 27°C → 0', scoreHeatIndex(20), 0);
assert('< 27°C → 0', scoreHeatIndex(26), 0);
assert('27–32°C → 15', scoreHeatIndex(28), 15);
assert('32–38°C → 40', scoreHeatIndex(35), 40);
assert('38–45°C → 70', scoreHeatIndex(40), 70);
assert('>= 45°C → 100', scoreHeatIndex(46), 100);
assert('>= 45°C → 100', scoreHeatIndex(55), 100);

// ─────────────────────────────────────────────────────────────────────
// Temperature Scoring
// ─────────────────────────────────────────────────────────────────────

console.log('\n── scoreTemperature ────────────────────────────────────');

assert('< 0°C → 85', scoreTemperature(-5), 85);
assert('0–5°C → 65', scoreTemperature(2), 65);
assert('5–10°C → 40', scoreTemperature(7), 40);
assert('10–15°C → 15', scoreTemperature(12), 15);
assert('15–28°C → 0', scoreTemperature(20), 0);
assert('28–32°C → 20', scoreTemperature(30), 20);
assert('32–36°C → 45', scoreTemperature(34), 45);
assert('36–40°C → 70', scoreTemperature(38), 70);
assert('>= 40°C → 100', scoreTemperature(42), 100);

// ─────────────────────────────────────────────────────────────────────
// Humidity Scoring
// ─────────────────────────────────────────────────────────────────────

console.log('\n── scoreHumidity ───────────────────────────────────────');

assert('< 30% → 15', scoreHumidity(20), 15);
assert('30–60% → 0', scoreHumidity(50), 0);
assert('60–70% → 15', scoreHumidity(65), 15);
assert('70–80% → 35', scoreHumidity(75), 35);
assert('80–90% → 60', scoreHumidity(85), 60);
assert('>= 90% → 85', scoreHumidity(95), 85);

// ─────────────────────────────────────────────────────────────────────
// UV Index Scoring
// ─────────────────────────────────────────────────────────────────────

console.log('\n── scoreUV ─────────────────────────────────────────────');

assert('UV 1 → 0', scoreUV(1), 0);
assert('UV 4 → 20', scoreUV(4), 20);
assert('UV 7 → 45', scoreUV(7), 45);
assert('UV 9 → 70', scoreUV(9), 70);
assert('UV 11 → 95', scoreUV(11), 95);
assert('UV 12 → 95', scoreUV(12), 95);

// ─────────────────────────────────────────────────────────────────────
// Wind Scoring
// Uses BOTH average wind speed and gust speed.
// ─────────────────────────────────────────────────────────────────────

console.log('\n── scoreWind ───────────────────────────────────────────');

assert('< 20 km/h → 0', scoreWind(10, 15), 0);
assert('20–30 km/h → 15', scoreWind(15, 25), 15);
assert('30–40 km/h → 35', scoreWind(20, 35), 35);
assert('40–50 km/h → 55', scoreWind(25, 45), 55);
assert('50–65 km/h → 75', scoreWind(30, 55), 75);
assert('>= 65 km/h → 95', scoreWind(40, 70), 95);

// ─────────────────────────────────────────────────────────────────────
// Precipitation Scoring
// ─────────────────────────────────────────────────────────────────────

console.log('\n── scorePrecipitation ──────────────────────────────────');

assert('0 mm → 0', scorePrecipitation(0), 0);
assert('< 0.1 mm → 10', scorePrecipitation(0.05), 10);
assert('< 1 mm → 25', scorePrecipitation(0.5), 25);
assert('< 2.5 mm → 40', scorePrecipitation(1), 40);
assert('< 5 mm → 60', scorePrecipitation(3), 60);
assert('< 10 mm → 80', scorePrecipitation(7), 80);
assert('>= 10 mm → 100', scorePrecipitation(15), 100);

// ─────────────────────────────────────────────────────────────────────
// Weather Condition Scoring
// ─────────────────────────────────────────────────────────────────────

console.log('\n── scoreWeatherCondition ───────────────────────────────');

assert(
  'Clear weather → 0',
  scoreWeatherCondition('clear', 'none'),
  0
);

assert(
  'Cloudy weather → 0',
  scoreWeatherCondition('cloud', 'none'),
  0
);

assert(
  'Rain with low severity → 40',
  scoreWeatherCondition('rain', 'low'),
  40
);

assert(
  'Rain with moderate severity → 55',
  scoreWeatherCondition('rain', 'moderate'),
  55
);

assert(
  'Rain with high severity → 75',
  scoreWeatherCondition('rain', 'high'),
  75
);

assert(
  'Fog → 45',
  scoreWeatherCondition('fog', 'none'),
  45
);

assert(
  'Snow → 60',
  scoreWeatherCondition('snow', 'none'),
  60
);

assert(
  'Thunderstorm → 100',
  scoreWeatherCondition('thunderstorm', 'high'),
  100
);

// ─────────────────────────────────────────────────────────────────────
// Heat Index Calculation
// ─────────────────────────────────────────────────────────────────────

console.log('\n── calculateHeatIndex ──────────────────────────────────');

// Valid formula range
const { heatIndex: hi1, formulaApplied: fa1 } =
  calculateHeatIndex(35, 70);

assert(
  'T=35°C RH=70% — formula applied',
  fa1,
  true
);

assertRange(
  'T=35°C RH=70% — heat index reasonable',
  hi1,
  40,
  55
);

// Below valid temperature range
const { heatIndex: hi2, formulaApplied: fa2 } =
  calculateHeatIndex(20, 60);

assert(
  'T=20°C — formula NOT applied',
  fa2,
  false
);

assert(
  'T=20°C — returns temperature',
  hi2,
  20
);

// Below valid humidity range
const { heatIndex: hi3, formulaApplied: fa3 } =
  calculateHeatIndex(35, 30);

assert(
  'T=35°C RH=30% — formula NOT applied',
  fa3,
  false
);

assert(
  'T=35°C RH=30% — returns temperature',
  hi3,
  35
);

// ─────────────────────────────────────────────────────────────────────
// Composite Safety Score Scenarios
// ─────────────────────────────────────────────────────────────────────

console.log('\n── calculateSafetyScore (composite) ───────────────────');

// 1. Extreme heat scenario
const weather1 = {
  temperature: 42,
  humidity: 90,
  windSpeed: 10,
  windGusts: 15,
  precipitation: 0,
  uvIndex: 12,
  weatherCategory: 'clear',
  weatherSeverity: 'none',
};

const result1 = calculateSafetyScore(
  weather1,
  52,
  'running'
);

console.log(
  `  Extreme heat: score=${result1.safetyScore}, ` +
  `level=${result1.riskLevel}, ` +
  `primary=${result1.primaryFactor}`
);

assert(
  'Extreme heat → HIGH or VERY_HIGH',
  ['HIGH', 'VERY_HIGH'].includes(result1.riskLevel),
  true
);


// 2. Mild pleasant weather scenario
const weather2 = {
  temperature: 20,
  humidity: 45,
  windSpeed: 10,
  windGusts: 15,
  precipitation: 0,
  uvIndex: 3,
  weatherCategory: 'clear',
  weatherSeverity: 'none',
};

const result2 = calculateSafetyScore(
  weather2,
  20,
  'hiking'
);

console.log(
  `  Mild day: score=${result2.safetyScore}, ` +
  `level=${result2.riskLevel}, ` +
  `primary=${result2.primaryFactor}`
);

assert(
  'Mild day → LOW',
  result2.riskLevel,
  'LOW'
);


// 3. Warm afternoon scenario
const weather3 = {
  temperature: 30,
  humidity: 65,
  windSpeed: 15,
  windGusts: 20,
  precipitation: 0,
  uvIndex: 7,
  weatherCategory: 'clear',
  weatherSeverity: 'none',
};

const result3 = calculateSafetyScore(
  weather3,
  35,
  'hiking'
);

console.log(
  `  Warm afternoon: score=${result3.safetyScore}, ` +
  `level=${result3.riskLevel}, ` +
  `primary=${result3.primaryFactor}`
);

assert(
  'Warm afternoon → LOW or MODERATE',
  ['LOW', 'MODERATE'].includes(result3.riskLevel),
  true
);


// 4. Heavy rain and strong wind scenario
const weather4 = {
  temperature: 22,
  humidity: 92,
  windSpeed: 35,
  windGusts: 60,
  precipitation: 12,
  uvIndex: 1,
  weatherCategory: 'rain',
  weatherSeverity: 'high',
};

const result4 = calculateSafetyScore(
  weather4,
  22,
  'hiking'
);

console.log(
  `  Heavy rain: score=${result4.safetyScore}, ` +
  `level=${result4.riskLevel}, ` +
  `primary=${result4.primaryFactor}`
);

assert(
  'Heavy rain scenario → MODERATE or higher',
  ['MODERATE', 'HIGH', 'VERY_HIGH'].includes(
    result4.riskLevel
  ),
  true
);


// 5. Thunderstorm scenario
const weather5 = {
  temperature: 25,
  humidity: 95,
  windSpeed: 40,
  windGusts: 75,
  precipitation: 15,
  uvIndex: 1,
  weatherCategory: 'thunderstorm',
  weatherSeverity: 'high',
};

const result5 = calculateSafetyScore(
  weather5,
  25,
  'hiking'
);

console.log(
  `  Thunderstorm: score=${result5.safetyScore}, ` +
  `level=${result5.riskLevel}, ` +
  `primary=${result5.primaryFactor}`
);

assert(
  'Thunderstorm → HIGH or VERY_HIGH',
  ['HIGH', 'VERY_HIGH'].includes(result5.riskLevel),
  true
);


// 6. Dangerous wind gust scenario
const weather6 = {
  temperature: 23,
  humidity: 55,
  windSpeed: 15,
  windGusts: 70,
  precipitation: 0,
  uvIndex: 2,
  weatherCategory: 'cloud',
  weatherSeverity: 'none',
};

const result6 = calculateSafetyScore(
  weather6,
  23,
  'hiking'
);

console.log(
  `  Dangerous gusts: score=${result6.safetyScore}, ` +
  `level=${result6.riskLevel}, ` +
  `primary=${result6.primaryFactor}`
);

assert(
  'Dangerous wind gusts → MODERATE or higher',
  ['MODERATE', 'HIGH', 'VERY_HIGH'].includes(
    result6.riskLevel
  ),
  true
);


// ─────────────────────────────────────────────────────────────────────
// Hydration Calculation
// ─────────────────────────────────────────────────────────────────────

console.log('\n── calculateHydration ──────────────────────────────────');

const hydration1 = calculateHydration(
  40,
  85,
  52,
  'running'
);

console.log(
  `  Extreme heat running: ${hydration1.minimum}–` +
  `${hydration1.maximum} ${hydration1.unit}`
);

assert(
  'Hydration minimum > 800',
  hydration1.minimum > 800,
  true
);


const hydration2 = calculateHydration(
  20,
  45,
  20,
  'hiking'
);

console.log(
  `  Mild hiking: ${hydration2.minimum}–` +
  `${hydration2.maximum} ${hydration2.unit}`
);

assert(
  'Mild hiking minimum is reasonable',
  hydration2.minimum >= 400,
  true
);


// ─────────────────────────────────────────────────────────────────────
// Final Results
// ─────────────────────────────────────────────────────────────────────

console.log('\n──────────────────────────────────────────────────────────');
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.error('⚠️ Some tests failed — review scoring logic.');
  process.exit(1);
} else {
  console.log('✅ All tests passed.');
}