/**
 * TrailSafe Location Service
 * Wraps expo-location for clean, single-use GPS acquisition.
 *
 * Design:
 * - We only request location ONCE per user action (not continuous tracking).
 * - If permission was already denied, we return the denied status rather
 *   than re-requesting — avoiding the system dialog loop.
 */

import * as Location from 'expo-location';

export type LocationResult =
  | { status: 'granted'; latitude: number; longitude: number }
  | { status: 'denied' }
  | { status: 'unavailable'; message: string };

/**
 * Requests foreground location permission (if not already granted)
 * and retrieves the device's current GPS position.
 *
 * @returns LocationResult — tagged union indicating outcome
 */
export async function getCurrentLocation(): Promise<LocationResult> {
  // Check current permission status
  const { status: existingStatus } = await Location.getForegroundPermissionsAsync();

  let finalStatus = existingStatus;

  // Only request if not yet determined (don't re-request if denied)
  if (existingStatus !== 'granted' && existingStatus !== 'denied') {
    const { status } = await Location.requestForegroundPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus === 'denied') {
    return { status: 'denied' };
  }

  if (finalStatus !== 'granted') {
    return {
      status: 'unavailable',
      message: 'Location permission is not available on this device.',
    };
  }

  // Permission granted — get current position
  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      status:    'granted',
      latitude:  position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return {
      status:  'unavailable',
      message: 'Unable to determine your current location. Please ensure GPS is enabled and try again.',
    };
  }
}
