# TrailSafe 🏔️

**Outdoor Activity Safety Assessment Mobile Application**

> ⚠️ **Disclaimer**: TrailSafe is a decision-support tool, not a medical or emergency safety certification system. All risk scores, thresholds, and hydration values are estimates. Never use this application as a substitute for professional outdoor safety advice, personal judgement, or emergency services.

---

## What is TrailSafe?

TrailSafe is a lightweight mobile application that helps hikers and runners make informed decisions about outdoor safety. Before starting or continuing an activity, the user selects their activity type and TrailSafe:

1. Obtains the device's current GPS location
2. Fetches real-time environmental data from Open-Meteo
3. Calculates a heat index using the NWS Rothfusz regression equation
4. Runs a multi-factor weighted safety scoring algorithm
5. Returns a human-readable safety score, risk level, recommendation, and hydration estimate

The core concept is intentionally simple:

```
GPS Location → Weather API → Environmental Analysis → Safety Score → Recommendation
```

---

## Problem Statement

Outdoor activities in challenging weather conditions (extreme heat, high UV, heavy precipitation, strong winds) can pose real health risks. Many people lack a quick, accessible way to assess whether current conditions are suitable before heading out or continuing an activity.

TrailSafe provides a fast, on-device assessment using real weather data and a transparent scoring algorithm.

---

## Features (V1)

- 🏔️ Activity selection: **Hiking** or **Running**
- 📍 Automatic GPS location acquisition (foreground only, one-shot)
- 🌤️ Real-time weather data via **Open-Meteo** (no API key required)
- 🌡️ **Heat index calculation** using the NWS Rothfusz regression equation
- 🔢 **Multi-factor weighted safety score** (0–100)
- 🟢🟡🔴 Four risk levels: LOW / MODERATE / HIGH / VERY HIGH
- 💧 Hydration estimate range (ml/hour)
- 📝 Deterministic recommendation text with primary factor identification
- ✅ Clean error handling for denied location, GPS unavailability, network errors

---

## Architecture

```
Mobile App (React Native + Expo)
       │
       │  User selects Hiking / Running
       │
       ▼
   GPS Coordinates (expo-location)
       │
       ▼
Node.js + Express Backend
       │
       │  GET https://api.open-meteo.com/v1/forecast
       │
       ▼
Open-Meteo Weather API
       │
       ▼
Weather Normalisation
       │
       ▼
Heat Index (Rothfusz)
       │
       ├── Heat Index Risk Score   (30%)
       ├── Temperature Risk Score  (20%)
       ├── Humidity Risk Score     (15%)
       ├── UV Index Risk Score     (15%)
       ├── Wind Speed Risk Score   (10%)
       └── Precipitation Risk Score(10%)
              │
              ▼
         Weighted Safety Score (0–100)
              │
              ▼
         Risk Level → Recommendation → Hydration Estimate
              │
              ▼
        Mobile App displays result
```

---

## Technology Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Mobile   | React Native, Expo SDK 57, TypeScript |
| Routing  | expo-router (file-based)            |
| GPS      | expo-location                       |
| Backend  | Node.js 18+, Express.js             |
| Weather  | Open-Meteo REST API (no key needed) |
| HTTP     | axios (backend), fetch (mobile)     |
| State    | React Context                       |
| Database | None — V1 has no persistence        |

---

## Project Structure

```
trailsafe/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── safetyConfig.js       ← weights, thresholds (centralised)
│   │   ├── controllers/
│   │   │   └── safetyController.js   ← assessment pipeline orchestration
│   │   ├── routes/
│   │   │   └── safetyRoutes.js
│   │   ├── services/
│   │   │   ├── weatherService.js     ← Open-Meteo integration
│   │   │   ├── heatIndexService.js   ← Rothfusz formula
│   │   │   ├── safetyService.js      ← weighted scoring engine
│   │   │   ├── hydrationService.js   ← hydration estimate
│   │   │   └── recommendationService.js
│   │   ├── utils/
│   │   │   └── validators.js
│   │   └── server.js
│   ├── .env
│   └── package.json
│
├── mobile/
│   ├── app/
│   │   ├── _layout.tsx              ← Root layout (context + navigator)
│   │   ├── index.tsx                ← Screen 1: Start / Activity Selection
│   │   └── result.tsx               ← Screen 2: Safety Assessment Result
│   ├── components/
│   │   ├── ActivityButton.tsx
│   │   ├── RiskBadge.tsx
│   │   └── WeatherGrid.tsx
│   ├── constants/
│   │   └── theme.ts                 ← Design tokens
│   ├── context/
│   │   └── SafetyResultContext.tsx  ← Shared state (Start → Result)
│   ├── services/
│   │   └── apiService.ts            ← Backend HTTP client
│   ├── utils/
│   │   └── locationService.ts       ← GPS wrapper
│   └── app.json
│
└── README.md
```

