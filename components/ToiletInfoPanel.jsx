import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Star, Navigation, Share, Bookmark, Info, Camera, MessageSquare } from 'lucide-react-native';
import { formatWorkingHours, getStatusColor, getStatusText } from '@/lib/workingHours';
import FeatureBadges from '@/components/FeatureBadges';

export default function ToiletInfoPanel({
  toilet,
  getDistance,
  isSaved,
  onDirections,
  onSave,
  onShare,
  onReviewPress,
  onReportPress,
  onImagePress,
  activeTab,
  setActiveTab,
  renderTabContent
}) {
  return (
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
            onPress={onDirections}
          >
            <Navigation size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Navigate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={onReviewPress}
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
            onPress={onSave}
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
            onPress={onShare}
          >
            <Share size={20} color="#007AFF" />
            <Text style={styles.secondaryButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.reportButton}
          onPress={onReportPress}
        >
          <MessageSquare size={16} color="#FF3B30" />
          <Text style={styles.reportButtonText}>Report Issue</Text>
        </TouchableOpacity>

        <View style={styles.imageSection}>
          <TouchableOpacity onPress={onImagePress}>
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
                <Camera size={16} color="#FFFFFF" />
                <Text style={styles.imageGalleryText}>
                  3 Photos
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
                onPress={() => setActiveTab(tab.key)}
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
  );
}

const styles = StyleSheet.create({
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
});