import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Search, MapPin, Star, Clock, Navigation, Filter } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { fetchToilets, searchToilets, getTopRatedToilets, Toilet } from '@/lib/api';
import { getCurrentLocation, LocationData, formatDistance } from '@/lib/location';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [topRatedToilets, setTopRatedToilets] = useState<Toilet[]>([]);
  const [searchResults, setSearchResults] = useState<Toilet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const initializeApp = async () => {
    await getUserLocation();
    await loadToilets();
  };

  const getUserLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadToilets = async () => {
    try {
      setLoading(true);
      const [allToilets, topRated] = await Promise.all([
        fetchToilets(),
        getTopRatedToilets(5)
      ]);
      
      setToilets(allToilets);
      setTopRatedToilets(topRated);
    } catch (error) {
      console.error('Error loading toilets:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchToilets(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching toilets:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadToilets();
    setRefreshing(false);
  };

  const navigateToToiletDetail = (toilet: Toilet) => {
    router.push({
      pathname: '/toilet-detail',
      params: { toiletId: toilet._id }
    });
  };

  const navigateToTabs = () => {
    router.push('/(tabs)');
  };

  const getDistance = (toilet: Toilet): string => {
    if (toilet.distance !== undefined) {
      return formatDistance(toilet.distance);
    }
    return 'Distance unknown';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Namma Loo...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Namma Loo</Text>
            <Text style={styles.subtitle}>Find clean toilets nearby</Text>
            
            {userLocation && (
              <View style={styles.locationIndicator}>
                <MapPin size={16} color="#10B981" />
                <Text style={styles.locationText}>Location enabled</Text>
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
              <TouchableOpacity style={styles.actionCard} onPress={navigateToTabs}>
                <View style={[styles.actionIcon, { backgroundColor: '#3B82F6' }]}>
                  <MapPin size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.actionText}>Explore Map</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionCard} onPress={navigateToTabs}>
                <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
                  <Star size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.actionText}>Top Rated</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionCard} onPress={navigateToTabs}>
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
              Search Results ({searchResults.length})
            </Text>
            {searchResults.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No results found</Text>
                <Text style={styles.emptySubtext}>
                  Try adjusting your search terms
                </Text>
              </View>
            ) : (
              searchResults.map((toilet) => (
                <TouchableOpacity 
                  key={toilet._id} 
                  style={styles.toiletCard}
                  onPress={() => navigateToToiletDetail(toilet)}
                >
                  <Image 
                    source={{ uri: toilet.image_url }} 
                    style={styles.toiletImage} 
                  />
                  
                  <View style={styles.toiletInfo}>
                    <Text style={styles.toiletName}>{toilet.name}</Text>
                    
                    <View style={styles.toiletMeta}>
                      <View style={styles.ratingContainer}>
                        <Star size={14} color="#F59E0B" fill="#F59E0B" />
                        <Text style={styles.ratingText}>{toilet.rating.toFixed(1)}</Text>
                      </View>
                      <Text style={styles.distance}>{getDistance(toilet)}</Text>
                    </View>
                    
                    <Text style={styles.address} numberOfLines={1}>
                      {toilet.address}
                    </Text>
                  </View>
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
              <TouchableOpacity onPress={navigateToTabs}>
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
                  key={toilet._id} 
                  style={styles.featuredCard}
                  onPress={() => navigateToToiletDetail(toilet)}
                >
                  <Image 
                    source={{ uri: toilet.image_url }} 
                    style={styles.featuredImage} 
                  />
                  
                  <View style={styles.featuredOverlay}>
                    <View style={styles.featuredRating}>
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.featuredRatingText}>{toilet.rating.toFixed(1)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.featuredContent}>
                    <Text style={styles.featuredName} numberOfLines={2}>
                      {toilet.name}
                    </Text>
                    <Text style={styles.featuredAddress} numberOfLines={1}>
                      {toilet.city}
                    </Text>
                    <Text style={styles.featuredDistance}>{getDistance(toilet)}</Text>
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
              <TouchableOpacity onPress={navigateToTabs}>
                <Text style={styles.seeAllText}>See All ({toilets.length})</Text>
              </TouchableOpacity>
            </View>
            
            {toilets.slice(0, 6).map((toilet) => (
              <TouchableOpacity 
                key={toilet._id} 
                style={styles.toiletCard}
                onPress={() => navigateToToiletDetail(toilet)}
              >
                <Image 
                  source={{ uri: toilet.image_url }} 
                  style={styles.toiletImage} 
                />
                
                <View style={styles.toiletInfo}>
                  <Text style={styles.toiletName}>{toilet.name}</Text>
                  
                  <View style={styles.toiletMeta}>
                    <View style={styles.ratingContainer}>
                      <Star size={14} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.ratingText}>{toilet.rating.toFixed(1)}</Text>
                    </View>
                    <Text style={styles.distance}>{getDistance(toilet)}</Text>
                  </View>
                  
                  <Text style={styles.address} numberOfLines={1}>
                    {toilet.address}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
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
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
    textAlign: 'center',
    lineHeight: 20,
  },
});