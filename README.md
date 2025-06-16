# Namma Loo - Smart Toilet Finder

A beautiful React Native app built with Expo that helps users find clean, accessible toilets near them with MongoDB backend.

## Features

### 🚻 Toilet Finding
- **Smart search** with real-time results
- **Location-based** toilet discovery
- **Advanced filtering** (rating, distance, features, accessibility)
- **Recently viewed** toilets tracking

### 📱 Beautiful UI
- **Modern design** with smooth animations
- **Responsive layout** for all screen sizes
- **Intuitive navigation** with tab-based layout
- **Image galleries** for toilet photos

### 🗺️ Location Features
- **GPS integration** for accurate positioning
- **Distance calculations** for nearby toilets
- **Area name parsing** from addresses

## Setup Instructions

### 1. Backend Setup

You'll need to set up a MongoDB backend with Node.js. The app expects the following API endpoints:

- `GET /api/health` - Health check
- `GET /api/toilets` - Get all toilets
- `GET /api/toilets/:id` - Get toilet by ID
- `GET /api/toilets/top-rated` - Get top rated toilets
- `GET /api/toilets/open` - Get currently open toilets
- `GET /api/toilets/search` - Search toilets
- `GET /api/toilets/:id/reviews` - Get reviews for a toilet
- `POST /api/toilets/:id/reviews` - Create a review
- `POST /api/toilets/:id/reports` - Create a report

### 2. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the API URL in `.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://your-backend-url/api
   ```

### 3. Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Database Schema

### Toilets Collection
```javascript
{
  _id: ObjectId,
  uuid: String,
  name: String,
  type: String,
  address: String,
  city: String,
  state: String,
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
  napkin_vendor: String
}
```

### Reviews Collection
```javascript
{
  _id: ObjectId,
  toilet_id: String,
  user_name: String,
  review_text: String,
  rating: Number,
  created_at: Date
}
```

### Reports Collection
```javascript
{
  _id: ObjectId,
  toilet_id: String,
  user_name: String,
  issue_text: String,
  created_at: Date
}
```

## Development

### Project Structure
```
app/
├── _layout.tsx          # Root layout
├── (tabs)/              # Main app tabs
│   ├── index.tsx        # Home screen
│   ├── map.tsx          # Map view
│   └── profile.tsx      # User profile
├── toilet-detail.tsx    # Toilet details
├── near-me.tsx          # Nearby toilets
├── top-rated.tsx        # Top rated toilets
└── open-now.tsx         # Currently open toilets

lib/
├── api.ts               # API utilities
├── location.ts          # GPS and location utilities
├── workingHours.ts      # Working hours parsing
├── addressParser.ts     # Address parsing utilities
├── features.ts          # Feature management
├── navigation.ts        # Navigation utilities
└── storage.ts           # Local storage utilities

components/
├── FeatureBadges.tsx    # Toilet features display
├── FilterModal.tsx      # Advanced filtering
└── ImageGallery.tsx     # Photo viewer
```

### Key Features Implementation

1. **Location-based Search**: Uses device GPS to find nearby toilets
2. **Smart Filtering**: Multiple filter options with real-time results
3. **Offline Support**: Fallback calculations when API unavailable
4. **Modern UI**: Clean, intuitive interface with smooth animations

## Deployment

### Web Deployment
```bash
# Build for web
npm run build:web

# Deploy to your hosting provider
```

### Mobile Deployment
```bash
# Build for iOS/Android using EAS
npx eas build --platform all
```

## Environment Variables

```bash
# Required
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# Optional (for enhanced features)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

---

Built with ❤️ using Expo, React Native, and MongoDB