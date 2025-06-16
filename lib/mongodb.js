import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentLocation } from './location';

// MongoDB connection URL
const MONGODB_URI = 'mongodb+srv://Dhasarathan:GsT4oZvB2leqFoB0@ottdistribution.ncn5p.mongodb.net/nammaloo?retryWrites=true&w=majority&appName=ottDistribution';

// API base URL - change this to your actual backend URL when deployed
const API_BASE_URL = 'http://localhost:3000/api';

// Toilet type definition
export const Toilet = {
  _id: String,
  uuid: String,
  name: String,
  type: String,
  address: String,
  city: String,
  state: String,
  country: String,
  postal_code: String,
  latitude: Number,
  longitude: Number,
  rating: Number,
  reviews: Number,
  image_url: String,
  working_hours: String,
  business_status: String,
  is_paid: String,
  wheelchair: String,
  gender: String,
  baby: String,
  shower: String,
  westernorindian: String,
  napkin_vendor: String,
  distance: Number,
  distanceText: String,
  durationText: String,
  isGoogleDistance: Boolean
};

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

// Sample toilet data for development
const SAMPLE_TOILETS = [
  {
    _id: 'toilet-001',
    uuid: 'toilet-001',
    name: 'Phoenix MarketCity Mall Restroom',
    type: 'Shopping Mall',
    address: 'Whitefield Main Road, Mahadevapura',
    city: 'Bangalore',
    postal_code: '560048',
    state: 'Karnataka',
    country: 'India',
    country_code: 'IN',
    latitude: 12.9698,
    longitude: 77.6991,
    rating: 4.5,
    reviews: 127,
    image_url: 'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=400',
    working_hours: '10:00 AM - 10:00 PM',
    business_status: 'OPERATIONAL',
    is_paid: 'No',
    wheelchair: 'Yes',
    gender: 'Unisex',
    baby: 'Yes',
    shower: 'No',
    westernorindian: 'Western'
  },
  {
    _id: 'toilet-002',
    uuid: 'toilet-002',
    name: 'Cubbon Park Public Toilet',
    type: 'Public Park',
    address: 'Cubbon Park, Kasturba Road',
    city: 'Bangalore',
    postal_code: '560001',
    state: 'Karnataka',
    country: 'India',
    country_code: 'IN',
    latitude: 12.9716,
    longitude: 77.5946,
    rating: 4.2,
    reviews: 89,
    image_url: 'https://images.pexels.com/photos/6585756/pexels-photo-6585756.jpeg?auto=compress&cs=tinysrgb&w=400',
    working_hours: '6:00 AM - 8:00 PM',
    business_status: 'OPERATIONAL',
    is_paid: 'No',
    wheelchair: 'Yes',
    gender: 'Separate',
    baby: 'Yes',
    shower: 'No',
    westernorindian: 'Both'
  },
  {
    _id: 'toilet-003',
    uuid: 'toilet-003',
    name: 'Bangalore Railway Station Restroom',
    type: 'Railway Station',
    address: 'Kempegowda Railway Station, Gubbi Thotadappa Road',
    city: 'Bangalore',
    postal_code: '560023',
    state: 'Karnataka',
    country: 'India',
    country_code: 'IN',
    latitude: 12.9767,
    longitude: 77.5993,
    rating: 3.8,
    reviews: 234,
    image_url: 'https://images.pexels.com/photos/6585758/pexels-photo-6585758.jpeg?auto=compress&cs=tinysrgb&w=400',
    working_hours: '24 Hours',
    business_status: 'OPERATIONAL',
    is_paid: 'Yes',
    wheelchair: 'Yes',
    gender: 'Separate',
    baby: 'No',
    shower: 'Yes',
    westernorindian: 'Both'
  },
  {
    _id: 'toilet-004',
    uuid: 'toilet-004',
    name: 'UB City Mall Premium Restroom',
    type: 'Shopping Mall',
    address: 'UB City Mall, Vittal Mallya Road',
    city: 'Bangalore',
    postal_code: '560001',
    state: 'Karnataka',
    country: 'India',
    country_code: 'IN',
    latitude: 12.9719,
    longitude: 77.6197,
    rating: 4.8,
    reviews: 156,
    image_url: 'https://images.pexels.com/photos/6585759/pexels-photo-6585759.jpeg?auto=compress&cs=tinysrgb&w=400',
    working_hours: '10:00 AM - 11:00 PM',
    business_status: 'OPERATIONAL',
    is_paid: 'No',
    wheelchair: 'Yes',
    gender: 'Unisex',
    baby: 'Yes',
    shower: 'No',
    westernorindian: 'Western'
  },
  {
    _id: 'toilet-005',
    uuid: 'toilet-005',
    name: 'Lalbagh Botanical Garden Facility',
    type: 'Public Garden',
    address: 'Lalbagh Main Gate, Mavalli',
    city: 'Bangalore',
    postal_code: '560004',
    state: 'Karnataka',
    country: 'India',
    country_code: 'IN',
    latitude: 12.9507,
    longitude: 77.5848,
    rating: 4.1,
    reviews: 67,
    image_url: 'https://images.pexels.com/photos/6585760/pexels-photo-6585760.jpeg?auto=compress&cs=tinysrgb&w=400',
    working_hours: '6:00 AM - 6:00 PM',
    business_status: 'OPERATIONAL',
    is_paid: 'No',
    wheelchair: 'No',
    gender: 'Separate',
    baby: 'No',
    shower: 'No',
    westernorindian: 'Indian'
  }
];

