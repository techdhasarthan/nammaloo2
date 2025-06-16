// API utilities for MongoDB backend
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Test API connection
export const testConnection = async () => {
  try {
    console.log('🔗 Testing API connection...');
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ API connection successful');
    
    return {
      success: true,
      details: data
    };
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return {
      success: false,
      error: error.message,
      details: { url: API_BASE_URL }
    };
  }
};

// Get all toilets
export const fetchToilets = async (userLocation) => {
  try {
    console.log('🚻 Fetching toilets from API...');
    
    let url = `${API_BASE_URL}/toilets`;
    if (userLocation) {
      url += `?lat=${userLocation.latitude}&lng=${userLocation.longitude}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch toilets: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Fetched ${data.length} toilets`);
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching toilets:', error);
    return [];
  }
};

// Get toilet by ID
export const getToiletById = async (id, userLocation) => {
  try {
    console.log('🚻 Fetching toilet by ID:', id);
    
    let url = `${API_BASE_URL}/toilets/${id}`;
    if (userLocation) {
      url += `?lat=${userLocation.latitude}&lng=${userLocation.longitude}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch toilet: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Fetched toilet:', data.name);
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching toilet:', error);
    return null;
  }
};

// Get top rated toilets
export const getTopRatedToilets = async (
  limit = 10,
  userLocation
) => {
  try {
    console.log('⭐ Fetching top rated toilets...');
    
    let url = `${API_BASE_URL}/toilets/top-rated?limit=${limit}`;
    if (userLocation) {
      url += `&lat=${userLocation.latitude}&lng=${userLocation.longitude}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch top rated toilets: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Fetched ${data.length} top rated toilets`);
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching top rated toilets:', error);
    return [];
  }
};

// Get open toilets
export const getOpenToilets = async (userLocation) => {
  try {
    console.log('🕐 Fetching open toilets...');
    
    let url = `${API_BASE_URL}/toilets/open`;
    if (userLocation) {
      url += `?lat=${userLocation.latitude}&lng=${userLocation.longitude}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch open toilets: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Fetched ${data.length} open toilets`);
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching open toilets:', error);
    return [];
  }
};

// Search toilets
export const searchToilets = async (query, userLocation) => {
  try {
    console.log('🔍 Searching toilets:', query);
    
    let url = `${API_BASE_URL}/toilets/search?q=${encodeURIComponent(query)}`;
    if (userLocation) {
      url += `&lat=${userLocation.latitude}&lng=${userLocation.longitude}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to search toilets: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Found ${data.length} toilets matching "${query}"`);
    
    return data;
  } catch (error) {
    console.error('❌ Error searching toilets:', error);
    return [];
  }
};

// Get reviews for a toilet
export const getReviewsForToilet = async (toiletId) => {
  try {
    console.log('💬 Fetching reviews for toilet:', toiletId);
    
    const response = await fetch(`${API_BASE_URL}/toilets/${toiletId}/reviews`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reviews: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Fetched ${data.length} reviews`);
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    return [];
  }
};

// Create a review
export const createReview = async (toiletId, userName, reviewText, rating) => {
  try {
    console.log('📝 Creating review for toilet:', toiletId);
    
    const response = await fetch(`${API_BASE_URL}/toilets/${toiletId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_name: userName,
        review_text: reviewText,
        rating,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create review: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Review created successfully');
    
    return data;
  } catch (error) {
    console.error('❌ Error creating review:', error);
    return null;
  }
};

// Create a report
export const createReport = async (toiletId, userName, issueText) => {
  try {
    console.log('📋 Creating report for toilet:', toiletId);
    
    const response = await fetch(`${API_BASE_URL}/toilets/${toiletId}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_name: userName,
        issue_text: issueText,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create report: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Report created successfully');
    
    return data;
  } catch (error) {
    console.error('❌ Error creating report:', error);
    return null;
  }
};

// Create anonymous user (for compatibility)
export const createAnonymousUser = async () => {
  // Generate a random anonymous user
  const anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const anonymousName = `Anonymous User ${Math.floor(Math.random() * 1000)}`;
  
  return {
    id: anonymousId,
    name: anonymousName
  };
};