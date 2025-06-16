import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Search, Filter } from 'lucide-react-native';
import { getFilterSummary, getActiveFilterCount } from '@/lib/filtering';
import { defaultFilters } from '@/components/FilterModal';

export default function SearchSection({
  searchQuery,
  setSearchQuery,
  activeFilterCount,
  currentFilters,
  setFilterModalVisible,
  setCurrentFilters
}) {
  return (
    <View style={styles.searchSection}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search toilets, locations..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter size={20} color={activeFilterCount > 0 ? "#FFFFFF" : "#3B82F6"} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Summary */}
      {activeFilterCount > 0 && (
        <View style={styles.filterSummary}>
          <Text style={styles.filterSummaryText}>
            {getFilterSummary(currentFilters)}
          </Text>
          <TouchableOpacity 
            style={styles.clearFiltersButton}
            onPress={() => setCurrentFilters(defaultFilters)}
          >
            <Text style={styles.clearFiltersText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  filterSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#EFF6FF',
    marginTop: 12,
    borderRadius: 12,
  },
  filterSummaryText: {
    fontSize: 14,
    color: '#1D4ED8',
    fontWeight: '500',
    flex: 1,
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#1D4ED8',
    fontWeight: '600',
  },
});