---

## Open-Meteo Integration

Open-Meteo is a free, open-source weather API requiring no API key for non-commercial use.

**Endpoint used:**
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}
  &longitude={lon}
  &current=temperature_2m,relative_humidity_2m,apparent_temperature,
            surface_pressure,wind_speed_10m,precipitation,uv_index
  &wind_speed_unit=kmh
  &temperature_unit=celsius
```

**Variables retrieved:**
| Variable              | Unit  | Usage                       |
|-----------------------|-------|-----------------------------|
| temperature_2m        | °C    | Temperature risk, heat index |
| relative_humidity_2m  | %     | Humidity risk, heat index   |
| apparent_temperature  | °C    | Displayed as "Feels Like"   |
| surface_pressure      | hPa   | Displayed only              |
| wind_speed_10m        | km/h  | Wind risk                   |
| precipitation         | mm    | Precipitation risk          |
| uv_index              | —     | UV risk                     |

`apparent_temperature` and `heatIndex` are kept **separate**. They are different measurements and are never conflated.

---

## GPS / Location Integration

- Uses `expo-location` (`requestForegroundPermissionsAsync`)
- Location is acquired **once** per user action — no continuous tracking
- If permission was previously denied, the app does not re-request — it shows an error with a Settings deep-link
- Uses `Accuracy.Balanced` for a reasonable balance of speed and precision

---

## Safety Scoring Methodology

### Weights
All weights are defined in `backend/src/config/safetyConfig.js` for easy modification:

| Factor         | Weight |
|----------------|--------|
| Heat Index     | 30%    |
| Temperature    | 20%    |
| Humidity       | 15%    |
| UV Index       | 15%    |
| Wind Speed     | 10%    |
| Precipitation  | 10%    |

### Risk Levels
| Score  | Level     |
|--------|-----------|
| 0–25   | LOW       |
| 26–50  | MODERATE  |
| 51–75  | HIGH      |
| 76–100 | VERY HIGH |

### Activity Adjustment
- Hiking → baseline (×1.00)
- Running → ×1.05 (5% higher exertion multiplier under environmental stress)

The individual scoring functions (`scoreHeatIndex`, `scoreTemperature`, etc.) are exported from `safetyService.js` for independent unit testing with artificial values.

---

## Heat Index Calculation

Implements the **NWS Rothfusz regression equation**:

Source: [https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml](https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml)

```
HI = −42.379 + 2.04901523T + 10.14333127RH − 0.22475541T·RH
     − 0.00683783T² − 0.05481717RH² + 0.00122874T²·RH
     + 0.00085282T·RH² − 0.00000199T²·RH²
```

Where T is in °F and RH is 0–100. Result converted back to °C.

**NWS adjustments applied:**
- Low humidity correction (RH < 13%, T 80–112°F)
- High humidity/cool correction (RH > 85%, T 80–87°F)

**Fallback:** If T < 26.67°C (80°F) or RH < 40%, the formula is not valid. Heat Index = temperature (NOT apparent_temperature).

---

## Hydration Estimation

A simple, transparent estimate — not a medical model:

```
base = 500 ml/hr (hiking) | 600 ml/hr (running)
+ heat index bonus: +50 to +250 ml/hr
+ humidity bonus:   +0 to +100 ml/hr
range = midpoint ± 100 ml/hr
```

Always presented as an estimate range. Not medical advice.

---

## How to Run the Backend

### Prerequisites
- Node.js 18+
- npm

### Setup
```bash
cd backend
npm install
```

### Configuration
The `.env` file in `backend/` is pre-configured:
```
PORT=5000
```
No API key is needed for Open-Meteo.

### Start
```bash
npm start
# or
node src/server.js
```

### Test
```bash
# Health check
curl http://localhost:5000/api/health

