// Global distance cache that loads once when app opens
import { getCurrentLocation } from './location';

class GlobalDistanceCacheManager {
  constructor() {
    this.cache = new Map();
    this.isLoaded = false;
    this.isLoading = false;
    this.userLocation = null;
    this.listeners = new Set();
  }

  // Subscribe to cache updates
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of cache updates
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.cache));
  }

  // Initialize the global cache with all toilets
  async initializeCache(userLocation) {
    if (this.isLoading || (this.isLoaded && this.userLocation && 
        Math.abs(this.userLocation.latitude - userLocation.latitude) < 0.001 &&
        Math.abs(this.userLocation.longitude - userLocation.longitude) < 0.001)) {
      console.log('🗂️ Global cache already loaded or loading for this location');
      return;
    }

    try {
      this.isLoading = true;
      this.userLocation = userLocation;
      
      console.log('🗂️ === INITIALIZING GLOBAL DISTANCE CACHE ===');
      console.log('📍 User location:', userLocation);

      // In a real app, this would fetch distances from an API
      // For now, we'll just simulate it with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Add some sample distances to the cache
      this.cache.set('toilet-001', {
        distanceKm: 1.2,
        distanceText: '1.2km',
        durationText: '5 mins',
        durationMinutes: 5,
        isGoogleDistance: true
      });
      
      this.cache.set('toilet-002', {
        distanceKm: 0.8,
        distanceText: '800m',
        durationText: '3 mins',
        durationMinutes: 3,
        isGoogleDistance: true
      });
      
      this.cache.set('toilet-003', {
        distanceKm: 2.5,
        distanceText: '2.5km',
        durationText: '10 mins',
        durationMinutes: 10,
        isGoogleDistance: true
      });

      this.isLoaded = true;
      console.log(`✅ Global distance cache loaded with ${this.cache.size} entries`);
      
      // Notify all listeners
      this.notifyListeners();

    } catch (error) {
      console.error('❌ Error initializing global distance cache:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Get distance from cache
  getDistance(toiletId) {
    return this.cache.get(toiletId) || null;
  }

  // Check if cache is loaded
  isCacheLoaded() {
    return this.isLoaded;
  }

  // Check if cache is loading
  isCacheLoading() {
    return this.isLoading;
  }

  // Get cache size
  getCacheSize() {
    return this.cache.size;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    this.isLoaded = false;
    this.userLocation = null;
    console.log('🗑️ Global distance cache cleared');
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      isLoaded: this.isLoaded,
      isLoading: this.isLoading,
      userLocation: this.userLocation
    };
  }
}

// Export singleton instance
export const globalDistanceCache = new GlobalDistanceCacheManager();