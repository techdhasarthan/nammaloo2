// Location utilities for getting user location and calculating distances
import * as Location from 'expo-location';

// Get user's current location
export const getCurrentLocation = async () => {
  try {
    console.log('📍 Requesting location permission...');
    
    // Check if location services are enabled
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      console.log('❌ Location services are disabled');
      return null;
    }
    
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('❌ Location permission denied, status:', status);
      return null;
    }

    console.log('✅ Location permission granted, getting position...');
    
    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeout: 15000,
      maximumAge: 60000,
    });

    const locationData = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
    };

    console.log('✅ Location obtained:', {
      lat: locationData.latitude.toFixed(6),
      lng: locationData.longitude.toFixed(6),
      accuracy: locationData.accuracy + 'm'
    });
    
    return locationData;
  } catch (error) {
    console.error('❌ Error getting location:', error);
    return null;
  }
};

// Calculate distance between two points using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  try {
    // Validate coordinates
    if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
      console.error('❌ Invalid coordinates for distance calculation');
      return 999;
    }
    
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    if (distance < 0 || distance > 20000 || isNaN(distance)) {
      console.error('❌ Unrealistic distance:', distance);
      return 999;
    }
    
    return distance;
  } catch (error) {
    console.error('❌ Error calculating distance:', error);
    return 999;
  }
};

// Format distance for display
export const formatDistance = (distance) => {
  try {
    // Handle undefined, null, or invalid values
    if (distance === undefined || distance === null || isNaN(distance)) {
      console.warn('⚠️ formatDistance received invalid value:', distance);
      return 'Unknown';
    }
    
    // Convert to number if it's a string
    const numDistance = typeof distance === 'string' ? parseFloat(distance) : distance;
    
    // Handle unrealistic distances
    if (numDistance >= 999 || numDistance < 0 || isNaN(numDistance)) {
      return 'Unknown';
    }
    
    // Format the distance
    if (numDistance < 1) {
      const meters = Math.round(numDistance * 1000);
      return `${meters}m`;
    } else {
      return `${numDistance.toFixed(1)}km`;
    }
  } catch (error) {
    console.error('❌ Error in formatDistance:', error);
    return 'Unknown';
  }
};

// Validate coordinates
export const isValidCoordinate = (lat, lng) => {
  try {
    // Check if values are numbers
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      console.error('❌ Coordinates are not numbers:', lat, lng);
      return false;
    }
    
    // Check for NaN
    if (isNaN(lat) || isNaN(lng)) {
      console.error('❌ Coordinates are NaN:', lat, lng);
      return false;
    }
    
    // Check valid ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.error('❌ Coordinates out of valid range:', lat, lng);
      return false;
    }
    
    // Check for null island (0,0)
    if (lat === 0 && lng === 0) {
      console.error('❌ Coordinates are 0,0 (likely invalid)');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error validating coordinates:', error);
    return false;
  }
};

// Get toilet distance for display
export const getToiletDistance = (toilet, userLocation) => {
  try {
    // Check if toilet has distance data
    if (toilet.distanceText && toilet.distanceText !== 'Unknown') {
      return toilet.distanceText;
    }
    
    // Check if toilet has calculated distance
    if (toilet.distance !== undefined && toilet.distance !== null && toilet.distance < 999) {
      return formatDistance(toilet.distance);
    }
    
    // Try to calculate distance if we have coordinates
    if (userLocation && toilet.latitude && toilet.longitude) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        toilet.latitude,
        toilet.longitude
      );
      
      if (distance < 999) {
        return formatDistance(distance);
      }
    }
    
    // Fallback
    return 'Distance unknown';
  } catch (error) {
    console.error('❌ Error getting toilet distance:', error);
    return 'Distance unknown';
  }
};