import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { Search, MapPin, Star, Clock, Navigation } from 'lucide-react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';

// Sample toilet data
const SAMPLE_TOILETS = [
  {
    id: '1',
    name: 'Phoenix MarketCity Mall',
    address: 'Whitefield, Bangalore',
    rating: 4.5,
    reviews: 127,
    distance: '2.3 km',
    image: 'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=400',
    isOpen: true,
    features: ['Free', 'Wheelchair Accessible', 'Baby Changing']
  },
  {
    id: '2',
    name: 'Cubbon Park Public Toilet',
    address: 'Cubbon Park, Bangalore',
    rating: 4.2,
    reviews: 89,
    distance: '1.8 km',
    image: 'https://images.pexels.com/photos/6585756/pexels-photo-6585756.jpeg?auto=compress&cs=tinysrgb&w=400',
    isOpen: true,
    features: ['Free', 'Clean', 'Well Maintained']
  },
  {
    id: '3',
    name: 'Railway Station Restroom',
    address: 'Bangalore City Railway Station',
    rating: 3.8,
    reviews: 234,
    distance: '3.1 km',
    image: 'https://images.pexels.com/photos/6585758/pexels-photo-6585758.jpeg?auto=compress&cs=tinysrgb&w=400',
    isOpen: true,
    features: ['24/7', 'Paid', 'Shower Available']
  },
  {
    id: '4',
    name: 'UB City Mall Premium',
    address: 'UB City, Vittal Mallya Road',
    rating: 4.8,
    reviews: 156,
    distance: '1.2 km',
    image: 'https://images.pexels.com/photos/6585759/pexels-photo-6585759.jpeg?auto=compress&cs=tinysrgb&w=400',
    isOpen: true,
    features: ['Premium', 'Free', 'Air Conditioned']
  },
  {
    id: '5',
    name: 'Lalbagh Garden Facility',
    address: 'Lalbagh Botanical Garden',
    rating: 4.1,
    reviews: 67,
    distance: '2.7 km',
    image: 'https://images.pexels.com/photos/6585760/pexels-photo-6585760.jpeg?auto=compress&cs=tinysrgb&w=400',
    isOpen: false,
    features: ['Free', 'Garden View', 'Eco Friendly']
  }
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [toilets, setToilets] = useState(SAMPLE_TOILETS);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const filteredToilets = toilets.filter(toilet =>
    toilet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    toilet.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigateToDetail = (toilet) => {
    router.push({
      pathname: '/toilet-detail',
      params: { 
        id: toilet.id,
        name: toilet.name,
        address: toilet.address,
        rating: toilet.rating.toString(),
        reviews: toilet.reviews.toString(),
        distance: toilet.distance,
        image: toilet.image,
        isOpen: toilet.isOpen.toString(),
        features: JSON.stringify(toilet.features)
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <MapPin size={20} color="#10B981" />
            <Text style={styles.locationText}>Bangalore, Karnataka</Text>
          </View>
          <Text style={styles.title}>Find Clean Toilets</Text>
          <Text style={styles.subtitle}>Discover nearby facilities with ratings and reviews</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search toilets or locations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#3B82F6' }]}>
                <MapPin size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Near Me</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
                <Star size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Top Rated</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#EF4444' }]}>
                <Clock size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Open Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Toilet List */}
        <View style={styles.toiletList}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? `Search Results (${filteredToilets.length})` : 'Nearby Toilets'}
          </Text>
          
          {filteredToilets.map((toilet) => (
            <TouchableOpacity 
              key={toilet.id} 
              style={styles.toiletCard}
              onPress={() => navigateToDetail(toilet)}
            >
              <Image source={{ uri: toilet.image }} style={styles.toiletImage} />
              
              <View style={styles.toiletInfo}>
                <View style={styles.toiletHeader}>
                  <Text style={styles.toiletName}>{toilet.name}</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: toilet.isOpen ? '#10B981' : '#EF4444' 
                  }]}>
                    <Text style={styles.statusText}>
                      {toilet.isOpen ? 'Open' : 'Closed'}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.toiletAddress}>{toilet.address}</Text>
                
                <View style={styles.toiletMeta}>
                  <View style={styles.ratingContainer}>
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.ratingText}>{toilet.rating}</Text>
                    <Text style={styles.reviewText}>({toilet.reviews})</Text>
                  </View>
                  
                  <View style={styles.distanceContainer}>
                    <Navigation size={14} color="#6B7280" />
                    <Text style={styles.distanceText}>{toilet.distance}</Text>
                  </View>
                </View>
                
                <View style={styles.featuresContainer}>
                  {toilet.features.slice(0, 3).map((feature, index) => (
                    <View key={index} style={styles.featureBadge}>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    marginHorizontal: 4,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  toiletList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  toiletCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  toiletImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F3F4F6',
  },
  toiletInfo: {
    padding: 16,
  },
  toiletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  toiletName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  toiletAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  toiletMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '500',
  },
});