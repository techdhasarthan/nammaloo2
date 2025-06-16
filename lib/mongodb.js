import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToilets, getToiletById, getTopRatedToilets, getOpenToilets, searchToilets } from './api';
import { getCurrentLocation, getToiletDistance } from './location';

// Toilet type definition
export interface Toilet {
  _id: string;
  uuid: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviews: number;
  image_url: string;
  working_hours: string;
  business_status: string;
  is_paid: string;
  wheelchair: string;
  gender: string;
  baby: string;
  shower: string;
  westernorindian: string;
  napkin_vendor: string;
  distance?: number;
  distanceText?: string;
  durationText?: string;
  isGoogleDistance?: boolean;
}

// Review type definition
export interface Review {
  _id: string;
  id: string;
  toilet_id: string;
  user_id: string;
  review_text: string;
  rating: number;
  created_at: string;
  user_profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

// Report type definition
export interface Report {
  _id: string;
  id: string;
  toilet_id: string;
  user_id: string;
  issue_text: string;
  issue_type: string;
  status: string;
  created_at: string;
}

// Cache keys
const CACHE_KEYS = {
  ALL_TOILETS: 'cache_all_toilets',
  TOP_RATED_TOILETS: 'cache_top_rated_toilets',
  OPEN_TOILETS: 'cache_open_toilets',
  TOILET_DETAILS: 'cache_toilet_details_',
  TOILET_REVIEWS: 'cache_toilet_reviews_'
};

// Cache expiration times (in milliseconds)
const CACHE_EXPIRATION = {
  ALL_TOILETS: 5 * 60 * 1000, // 5 minutes
  TOP_RATED_TOILETS: 10 * 60 * 1000, // 10 minutes
  OPEN_TOILETS: 2 * 60 * 1000, // 2 minutes
  TOILET_DETAILS: 15 * 60 * 1000, // 15 minutes
  TOILET_REVIEWS: 5 * 60 * 1000 // 5 minutes
};

// Cache helpers
const getFromCache = async (key) => {
  try {
    let data;
    
    if (Platform.OS === 'web') {
      data = localStorage.getItem(key);
    } else {
      data = await AsyncStorage.getItem(key);
    }
    
    if (!data) return null;
    
    const { value, timestamp } = JSON.parse(data);
    const now = Date.now();
    
    // Check if cache is expired
    if (key.includes(CACHE_KEYS.ALL_TOILETS) && now - timestamp > CACHE_EXPIRATION.ALL_TOILETS) return null;
    if (key.includes(CACHE_KEYS.TOP_RATED_TOILETS) && now - timestamp > CACHE_EXPIRATION.TOP_RATED_TOILETS) return null;
    if (key.includes(CACHE_KEYS.OPEN_TOILETS) && now - timestamp > CACHE_EXPIRATION.OPEN_TOILETS) return null;
    if (key.includes(CACHE_KEYS.TOILET_DETAILS) && now - timestamp > CACHE_EXPIRATION.TOILET_DETAILS) return null;
    if (key.includes(CACHE_KEYS.TOILET_REVIEWS) && now - timestamp > CACHE_EXPIRATION.TOILET_REVIEWS) return null;
    
    return value;
  } catch (error) {
    console.error('Error getting from cache:', error);
    return null;
  }
};

const saveToCache = async (key, value) => {
  try {
    const data = JSON.stringify({
      value,
      timestamp: Date.now()
    });
    
    if (Platform.OS === 'web') {
      localStorage.setItem(key, data);
    } else {
      await AsyncStorage.setItem(key, data);
    }
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

// API functions with caching
export const getAllToilets = async (userLocation) => {
  try {
    console.log('🚽 === FETCHING ALL TOILETS ===');
    
    // Try to get from cache first
    const cacheKey = CACHE_KEYS.ALL_TOILETS;
    const cachedData = await getFromCache(cacheKey);
    
    if (cachedData) {
      console.log('📋 Using cached toilet data');
      return addDistancesToToilets(cachedData, userLocation);
    }
    
    // Fetch from API
    const toilets = await getToilets(userLocation);
    
    // Save to cache
    await saveToCache(cacheKey, toilets);
    
    return toilets;
  } catch (error) {
    console.error('Error fetching all toilets:', error);
    return [];
  }
};

export const getToiletDetails = async (toiletId, userLocation) => {
  try {
    console.log(`🚽 === FETCHING TOILET DETAILS: ${toiletId} ===`);
    
    // Try to get from cache first
    const cacheKey = `${CACHE_KEYS.TOILET_DETAILS}${toiletId}`;
    const cachedData = await getFromCache(cacheKey);
    
    if (cachedData) {
      console.log('📋 Using cached toilet details');
      return addDistanceToToilet(cachedData, userLocation);
    }
    
    // Fetch from API
    const toilet = await getToiletById(toiletId, userLocation);
    
    // Save to cache
    await saveToCache(cacheKey, toilet);
    
    return toilet;
  } catch (error) {
    console.error(`Error fetching toilet details for ${toiletId}:`, error);
    return null;
  }
};

export const getTopRated = async (limit = 10, userLocation) => {
  try {
    console.log('⭐ === FETCHING TOP RATED TOILETS ===');
    
    // Try to get from cache first
    const cacheKey = `${CACHE_KEYS.TOP_RATED_TOILETS}_${limit}`;
    const cachedData = await getFromCache(cacheKey);
    
    if (cachedData) {
      console.log('📋 Using cached top rated toilets');
      return addDistancesToToilets(cachedData, userLocation);
    }
    
    // Fetch from API
    const toilets = await getTopRatedToilets(limit, userLocation);
    
    // Save to cache
    await saveToCache(cacheKey, toilets);
    
    return toilets;
  } catch (error) {
    console.error('Error fetching top rated toilets:', error);
    return [];
  }
};

export const getOpenNow = async (userLocation) => {
  try {
    console.log('🕒 === FETCHING OPEN TOILETS ===');
    
    // Try to get from cache first
    const cacheKey = CACHE_KEYS.OPEN_TOILETS;
    const cachedData = await getFromCache(cacheKey);
    
    if (cachedData) {
      console.log('📋 Using cached open toilets');
      return addDistancesToToilets(cachedData, userLocation);
    }
    
    // Fetch from API
    const toilets = await getOpenToilets(userLocation);
    
    // Save to cache
    await saveToCache(cacheKey, toilets);
    
    return toilets;
  } catch (error) {
    console.error('Error fetching open toilets:', error);
    return [];
  }
};

export const searchForToilets = async (query, userLocation) => {
  try {
    console.log(`🔍 === SEARCHING TOILETS: "${query}" ===`);
    
    // Don't cache search results
    const toilets = await searchToilets(query, userLocation);
    
    return addDistancesToToilets(toilets, userLocation);
  } catch (error) {
    console.error('Error searching toilets:', error);
    return [];
  }
};

export const getToiletReviews = async (toiletId) => {
  try {
    console.log(`💬 === FETCHING REVIEWS FOR TOILET: ${toiletId} ===`);
    
    // Try to get from cache first
    const cacheKey = `${CACHE_KEYS.TOILET_REVIEWS}${toiletId}`;
    const cachedData = await getFromCache(cacheKey);
    
    if (cachedData) {
      console.log('📋 Using cached reviews');
      return cachedData;
    }
    
    // Fetch from API
    const reviews = await getReviewsForToilet(toiletId);
    
    // Save to cache
    await saveToCache(cacheKey, reviews);
    
    return reviews;
  } catch (error) {
    console.error(`Error fetching reviews for toilet ${toiletId}:`, error);
    return [];
  }
};

// Helper functions
const addDistancesToToilets = (toilets, userLocation) => {
  if (!userLocation || !toilets || toilets.length === 0) {
    return toilets;
  }
  
  return toilets.map(toilet => addDistanceToToilet(toilet, userLocation));
};

const addDistanceToToilet = (toilet, userLocation) => {
  if (!userLocation || !toilet || !toilet.latitude || !toilet.longitude) {
    return toilet;
  }
  
  // Calculate distance
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    toilet.latitude,
    toilet.longitude
  );
  
  return {
    ...toilet,
    distance,
    distanceText: formatDistance(distance),
    durationText: `~${Math.round(distance * 2)} mins`,
    isGoogleDistance: false
  };
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

// Test connection to API
export const testConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    
    return {
      success: true,
      details: data
    };
  } catch (error) {
    console.error('Connection test failed:', error);
    return {
      success: false,
      error: error.message,
      details: { error: error.toString() }
    };
  }
};

// Export all functions
export default {
  getAllToilets,
  getToiletDetails,
  getTopRated,
  getOpenNow,
  searchForToilets,
  getToiletReviews,
  testConnection
};