import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Star, MapPin, Clock } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchToiletById, Toilet } from '@/lib/api';

export default function ToiletDetailPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [toilet, setToilet] = useState<Toilet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const toiletId = params.toiletId as string;
    if (toiletId) {
      loadToiletData(toiletId);
    }
  }, [params.toiletId]);

  const loadToiletData = async (toiletId: string) => {
    try {
      setLoading(true);
      const toiletData = await fetchToiletById(toiletId);
      setToilet(toiletData);
    } catch (error) {
      console.error('Error loading toilet data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Toilet Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image */}
        <Image 
          source={{ uri: toilet.image_url }} 
          style={styles.toiletImage} 
        />

        {/* Content */}
        <View style={styles.content}>
          {/* Basic Info */}
          <View style={styles.basicInfo}>
            <Text style={styles.toiletName}>{toilet.name}</Text>
            <Text style={styles.toiletAddress}>{toilet.address}</Text>
            
            <View style={styles.metaRow}>
              <View style={styles.ratingContainer}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text style={styles.ratingText}>{toilet.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>({toilet.reviews} reviews)</Text>
              </View>
            </View>
          </View>

          {/* Working Hours */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Working Hours</Text>
            <View style={styles.hoursContainer}>
              <Clock size={20} color="#666" />
              <Text style={styles.hoursText}>
                {toilet.working_hours || 'Hours not available'}
              </Text>
            </View>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features & Amenities</Text>
            <View style={styles.featuresGrid}>
              <View style={styles.featureItem}>
                <Text style={styles.featureLabel}>Payment</Text>
                <Text style={styles.featureValue}>
                  {toilet.is_paid === 'Yes' ? 'Paid' : 'Free'}
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <Text style={styles.featureLabel}>Accessibility</Text>
                <Text style={styles.featureValue}>
                  {toilet.wheelchair === 'Yes' ? 'Wheelchair Accessible' : 'Not Accessible'}
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <Text style={styles.featureLabel}>Gender</Text>
                <Text style={styles.featureValue}>{toilet.gender}</Text>
              </View>
              
              <View style={styles.featureItem}>
                <Text style={styles.featureLabel}>Baby Care</Text>
                <Text style={styles.featureValue}>
                  {toilet.baby === 'Yes' ? 'Available' : 'Not Available'}
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <Text style={styles.featureLabel}>Shower</Text>
                <Text style={styles.featureValue}>
                  {toilet.shower === 'Yes' ? 'Available' : 'Not Available'}
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <Text style={styles.featureLabel}>Toilet Type</Text>
                <Text style={styles.featureValue}>{toilet.westernorindian}</Text>
              </View>
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationContainer}>
              <MapPin size={20} color="#007AFF" />
              <View style={styles.locationInfo}>
                <Text style={styles.locationText}>{toilet.address}</Text>
                <Text style={styles.locationSubtext}>{toilet.city}, {toilet.state}</Text>
              </View>
            </View>
          </View>
        </View>
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
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
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
  headerButton: {
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
  scrollView: {
    flex: 1,
  },
  toiletImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 20,
  },
  basicInfo: {
    marginBottom: 24,
  },
  toiletName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  toiletAddress: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
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
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  hoursText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  featuresGrid: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  featureLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  featureValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  locationSubtext: {
    fontSize: 14,
    color: '#666',
  },
});