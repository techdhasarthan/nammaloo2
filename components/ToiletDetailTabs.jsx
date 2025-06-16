import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MapPin, Clock, Star, ImageIcon } from 'lucide-react-native';
import { formatWorkingHours, getDetailedHours } from '@/lib/workingHours';
import FeatureBadges from '@/components/FeatureBadges';

export default function ToiletDetailTabs({
  activeTab,
  toilet,
  reviews,
  toiletImages,
  onImagePress,
  onReviewPress
}) {
  const renderTabContent = () => {
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
                  onPress={onReviewPress}
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
                  onPress={onImagePress}
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
                    onPress={onImagePress}
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

  return renderTabContent();
}

const styles = StyleSheet.create({
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
    width: 100,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
});