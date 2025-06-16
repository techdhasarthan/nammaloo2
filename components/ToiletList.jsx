import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Star, ChevronRight } from 'lucide-react-native';
import { getLocationDisplayName } from '@/lib/addressParser';
import FeatureBadges from '@/components/FeatureBadges';

export default function ToiletList({
  searchQuery,
  activeFilterCount,
  displayToilets,
  topRatedToilets,
  recentToilets,
  toilets,
  getDistance,
  navigateToToiletDetail,
  navigateToTopRated,
  navigateToNearMe
}) {
  const handleRecentToiletPress = (recentToilet) => {
    navigateToToiletDetail({
      uuid: recentToilet.toiletId,
      name: recentToilet.name,
      address: recentToilet.address,
      rating: recentToilet.rating,
      image_url: recentToilet.image_url
    });
  };

  return (
    <>
      {/* Search Results */}
      {(searchQuery.length > 0 || activeFilterCount > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery.length > 0 
              ? `Search Results (${displayToilets.length})`
              : `Filtered Results (${displayToilets.length})`
            }
          </Text>
          {displayToilets.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            displayToilets.slice(0, 8).map((toilet) => (
              <ToiletCard
                key={toilet.uuid}
                toilet={toilet}
                getDistance={getDistance}
                navigateToToiletDetail={navigateToToiletDetail}
              />
            ))
          )}
        </View>
      )}

      {/* Top Rated Section */}
      {topRatedToilets.length > 0 && searchQuery.length === 0 && activeFilterCount === 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Highly Rated</Text>
            <TouchableOpacity onPress={navigateToTopRated}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContainer}
          >
            {topRatedToilets.map((toilet) => (
              <FeaturedCard
                key={toilet.uuid}
                toilet={toilet}
                getDistance={getDistance}
                navigateToToiletDetail={navigateToToiletDetail}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Recently Viewed */}
      {recentToilets.length > 0 && searchQuery.length === 0 && activeFilterCount === 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently Viewed</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContainer}
          >
            {recentToilets.slice(0, 10).map((recentToilet) => (
              <RecentCard
                key={recentToilet.toiletId}
                recentToilet={recentToilet}
                handleRecentToiletPress={handleRecentToiletPress}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* All Toilets */}
      {toilets.length > 0 && searchQuery.length === 0 && activeFilterCount === 0 && (
        <View style={[styles.section, { marginBottom: 40 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Toilets</Text>
            <TouchableOpacity onPress={navigateToNearMe}>
              <Text style={styles.seeAllText}>See All ({toilets.length})</Text>
            </TouchableOpacity>
          </View>
          
          {toilets.slice(0, 6).map((toilet) => (
            <ToiletCard
              key={toilet.uuid}
              toilet={toilet}
              getDistance={getDistance}
              navigateToToiletDetail={navigateToToiletDetail}
            />
          ))}
        </View>
      )}

      {/* Empty State */}
      {toilets.length === 0 && (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyText}>No toilets found</Text>
          <Text style={styles.emptySubtext}>
            Check your connection and try again
          </Text>
        </View>
      )}
    </>
  );
}

function ToiletCard({ toilet, getDistance, navigateToToiletDetail }) {
  return (
    <TouchableOpacity 
      style={styles.toiletCard}
      onPress={() => navigateToToiletDetail(toilet)}
    >
      <Image 
        source={{ 
          uri: toilet.image_url || 'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=200'
        }} 
        style={styles.toiletImage} 
      />
      
      <View style={styles.toiletInfo}>
        <Text style={styles.toiletName}>{toilet.name || 'Public Toilet'}</Text>
        
        <View style={styles.toiletMeta}>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>{toilet.rating?.toFixed(1) || 'N/A'}</Text>
          </View>
          <Text style={styles.distance}>{getDistance(toilet)}</Text>
        </View>
        
        <Text style={styles.address} numberOfLines={1}>
          {getLocationDisplayName(toilet.address || '')}
        </Text>
        <View style={styles.featureBadgesContainer}>
          <FeatureBadges toilet={toilet} maxBadges={3} size="small" />
        </View>
      </View>
      
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

function FeaturedCard({ toilet, getDistance, navigateToToiletDetail }) {
  return (
    <TouchableOpacity 
      style={styles.featuredCard}
      onPress={() => navigateToToiletDetail(toilet)}
    >
      <Image 
        source={{ 
          uri: toilet.image_url || 'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=400'
        }} 
        style={styles.featuredImage} 
      />
      
      <View style={styles.featuredOverlay}>
        <View style={styles.featuredRating}>
          <Star size={12} color="#F59E0B" fill="#F59E0B" />
          <Text style={styles.featuredRatingText}>{toilet.rating?.toFixed(1) || 'N/A'}</Text>
        </View>
      </View>
      
      <View style={styles.featuredContent}>
        <Text style={styles.featuredName} numberOfLines={2}>
          {toilet.name || 'Public Toilet'}
        </Text>
        <Text style={styles.featuredAddress} numberOfLines={1}>
          {getLocationDisplayName(toilet.address || '')}
        </Text>
        <Text style={styles.featuredDistance}>{getDistance(toilet)}</Text>
        <View style={styles.featureBadgesContainer}>
          <FeatureBadges toilet={toilet} maxBadges={2} size="small" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function RecentCard({ recentToilet, handleRecentToiletPress }) {
  return (
    <TouchableOpacity 
      style={styles.recentCard}
      onPress={() => handleRecentToiletPress(recentToilet)}
    >
      <Image 
        source={{ 
          uri: recentToilet.image_url || 'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=400'
        }} 
        style={styles.recentImage} 
      />
      
      <View style={styles.recentContent}>
        <Text style={styles.recentName} numberOfLines={2}>
          {recentToilet.name}
        </Text>
        
        {recentToilet.rating && (
          <View style={styles.recentRating}>
            <Star size={12} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.recentRatingText}>{recentToilet.rating.toFixed(1)}</Text>
          </View>
        )}
        
        <Text style={styles.recentViews}>{recentToilet.viewCount} views</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  horizontalScrollContainer: {
    paddingLeft: 0,
    paddingRight: 16,
    paddingBottom: 20,
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
  distance: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  address: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 16,
    marginBottom: 8,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#F3F4F6',
  },
  featuredOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  featuredRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featuredContent: {
    padding: 12,
  },
  featuredName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 18,
  },
  featuredAddress: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  featuredDistance: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500',
    marginBottom: 2,
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 12,
    marginBottom: 8,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  recentImage: {
    width: '100%',
    height: 80,
    backgroundColor: '#F3F4F6',
  },
  recentContent: {
    padding: 12,
  },
  recentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 18,
  },
  recentRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  recentRatingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
  },
  recentViews: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  featureBadgesContainer: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});