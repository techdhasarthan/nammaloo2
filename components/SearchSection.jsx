import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import { Search, Filter } from 'lucide-react-native';

export default function SearchSection({
  searchQuery,
  setSearchQuery,
  activeFilterCount,
  setFilterModalVisible,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Search size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.input}
          value={searchQuery}
          placeholder="Search toilets..."
          onChangeText={setSearchQuery}
        />
      </View>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setFilterModalVisible(true)}
      >
        <Filter size={18} color="#FFFFFF" />
        {activeFilterCount > 0 && (
          <Text style={styles.badge}>{activeFilterCount}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  input: { flex: 1, height: 40, fontSize: 16 },
  filterButton: {
    marginLeft: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    padding: 10,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    color: '#FFF',
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
});
