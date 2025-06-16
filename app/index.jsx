// REDESIGNED HomeScreen - Modern, Minimalistic & Clean
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert, RefreshControl, SafeAreaView } from 'react-native';
import { Search, MapPin, Star, Clock, RefreshCw, Navigation, Share, Filter, ChevronRight, User } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { getToilets, getTopRatedToilets, testConnection, searchToilets } from '@/lib/supabase';
import { getCurrentLocation, getToiletDistance } from '@/lib/location';
import { globalDistanceCache } from '@/lib/globalDistanceCache';
import { formatWorkingHours, getStatusColor, getStatusText } from '@/lib/workingHours';
import { getLocationDisplayName } from '@/lib/addressParser';
import { recentToiletCache } from '@/lib/recentToiletCache';
import FeatureBadges from '@/components/FeatureBadges';
import FilterModal, { defaultFilters } from '@/components/FilterModal';
import { applyFilters, getFilterSummary, getActiveFilterCount } from '@/lib/filtering';
import ShareModal from '@/components/ShareModal';
import QuickActions from '@/components/QuickActions';
import SearchSection from '@/components/SearchSection';
import ToiletList from '@/components/ToiletList';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [toilets, setToilets] = useState([]);
  const [topRatedToilets, setTopRatedToilets] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [filteredToilets, setFilteredToilets] = useState([]);
  const [recentToilets, setRecentToilets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userLocationAddress, setUserLocationAddress] = useState('Chennai');
  const [locationLoading, setLocationLoading] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedToilet, setSelectedToilet] = useState(null);
  const [currentFilters, setCurrentFilters] = useState(defaultFilters);
  const [globalCacheStatus, setGlobalCacheStatus] = useState('');
  const router = useRouter();

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      performSearch();
    } else {
      applyFiltersToToilets();
    }
  }, [searchQuery, userLocation, toilets, currentFilters]);

  const initializeApp = async () => {
    await getUserLocation();
    await loadToilets();
    
    recentToiletCache.subscribe((recentToilets) => {
      const viewedToilets = recentToilets.filter(toilet => toilet.viewCount > 0);
      setRecentToilets(viewedToilets);
    });
  };

  const applyFiltersToToilets = async () => {
    try {
      const filtered = applyFilters(toilets, currentFilters, userLocation || undefined);
      setFilteredToilets(filtered);
      setSearchResults([]);
    } catch (error) {
      console.error('Error applying filters:', error);
      setFilteredToilets(toilets);
    }
  };

  const getUserLocation = async () => {
    try {
      setLocationLoading(true);
      console.log('📍 === GETTING USER LOCATION FOR HOME SCREEN ===');
      const location = await getCurrentLocation();
      if (location) {
        setUserLocation(location);
        console.log('✅ Got user location for Home Screen:', location);
        
        setGlobalCacheStatus('Initializing global distance cache...');
        await globalDistanceCache.initializeCache(location);
        setGlobalCacheStatus(`Global cache loaded with ${globalDistanceCache.getCacheSize()} distances`);
        
        globalDistanceCache.subscribe((cache) => {
          setGlobalCacheStatus(`Global cache: ${cache.size} distances loaded`);
          if (toilets.length > 0) {
            setToilets([...toilets]);
          }
          if (topRatedToilets.length > 0) {
            setTopRatedToilets([...topRatedToilets]);
          }
        });
        
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
      console.log('🔍 === PERFORMING SEARCH WITH GLOBAL CACHE ===');
      console.log(`Query: "${searchQuery}"`);
      
      const results = await searchToilets(searchQuery, userLocation || undefined);
      console.log(`📊 Search returned ${results.length} results`);
      
      const filtered = applyFilters(results, currentFilters, userLocation || undefined);
      setSearchResults(filtered);
      
      console.log(`✅ Search complete: ${filtered.length} filtered results`);
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
      
      const filtered = applyFilters(allToilets, currentFilters, userLocation || undefined);
      setFilteredToilets(filtered);
      
    } catch (error) {
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

  const handleApplyFilters = async (filters) => {
    console.log('🔍 Applying new filters:', filters);
    setCurrentFilters(filters);
  };

  const getDistance = (toilet) => {
    return getToiletDistance(toilet, userLocation || undefined);
  };

  const navigateToToiletDetail = (toilet) => {
    console.log('🚀 Navigating to toilet detail:', toilet.uuid);
    recentToiletCache.addRecentView(toilet);
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

  const handleShareToilet = (toilet) => {
    setSelectedToilet(toilet);
    setShareModalVisible(true);
  };

  const getDisplayToilets = () => {
    if (searchQuery.length > 0) {
      return searchResults;
    }
    return filteredToilets;
  };

  const activeFilterCount = getActiveFilterCount(currentFilters);

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
        {/* Modern Header with Location and Profile */}
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
            
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => router.push('/profile')}
            >
              <View style={styles.profileIcon}>
                <User size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
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
        <SearchSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilterCount={activeFilterCount}
          currentFilters={currentFilters}
          setFilterModalVisible={setFilterModalVisible}
          setCurrentFilters={setCurrentFilters}
        />

        {/* Quick Actions */}
        {searchQuery.length === 0 && activeFilterCount === 0 && (
          <QuickActions
            navigateToNearMe={navigateToNearMe}
            navigateToTopRated={navigateToTopRated}
            navigateToOpenNow={navigateToOpenNow}
          />
        )}

        {/* Toilet Lists */}
        <ToiletList
          searchQuery={searchQuery}
          activeFilterCount={activeFilterCount}
          displayToilets={getDisplayToilets()}
          topRatedToilets={topRatedToilets}
          recentToilets={recentToilets}
          toilets={toilets}
          getDistance={getDistance}
          navigateToToiletDetail={navigateToToiletDetail}
          navigateToTopRated={navigateToTopRated}
          navigateToNearMe={navigateToNearMe}
        />

        {/* Modals */}
        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApplyFilters={handleApplyFilters}
          currentFilters={currentFilters}
        />

        {selectedToilet && (
          <ShareModal
            visible={shareModalVisible}
            onClose={() => {
              setShareModalVisible(false);
              setSelectedToilet(null);
            }}
            toilet={selectedToilet}
          />
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
  profileButton: {
    padding: 4,
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
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
});