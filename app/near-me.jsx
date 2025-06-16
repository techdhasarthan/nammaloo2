import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, MapPin, Clock, RefreshCw, Navigation } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';

// Mock data for nearby toilets
const mockNearbyToilets = [
  {
    id: 'toilet-001',
    name: 'Phoenix MarketCity Mall Restroom',
    address: 'Whitefield Main Road, Mahadevapura, Bangalore',
    rating: 4.5,
    reviews: 127,
    distance: '2.3 km',
    duration: '8 mins',
    image_url: 'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=400',
    working_hours: '10:00 AM - 10:00 PM',
    status: 'open'
  },
  {
    id: 'toilet-002',
    name: 'Cubbon Park Public Toilet',
    address: 'Cubbon Park, Kasturba Road, Bangalore',
    rating: 4.2,
    reviews: 89,
    distance: '1.8 km',
    duration: '6 mins',
    image_url: 'https://images.pexels.com/photos/6585756/pexels-photo-6585756.jpeg?auto=compress&cs=tinysrgb&w=400',
    working_hours: '6:00 AM - 8:00 PM',
    status: 'open'
  },
  {
    id: 'toilet-003',
    name: 'Bangalore Railway Station Restroom',
    address: 'Kempegowda Railway Station, Bangalore',
    rating: 3.8,
    reviews: 234,
    distance: '3.1 km',
    duration: '12 mins',
    image_url: 'https://images.pexels.com/photos/6585758/pexels-photo-6585758.jpeg?auto=compress&cs=tinysrgb&w=400',
    working_hours: '24 Hours',
    status: 'open'
  }
];

export default function NearMePage() {
  const router = useRouter();
  const [toilets, setToilets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNearbyToilets();
  }, []);

  const loadNearbyToilets = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setToilets(mockNearbyToilets);
    } catch (error) {
      console.error('Error loading nearby toilets:', error);
      Alert.alert('Error', 'Failed to load nearby toilets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshToilets = async () => {
    await loadNearbyToilets();
  };

  const navigateToToiletDetail = (toilet) => {
    router.push({
      pathname: '/toilet-detail',
      params: { toiletId: toilet.id }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return '#34C759';
      case 'closed':
        return '#FF3B30';
      default:
        return '#FF9500';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Navigation size={48} color="#007AFF" />
          <ActivityIndicator size="large" color="#007AFF" style={styles.spinner} />
          <Text style={styles.loadingText}>Finding nearby toilets...</Text>
          <Text style={styles.loadingSubtext}>
            Getting your location and calculating distances...
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
          <MapPin size={18} color="#34C759" />
          <Text style={styles.resultsCount}>
            {toilets.length} toilets found nearby
          </Text>
        </View>
        <Text style={styles.resultsSubtext}>
          Within 5km • Sorted by distance
        </Text>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {toilets.length === 0 ? (
          <View style={styles.emptyState}>
            <MapPin size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Nearby Toilets</Text>
            <Text style={styles.emptyStateText}>
              No toilets found within 10km of your location.
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
              key={toilet.id} 
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
                source={{ uri: toilet.image_url }} 
                style={styles.toiletImage} 
              />
              
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.toiletName} numberOfLines={1}>
                    {toilet.name}
                  </Text>
                  <View style={styles.distanceContainer}>
                    <MapPin size={12} color="#007AFF" />
                    <Text style={styles.distanceText}>
                      {toilet.distance}
                    </Text>
                  </View>
                </View>

                <View style={styles.ratingRow}>
                  <View style={styles.ratingContainer}>
                    <Star size={14} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.ratingText}>{toilet.rating.toFixed(1)}</Text>
                    <Text style={styles.reviewCount}>({toilet.reviews})</Text>
                  </View>
                  
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(toilet.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(toilet.status) }]}>
                      {toilet.status === 'open' ? 'Open Now' : 'Closed'}
                    </Text>
                  </View>
                </View>

                <View style={styles.hoursRow}>
                  <Clock size={12} color="#666" />
                  <Text style={styles.hoursText}>
                    {toilet.working_hours}
                  </Text>
                </View>

                <View style={styles.durationRow}>
                  <Clock size={12} color="#666" />
                  <Text style={styles.durationText}>
                    {toilet.duration} drive
                  </Text>
                </View>
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
    color: '#007AFF',
    marginLeft: 4,
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
    marginBottom: 8,
  },
  hoursText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
});