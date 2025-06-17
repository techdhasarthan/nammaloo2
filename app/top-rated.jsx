import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';

// Mock data for top rated toilets
const mockTopRatedToilets = [
  {
    id: 'toilet-004',
    name: 'UB City Mall Premium Restroom',
    address: 'UB City Mall, Vittal Mallya Road, Bangalore',
    rating: 4.8,
    reviews: 156,
    distance: '1.2 km',
    duration: '4 mins',
    image_url: 'https://images.pexels.com/photos/6585759/pexels-photo-6585759.jpeg?auto=compress&cs=tinysrgb&w=400',
    working_hours: '10:00 AM - 11:00 PM',
    highlights: ['Premium', 'Accessible', 'Free']
  },
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
    highlights: ['Executive', 'Accessible', 'Free']
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
    highlights: ['Quality', 'Accessible', 'Free']
  }
];

export default function TopRatedPage() {
  const router = useRouter();
  const [toilets, setToilets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadToilets();
  }, []);

  const loadToilets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setToilets(mockTopRatedToilets);
    } catch (error) {
      console.error('Error loading top rated toilets:', error);
      setError('Failed to load top rated toilets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (rating) => {
    if (rating >= 4.8) return '#E74C3C'; // VIP
    if (rating >= 4.6) return '#8E44AD'; // Premium
    if (rating >= 4.4) return '#2980B9'; // Executive
    return '#34C759'; // Good
  };

  const getBadgeText = (rating) => {
    if (rating >= 4.8) return 'VIP';
    if (rating >= 4.6) return 'Premium';
    if (rating >= 4.4) return 'Executive';
    return 'Quality';
  };

  const navigateToToiletDetail = (toilet) => {
    router.push({
      pathname: '/toilet-detail',
      params: { 
        toiletId: toilet.id,
        name: toilet.name,
        address: toilet.address,
        rating: toilet.rating.toString(),
        reviews: toilet.reviews.toString(),
        distance: toilet.distance,
        image: toilet.image_url,
        isOpen: 'true',
        features: JSON.stringify(toilet.highlights || [])
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Top Rated</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <MaterialIcons name="emoji-events" size={48} color="#F59E0B" />
          <ActivityIndicator size="large" color="#F59E0B" style={styles.spinner} />
          <Text style={styles.loadingText}>Loading top rated toilets...</Text>
          <Text style={styles.loadingSubtext}>
            Finding the highest quality facilities for you...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Top Rated</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.errorContainer}>
          <MaterialIcons name="emoji-events" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Unable to Load Top Rated</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={loadToilets}
          >
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
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
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top Rated</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <View style={styles.resultsHeaderContent}>
          <MaterialIcons name="emoji-events" size={18} color="#F59E0B" />
          <Text style={styles.resultsCount}>{toilets.length} highly rated toilets</Text>
        </View>
        <Text style={styles.resultsSubtext}>
          Sorted by rating • With accurate distances
        </Text>
      </View>

      {/* Toilet List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {toilets.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="emoji-events" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Top Rated Toilets</Text>
            <Text style={styles.emptyStateText}>
              We couldn't find any highly rated toilets in your area. Check back later as we add more locations.
            </Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={loadToilets}
            >
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={styles.retryButtonText}>Refresh</Text>
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
                <View style={styles.topBadge}>
                  <MaterialIcons name="emoji-events" size={16} color="#FFD700" />
                  <Text style={styles.topBadgeText}>#1 Rated</Text>
                </View>
              )}
              
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
                    <View style={[styles.badge, { backgroundColor: getBadgeColor(toilet.rating) }]}>
                      <Text style={styles.badgeText}>{getBadgeText(toilet.rating)}</Text>
                    </View>
                  </View>
                  <View style={styles.distanceContainer}>
                    <Ionicons name="location" size={12} color="#007AFF" />
                    <Text style={styles.distanceText}>{toilet.distance}</Text>
                  </View>
                </View>

                <Text style={styles.toiletAddress} numberOfLines={1}>
                  {toilet.address}
                </Text>

                <View style={styles.ratingRow}>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>{toilet.rating.toFixed(1)}</Text>
                    <Text style={styles.reviewCount}>({toilet.reviews} reviews)</Text>
                  </View>
                </View>

                <View style={styles.hoursRow}>
                  <Ionicons name="time" size={12} color="#666" />
                  <Text style={styles.hoursText}>
                    {toilet.working_hours}
                  </Text>
                </View>

                <View style={styles.highlightsContainer}>
                  {toilet.highlights.map((highlight, index) => (
                    <View key={index} style={styles.highlightTag}>
                      <Text style={styles.highlightText}>"{highlight}"</Text>
                    </View>
                  ))}
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
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
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
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
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
  topBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  topBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 4,
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameContainer: {
    flex: 1,
    marginRight: 12,
  },
  toiletName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  toiletAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
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
  highlightsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  highlightTag: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  highlightText: {
    fontSize: 11,
    color: '#856404',
    fontWeight: '500',
    fontStyle: 'italic',
  },
});