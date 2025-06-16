// Recent toilet cache system for tracking viewed toilets
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const CACHE_KEY = 'recent_toilet_cache';
const MAX_RECENT_TOILETS = 20; // Keep only the 20 most recent

class RecentToiletCacheManager {
  constructor() {
    this.cache = new Map();
    this.listeners = new Set();
    this.loadCache();
  }

  // Subscribe to cache updates
  subscribe(callback) {
    this.listeners.add(callback);
    // Immediately call with current data
    callback(this.getRecentToilets());
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of cache updates
  notifyListeners() {
    const recentToilets = this.getRecentToilets();
    this.listeners.forEach(callback => callback(recentToilets));
  }

  // Load cache from storage
  async loadCache() {
    try {
      let cacheData;
      
      if (Platform.OS === 'web') {
        cacheData = localStorage.getItem(CACHE_KEY);
      } else {
        cacheData = await AsyncStorage.getItem(CACHE_KEY);
      }
      
      if (cacheData) {
        const cache = JSON.parse(cacheData);
        
        // Load into memory cache
        Object.entries(cache).forEach(([toiletId, entry]) => {
          this.cache.set(toiletId, entry);
        });
        
        console.log(`📋 Loaded ${this.cache.size} recent toilet entries`);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('❌ Error loading recent toilet cache:', error);
      this.cache.clear();
    }
  }

  // Save cache to storage
  async saveCache() {
    try {
      const cacheToSave = {};
      
      // Convert Map to object for storage
      this.cache.forEach((entry, toiletId) => {
        cacheToSave[toiletId] = entry;
      });
      
      const cacheData = JSON.stringify(cacheToSave);
      
      if (Platform.OS === 'web') {
        localStorage.setItem(CACHE_KEY, cacheData);
      } else {
        await AsyncStorage.setItem(CACHE_KEY, cacheData);
      }
      
      console.log(`💾 Saved ${Object.keys(cacheToSave).length} recent toilet entries`);
    } catch (error) {
      console.error('❌ Error saving recent toilet cache:', error);
    }
  }

  // Add toilet to recent views
  async addRecentView(toilet) {
    try {
      const now = Date.now();
      const toiletId = toilet.uuid || toilet._id;
      
      if (!toiletId) {
        console.warn('⚠️ Cannot add toilet to recent views: missing ID');
        return;
      }

      const existing = this.cache.get(toiletId);
      
      const entry = {
        toiletId,
        name: toilet.name || 'Public Toilet',
        address: toilet.address || 'Address not available',
        rating: toilet.rating,
        image_url: toilet.image_url,
        viewedAt: now,
        viewCount: (existing?.viewCount || 0) + 1
      };

      this.cache.set(toiletId, entry);
      await this.trimCache();
      await this.saveCache();
      this.notifyListeners();
      
      console.log(`👁️ Added toilet to recent views: ${entry.name} (view count: ${entry.viewCount})`);
    } catch (error) {
      console.error('❌ Error adding recent view:', error);
    }
  }

  // Get recent toilets sorted by most recent view
  getRecentToilets() {
    const entries = Array.from(this.cache.values());
    
    // Sort by most recent view
    entries.sort((a, b) => b.viewedAt - a.viewedAt);
    
    return entries;
  }

  // Get most viewed toilets
  getMostViewed() {
    const entries = Array.from(this.cache.values());
    
    // Sort by view count
    entries.sort((a, b) => b.viewCount - a.viewCount);
    
    return entries.slice(0, 10); // Top 10 most viewed
  }

  // Check if a toilet is in recent cache
  isRecentToilet(toiletId) {
    return this.cache.has(toiletId);
  }

  // Get a specific recent toilet entry
  getRecentToilet(toiletId) {
    return this.cache.get(toiletId) || null;
  }

  // Remove a toilet from recent cache
  async removeRecentToilet(toiletId) {
    try {
      if (this.cache.delete(toiletId)) {
        await this.saveCache();
        this.notifyListeners();
        console.log(`🗑️ Removed toilet from recent cache: ${toiletId}`);
      }
    } catch (error) {
      console.error('❌ Error removing recent toilet:', error);
    }
  }

  // Clear all recent toilets
  async clearRecentToilets() {
    try {
      this.cache.clear();
      await this.saveCache();
      this.notifyListeners();
      console.log('🗑️ Cleared all recent toilets');
    } catch (error) {
      console.error('❌ Error clearing recent toilets:', error);
    }
  }

  // Trim cache to maximum size
  async trimCache() {
    if (this.cache.size <= MAX_RECENT_TOILETS) {
      return;
    }

    const entries = this.getRecentToilets();
    const toKeep = entries.slice(0, MAX_RECENT_TOILETS);
    
    // Clear cache and re-add only the entries to keep
    this.cache.clear();
    toKeep.forEach(entry => {
      this.cache.set(entry.toiletId, entry);
    });
    
    console.log(`✂️ Trimmed recent toilet cache to ${this.cache.size} entries`);
  }
}

// Export singleton instance
export const recentToiletCache = new RecentToiletCacheManager();