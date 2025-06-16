import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Star, Clock } from 'lucide-react-native';

export default function QuickActions({
  navigateToNearMe,
  navigateToTopRated,
  navigateToOpenNow
}) {
  return (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionCard} onPress={navigateToNearMe}>
          <View style={[styles.actionIcon, { backgroundColor: '#3B82F6' }]}>
            <MapPin size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>Near Me</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard} onPress={navigateToTopRated}>
          <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
            <Star size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>Top Rated</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard} onPress={navigateToOpenNow}>
          <View style={[styles.actionIcon, { backgroundColor: '#EF4444' }]}>
            <Clock size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>Open Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quickActionsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 16,
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
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
    fontFamily: 'System',
  },
});