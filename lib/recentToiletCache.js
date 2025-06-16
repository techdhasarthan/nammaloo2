// lib/recentToiletCache.js

class RecentToiletCache {
  constructor() {
    this.recentViews = [];
    this.subscribers = [];
  }

  addRecentView(toilet) {
    const exists = this.recentViews.find((t) => t._id === toilet._id);
    if (!exists) {
      this.recentViews.unshift({ ...toilet, viewCount: 1 });
      if (this.recentViews.length > 10) {
        this.recentViews.pop(); // Keep max 10 recent
      }
    } else {
      exists.viewCount += 1;
    }
    this.notifySubscribers();
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    // Immediately notify new subscribers
    callback(this.recentViews);
  }

  notifySubscribers() {
    for (const cb of this.subscribers) {
      cb(this.recentViews);
    }
  }
}

export const recentToiletCache = new RecentToiletCache();
