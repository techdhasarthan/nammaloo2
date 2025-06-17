import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, MapPin, Clock, CircleCheck as CheckCircle, RefreshCw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';

// Mock data for open toilets
const mockOpenToilets = [
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
    highlights: ['24/7', 'Accessible', 'Shower']
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
    highlights: ['Premium', 'Accessible', 'Free']
  }
];

export default function OpenNowPage() {
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
      setToilets(mockOpenToilets);
    } catch (error) {
      console.error('Error loading open toilets:', error);
      setError('Failed to load open toilets. Please try again.');
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
            <ArrowLeft size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Open Now</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <Clock size={48} color="#10B981" />
          <ActivityIndicator size="large" color="#10B981" style={styles.spinner} />
          <Text style={styles.loadingText}>Finding open toilets...</Text>
          <Text style={styles.loadingSubtext}>
            Checking real-time availability and operating hours...
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
            <ArrowLeft size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Open Now</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.errorContainer}>
          <Clock size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Unable to Check Status</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={loadToilets}
          >
            <RefreshCw size={16} color="#fff" />
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
          <ArrowLeft size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Open Now</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <View style={styles.resultsHeaderContent}>
          <CheckCircle size={18} color="#10B981" />
          <Text style={styles.resultsCount}>{toilets.length} toilets currently open</Text>
        </View>
        <Text style={styles.resultsSubtext}>
          Real-time availability • With accurate distances
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
            <Clock size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Open Toilets</Text>
            <Text style={styles.emptyStateText}>
              No toilets appear to be open right now. This might be due to limited operating hours or temporary closures. Please check back later.
            </Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={loadToilets}
            >
              <RefreshCw size={16} color="#fff" />
              <Text style={styles.retryButtonText}>Check Again</Text>
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
              <View style={styles.openBadge}>
                <CheckCircle size={14} color="#34C759" fill="#34C759" />
                <Text style={styles.openBadgeText}>OPEN</Text>
              </View>
              
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
                    <MapPin size={12} color="#007AFF" />
                    <Text style={styles.distanceText}>{toilet.distance}</Text>
                  </View>
                </View>

                <Text style={styles.toiletAddress} numberOfLines={1}>
                  {toilet.address}
                </Text>

                <View style={styles.ratingRow}>
                  <View style={styles.ratingContainer}>
                    <Star size={16} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.ratingText}>{toilet.rating.toFixed(1)}</Text>
                    <Text style={styles.reviewCount}>({toilet.reviews} reviews)</Text>
                  </View>
                </View>

                <View style={styles.hoursRow}>
                  <Clock size={12} color="#666" />
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
  openBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  openBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
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