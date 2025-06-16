import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Navigation,
  Share,
  Bookmark,
  Info,
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data for toilet details
const mockToiletDetails = {
  'toilet-001': {
    id: 'toilet-001',
    name: 'Phoenix MarketCity Mall Restroom',
    address: 'Whitefield Main Road, Mahadevapura, Bangalore',
    rating: 4.5,
    reviews: 127,
    distance: '2.3 km',
    duration: '8 mins',
    image_url: 'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=400',
    working_hours: '10:00 AM - 10:00 PM',
    is_paid: 'No',
    wheelchair: 'Yes',
    gender: 'Unisex',
    baby: 'Yes',
    shower: 'No',
    westernorindian: 'Western',
    description: 'Clean and well-maintained restroom facility located in Phoenix MarketCity Mall. Features modern amenities and accessibility options.',
    features: ['Free', 'Wheelchair Accessible', 'Baby Changing', 'Western Style', 'Unisex']
  },
  'toilet-002': {
    id: 'toilet-002',
    name: 'Cubbon Park Public Toilet',
    address: 'Cubbon Park, Kasturba Road, Bangalore',
    rating: 4.2,
    reviews: 89,
    distance: '1.8 km',
    duration: '6 mins',
    image_url: 'https://images.pexels.com/photos/6585756/pexels-photo-6585756.jpeg?auto=compress&cs=tinysrgb&w=400',
    working_hours: '6:00 AM - 8:00 PM',
    is_paid: 'No',
    wheelchair: 'Yes',
    gender: 'Separate',
    baby: 'Yes',
    shower: 'No',
    westernorindian: 'Both',
    description: 'Public restroom facility in the heart of Cubbon Park. Well-maintained with separate facilities for men and women.',
    features: ['Free', 'Wheelchair Accessible', 'Baby Changing', 'Both Styles', 'Separate Facilities']
  }
};

export default function ToiletDetailPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [toilet, setToilet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const toiletId = params.toiletId;
    if (toiletId) {
      loadToiletData(toiletId);
    }
  }, [params.toiletId]);

  const loadToiletData = async (toiletId) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const toiletData = mockToiletDetails[toiletId] || mockToiletDetails['toilet-001'];
      setToilet(toiletData);
    } catch (error) {
      console.error('Error loading toilet data:', error);
      Alert.alert('Error', 'Failed to load toilet details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirections = () => {
    Alert.alert('Directions', 'Opening navigation app...');
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    Alert.alert(
      isSaved ? 'Removed' : 'Saved',
      isSaved ? 'Toilet removed from saved list.' : 'Toilet saved to your favorites!'
    );
  };

  const handleShare = () => {
    Alert.alert('Share', 'Sharing toilet information...');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading toilet details...</Text>
      </View>
    );
  }

  if (!toilet) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Toilet not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: toilet.image_url }}
          style={styles.headerImage}
        />
        <SafeAreaView style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1a1a1a" />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Info */}
        <View style={styles.infoSection}>
          <Text style={styles.toiletName}>{toilet.name}</Text>
          <Text style={styles.toiletAddress}>{toilet.address}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{toilet.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({toilet.reviews} reviews)</Text>
            </View>
            
            <View style={styles.distanceContainer}>
              <MapPin size={16} color="#34C759" />
              <Text style={styles.distanceText}>{toilet.distance}</Text>
              <Text style={styles.durationText}>• {toilet.duration}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleDirections}
          >
            <Navigation size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Navigate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleSave}
          >
            <Bookmark
              size={20}
              color={isSaved ? '#FFFFFF' : '#007AFF'}
              fill={isSaved ? '#FFFFFF' : 'none'}
            />
            <Text style={[
              styles.secondaryButtonText,
              isSaved && styles.savedButtonText
            ]}>
              {isSaved ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleShare}
          >
            <Share size={20} color="#007AFF" />
            <Text style={styles.secondaryButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Working Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Working Hours</Text>
          <View style={styles.hoursContainer}>
            <Clock size={20} color="#34C759" />
            <Text style={styles.hoursText}>{toilet.working_hours}</Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features & Amenities</Text>
          <View style={styles.featuresContainer}>
            {toilet.features.map((feature, index) => (
              <View key={index} style={styles.featureBadge}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{toilet.description}</Text>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Cost:</Text>
              <Text style={styles.detailValue}>{toilet.is_paid === 'No' ? 'Free' : 'Paid'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Accessibility:</Text>
              <Text style={styles.detailValue}>{toilet.wheelchair === 'Yes' ? 'Wheelchair Accessible' : 'Not Accessible'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gender:</Text>
              <Text style={styles.detailValue}>{toilet.gender}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>{toilet.westernorindian}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  imageContainer: {
    height: SCREEN_HEIGHT * 0.3,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  infoSection: {
    padding: 20,
    paddingBottom: 16,
  },
  toiletName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  toiletAddress: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
    marginLeft: 6,
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  savedButtonText: {
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hoursText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  featureText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
});