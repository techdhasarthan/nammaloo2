import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  SafeAreaView 
} from 'react-native';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Clock, 
  Navigation, 
  Share, 
  Heart,
  Phone,
  Wifi,
  Car
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ToiletDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const toilet = {
    id: params.id,
    name: params.name,
    address: params.address,
    rating: parseFloat(params.rating),
    reviews: parseInt(params.reviews),
    distance: params.distance,
    image: params.image,
    isOpen: params.isOpen === 'true',
    features: JSON.parse(params.features || '[]'),
  };

  const additionalFeatures = [
    { icon: Wifi, label: 'Free WiFi', available: true },
    { icon: Car, label: 'Parking', available: true },
    { icon: Phone, label: 'Emergency Call', available: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Heart size={20} color="#EF4444" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Share size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <Image source={{ uri: toilet.image }} style={styles.heroImage} />
        
        {/* Status Badge */}
        <View style={[styles.statusBadge, { 
          backgroundColor: toilet.isOpen ? '#10B981' : '#EF4444' 
        }]}>
          <Text style={styles.statusText}>
            {toilet.isOpen ? 'Open Now' : 'Closed'}
          </Text>
        </View>

        {/* Main Info */}
        <View style={styles.mainInfo}>
          <Text style={styles.toiletName}>{toilet.name}</Text>
          <Text style={styles.toiletAddress}>{toilet.address}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>{toilet.rating}</Text>
              <Text style={styles.reviewText}>({toilet.reviews} reviews)</Text>
            </View>
            
            <View style={styles.distanceContainer}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.distanceText}>{toilet.distance}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Navigation size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Get Directions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton}>
            <Phone size={20} color="#3B82F6" />
            <Text style={styles.secondaryButtonText}>Call</Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features & Amenities</Text>
          <View style={styles.featuresGrid}>
            {toilet.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Additional Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Services</Text>
          {additionalFeatures.map((feature, index) => (
            <View key={index} style={styles.serviceItem}>
              <View style={[styles.serviceIcon, { 
                backgroundColor: feature.available ? '#DCFCE7' : '#FEF2F2' 
              }]}>
                <feature.icon 
                  size={20} 
                  color={feature.available ? '#16A34A' : '#DC2626'} 
                />
              </View>
              <Text style={[styles.serviceText, { 
                color: feature.available ? '#1F2937' : '#9CA3AF' 
              }]}>
                {feature.label}
              </Text>
              <Text style={[styles.serviceStatus, { 
                color: feature.available ? '#16A34A' : '#DC2626' 
              }]}>
                {feature.available ? 'Available' : 'Not Available'}
              </Text>
            </View>
          ))}
        </View>

        {/* Working Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Working Hours</Text>
          <View style={styles.hoursContainer}>
            <Clock size={20} color="#6B7280" />
            <View style={styles.hoursInfo}>
              <Text style={styles.hoursText}>Open 24 Hours</Text>
              <Text style={styles.hoursSubtext}>Available all day, every day</Text>
            </View>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          
          {[1, 2, 3].map((review) => (
            <View key={review} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>U{review}</Text>
                </View>
                <View style={styles.reviewInfo}>
                  <Text style={styles.reviewUser}>User {review}</Text>
                  <View style={styles.reviewRating}>
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        color="#F59E0B" 
                        fill={i < 4 ? "#F59E0B" : "transparent"} 
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>2 days ago</Text>
              </View>
              <Text style={styles.reviewText}>
                Clean and well-maintained facility. Easy to find and accessible.
              </Text>
            </View>
          ))}
          
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Reviews</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#E5E7EB',
  },
  statusBadge: {
    position: 'absolute',
    top: 260,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  mainInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  toiletName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  toiletAddress: {
    fontSize: 16,
    color: '#6B7280',
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
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  primaryButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureItem: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  serviceStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hoursInfo: {
    marginLeft: 16,
  },
  hoursText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  hoursSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  reviewItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reviewText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
});