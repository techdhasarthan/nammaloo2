import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert, RefreshControl, SafeAreaView } from 'react-native';
import { Search, MapPin, Star, Clock, RefreshCw, Navigation, Filter, ChevronRight, User } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { getToilets, getTopRatedToilets, testConnection, searchToilets, Toilet } from '@/lib/api';
import { getCurrentLocation, LocationData, getToiletDistance } from '@/lib/location';
import { formatWorkingHours, getStatusColor, getStatusText } from '@/lib/workingHours';
import { getLocationDisplayName } from '@/lib/addressParser';
import FeatureBadges from '@/components/FeatureBadges';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [topRatedToilets, setTopRatedToilets] = useState<Toilet[]>([]);
  const [searchResults, setSearchResults] = useState<Toilet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [userLocationAddress, setUserLocationAddress] = useState<string>('Chennai');
  const [locationLoading, setLocationLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, userLocation]);

  const initializeApp = async () => {
    await getUserLocation();
    await loadToilets();
  };

  const getUserLocation = async () => {
    try {
      setLocationLoading(true);
      console.log('📍 === GETTING USER LOCATION FOR HOME SCREEN ===');
      const location = await getCurrentLocation();
      if (location) {
        setUserLocation(location);
        console.log('✅ Got user location for Home Screen:', location);
      } else {
        console.log('⚠️ Could not get user location, using default');
        setUserLocation({
          latitude: 12.9716,
          longitude: 77.5946
        });
        setUserLocationAddress('Chennai, Tamil Nadu');
      }
    } catch (error) {
      console.error('❌ Error getting location for Home Screen:', error);
      setUserLocation({
        latitude: 12.9716,
        longitude: 77.5946
      });
      setUserLocationAddress('Chennai, Tamil Nadu');
    } finally {
      setLocationLoading(false);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      console.log('🔍 === PERFORMING SEARCH ===');
      console.log(`Query: "${searchQuery}"`);
      
      const results = await searchToilets(searchQuery, userLocation || undefined);
      console.log(`📊 Search returned ${results.length} results`);
      
      setSearchResults(results);
      
      console.log(`✅ Search complete: ${results.length} results`);
    } catch (error) {
      console.error('❌ Error searching toilets:', error);
      setSearchResults([]);
    }
  };

  const loadToilets = async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionStatus('Testing connection...');
      
      const connectionResult = await testConnection();
      if (!connectionResult.success) {
        setConnectionStatus('Connection failed');
        setError(`Connection failed: ${connectionResult.error}`);
        console.error('Connection details:', connectionResult.details);
        return;
      }
      
      setConnectionStatus('Loading toilets...');
      
      console.log('🗺️ === LOADING ALL TOILETS ===');
      const allToilets = await getToilets(userLocation || undefined);
      
      console.log(`📊 Loaded ${allToilets.length} toilets`);
      setToilets(allToilets);
      
      console.log('⭐ === LOADING TOP RATED TOILETS ===');
      const topRated = await getTopRatedToilets(5, userLocation || undefined);
      
      console.log(`⭐ Loaded ${topRated.length} top rated toilets`);
      setTopRatedToilets(topRated);
      
      if (allToilets.length === 0) {
        setConnectionStatus('No toilets found');
        setError('The database appears to be empty. Please check if data has been imported.');
      } else {
        setConnectionStatus(`Connected`);
      }
      
    } catch (error: any) {
      console.error('❌ Error loading toilets:', error);
      setConnectionStatus('Error loading data');
      setError(error.message || 'Failed to load toilets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadToilets(), getUserLocation()]);
    setRefreshing(false);
  }, []);

  const getDistance = (toilet: Toilet): string => {
    return getToiletDistance(toilet, userLocation || undefined);
  };

  const navigateToToiletDetail = (toilet: Toilet) => {
    console.log('🚀 Navigating to toilet detail:', toilet.uuid);
    router.push({
      pathname: '/toilet-detail',
      params: { toiletId: toilet.uuid }
    });
  };

  const navigateToNearMe = () => {
    router.push('/near-me');
  };

  const navigateToTopRated = () => {
    router.push('/top-rated');
  };

  const navigateToOpenNow = () => {
    router.push('/open-now');
  };

  const getUserLocationText = () => {
    if (locationLoading) {
      return 'Getting location...';
    }
    return userLocationAddress;
  };

  const getDisplayToilets = () => {
    if (searchQuery.length > 0) {
      return searchResults;
    }
    return toilets;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingTitle}>Namma Loo</Text>
          <Text style={styles.loadingText}>{connectionStatus}</Text>
          {locationLoading && (
            <Text style={styles.loadingSubtext}>Getting your location...</Text>
          )}
          {error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.retryButton} onPress={loadToilets}>
            <RefreshCw size={18} color="#FFFFFF" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Modern Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.locationSection}>
              <View style={styles.locationBadge}>
                <MapPin size={16} color="#10B981" />
              </View>
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>Showing toilets near</Text>
                <Text style={styles.locationAddress} numberOfLines={1}>
                  {userLocation ? 'Current Location' : 'Chennai, Tamil Nadu'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.headerContent}>
            <Text style={styles.title}>Namma Loo</Text>
            <Text style={styles.subtitle}>Find clean toilets nearby</Text>
            
            {userLocation && (
              <View style={styles.statusIndicator}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Connected</Text>
              </View>
            )}
          </View>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search toilets, locations..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={styles.clearText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        {searchQuery.length === 0 && (
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.actionCard} onPress={navigateToNearMe}>
                <View style={[styles.actionIcon, { backgroundColor: '#3B82F6' }]}>
                  <MapPin size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.actionText}>Near Me</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionCard} onPress={navigateToTopRated}>
                <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
                  <Star size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.actionText}>Top Rated</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionCard} onPress={navigateToOpenNow}>
                <View style={[styles.actionIcon, { backgroundColor: '#EF4444' }]}>
                  <Clock size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.actionText}>Open Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Search Results */}
        {searchQuery.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Search Results ({getDisplayToilets().length})
            </Text>
            {getDisplayToilets().length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No results found</Text>
                <Text style={styles.emptySubtext}>
                  Try adjusting your search terms
                </Text>
              </View>
            ) : (
              getDisplayToilets().slice(0, 8).map((toilet) => (
                <TouchableOpacity 
                  key={toilet.uuid} 
                  style={styles.toiletCard}
                  onPress={() => navigateToToiletDetail(toilet)}
                >
                  <Image 
                    source={{ 
                      uri: toilet.image_url || 'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=200'
                    }} 
                    style={styles.toiletImage} 
                  />
                  
                  <View style={styles.toiletInfo}>
                    <Text style={styles.toiletName}>{toilet.name || 'Public Toilet'}</Text>
                    
                    <View style={styles.toiletMeta}>
                      <View style={styles.ratingContainer}>
                        <Star size={14} color="#F59E0B" fill="#F59E0B" />
                        <Text style={styles.ratingText}>{toilet.rating?.toFixed(1) || 'N/A'}</Text>
                      </View>
                      <Text style={styles.distance}>{getDistance(toilet)}</Text>
                      <View style={[styles.statusIndicatorSmall, { backgroundColor: getStatusColor(toilet.working_hours) }]} />
                    </View>
                    
                    <Text style={styles.address} numberOfLines={1}>
                      {getLocationDisplayName(toilet.address || '')}
                    </Text>
                    <View style={styles.featureBadgesContainer}>
                      <FeatureBadges toilet={toilet} maxBadges={3} size="small" />
                    </View>
                  </View>
                  
                  <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Top Rated Section */}
        {topRatedToilets.length > 0 && searchQuery.length === 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Highly Rated</Text>
              <TouchableOpacity onPress={navigateToTopRated}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContainer}
            >
              {topRatedToilets.map((toilet) => (
                <TouchableOpacity 
                  key={toilet.uuid} 
                  style={styles.featuredCard}
                  onPress={() => navigateToToiletDetail(toilet)}
                >
                  <Image 
                    source={{ 
                      uri: toilet.image_url || 'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=400'
                    }} 
                    style={styles.featuredImage} 
                  />
                  
                  <View style={styles.featuredOverlay}>
                    <View style={styles.featuredRating}>
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.featuredRatingText}>{toilet.rating?.toFixed(1) || 'N/A'}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.featuredContent}>
                    <Text style={styles.featuredName} numberOfLines={2}>
                      {toilet.name || 'Public Toilet'}
                    </Text>
                    <Text style={styles.featuredAddress} numberOfLines={1}>
                      {getLocationDisplayName(toilet.address || '')}
                    </Text>
                    <Text style={styles.featuredDistance}>{getDistance(toilet)}</Text>
                    <View style={styles.featureBadgesContainer}>
                      <FeatureBadges toilet={toilet} maxBadges={2} size="small" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Toilets */}
        {toilets.length > 0 && searchQuery.length === 0 && (
          <View style={[styles.section, { marginBottom: 40 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Toilets</Text>
              <TouchableOpacity onPress={navigateToNearMe}>
                <Text style={styles.seeAllText}>See All ({toilets.length})</Text>
              </TouchableOpacity>
            </View>
            
            {toilets.slice(0, 6).map((toilet) => (
              <TouchableOpacity 
                key={toilet.uuid} 
                style={styles.toiletCard}
                onPress={() => navigateToToiletDetail(toilet)}
              >
                <Image 
                  source={{ 
                    uri: toilet.image_url || 'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=200'
                  }} 
                  style={styles.toiletImage} 
                />
                
                <View style={styles.toiletInfo}>
                  <Text style={styles.toiletName}>{toilet.name || 'Public Toilet'}</Text>
                  
                  <View style={styles.toiletMeta}>
                    <View style={styles.ratingContainer}>
                      <Star size={14} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.ratingText}>{toilet.rating?.toFixed(1) || 'N/A'}</Text>
                    </View>
                    <Text style={styles.distance}>{getDistance(toilet)}</Text>
                    <View style={[styles.statusIndicatorSmall, { backgroundColor: getStatusColor(toilet.working_hours) }]} />
                  </View>
                  
                  <Text style={styles.address} numberOfLines={1}>
                    {getLocationDisplayName(toilet.address || '')}
                  </Text>
                  <View style={styles.featureBadgesContainer}>
                    <FeatureBadges toilet={toilet} maxBadges={3} size="small" />
                  </View>
                </View>
                
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State */}
        {toilets.length === 0 && !loading && (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyText}>No toilets found</Text>
            <Text style={styles.emptySubtext}>
              Check your connection and try again
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadToilets}>
              <RefreshCw size={18} color="#FFFFFF" />
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    maxWidth: 300,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  locationBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  searchSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
  quickActionsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  horizontalScrollContainer: {
    paddingLeft: 0,
    paddingRight: 16,
    paddingBottom: 20,
  },
  toiletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  toiletImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginRight: 16,
  },
  toiletInfo: {
    flex: 1,
  },
  toiletName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  toiletMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  distance: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusIndicatorSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  address: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 16,
    marginBottom: 8,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#F3F4F6',
  },
  featuredOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  featuredRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featuredContent: {
    padding: 12,
  },
  featuredName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 18,
  },
  featuredAddress: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  featuredDistance: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500',
    marginBottom: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  featureBadgesContainer: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});