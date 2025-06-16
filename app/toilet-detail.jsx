import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  getToiletById,
  getReviewsForToilet,
  createReview,
  createReport,
  createOrGetAnonymousUser,
} from '@/lib/supabase';
import {
  getCurrentLocation,
  getToiletDistance,
} from '@/lib/location';
import { openGoogleMaps } from '@/lib/navigation';
import { saveToilet, unsaveToilet, isToiletSaved } from '@/lib/storage';
import ToiletDetailHeader from '@/components/ToiletDetailHeader';
import ToiletInfoPanel from '@/components/ToiletInfoPanel';
import ShareModal from '@/components/ShareModal';
import ImageGallery from '@/components/ImageGallery';
import LoadingScreen from '@/components/LoadingScreen';
import ToiletDetailTabs from '@/components/ToiletDetailTabs';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ToiletDetailPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [toilet, setToilet] = useState(null);
  const [reviews, setReviews] = useState([]);
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
  const [userLocation, setUserLocation] = useState(null);

  const toiletImages = [
    toilet?.image_url ||
      'https://via.placeholder.com/800x600.png?text=Toilet+Image',
    'https://via.placeholder.com/800x600.png?text=Toilet+Image+2',
    'https://via.placeholder.com/800x600.png?text=Toilet+Image+3',
  ];

  useEffect(() => {
    const toiletId = params.toiletId;
    if (toiletId) {
      initializePage(toiletId);
    }
  }, [params.toiletId]);

  useEffect(() => {
    if (toilet) {
      checkIfSaved();
    }
  }, [toilet]);

  const initializePage = async (toiletId) => {
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

  const loadToiletData = async (toiletId) => {
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

  const getDistance = () => {
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
      
      <ToiletDetailHeader onBackPress={() => router.back()} />
      
      <ToiletInfoPanel
        toilet={toilet}
        getDistance={getDistance}
        isSaved={isSaved}
        onDirections={handleDirections}
        onSave={handleSave}
        onShare={handleShare}
        onReviewPress={() => setReviewModalVisible(true)}
        onReportPress={() => setReportModalVisible(true)}
        onImagePress={handleImagePress}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        renderTabContent={() => (
          <ToiletDetailTabs
            activeTab={activeTab}
            toilet={toilet}
            reviews={reviews}
            toiletImages={toiletImages}
            onImagePress={handleImagePress}
            onReviewPress={() => setReviewModalVisible(true)}
          />
        )}
      />

      {/* Modals */}
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
  mapContainer: {
    height: SCREEN_HEIGHT * 0.4,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
});