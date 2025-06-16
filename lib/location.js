// lib/location.js

export async function getCurrentLocation() {
  // Return a default mock location (e.g., Chennai)
  return {
    latitude: 13.0827,
    longitude: 80.2707,
  };
}

export function getToiletDistance(toilet, userLocation) {
  if (!toilet?.location || !userLocation) return 0;

  // Return mock distance (or calculate it roughly)
  const randomDistance = Math.floor(Math.random() * 1000); // meters
  return randomDistance;
}
