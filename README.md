# Namma Loo - Smart Toilet Finder

A beautiful React Native app built with Expo that helps users find clean, accessible toilets near them with Google OAuth authentication via Supabase.

## Features

### 🔐 Authentication
- **Google OAuth** integration via Supabase
- **Email/Password** authentication fallback
- **Password reset** functionality
- **User profiles** with avatar support
- **Secure session management**

### 🚻 Toilet Finding
- **Smart search** with real-time results
- **Google Maps integration** for accurate distances
- **Advanced filtering** (rating, distance, features, accessibility)
- **Recently viewed** toilets tracking
- **Save favorites** for quick access

### 📱 Beautiful UI
- **Modern design** with smooth animations
- **Responsive layout** for all screen sizes
- **Dark/Light mode** support
- **Intuitive navigation** with tab-based layout
- **Image galleries** for toilet photos

### 🗺️ Location Features
- **GPS integration** for accurate positioning
- **Google Distance Matrix API** for real-time distances
- **Area name parsing** from addresses
- **Offline fallback** distance calculations

## Setup Instructions

### 1. Supabase Configuration

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Enable Google OAuth**:
   - Go to Authentication > Providers in your Supabase dashboard
   - Enable the Google provider
   - Add your Google OAuth credentials:
     - Client ID: Get from [Google Cloud Console](https://console.cloud.google.com)
     - Client Secret: Get from Google Cloud Console
   - Set authorized redirect URIs:
     - For development: `http://localhost:8081`
     - For production: `https://yourdomain.com`

3. **Configure environment variables**:
   ```bash
   # .env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run database migrations**:
   - The app includes migration files in `supabase/migrations/`
   - These will set up the required tables and authentication policies

### 2. Google Maps API Setup

1. **Get a Google Maps API key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Enable the Distance Matrix API
   - Create an API key

2. **Add to environment**:
   ```bash
   # In lib/location.ts, replace the API key
   const GOOGLE_MAPS_API_KEY = 'your_google_maps_api_key';
   ```

### 3. Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Authentication Flow

### Login Page
- Beautiful gradient design with hero image
- Google OAuth button (primary)
- Email/password form (fallback)
- Sign up and password reset options
- Responsive design for all devices

### Protected Routes
- All main app routes require authentication
- Automatic redirect to login if not authenticated
- Session persistence across app restarts
- Secure logout functionality

### User Profile
- Display user information from Google/email
- Avatar from Google profile or generated placeholder
- Provider badge showing authentication method
- Edit profile and settings options

## Database Schema

### Authentication Tables
- `auth.users` - Supabase built-in user table
- `user_profiles` - Extended user information
- All user data protected with Row Level Security (RLS)

### App Tables
- `kakoos` - Toilet locations and information
- `reviews` - User reviews with auth integration
- `saved_toilets` - User's saved toilets
- `reports` - Issue reports with auth tracking

## Security Features

- **Row Level Security (RLS)** on all user data
- **JWT-based authentication** via Supabase
- **Secure API endpoints** with proper authorization
- **Input validation** and sanitization
- **HTTPS enforcement** in production

## Development

### Project Structure
```
app/
├── _layout.tsx          # Root layout with auth check
├── login.tsx            # Authentication page
├── (tabs)/              # Main app (protected)
│   ├── index.tsx        # Home screen
│   ├── map.tsx          # Map view
│   └── profile.tsx      # User profile
└── toilet-detail.tsx    # Toilet details

lib/
├── auth.ts              # Authentication utilities
├── supabase.ts          # Database operations
├── location.ts          # GPS and Google Maps
└── filtering.ts         # Search and filter logic

components/
├── FilterModal.tsx      # Advanced filtering
├── ImageGallery.tsx     # Photo viewer
└── FeatureBadges.tsx    # Toilet features display
```

### Key Features Implementation

1. **Global Distance Cache**: Loads all toilet distances once for instant results
2. **Progressive Loading**: Shows fallback distances immediately, updates with Google data
3. **Recent Toilets Cache**: Tracks viewed toilets for quick access
4. **Advanced Filtering**: Multiple filter options with real-time results
5. **Offline Support**: Fallback calculations when Google API unavailable

## Deployment

### Web Deployment
```bash
# Build for web
npm run build:web

# Deploy to your hosting provider
# (Vercel, Netlify, etc.)
```

### Mobile Deployment
```bash
# Build for iOS/Android using EAS
npx eas build --platform all
```

## Environment Variables

```bash
# Required
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

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

## Support

For issues and questions:
- Check the GitHub issues
- Review the Supabase documentation
- Check the Expo documentation

---

Built with ❤️ using Expo, React Native, and Supabase