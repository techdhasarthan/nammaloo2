import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, MapPin, Clock, RefreshCw, Navigation } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { getToilets, Toilet } from '@/lib/api';
import { formatWorkingHours, getStatusColor, getStatusText } from '@/lib/workingHours';
import { getCurrentLocation, LocationData, formatDistance } from '@/lib/location';
import FeatureBadges from '@/components/FeatureBadges';

export default function NearMePage() {
  const router = useRouter();
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    initializePage();
  }, []);

  useEffect(() => {
    if (!locationLoading && userLocation) {
      loadNearbyToilets();
    }
  }, [userLocation, locationLoading]);

  const initializePage = async () => {
    console.log('🚀 === INITIALIZING NEAR ME PAGE ===');
    await loadUserLocation();
  };

  const loadUserLocation = async () => {
    try {
      console.log('📍 === GETTING USER LOCATION FOR NEAR ME ===');
      setLocationLoading(true);
      setLocationError(null);
      
      const location = await getCurrentLocation();
      
      if (location) {
        setUserLocation(location);
        console.log('✅ Successfully got user location for Near Me:', {
          lat: location.latitude.toFixed(6),
          lng: location.longitude.toFixed(6),
          accuracy: location.accuracy ? location.accuracy + 'm' : 'unknown'
        });
      } else {
        setLocationError('Unable to get your location. Please enable location services and try again.');
        console.log('❌ Failed to get user location');
      }
    } catch (error) {
      console.error('❌ Error getting location for Near Me:', error);
      setLocationError('Error accessing location. Please check permissions and try again.');
      setUserLocation(null);
    } finally {
      setLocationLoading(false);
    }
  };

  const loadNearbyToilets = async () => {
    try {
      setLoading(true);
      console.log('🗺️ === LOADING NEARBY TOILETS ===');
      console.log('📍 User location:', userLocation);
      
      if (!userLocation) {
        console.log('⚠️ No user location - cannot load nearby toilets');
        setToilets([]);
        return;
      }

      const nearbyToilets = await getToilets(userLocation);
      
      console.log('📊 Nearby toilets received:', nearbyToilets.length);
      setToilets(nearbyToilets);
      
    } catch (error) {
      console.error('❌ Error loading nearby toilets:', error);
      Alert.alert(
        'Error Loading Toilets', 
        'Failed to load nearby toilets. Please check your internet connection and try again.',
        [
          { text: 'Retry', onPress: loadNearbyToilets },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetryLocation = async () => {
    console.log('🔄 Retrying location and toilets...');
    await loadUserLocation();
  };

  const handleRefreshToilets = async () => {
    if (userLocation) {
      await loadNearbyToilets();
    } else {
      await handleRetryLocation();
    }
  };

  const navigateToToiletDetail = (toilet: Toilet) => {
    console.log('🚀 Navigating to toilet detail:', toilet.uuid);
    router.push({
      pathname: '/toilet-detail',
      params: { toiletId: toilet.uuid }
    });
  };

  const getDistance = (toilet: Toilet): string => {
    if (toilet.distanceText && toilet.distanceText !== 'Unknown') {
      return toilet.distanceText;
    }
    
    if (toilet.distance !== undefined && toilet.distance < 999) {
      return formatDistance(toilet.distance);
    }
    
    return 'Distance unknown';
  };

  if (loading || locationLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Navigation size={48} color="#007AFF" />
          <ActivityIndicator size="large" color="#007AFF" style={styles.spinner} />
          <Text style={styles.loadingText}>
            {locationLoading ? 'Getting your location...' : 'Finding nearby toilets...'}
          </Text>
          <Text style={styles.loadingSubtext}>
            {locationLoading 
              ? 'Please allow location access for accurate results'
              : 'Calculating distances...'
            }
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Near Me</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefreshToilets}
          disabled={loading}
        >
          <RefreshCw 
            size={20} 
            color={loading ? "#ccc" : "#007AFF"} 
          />
        </TouchableOpacity>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <View style={styles.resultsHeaderContent}>
          <MapPin size={18} color={userLocation ? "#34C759" : "#FF9500"} />
          <Text style={styles.resultsCount}>
            {userLocation 
              ? `${toilets.length} toilets found nearby`
              : 'Location required'
            }
          </Text>
        </View>
        <Text style={styles.resultsSubtext}>
          {userLocation 
            ? `Sorted by distance`
            : locationError || 'Enable location to find nearby toilets'
          }
        </Text>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {!userLocation ? (
          <View style={styles.emptyState}>
            <Navigation size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>Location Required</Text>
            <Text style={styles.emptyStateText}>
              {locationError || 'Please enable location services to find toilets near you.'}
            </Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={handleRetryLocation}
              disabled={locationLoading}
            >
              <Navigation size={16} color="#fff" />
              <Text style={styles.retryButtonText}>
                {locationLoading ? 'Getting Location...' : 'Enable Location'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : toilets.length === 0 ? (
          <View style={styles.emptyState}>
            <MapPin size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Nearby Toilets</Text>
            <Text style={styles.emptyStateText}>
              No toilets found in your area. This might be due to:
              {'\n'}• Limited data in your area
              {'\n'}• Connectivity issues
              {'\n'}• Location accuracy
            </Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={handleRefreshToilets}
              disabled={loading}
            >
              <RefreshCw size={16} color="#fff" />
              <Text style={styles.retryButtonText}>
                {loading ? 'Searching...' : 'Try Again'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          toilets.map((toilet, index) => (
            <TouchableOpacity 
              key={toilet.uuid} 
              style={styles.toiletCard}
              onPress={() => navigateToToiletDetail(toilet)}
              activeOpacity={0.7}
            >
              {index === 0 && (
                <View style={styles.closestBadge}>
                  <Text style={styles.closestBadgeText}>CLOSEST</Text>
                </View>
              )}
              
              <Image 
                source={{ 
                  uri: toilet.image_url || 'https://images.pexels.com/photos/6585756/pexels-photo-6585756.jpeg?auto=compress&cs=tinysrgb&w=400'
                }} 
                style={styles.toiletImage} 
              />
              
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.toiletName} numberOfLines={1}>
                    {toilet.name || 'Public Toilet'}
                  </Text>
                  <View style={styles.distanceContainer}>
                    <MapPin size={12} color="#007AFF" />
                    <Text style={styles.distanceText}>
                      {getDistance(toilet)}
                    </Text>
                  </View>
                </View>

                <View style={styles.ratingRow}>
                  <View style={styles.ratingContainer}>
                    <Star size={14} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.ratingText}>{toilet.rating?.toFixed(1) || 'N/A'}</Text>
                    {toilet.reviews && (
                      <Text style={styles.reviewCount}>({toilet.reviews})</Text>
                    )}
                  </View>
                  
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(toilet.working_hours) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(toilet.working_hours) }]}>
                      {getStatusText(toilet.working_hours)}
                    </Text>
                  </View>
                </View>

                <View style={styles.hoursRow}>
                  <Clock size={12} color="#666" />
                  <Text style={styles.hoursText}>
                    {formatWorkingHours(toilet.working_hours)}
                  </Text>
                </View>

                <FeatureBadges toilet={toilet} maxBadges={3} size="small" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  spinner: {
    marginTop: 16,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultsHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  resultsCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  resultsSubtext: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toiletCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  closestBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(52, 199, 89, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  closestBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  toiletImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toiletName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 12,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: '#007AFF',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hoursText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
});