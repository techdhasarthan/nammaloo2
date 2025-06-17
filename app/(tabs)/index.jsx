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
} from 'react-native';
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  AntDesign,
  Feather,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';

// Mock toilet data for homepage
const mockToilets = [
  {
    _id: '1',
    uuid: '1',
    name: 'Phoenix MarketCity Mall Restroom',
    address: 'Whitefield Main Road, Mahadevapura, Bangalore',
    rating: 4.5,
    reviews: 127,
    distance: '2.3 km',
    duration: '8 mins',
    image_url:
      'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=400',
    working_hours: '10:00 AM - 10:00 PM',
    status: 'open',
    features: ['Premium', 'Accessible', 'Free', 'WiFi'],
    type: 'Mall',
    is_paid: 'No',
    wheelchair: 'Yes',
    location: {
      latitude: 12.9716,
      longitude: 77.5946,
    },
  },
  {
    _id: '2',
    uuid: '2',
    name: 'Cubbon Park Public Toilet',
    address: 'Cubbon Park, Kasturba Road, Bangalore',
    rating: 4.2,
    reviews: 89,
    distance: '1.8 km',
    duration: '6 mins',
    image_url:
      'https://images.pexels.com/photos/6585756/pexels-photo-6585756.jpeg?auto=compress&cs=tinysrgb&w=400',
    working_hours: '6:00 AM - 8:00 PM',
    status: 'open',
    features: ['Clean', 'Free', 'Accessible'],
    type: 'Public',
    is_paid: 'No',
    wheelchair: 'Yes',
    location: {
      latitude: 12.9716,
      longitude: 77.5946,
    },
  },
  {
    _id: '3',
    uuid: '3',
    name: 'UB City Mall Premium Restroom',
    address: 'UB City Mall, Vittal Mallya Road, Bangalore',
    rating: 4.8,
    reviews: 156,
    distance: '1.2 km',
    duration: '4 mins',
    image_url:
      'https://images.pexels.com/photos/6585759/pexels-photo-6585759.jpeg?auto=compress&cs=tinysrgb&w=400',
    working_hours: '10:00 AM - 11:00 PM',
    status: 'open',
    features: ['VIP', 'Premium', 'Accessible', 'Free'],
    type: 'Mall',
    is_paid: 'No',
    wheelchair: 'Yes',
    location: {
      latitude: 12.9716,
      longitude: 77.5946,
    },
  },
  {
    _id: '4',
    uuid: '4',
    name: 'Bangalore Railway Station Restroom',
    address: 'Kempegowda Railway Station, Bangalore',
    rating: 3.8,
    reviews: 234,
    distance: '3.1 km',
    duration: '12 mins',
    image_url:
      'https://images.pexels.com/photos/6585758/pexels-photo-6585758.jpeg?auto=compress&cs=tinysrgb&w=400',
    working_hours: '24 Hours',
    status: 'open',
    features: ['24/7', 'Accessible', 'Shower'],
    type: 'Transport',
    is_paid: 'Yes',
    wheelchair: 'Yes',
    location: {
      latitude: 12.9716,
      longitude: 77.5946,
    },
  },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [toilets, setToilets] = useState([]);
  const [topRatedToilets, setTopRatedToilets] = useState([]);
  const [filteredToilets, setFilteredToilets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const router = useRouter();

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      performSearch();
    } else {
      setFilteredToilets(toilets);
    }
  }, [searchQuery, toilets]);

  const initializeApp = async () => {
    await loadToilets();
  };

  const loadToilets = async () => {
    try {
      setLoading(true);

      // Simulate API loading delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setToilets(mockToilets);
      setTopRatedToilets(
        mockToilets.sort((a, b) => b.rating - a.rating).slice(0, 3)
      );
      setFilteredToilets(mockToilets);

      // Mock user location
      setUserLocation({
        latitude: 12.9716,
        longitude: 77.5946,
      });
    } catch (error) {
      console.error('Error loading toilets:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = () => {
    const results = mockToilets.filter(
      (toilet) =>
        toilet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        toilet.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredToilets(results);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadToilets();
    setRefreshing(false);
  }, []);

  const navigateToToiletDetail = (toilet) => {
    router.push({
      pathname: '/toilet-detail',
      params: {
        toiletId: toilet.uuid || toilet._id,
        name: toilet.name,
        address: toilet.address,
        rating: toilet.rating.toString(),
        reviews: toilet.reviews.toString(),
        distance: toilet.distance,
        image: toilet.image_url,
        isOpen: toilet.status === 'open' ? 'true' : 'false',
        features: JSON.stringify(toilet.features || []),
      },
    });
  };

  const navigateToNearMe = () => {
    console.log('clicking near-me');
    // router.push('/near-me');
  };

  const navigateToTopRated = () => {
    console.log('clicking top-rated');
    // router.push('/top-rated');
  };

  const navigateToOpenNow = () => {
    console.log('clicking open-now');
    // router.push('/open-now');
  };

  const getStatusColor = (status) => {
    return status === 'open' ? '#10B981' : '#EF4444';
  };

  const getBadgeColor = (rating) => {
    if (rating >= 4.8) return '#E74C3C';
    if (rating >= 4.6) return '#8E44AD';
    if (rating >= 4.4) return '#2980B9';
    return '#34C759';
  };

  const getBadgeText = (rating) => {
    if (rating >= 4.8) return 'VIP';
    if (rating >= 4.6) return 'Premium';
    if (rating >= 4.4) return 'Executive';
    return 'Quality';
  };

  const renderFeatureIcon = (feature) => {
    switch (feature.toLowerCase()) {
      case 'wifi':
        return <MaterialIcons name="wifi" size={12} color="#3B82F6" />;
      case 'accessible':
        return <MaterialIcons name="accessible" size={12} color="#10B981" />;
      case 'parking':
        return <Ionicons name="car" size={12} color="#6B7280" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingTitle}>Namma Loo</Text>
          <Text style={styles.loadingText}>Loading toilets near you...</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadToilets}>
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.locationSection}>
              <View style={styles.locationBadge}>
                <Ionicons name="location" size={16} color="#10B981" />
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
              onPress={() => router.push('/(tabs)/profile')}
            >
              <View style={styles.profileIcon}>
                <Ionicons name="person" size={20} color="#FFFFFF" />
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
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              placeholder="Search toilets..."
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        {searchQuery.length === 0 && (
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={navigateToNearMe}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="navigate" size={24} color="#3B82F6" />
                </View>
                <Text style={styles.quickActionTitle}>Near Me</Text>
                <Text style={styles.quickActionSubtitle}>
                  Find closest toilets
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={navigateToTopRated}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="star" size={24} color="#F59E0B" />
                </View>
                <Text style={styles.quickActionTitle}>Top Rated</Text>
                <Text style={styles.quickActionSubtitle}>Highest quality</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={navigateToOpenNow}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="time" size={24} color="#10B981" />
                </View>
                <Text style={styles.quickActionTitle}>Open Now</Text>
                <Text style={styles.quickActionSubtitle}>
                  Currently available
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Top Rated Section */}
        {searchQuery.length === 0 && topRatedToilets.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Rated Toilets</Text>
              <TouchableOpacity onPress={navigateToTopRated}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {topRatedToilets.map((toilet) => (
                <TouchableOpacity
                  key={toilet._id}
                  style={styles.topRatedCard}
                  onPress={() => navigateToToiletDetail(toilet)}
                >
                  <Image
                    source={{ uri: toilet.image_url }}
                    style={styles.topRatedImage}
                  />
                  <View style={styles.topRatedContent}>
                    <Text style={styles.topRatedName} numberOfLines={1}>
                      {toilet.name}
                    </Text>
                    <View style={styles.topRatedRating}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.topRatedRatingText}>
                        {toilet.rating}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Toilets Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery.length > 0
              ? `Search Results (${filteredToilets.length})`
              : 'All Toilets'}
          </Text>

          {filteredToilets.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="location" size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>
                {searchQuery.length > 0
                  ? 'No toilets found'
                  : 'No toilets available'}
              </Text>
              <Text style={styles.emptyStateText}>
                {searchQuery.length > 0
                  ? `No toilets match "${searchQuery}". Try a different search term.`
                  : "We couldn't find any toilets in your area. Please try again later."}
              </Text>
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearSearchButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={styles.clearSearchText}>Clear Search</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredToilets.map((toilet) => (
              <TouchableOpacity
                key={toilet._id}
                style={styles.toiletCard}
                onPress={() => navigateToToiletDetail(toilet)}
              >
                <Image
                  source={{ uri: toilet.image_url }}
                  style={styles.toiletImage}
                />

                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.nameContainer}>
                      <Text style={styles.toiletName} numberOfLines={1}>
                        {toilet.name}
                      </Text>
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: getBadgeColor(toilet.rating) },
                        ]}
                      >
                        <Text style={styles.badgeText}>
                          {getBadgeText(toilet.rating)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.distanceContainer}>
                      <Ionicons name="location" size={12} color="#3B82F6" />
                      <Text style={styles.distanceText}>{toilet.distance}</Text>
                    </View>
                  </View>

                  <Text style={styles.toiletAddress} numberOfLines={1}>
                    {toilet.address}
                  </Text>

                  <View style={styles.ratingRow}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#F59E0B" />
                      <Text style={styles.ratingText}>{toilet.rating}</Text>
                      <Text style={styles.reviewCount}>
                        ({toilet.reviews} reviews)
                      </Text>
                    </View>

                    <View style={styles.statusContainer}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: getStatusColor(toilet.status) },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(toilet.status) },
                        ]}
                      >
                        {toilet.status === 'open' ? 'Open' : 'Closed'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.hoursRow}>
                    <Ionicons name="time" size={12} color="#6B7280" />
                    <Text style={styles.hoursText}>{toilet.working_hours}</Text>
                  </View>

                  <View style={styles.featuresContainer}>
                    {toilet.features.slice(0, 3).map((feature, index) => (
                      <View key={index} style={styles.featureTag}>
                        {renderFeatureIcon(feature)}
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                    {toilet.features.length > 3 && (
                      <View style={styles.moreFeatures}>
                        <Text style={styles.moreText}>
                          +{toilet.features.length - 3}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.favoriteButton}>
                    <Ionicons name="heart" size={16} color="#EF4444" />
                  </TouchableOpacity>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    marginTop: 40,
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
    marginTop: 40,
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
    marginBottom: 20,
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
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  filterButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionsSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
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
  horizontalScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  topRatedCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topRatedImage: {
    width: '100%',
    height: 80,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  topRatedContent: {
    padding: 12,
  },
  topRatedName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  topRatedRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topRatedRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  toiletCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  toiletImage: {
    width: 100,
    height: 120,
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameContainer: {
    flex: 1,
    marginRight: 12,
  },
  toiletName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  toiletAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
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
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  hoursText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  featureText: {
    fontSize: 10,
    color: '#0369A1',
    fontWeight: '500',
  },
  moreFeatures: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  moreText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  cardActions: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingRight: 16,
  },
  favoriteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  clearSearchButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearSearchText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