# Safety assessment (Vijayawada, India — hiking)
curl "http://localhost:5000/api/safety?latitude=16.4526&longitude=80.6212&activity=hiking"

# Validation test (invalid coordinates)
curl "http://localhost:5000/api/safety?latitude=999&longitude=80&activity=hiking"
```

---

## How to Run the Mobile Application

### Prerequisites
- Node.js 18+
- Expo Go app installed on your Android device
- Backend running and reachable

### Important — Backend URL Configuration

When running on a **physical Android device**, you must update the `BACKEND_URL` in `mobile/services/apiService.ts`:

```typescript
// For Android Emulator:
const BACKEND_URL = 'http://10.0.2.2:5000';

// For physical device (use your machine's LAN IP):
const BACKEND_URL = 'http://192.168.1.100:5000';  // replace with your IP
```

Find your machine's IP: `ipconfig` (Windows) → look for IPv4 Address under your Wi-Fi adapter.

### Setup
```bash
cd mobile
npm install
```

### Start
```bash
npx expo start
```

Then scan the QR code with Expo Go on your Android device.

---

## API Endpoint Documentation

### `GET /api/health`
Returns server status.

**Response:**
```json
{ "status": "ok", "timestamp": "2026-08-20T10:27:06.062Z" }
```

---

### `GET /api/safety`

**Query Parameters:**
| Parameter | Type   | Required | Constraints         |
|-----------|--------|----------|---------------------|
| latitude  | number | Yes      | −90 to +90          |
| longitude | number | Yes      | −180 to +180        |
| activity  | string | Yes      | `hiking` or `running` |

**Example Request:**
```
GET /api/safety?latitude=16.4526&longitude=80.6212&activity=hiking
```

**Success Response (200):**
```json
{
  "location": { "latitude": 16.4526, "longitude": 80.6212 },
  "activity": "hiking",
  "weather": {
    "temperature": 33.4,
    "humidity": 54,
    "apparentTemperature": 36.3,
    "pressure": 1001.3,
    "windSpeed": 17.0,
    "precipitation": 0.0,
    "uvIndex": 2.8
  },
  "heatIndex": 38.4,
  "heatIndexFormulaApplied": true,
  "safetyScore": 39,
  "riskLevel": "MODERATE",
  "recommendation": "Conditions are moderately challenging. Take regular breaks and stay hydrated. The heat index is currently the primary contributing factor to the risk level.",
  "hydration": { "minimum": 600, "maximum": 800, "unit": "ml/hour" },
  "factorScores": {
    "heatIndex": 75,
    "temperature": 65,
    "humidity": 0,
    "uvIndex": 20,
    "windSpeed": 0,
    "precipitation": 0
  }
}
```

**Validation Error (400):**
```json
{ "error": "Validation failed", "details": ["latitude must be between -90 and 90"] }
```

**Weather Unavailable (502):**
```json
{ "error": "Weather service unavailable", "message": "..." }
```

---

## Limitations

- V1 only assesses **current** conditions — no forecast or route analysis
- Hydration estimate is a simplified model — not a physiological calculation
- Safety thresholds are reasonable starting points, not official standards
- No elevation awareness — altitude affects UV and temperature significantly
- No offline mode — requires internet for weather data
- Not suitable as a primary safety system for emergency situations

---

## Future Improvements (V2/V3 Ideas)

- Activity history and session logs
- Route-aware weather forecast (upcoming conditions)
- Elevation-adjusted risk scoring
- AI-generated personalised recommendations
- Emergency contact integration
- Offline mode with cached weather
- Push notifications for changing conditions
- User accounts and saved locations
- Fall detection (using device accelerometer)

---

## License

MIT — for educational and personal use.