// Sample review data
const SAMPLE_REVIEWS = [
  {
    _id: 'review-001',
    id: 'review-001',
    toilet_id: 'toilet-001',
    user_id: 'user-001',
    review_text: 'Very clean and well-maintained facility. Highly recommended!',
    rating: 5,
    created_at: '2023-06-15T10:30:00Z',
    user_profiles: {
      full_name: 'John Doe',
      avatar_url: null
    }
  },
  {
    _id: 'review-002',
    id: 'review-002',
    toilet_id: 'toilet-001',
    user_id: 'user-002',
    review_text: 'Good location and accessibility features.',
    rating: 4,
    created_at: '2023-06-10T14:20:00Z',
    user_profiles: {
      full_name: 'Jane Smith',
      avatar_url: null
    }
  }
];

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
    
    // For development, use sample data
    // In production, this would be a fetch to your MongoDB API
    const toilets = SAMPLE_TOILETS;
    
    // Save to cache
    await saveToCache(cacheKey, toilets);
    
    return addDistancesToToilets(toilets, userLocation);
  } catch (error) {
    console.error('Error fetching all toilets:', error);
    return [];
  }
};

export const getToiletById = async (toiletId, userLocation) => {
  try {
    console.log(`🚽 === FETCHING TOILET DETAILS: ${toiletId} ===`);
    
    // Try to get from cache first
    const cacheKey = `${CACHE_KEYS.TOILET_DETAILS}${toiletId}`;
    const cachedData = await getFromCache(cacheKey);
    
    if (cachedData) {
      console.log('📋 Using cached toilet details');
      return addDistanceToToilet(cachedData, userLocation);
    }
    
    // For development, use sample data
    // In production, this would be a fetch to your MongoDB API
    const toilet = SAMPLE_TOILETS.find(t => t._id === toiletId || t.uuid === toiletId);
    
    if (!toilet) {
      console.error(`Toilet with ID ${toiletId} not found`);
      return null;
    }
    
    // Save to cache
    await saveToCache(cacheKey, toilet);
    
    return addDistanceToToilet(toilet, userLocation);
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
    
    // For development, use sample data
    // In production, this would be a fetch to your MongoDB API
    const toilets = SAMPLE_TOILETS
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
    
    // Save to cache
    await saveToCache(cacheKey, toilets);
    
    return addDistancesToToilets(toilets, userLocation);
  } catch (error) {
    console.error('Error fetching top rated toilets:', error);
    return [];
  }
};

export const getOpenToilets = async (userLocation) => {
  try {
    console.log('🕒 === FETCHING OPEN TOILETS ===');
    
    // Try to get from cache first
    const cacheKey = CACHE_KEYS.OPEN_TOILETS;
    const cachedData = await getFromCache(cacheKey);
    
    if (cachedData) {
      console.log('📋 Using cached open toilets');
      return addDistancesToToilets(cachedData, userLocation);
    }
    
    // For development, use sample data
    // In production, this would be a fetch to your MongoDB API
    const toilets = SAMPLE_TOILETS.filter(toilet => 
      toilet.working_hours.includes('24 Hours') || 
      toilet.working_hours.includes('24/7') ||
      isCurrentlyOpen(toilet.working_hours)
    );
    
    // Save to cache
    await saveToCache(cacheKey, toilets);
    
    return addDistancesToToilets(toilets, userLocation);
  } catch (error) {
    console.error('Error fetching open toilets:', error);
    return [];
  }
};

export const searchForToilets = async (query, userLocation) => {
  try {
    console.log(`🔍 === SEARCHING TOILETS: "${query}" ===`);
    
    // Don't cache search results
    // In production, this would be a fetch to your MongoDB API
    const toilets = SAMPLE_TOILETS.filter(toilet => 
      toilet.name.toLowerCase().includes(query.toLowerCase()) ||
      toilet.address.toLowerCase().includes(query.toLowerCase()) ||
      toilet.city.toLowerCase().includes(query.toLowerCase())
    );
    
    return addDistancesToToilets(toilets, userLocation);
  } catch (error) {
    console.error('Error searching toilets:', error);
    return [];
  }
};

