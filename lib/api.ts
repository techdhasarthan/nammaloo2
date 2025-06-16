// API configuration and data fetching
const MONGODB_API_URL = 'http://localhost:3001/api'; // Backend API URL

export interface Toilet {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviews: number;
  image_url?: string;
  working_hours?: string;
  is_paid: string;
  wheelchair: string;
  gender: string;
  baby: string;
  shower: string;
  westernorindian: string;
  napkin_vendor: string;
  distance?: number;
  distanceText?: string;
}

// Mock data for fallback
const mockToilets: Toilet[] = [
  {
    _id: '1',
    name: 'Phoenix MarketCity Mall Restroom',
    address: 'Whitefield Main Road, Mahadevapura',
    city: 'Bangalore',
    state: 'Karnataka',
    latitude: 12.9698,
    longitude: 77.6991,
    rating: 4.5,
    reviews: 127,
    image_url: 'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=400',
    working_hours: '10:00 AM - 10:00 PM',
    is_paid: 'No',
    wheelchair: 'Yes',
    gender: 'Unisex',
    baby: 'Yes',
    shower: 'No',
    westernorindian: 'Western',
    napkin_vendor: 'No'
  },
  {
    _id: '2',
    name: 'Cubbon Park Public Toilet',
    address: 'Cubbon Park, Kasturba Road',
    city: 'Bangalore',
    state: 'Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
    rating: 4.2,
    reviews: 89,
    image_url: 'https://images.pexels.com/photos/6585756/pexels-photo-6585756.jpeg?auto=compress&cs=tinysrgb&w=400',
    working_hours: '6:00 AM - 8:00 PM',
    is_paid: 'No',
    wheelchair: 'Yes',
    gender: 'Separate',
    baby: 'Yes',
    shower: 'No',
    westernorindian: 'Both',
    napkin_vendor: 'No'
  },
  {
    _id: '3',
    name: 'Bangalore Railway Station Restroom',
    address: 'Kempegowda Railway Station, Gubbi Thotadappa Road',
    city: 'Bangalore',
    state: 'Karnataka',
    latitude: 12.9767,
    longitude: 77.5993,
    rating: 3.8,
    reviews: 234,
    image_url: 'https://images.pexels.com/photos/6585758/pexels-photo-6585758.jpeg?auto=compress&cs=tinysrgb&w=400',
    working_hours: '24 Hours',
    is_paid: 'Yes',
    wheelchair: 'Yes',
    gender: 'Separate',
    baby: 'No',
    shower: 'Yes',
    westernorindian: 'Both',
    napkin_vendor: 'Yes'
  },
  {
    _id: '4',
    name: 'UB City Mall Premium Restroom',
    address: 'UB City Mall, Vittal Mallya Road',
    city: 'Bangalore',
    state: 'Karnataka',
    latitude: 12.9719,
    longitude: 77.6197,
    rating: 4.8,
    reviews: 156,
    image_url: 'https://images.pexels.com/photos/6585759/pexels-photo-6585759.jpeg?auto=compress&cs=tinysrgb&w=400',
    working_hours: '10:00 AM - 11:00 PM',
    is_paid: 'No',
    wheelchair: 'Yes',
    gender: 'Unisex',
    baby: 'Yes',
    shower: 'No',
    westernorindian: 'Western',
    napkin_vendor: 'No'
  },
  {
    _id: '5',
    name: 'Lalbagh Botanical Garden Facility',
    address: 'Lalbagh Main Gate, Mavalli',
    city: 'Bangalore',
    state: 'Karnataka',
    latitude: 12.9507,
    longitude: 77.5848,
    rating: 4.1,
    reviews: 67,
    image_url: 'https://images.pexels.com/photos/6585760/pexels-photo-6585760.jpeg?auto=compress&cs=tinysrgb&w=400',
    working_hours: '6:00 AM - 6:00 PM',
    is_paid: 'No',
    wheelchair: 'No',
    gender: 'Separate',
    baby: 'No',
    shower: 'No',
    westernorindian: 'Indian',
    napkin_vendor: 'No'
  }
];

// Fetch toilets from backend or use mock data
export const fetchToilets = async (): Promise<Toilet[]> => {
  try {
    console.log('Attempting to fetch from backend...');
    const response = await fetch(`${MONGODB_API_URL}/toilets`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Successfully fetched from backend:', data.length, 'toilets');
    return data;
  } catch (error) {
    console.warn('Backend not available, using mock data:', error);
    return mockToilets;
  }
};

// Fetch toilet by ID
export const fetchToiletById = async (id: string): Promise<Toilet | null> => {
  try {
    const response = await fetch(`${MONGODB_API_URL}/toilets/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn('Backend not available, using mock data');
    return mockToilets.find(toilet => toilet._id === id) || null;
  }
};

// Search toilets
export const searchToilets = async (query: string): Promise<Toilet[]> => {
  try {
    const response = await fetch(`${MONGODB_API_URL}/toilets/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn('Backend not available, using mock search');
    return mockToilets.filter(toilet => 
      toilet.name.toLowerCase().includes(query.toLowerCase()) ||
      toilet.address.toLowerCase().includes(query.toLowerCase()) ||
      toilet.city.toLowerCase().includes(query.toLowerCase())
    );
  }
};

// Get top rated toilets
export const getTopRatedToilets = async (limit: number = 5): Promise<Toilet[]> => {
  try {
    const response = await fetch(`${MONGODB_API_URL}/toilets/top-rated?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn('Backend not available, using mock data');
    return mockToilets
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }
};

// Get nearby toilets
export const getNearbyToilets = async (latitude: number, longitude: number, radius: number = 5): Promise<Toilet[]> => {
  try {
    const response = await fetch(`${MONGODB_API_URL}/toilets/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn('Backend not available, using mock data');
    // Simple distance calculation for mock data
    return mockToilets.map(toilet => {
      const distance = calculateDistance(latitude, longitude, toilet.latitude, toilet.longitude);
      return {
        ...toilet,
        distance,
        distanceText: `${distance.toFixed(1)} km`
      };
    }).filter(toilet => toilet.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }
};

// Simple distance calculation (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};