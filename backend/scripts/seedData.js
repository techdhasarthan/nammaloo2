const mongoose = require('mongoose');
const Toilet = require('../models/Toilet');
const User = require('../models/User');
const Review = require('../models/Review');
require('dotenv').config();

// Sample toilet data
const toiletData = [
  {
    name: 'Phoenix MarketCity Mall Restroom',
    type: 'Shopping Mall',
    address: 'Whitefield Main Road, Mahadevapura',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    postal_code: '560048',
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
    name: 'Cubbon Park Public Toilet',
    type: 'Public Park',
    address: 'Cubbon Park, Kasturba Road',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    postal_code: '560001',
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
    name: 'Bangalore Railway Station Restroom',
    type: 'Railway Station',
    address: 'Kempegowda Railway Station, Gubbi Thotadappa Road',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    postal_code: '560023',
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
    name: 'UB City Mall Premium Restroom',
    type: 'Shopping Mall',
    address: 'UB City Mall, Vittal Mallya Road',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    postal_code: '560001',
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
    name: 'Lalbagh Botanical Garden Facility',
    type: 'Public Garden',
    address: 'Lalbagh Main Gate, Mavalli',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    postal_code: '560004',
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

// Sample user data
const userData = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Regular User',
    email: 'user@example.com',
    password: 'password123',
    role: 'user'
  }
];

// Sample review data
const getReviewData = (toilets, users) => {
  return [
    {
      toilet_id: toilets[0]._id,
      user_id: users[1]._id,
      rating: 5,
      review_text: 'Very clean and well-maintained facility. Highly recommended!'
    },
    {
      toilet_id: toilets[0]._id,
      user_id: users[0]._id,
      rating: 4,
      review_text: 'Good location and accessibility features.'
    },
    {
      toilet_id: toilets[1]._id,
      user_id: users[1]._id,
      rating: 4,
      review_text: 'Nice location, clean restrooms.'
    },
    {
      toilet_id: toilets[2]._id,
      user_id: users[0]._id,
      rating: 3,
      review_text: 'Busy location but facilities are adequate.'
    }
  ];
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/namma-loo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Clear existing data
    await Toilet.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});
    
    console.log('🗑️ Cleared existing data');
    
    // Insert users
    const users = await User.insertMany(userData);
    console.log(`✅ Added ${users.length} users`);
    
    // Insert toilets
    const toilets = await Toilet.insertMany(toiletData);
    console.log(`✅ Added ${toilets.length} toilets`);
    
    // Insert reviews
    const reviewData = getReviewData(toilets, users);
    const reviews = await Review.insertMany(reviewData);
    console.log(`✅ Added ${reviews.length} reviews`);
    
    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});