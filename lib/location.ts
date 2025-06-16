// Location utilities
import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// Get user's current location
export const getCurrentLocation = async (): Promise<LocationData | null> => {
  try {
    console.log('Requesting location permission...');
    
    // Check if location services are enabled
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      console.log('Location services are disabled');
      return null;
    }
    
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Location permission denied');
      return null;
    }

    console.log('Location permission granted, getting position...');
    
    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeout: 15000,
      maximumAge: 60000,
    });

    const locationData: LocationData = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
    };

    console.log('Location obtained:', locationData);
    return locationData;
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

// Format distance for display
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else {
    return `${distance.toFixed(1)}km`;
  }
};