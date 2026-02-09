import * as Location from 'expo-location';
import type { LocationSnapshot, LocationStatus } from '../types/Form';

function createLocationResult(
  status: LocationStatus,
  capturedAt: string,
  latitude: number | null = null,
  longitude: number | null = null,
  accuracy: number | null = null,
): LocationSnapshot {
  return {
    status,
    capturedAt,
    latitude,
    longitude,
    accuracy,
  };
}

export async function captureLocationSnapshot(): Promise<LocationSnapshot> {
  const capturedAt = new Date().toISOString();

  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      return createLocationResult('denied', capturedAt);
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return createLocationResult(
      'captured',
      capturedAt,
      position.coords.latitude,
      position.coords.longitude,
      position.coords.accuracy ?? null,
    );
  } catch {
    return createLocationResult('error', capturedAt);
  }
}
