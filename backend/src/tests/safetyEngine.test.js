/**
 * TrailSafe Safety Engine — Unit Tests (Artificial Values)
 *
 * Tests each scoring function independently with known inputs
 * so we can verify expected outputs without relying on live weather data.
 *
 * Run with: node src/tests/safetyEngine.test.js
 */

const {
  scoreHeatIndex,
  scoreTemperature,
  scoreHumidity,
  scoreUV,
  scoreWind,
  scorePrecipitation,
  calculateSafetyScore,
} = require('../services/safetyService');

const { calculateHeatIndex } = require('../services/heatIndexService');
const { calculateHydration } = require('../services/hydrationService');

let passed = 0;
let failed = 0;

function assert(description, actual, expected) {
  if (actual === expected) {
    console.log(`  ✅ ${description}: ${actual}`);
    passed++;
  } else {
    console.error(`  ❌ ${description}: expected ${expected}, got ${actual}`);
    failed++;
  }
}

function assertRange(description, actual, min, max) {
  if (actual >= min && actual <= max) {
    console.log(`  ✅ ${description}: ${actual} (within ${min}–${max})`);
    passed++;
  } else {
    console.error(`  ❌ ${description}: ${actual} NOT in range ${min}–${max}`);
    failed++;
  }
}

// ─────────────────────────────────────────────────────────────────────
console.log('\n── scoreHeatIndex ──────────────────────────────────────');
assert('< 27°C → 0',    scoreHeatIndex(20),  0);
assert('< 27°C → 0',    scoreHeatIndex(26),  0);
assert('27–32°C → 20',  scoreHeatIndex(28),  20);
assert('32–38°C → 50',  scoreHeatIndex(35),  50);
assert('38–45°C → 75',  scoreHeatIndex(40),  75);
assert('> 45°C → 100',  scoreHeatIndex(46),  100);
assert('> 45°C → 100',  scoreHeatIndex(55),  100);

// ─────────────────────────────────────────────────────────────────────
console.log('\n── scoreTemperature ────────────────────────────────────');
assert('< 0°C → 80',    scoreTemperature(-5),  80);
assert('10–15 → 20',    scoreTemperature(12),  20);
assert('15–25 → 0',     scoreTemperature(20),  0);
assert('25–32 → 30',    scoreTemperature(28),  30);
assert('32–38 → 65',    scoreTemperature(35),  65);
assert('> 38 → 100',    scoreTemperature(40),  100);

// ─────────────────────────────────────────────────────────────────────
console.log('\n── scoreHumidity ───────────────────────────────────────');
assert('< 30% → 10',    scoreHumidity(20),  10);
assert('30–60% → 0',    scoreHumidity(50),  0);
assert('60–75% → 30',   scoreHumidity(65),  30);
assert('75–85% → 60',   scoreHumidity(80),  60);
assert('> 85% → 90',    scoreHumidity(88),  90);
assert('> 85% → 90',    scoreHumidity(95),  90);

// ─────────────────────────────────────────────────────────────────────
console.log('\n── scoreUV ─────────────────────────────────────────────');
assert('UV 1 → 0',     scoreUV(1),   0);
assert('UV 4 → 20',    scoreUV(4),   20);
assert('UV 7 → 40',    scoreUV(7),   40);
assert('UV 9 → 65',    scoreUV(9),   65);
assert('UV 11 → 90',   scoreUV(11),  90);
assert('UV 12 → 90',   scoreUV(12),  90);

// ─────────────────────────────────────────────────────────────────────
console.log('\n── scoreWind ───────────────────────────────────────────');
assert('< 20 km/h → 0',   scoreWind(10),  0);
assert('20–40 km/h → 20', scoreWind(30),  20);
assert('40–60 km/h → 50', scoreWind(50),  50);
assert('> 60 km/h → 85',  scoreWind(70),  85);

// ─────────────────────────────────────────────────────────────────────
console.log('\n── scorePrecipitation ──────────────────────────────────');
assert('0 mm → 0',     scorePrecipitation(0),    0);
assert('1 mm → 20',    scorePrecipitation(1),    20);
assert('5 mm → 55',    scorePrecipitation(5),    55);
assert('15 mm → 90',   scorePrecipitation(15),   90);

