// lib/globalDistanceCache.js

class GlobalDistanceCache {
  constructor() {
    this.cache = new Map();
    this.subscribers = [];
  }

  async initializeCache(userLocation) {
    // Simulate async delay and set random data
    await new Promise((res) => setTimeout(res, 200));
    this.cache.set('mock', 1);
    this.notifySubscribers();
  }

  getCacheSize() {
    return this.cache.size;
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notifySubscribers() {
    for (const callback of this.subscribers) {
      callback(this.cache);
    }
  }
}

export const globalDistanceCache = new GlobalDistanceCache();
