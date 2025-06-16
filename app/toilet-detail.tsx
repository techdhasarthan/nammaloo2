import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Modal,
  TextInput,
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
  Info,
  X,
  Send,
  MessageSquare,
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  getToiletById,
  getReviewsForToilet,
  createReview,
  createReport,
  createOrGetAnonymousUser,
  Toilet,
  Review,
} from '@/lib/api';
import {
  getCurrentLocation,
  LocationData,
  getToiletDistance,
} from '@/lib/location';
import {
  formatWorkingHours,
  getStatusColor,
  getStatusText,
  getDetailedHours,
} from '@/lib/workingHours';
import { openGoogleMaps } from '@/lib/navigation';
import FeatureBadges from '@/components/FeatureBadges';

export default function ToiletDetailPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [toilet, setToilet] = useState<Toilet | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reportText, setReportText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    const toiletId = params.toiletId as string;
    if (toiletId) {
      initializePage(toiletId);
    }
  }, [params.toiletId]);

  const initializePage = async (toiletId: string) => {
    try {
      setLoading(true);
      await Promise.all([getUserLocation(), loadToiletData(toiletId)]);
    } catch (error) {
      console.error('Initialization error:', error);
      Alert.alert('Error', 'Failed to initialize page.');
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location || { latitude: 12.9716, longitude: 77.5946 });
    } catch (error) {
      console.error('Error getting location:', error);
      setUserLocation({ latitude: 12.9716, longitude: 77.5946 });
    }
  };

  const loadToiletData = async (toiletId: string) => {
    try {
      const [toiletData, reviewsData] = await Promise.all([
        getToiletById(toiletId, userLocation || undefined),
        getReviewsForToilet(toiletId),
      ]);
      setToilet(toiletData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading toilet data:', error);
      throw error;
    }
  };

  const handleSubmitReview = async () => {
    if (!toilet || !reviewText.trim()) {
      Alert.alert('Error', 'Please enter a review.');
      return;
    }

    try {
      setSubmitting(true);
      const user = await createOrGetAnonymousUser();
      if (!user) throw new Error('Failed to create anonymous user');

      const newReview = await createReview(
        toilet.uuid,
        user.name,
        reviewText.trim(),
        reviewRating
      );
      if (newReview) {
        setReviewText('');
        setReviewRating(5);
        setReviewModalVisible(false);
        const updatedReviews = await getReviewsForToilet(toilet.uuid);
        setReviews(updatedReviews);
        Alert.alert('Success', 'Review submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!toilet || !reportText.trim()) {
      Alert.alert('Error', 'Please describe the issue.');
      return;
    }

    try {
      setSubmitting(true);
      const user = await createOrGetAnonymousUser();
      if (!user) throw new Error('Failed to create anonymous user');

      const newReport = await createReport(
        toilet.uuid,
        user.name,
        reportText.trim()
      );
      if (newReport) {
        setReportText('');
        setReportModalVisible(false);
        Alert.alert('Success', 'Report submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDirections = async () => {
    if (!toilet || !toilet.latitude || !toilet.longitude) {
      Alert.alert('Error', 'Location coordinates not available.');
      return;
    }

    try {
      await openGoogleMaps({
        latitude: toilet.latitude,
        longitude: toilet.longitude,
        name: toilet.name || 'Public Toilet',
        address: toilet.address || undefined,
      });
    } catch (error) {
      console.error('Error opening directions:', error);
      Alert.alert('Error', 'Could not open navigation app.');
    }
  };

  const getDistance = (): string => {
    if (!toilet || !userLocation) return 'Distance unknown';
    return getToiletDistance(toilet, userLocation);
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
      
      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Main Image */}
        <Image
          source={{
            uri: toilet.image_url || 'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=800'
          }}
          style={styles.mainImage}
        />

        {/* Toilet Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.toiletName}>
            {toilet.name || 'Public Toilet'}
          </Text>
          <Text style={styles.toiletAddress}>
            {toilet.address || 'Address not available'}
          </Text>
          
          <View style={styles.metaRow}>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>
                {toilet.rating?.toFixed(1) || 'N/A'}
              </Text>
              <Text style={styles.reviewCount}>
                ({toilet.reviews || 0} reviews)
              </Text>
            </View>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: getStatusColor(
                      toilet.working_hours ?? ''
                    ),
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(toilet.working_hours ?? '') },
                ]}
              >
                {getStatusText(toilet.working_hours ?? '')}
              </Text>
            </View>
          </View>
          
          <View style={styles.distanceRow}>
            <Navigation size={16} color="#34C759" />
            <Text style={styles.distanceText}>{getDistance()}</Text>
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
            onPress={() => setReviewModalVisible(true)}
          >
            <Star size={20} color="#007AFF" />
            <Text style={styles.secondaryButtonText}>Rate</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => setReportModalVisible(true)}
        >
          <MessageSquare size={16} color="#FF3B30" />
          <Text style={styles.reportButtonText}>Report Issue</Text>
        </TouchableOpacity>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features & Amenities</Text>
          <FeatureBadges
            toilet={toilet}
            maxBadges={12}
            size="large"
            showAll={true}
          />
        </View>

        {/* Working Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Working Hours</Text>
          <View style={styles.hoursContainer}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: getStatusColor(
                    toilet.working_hours ?? ''
                  ),
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(toilet.working_hours ?? '') },
              ]}
            >
              {getStatusText(toilet.working_hours ?? '')}
            </Text>
          </View>
          <Text style={styles.hoursText}>
            {formatWorkingHours(toilet.working_hours ?? '')}
          </Text>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>
              Reviews ({reviews.length})
            </Text>
            <TouchableOpacity
              style={styles.addReviewButton}
              onPress={() => setReviewModalVisible(true)}
            >
              <Text style={styles.addReviewText}>Add Review</Text>
            </TouchableOpacity>
          </View>
          {reviews.length === 0 ? (
            <Text style={styles.noReviewsText}>
              No reviews yet. Be the first to review!
            </Text>
          ) : (
            reviews.map((review) => (
              <View key={review._id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>
                      {(review.user_name || 'A')
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.reviewInfo}>
                    <Text style={styles.reviewUser}>
                      {review.user_name || 'Anonymous'}
                    </Text>
                    <View style={styles.reviewRating}>
                      {[...Array(review.rating || 0)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          color="#FFD700"
                          fill="#FFD700"
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.reviewComment}>
                  {review.review_text}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
              <X size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Write a Review</Text>
            <TouchableOpacity
              onPress={handleSubmitReview}
              disabled={submitting}
            >
              <Send size={24} color={submitting ? '#ccc' : '#007AFF'} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalLabel}>Rating</Text>
            <View style={styles.ratingSelector}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  onPress={() => setReviewRating(rating)}
                >
                  <Star
                    size={32}
                    color="#FFD700"
                    fill={rating <= reviewRating ? '#FFD700' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.modalLabel}>Review</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="Share your experience..."
              multiline
              numberOfLines={6}
              value={reviewText}
              onChangeText={setReviewText}
              textAlignVertical="top"
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Report Modal */}
      <Modal
        visible={reportModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setReportModalVisible(false)}>
              <X size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Report Issue</Text>
            <TouchableOpacity
              onPress={handleSubmitReport}
              disabled={submitting}
            >
              <Send size={24} color={submitting ? '#ccc' : '#007AFF'} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalLabel}>Describe the issue</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="Please describe the issue you encountered..."
              multiline
              numberOfLines={6}
              value={reportText}
              onChangeText={setReportText}
              textAlignVertical="top"
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 10,
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
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 40,
  },
  mainImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  infoContainer: {
    padding: 20,
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
    marginBottom: 12,
  },
  metaRow: {
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
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '500',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
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
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#FF3B30',
    gap: 6,
    marginBottom: 20,
  },
  reportButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 20,
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
    marginBottom: 8,
  },
  hoursText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addReviewButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addReviewText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noReviewsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  reviewItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewComment: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  ratingSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: '#f8f9fa',
  },
});