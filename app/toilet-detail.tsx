import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  Alert,
  Animated,
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
  X,
  Send,
  MessageSquare,
  Camera,
  Image as ImageIcon,
  Wifi,
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getToiletById,
  getReviewsForToilet,
  createReview,
  createReport,
  createOrGetAnonymousUser,
  Toilet,
  Review,
} from '@/lib/supabase';
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
import { saveToilet, unsaveToilet, isToiletSaved } from '@/lib/storage';
import FeatureBadges from '@/components/FeatureBadges';
import ShareModal from '@/components/ShareModal';
import ImageGallery from '@/components/ImageGallery';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const LoadingScreen: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  return (
    <View style={loadingStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        style={[
          loadingStyles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            loadingStyles.iconContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={loadingStyles.iconCircle}>
            <MapPin size={32} color="#FFFFFF" />
          </View>
          <View style={loadingStyles.ripple1} />
          <View style={loadingStyles.ripple2} />
          <View style={loadingStyles.ripple3} />
        </Animated.View>

        <View style={loadingStyles.textContainer}>
          <Text style={loadingStyles.mainText}>Finding Your Comfort</Text>
          <Text style={loadingStyles.subText}>
            Loading real-time toilet details...
          </Text>
          <View style={loadingStyles.dotsContainer}>
            <Animated.View
              style={[loadingStyles.dot, { opacity: pulseAnim }]}
            />
            <Animated.View
              style={[loadingStyles.dot, { opacity: pulseAnim }]}
            />
            <Animated.View
              style={[loadingStyles.dot, { opacity: pulseAnim }]}
            />
          </View>
        </View>

        <View style={loadingStyles.featuresContainer}>
          <View style={loadingStyles.featureItem}>
            <Wifi size={20} color="#10B981" />
            <Text style={loadingStyles.featureText}>Live Data</Text>
          </View>
          <View style={loadingStyles.featureItem}>
            <Navigation size={20} color="#10B981" />
            <Text style={loadingStyles.featureText}>Accurate Distance</Text>
          </View>
          <View style={loadingStyles.featureItem}>
            <Star size={20} color="#10B981" />
            <Text style={loadingStyles.featureText}>User Reviews</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const ToiletDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'reviews' | 'photos' | 'about'
  >('overview');
  const [toilet, setToilet] = useState<Toilet | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [imageGalleryVisible, setImageGalleryVisible] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reportText, setReportText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);

  const toiletImages = [
    toilet?.image_url ||
      'https://via.placeholder.com/800x600.png?text=Toilet+Image',
    'https://via.placeholder.com/800x600.png?text=Toilet+Image+2',
    'https://via.placeholder.com/800x600.png?text=Toilet+Image+3',
  ];

  useEffect(() => {
    const toiletId = params.toiletId as string;
    if (toiletId) {
      initializePage(toiletId);
    }
  }, [params.toiletId]);

  useEffect(() => {
    if (toilet) {
      checkIfSaved();
    }
  }, [toilet]);

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

  const checkIfSaved = async () => {
    if (toilet) {
      const saved = await isToiletSaved(toilet.uuid);
      setIsSaved(saved);
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
        user.id,
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
        user.id,
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

  const handleSave = async () => {
    if (!toilet) return;

    try {
      if (isSaved) {
        await unsaveToilet(toilet.uuid);
        setIsSaved(false);
        Alert.alert('Removed', 'Toilet removed from saved list.');
      } else {
        await saveToilet(toilet);
        setIsSaved(true);
        Alert.alert('Saved', 'Toilet saved to your favorites!');
      }
    } catch (error) {
      console.error('Error saving toilet:', error);
      Alert.alert('Error', 'Could not save toilet.');
    }
  };

  const handleShare = () => {
    setShareModalVisible(true);
  };

  const handleImagePress = () => {
    setImageGalleryVisible(true);
  };

  const getDistance = (): string => {
    if (!toilet || !userLocation) return 'Distance unknown';
    return getToiletDistance(toilet, userLocation);
  };

  const renderMap = () => {
    if (!toilet || !toilet.latitude || !toilet.longitude) {
      return (
        <View style={styles.webMapContainer}>
          <Image
            source={{
              uri: 'https://via.placeholder.com/800x600.png?text=Map+Placeholder',
            }}
            style={styles.mapImage}
          />
          <View style={styles.mapOverlay} />
          <View style={styles.webMapInfo}>
            <Text style={styles.webMapText}>Location not available</Text>
          </View>
        </View>
      );
    }

    if (Platform.OS === 'web') {
      return (
        <View style={styles.webMapContainer}>
          <Image
            source={{
              uri: 'https://via.placeholder.com/800x600.png?text=Map+Placeholder',
            }}
            style={styles.mapImage}
          />
          <View style={styles.mapOverlay} />
          <View style={styles.markerContainer}>
            <View style={styles.redMarker}>
              <View style={styles.markerPin} />
              <View style={styles.markerShadow} />
            </View>
          </View>
          <View style={styles.webMapInfo}>
            <Text style={styles.webMapText}>{toilet.name}</Text>
            <Text style={styles.webMapSubtext}>Distance: {getDistance()}</Text>
          </View>
        </View>
      );
    }

    try {
      const MapView = require('react-native-maps').default;
      const Marker = require('react-native-maps').Marker;
      const PROVIDER_GOOGLE = require('react-native-maps').PROVIDER_GOOGLE;

      return (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: toilet.latitude,
            longitude: toilet.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
        >
          <Marker
            coordinate={{
              latitude: toilet.latitude,
              longitude: toilet.longitude,
            }}
            title={toilet.name || 'Public Toilet'}
            description={toilet.address || ''}
          >
            <View style={styles.customRedMarker}>
              <View style={styles.markerPin} />
              <View style={styles.markerShadow} />
            </View>
          </Marker>
        </MapView>
      );
    } catch (error) {
      console.error('Map rendering error:', error);
      return (
        <View style={styles.webMapContainer}>
          <Image
            source={{
              uri: 'https://via.placeholder.com/800x600.png?text=Map+Placeholder',
            }}
            style={styles.mapImage}
          />
          <View style={styles.mapOverlay} />
          <View style={styles.webMapInfo}>
            <Text style={styles.webMapText}>Map unavailable</Text>
          </View>
        </View>
      );
    }
  };

  const renderTabContent = () => {
    if (!toilet) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContentContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Features & Amenities</Text>
              <FeatureBadges
                toilet={toilet}
                maxBadges={12}
                size="large"
                showAll={true}
              />
            </View>

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
              <View style={styles.detailedHours}>
                {getDetailedHours(toilet.working_hours ?? '').map(
                  (hourLine, index) => (
                    <Text key={index} style={styles.hourLine}>
                      {hourLine}
                    </Text>
                  )
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location & Distance</Text>
              {toilet.address && (
                <View style={styles.contactItem}>
                  <MapPin size={20} color="#007AFF" />
                  <Text style={styles.contactText}>{toilet.address}</Text>
                </View>
              )}
              {toilet.city && (
                <View style={styles.contactItem}>
                  <MapPin size={20} color="#007AFF" />
                  <Text style={styles.contactText}>
                    {toilet.city}, {toilet.state}
                  </Text>
                </View>
              )}
              <View style={styles.contactItem}>
                <Navigation size={20} color="#34C759" />
                <Text style={styles.contactText}>
                  Distance: {getDistance()}
                </Text>
                {toilet.isGoogleDistance && (
                  <Text style={styles.googleBadgeDetail}>📍 Google Maps</Text>
                )}
              </View>
              {toilet.durationText && (
                <View style={styles.contactItem}>
                  <Clock size={20} color="#FF9500" />
                  <Text style={styles.contactText}>
                    Drive time: {toilet.durationText}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );

      case 'reviews':
        return (
          <View style={styles.tabContentContainer}>
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
                  <View key={review.id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>
                          {(review.user_profiles?.full_name || 'A')
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.reviewInfo}>
                        <Text style={styles.reviewUser}>
                          {review.user_profiles?.full_name || 'Anonymous'}
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
          </View>
        );

      case 'photos':
        return (
          <View style={styles.tabContentContainer}>
            <View style={styles.section}>
              <View style={styles.photosHeader}>
                <Text style={styles.sectionTitle}>
                  Photos ({toiletImages.length})
                </Text>
                <TouchableOpacity
                  style={styles.viewAllPhotosButton}
                  onPress={handleImagePress}
                >
                  <ImageIcon size={16} color="#007AFF" />
                  <Text style={styles.viewAllPhotosText}>View All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.photosGrid}>
                {toiletImages.slice(0, 6).map((imageUrl, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.photoItem}
                    onPress={handleImagePress}
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.photoImage}
                    />
                    {index === 5 && toiletImages.length > 6 && (
                      <View style={styles.photoOverlay}>
                        <Text style={styles.photoOverlayText}>
                          +{toiletImages.length - 6}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 'about':
        return (
          <View style={styles.tabContentContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About This Location</Text>
              <Text style={styles.aboutText}>
                {toilet.name || 'Public Toilet'} - A public restroom facility
                providing essential services to the community.
              </Text>
              <Text style={styles.sectionTitle}>Accessibility</Text>
              <Text style={styles.aboutText}>
                {toilet.wheelchair === 'Yes'
                  ? 'Fully wheelchair accessible with appropriate facilities.'
                  : 'Please check accessibility features before visiting.'}
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingScreen />;
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
      <View style={styles.mapContainer}>{renderMap()}</View>
      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </SafeAreaView>
      <View style={styles.infoPanel}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={true}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <View style={styles.panelHeader}>
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
              {toilet.isGoogleDistance && (
                <Text style={styles.googleBadgeDetail}>📍 Google Maps</Text>
              )}
              {toilet.durationText && (
                <Text style={styles.durationDetail}>
                  • {toilet.durationText} drive
                </Text>
              )}
            </View>
          </View>

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
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.secondaryButton,
                isSaved && styles.savedButton,
              ]}
              onPress={handleSave}
            >
              <Bookmark
                size={20}
                color={isSaved ? '#FFFFFF' : '#007AFF'}
                fill={isSaved ? '#FFFFFF' : 'none'}
              />
              <Text
                style={[
                  styles.secondaryButtonText,
                  isSaved && styles.savedButtonText,
                ]}
              >
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

          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => setReportModalVisible(true)}
          >
            <MessageSquare size={16} color="#FF3B30" />
            <Text style={styles.reportButtonText}>Report Issue</Text>
          </TouchableOpacity>

          <View style={styles.imageSection}>
            <TouchableOpacity onPress={handleImagePress}>
              <Image
                source={{
                  uri:
                    toilet.image_url ||
                    'https://via.placeholder.com/400x200.png?text=Toilet+Image',
                }}
                style={styles.mainImage}
              />
              <View style={styles.imageOverlay}>
                <View style={styles.imageGalleryIndicator}>
                  <ImageIcon size={16} color="#FFFFFF" />
                  <Text style={styles.imageGalleryText}>
                    {toiletImages.length} Photos
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabsScroll}
            >
              {[
                { key: 'overview', label: 'Overview', icon: Info },
                { key: 'reviews', label: 'Reviews', icon: MessageSquare },
                { key: 'photos', label: 'Photos', icon: Camera },
                { key: 'about', label: 'About', icon: Info },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.tab,
                    activeTab === tab.key && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab(tab.key as any)}
                >
                  <tab.icon
                    size={16}
                    color={activeTab === tab.key ? '#007AFF' : '#666'}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab.key && styles.activeTabText,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {renderTabContent()}
        </ScrollView>
      </View>

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

      {toilet && (
        <ShareModal
          visible={shareModalVisible}
          onClose={() => setShareModalVisible(false)}
          toilet={toilet}
        />
      )}

      <ImageGallery
        visible={imageGalleryVisible}
        onClose={() => setImageGalleryVisible(false)}
        images={toiletImages}
        title={toilet.name || 'Toilet Photos'}
      />
    </View>
  );
};

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  ripple1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
  },
  ripple2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    zIndex: 0,
  },
  ripple3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    zIndex: -1,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mainText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 20,
  },
  featureItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    flex: 1,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});

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
  mapContainer: {
    height: SCREEN_HEIGHT * 0.4,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  webMapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  markerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -30 }],
  },
  redMarker: {
    position: 'relative',
    alignItems: 'center',
  },
  markerPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EA4335',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  markerShadow: {
    position: 'absolute',
    top: 25,
    width: 20,
    height: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    transform: [{ scaleX: 1.5 }],
  },
  customRedMarker: {
    alignItems: 'center',
    position: 'relative',
  },
  webMapInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 8,
    maxWidth: 200,
  },
  webMapText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  webMapSubtext: {
    fontSize: 12,
    color: '#666',
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
  infoPanel: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 40,
  },
  panelHeader: {
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
  googleBadgeDetail: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  durationDetail: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
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
  savedButton: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  savedButtonText: {
    color: '#FFFFFF',
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
  imageSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  imageGalleryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  imageGalleryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tabsContainer: {
    marginBottom: 20,
    paddingLeft: 20,
  },
  tabsScroll: {
    flexGrow: 0,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#e3f2fd',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
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
  detailedHours: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  hourLine: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#333',
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
  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllPhotosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  viewAllPhotosText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoItem: {
    width: (SCREEN_WIDTH - 56) / 3,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOverlayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aboutText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 16,
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

export default ToiletDetailPage;
