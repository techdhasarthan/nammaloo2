// lib/mockData.js

export const mockToilets = [
  {
    _id: '1',
    name: 'Central Park Toilet',
    location: {
      latitude: 13.0827,
      longitude: 80.2707,
    },
    rating: 4.7,
    features: ['Wheelchair Accessible', 'Clean', 'Open 24/7'],
    workingHours: {
      open: '06:00',
      close: '22:00',
    },
  },
  {
    _id: '2',
    name: 'Marina Beach Public Toilet',
    location: {
      latitude: 13.0495,
      longitude: 80.2826,
    },
    rating: 4.3,
    features: ['Paid Access', 'Family Friendly'],
    workingHours: {
      open: '05:00',
      close: '23:00',
    },
  },
  // Add more mock entries as needed
];