// ─────────────────────────────────────────────────────────────────────
console.log('\n── calculateHeatIndex ──────────────────────────────────');

// Valid range: T >= 26.67°C and RH >= 40%
const { heatIndex: hi1, formulaApplied: fa1 } = calculateHeatIndex(35, 70);
assert('T=35°C RH=70% — formula applied', fa1, true);
assertRange('T=35°C RH=70% — heat index reasonable', hi1, 40, 55);

// Below valid range: T = 20°C
const { heatIndex: hi2, formulaApplied: fa2 } = calculateHeatIndex(20, 60);
assert('T=20°C — formula NOT applied', fa2, false);
assert('T=20°C — returns temperature', hi2, 20);

// Below valid range: RH = 30%
const { heatIndex: hi3, formulaApplied: fa3 } = calculateHeatIndex(35, 30);
assert('T=35°C RH=30% — formula NOT applied (low humidity)', fa3, false);
assert('T=35°C RH=30% — returns temperature', hi3, 35);

// ─────────────────────────────────────────────────────────────────────
console.log('\n── calculateSafetyScore (composite) ───────────────────');

// Extreme heat scenario: all factors high
const weather1 = { temperature: 40, humidity: 85, windSpeed: 5, precipitation: 0, uvIndex: 11 };
const { safetyScore: score1, riskLevel: level1 } = calculateSafetyScore(weather1, 52, 'running');
console.log(`  Extreme heat (T=40, RH=85, HI=52, UV=11, running): score=${score1}, level=${level1}`);
assert('Extreme heat → VERY_HIGH', level1, 'VERY_HIGH');

// Mild scenario: pleasant day
const weather2 = { temperature: 20, humidity: 45, windSpeed: 10, precipitation: 0, uvIndex: 3 };
const { safetyScore: score2, riskLevel: level2 } = calculateSafetyScore(weather2, 20, 'hiking');
console.log(`  Mild day (T=20, RH=45, HI=20, UV=3, hiking): score=${score2}, level=${level2}`);
assert('Mild day → LOW', level2, 'LOW');

// Moderate scenario
const weather3 = { temperature: 30, humidity: 65, windSpeed: 15, precipitation: 0, uvIndex: 7 };
const { safetyScore: score3, riskLevel: level3 } = calculateSafetyScore(weather3, 35, 'hiking');
console.log(`  Warm day (T=30, RH=65, HI=35, UV=7, hiking): score=${score3}, level=${level3}`);
assert('Warm day → MODERATE or HIGH', ['MODERATE', 'HIGH'].includes(level3), true);

// Heavy rain scenario
const weather4 = { temperature: 22, humidity: 90, windSpeed: 55, precipitation: 15, uvIndex: 1 };
const { safetyScore: score4, riskLevel: level4 } = calculateSafetyScore(weather4, 22, 'running');
console.log(`  Storm (T=22, RH=90, wind=55, rain=15, running): score=${score4}, level=${level4}`);
assert('Storm scenario — not LOW', level4 !== 'LOW', true);

// ─────────────────────────────────────────────────────────────────────
console.log('\n── calculateHydration ──────────────────────────────────');

const hydration1 = calculateHydration(40, 85, 52, 'running');
console.log(`  Extreme heat running: ${hydration1.minimum}–${hydration1.maximum} ${hydration1.unit}`);
assert('Hydration minimum > 800', hydration1.minimum > 800, true);

const hydration2 = calculateHydration(20, 45, 20, 'hiking');
console.log(`  Mild hiking: ${hydration2.minimum}–${hydration2.maximum} ${hydration2.unit}`);
assert('Mild hiking minimum is reasonable', hydration2.minimum >= 400, true);

// ─────────────────────────────────────────────────────────────────────
console.log('\n──────────────────────────────────────────────────────────');
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('⚠️  Some tests failed — review scoring logic.');
  process.exit(1);
} else {
  console.log('✅ All tests passed.');
}
