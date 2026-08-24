/**
 * TrailSafe API Service
 * Handles HTTP communication with the TrailSafe backend.
 *
 * IMPORTANT: Update BACKEND_URL to your local machine's network IP address
 * when testing on a physical Android device via Expo Go.
 * Example: 'http://192.168.1.100:5000'
 * Do NOT use 'localhost' — it refers to the phone, not your computer.
 */

// ─────────────────────────────────────────────────────────────
// Configuration — update this IP when running on a real device
// ─────────────────────────────────────────────────────────────
const BACKEND_URL = 'https://trecksafe-backend.onrender.com';
// Use 10.0.2.2 for Android Emulator (maps to host machine's localhost)
// Use your LAN IP (e.g. 192.168.x.x) for a physical device

export interface WeatherData {
  temperature:          number;
  humidity:             number;
  apparentTemperature:  number;
  pressure:             number;
  windSpeed:            number;
  precipitation:        number;
  uvIndex:              number;
}

export interface HydrationData {
  minimum:  number;
  maximum:  number;
  unit:     string;
}

export interface SafetyResult {
  location: {
    latitude:   number;
    longitude:  number;
  };
  activity:                  string;
  weather:                   WeatherData;
  heatIndex:                 number;
  heatIndexFormulaApplied:   boolean;
  safetyScore:               number;
  riskLevel:                 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  recommendation:            string;
  hydration:                 HydrationData;
  factorScores: {
    heatIndex:      number;
    temperature:    number;
    humidity:       number;
    uvIndex:        number;
    windSpeed:      number;
    precipitation:  number;
  };
}

/**
 * Fetches a safety assessment from the TrailSafe backend.
 * @param latitude  - Device GPS latitude
 * @param longitude - Device GPS longitude
 * @param activity  - 'hiking' | 'running'
 * @returns SafetyResult
 * @throws Error with a user-friendly message on failure
 */
export async function fetchSafetyAssessment(
  latitude: number,
  longitude: number,
  activity: string,
): Promise<SafetyResult> {
  const url = `${BACKEND_URL}/api/safety?latitude=${latitude}&longitude=${longitude}&activity=${activity}`;

  let response: Response;
  try {
    response = await fetch(url, { method: 'GET' });
  } catch {
    throw new Error(
      'Unable to reach the TrailSafe server. Please check your network connection and try again.',
    );
  }

  if (!response.ok) {
    let errorMessage = 'Unable to retrieve current weather conditions. Please try again.';
    try {
      const errorBody = await response.json();
      if (errorBody?.message) errorMessage = errorBody.message;
    } catch {
      // ignore JSON parse error, use default message
    }
    throw new Error(errorMessage);
  }

  const data: SafetyResult = await response.json();
  return data;
}

/**
 * Checks backend health.
 * @returns true if backend is reachable
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
