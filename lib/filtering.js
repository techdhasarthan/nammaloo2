// lib/filtering.js

// Applies basic filtering by rating, distance, and features
export function applyFilters(toilets, filters, userLocation = null) {
  return toilets.filter((toilet) => {
    // Rating filter
    if (filters.minRating && toilet.rating < filters.minRating) {
      return false;
    }

    // Feature filter
    if (filters.features && filters.features.length > 0) {
      const hasAllFeatures = filters.features.every((feature) =>
        toilet.features?.includes(feature)
      );
      if (!hasAllFeatures) return false;
    }

    // Distance filter (mock)
    if (filters.maxDistanceMeters && userLocation) {
      const mockDistance = Math.floor(Math.random() * 3000); // simulate distance in meters
      if (mockDistance > filters.maxDistanceMeters) {
        return false;
      }
    }

    return true;
  });
}

// Counts how many active filters are enabled
export function getActiveFilterCount(filters) {
  let count = 0;

  if (filters.minRating) count++;
  if (filters.features && filters.features.length > 0) count++;
  if (filters.maxDistanceMeters) count++;

  return count;
}