export const getReviewsForToilet = async (toiletId) => {
  try {
    console.log(`💬 === FETCHING REVIEWS FOR TOILET: ${toiletId} ===`);
    
    // Try to get from cache first
    const cacheKey = `${CACHE_KEYS.TOILET_REVIEWS}${toiletId}`;
    const cachedData = await getFromCache(cacheKey);
    
    if (cachedData) {
      console.log('📋 Using cached reviews');
      return cachedData;
    }
    
    // For development, use sample data
    // In production, this would be a fetch to your MongoDB API
    const reviews = SAMPLE_REVIEWS.filter(review => review.toilet_id === toiletId);
    
    // Save to cache
    await saveToCache(cacheKey, reviews);
    
    return reviews;
  } catch (error) {
    console.error(`Error fetching reviews for toilet ${toiletId}:`, error);
    return [];
  }
};

export const createReview = async (toiletId, userId, reviewText, rating) => {
  try {
    console.log(`💬 === CREATING REVIEW FOR TOILET: ${toiletId} ===`);
    
    // In production, this would be a POST to your MongoDB API
    const newReview = {
      _id: `review-${Date.now()}`,
      id: `review-${Date.now()}`,
      toilet_id: toiletId,
      user_id: userId,
      review_text: reviewText,
      rating: rating,
      created_at: new Date().toISOString(),
      user_profiles: {
        full_name: 'Anonymous User',
        avatar_url: null
      }
    };
    
    // Add to sample data
    SAMPLE_REVIEWS.push(newReview);
    
    // Update toilet rating
    const toilet = SAMPLE_TOILETS.find(t => t._id === toiletId || t.uuid === toiletId);
    if (toilet) {
      const toiletReviews = SAMPLE_REVIEWS.filter(r => r.toilet_id === toiletId);
      const totalRating = toiletReviews.reduce((sum, r) => sum + r.rating, 0);
      toilet.rating = Math.round((totalRating / toiletReviews.length) * 10) / 10;
      toilet.reviews = toiletReviews.length;
    }
    
    // Clear cache
    if (Platform.OS === 'web') {
      localStorage.removeItem(`${CACHE_KEYS.TOILET_REVIEWS}${toiletId}`);
      localStorage.removeItem(`${CACHE_KEYS.TOILET_DETAILS}${toiletId}`);
    } else {
      await AsyncStorage.removeItem(`${CACHE_KEYS.TOILET_REVIEWS}${toiletId}`);
      await AsyncStorage.removeItem(`${CACHE_KEYS.TOILET_DETAILS}${toiletId}`);
    }
    
    return newReview;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const createReport = async (toiletId, userId, issueText) => {
  try {
    console.log(`🚨 === CREATING REPORT FOR TOILET: ${toiletId} ===`);
    
    // In production, this would be a POST to your MongoDB API
    const newReport = {
      _id: `report-${Date.now()}`,
      id: `report-${Date.now()}`,
      toilet_id: toiletId,
      user_id: userId,
      issue_text: issueText,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    return newReport;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

export const createOrGetAnonymousUser = async () => {
  try {
    console.log('👤 === CREATING ANONYMOUS USER ===');
    
    // In production, this would be a POST to your MongoDB API
    return {
      id: 'anonymous-user',
      name: 'Anonymous User'
    };
  } catch (error) {
    console.error('Error creating anonymous user:', error);
    return null;
  }
};

// Test connection to MongoDB
export const testConnection = async () => {
  try {
    console.log('🔌 === TESTING MONGODB CONNECTION ===');
    
    // For development, just return success
    // In production, this would test the actual connection
    return {
      success: true,
      details: {
        status: 'connected',
        database: 'nammaloo',
        count: SAMPLE_TOILETS.length
      }
    };
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return {
      success: false,
      error: error.message,
      details: { error: error.toString() }
    };
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

const isCurrentlyOpen = (workingHours) => {
  if (!workingHours) return true;
  
  // Check for 24-hour operations
  if (workingHours.includes('24 Hours') || workingHours.includes('24/7')) {
    return true;
  }
  
  // Simple implementation - in production you'd want more sophisticated hour checking
  return true;
};

// Export all functions
export default {
  getAllToilets,
  getToiletById,
  getTopRated,
  getOpenToilets,
  searchForToilets,
  getReviewsForToilet,
  createReview,
  createReport,
  createOrGetAnonymousUser,
  testConnection
};