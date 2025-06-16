import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Star, MapPin, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { fetchToilets, getTopRatedToilets, Toilet } from '@/lib/api';
import { getCurrentLocation, LocationData, formatDistance } from '@/lib/location';

export default function HomeTabScreen() {
  const router = useRouter();
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [topRatedToilets, setTopRatedToilets] = useState<Toilet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    initializeTab();
  }, []);

  const initializeTab = async () => {
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
        getTopRatedToilets(10)
      ]);
      
      setToilets(allToilets);
      setTopRatedToilets(topRated);
    } catch (error) {
      console.error('Error loading toilets:', error);
    } finally {
      setLoading(false);
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

  const getDistance = (toilet: Toilet): string => {
    if (toilet.distance !== undefined) {
      return formatDistance(toilet.distance);
    }
    return 'Distance unknown';
  };

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
          <Text style={styles.title}>Explore Toilets</Text>
          <Text style={styles.subtitle}>Find the best facilities near you</Text>
        </View>

        {/* Top Rated Section */}
        {topRatedToilets.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Rated</Text>
            
            {topRatedToilets.map((toilet) => (
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
                      <Text style={styles.reviewCount}>({toilet.reviews} reviews)</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.address} numberOfLines={1}>
                    {toilet.address}
                  </Text>
                  
                  <View style={styles.features}>
                    {toilet.wheelchair === 'Yes' && (
                      <View style={styles.featureBadge}>
                        <Text style={styles.featureText}>Accessible</Text>
                      </View>
                    )}
                    {toilet.is_paid === 'No' && (
                      <View style={[styles.featureBadge, { backgroundColor: '#10B981' }]}>
                        <Text style={styles.featureText}>Free</Text>
                      </View>
                    )}
                    {toilet.baby === 'Yes' && (
                      <View style={[styles.featureBadge, { backgroundColor: '#E91E63' }]}>
                        <Text style={styles.featureText}>Baby Care</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* All Toilets Section */}
        {toilets.length > 0 && (
          <View style={[styles.section, { marginBottom: 40 }]}>
            <Text style={styles.sectionTitle}>All Toilets ({toilets.length})</Text>
            
            {toilets.map((toilet) => (
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
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
  reviewCount: {
    fontSize: 12,
    color: '#6B7280',
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
    marginBottom: 8,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});