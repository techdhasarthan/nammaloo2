import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';

export default function ToiletList({ displayToilets, navigateToToiletDetail }) {
  if (!displayToilets || displayToilets.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No toilets found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={displayToilets}
      keyExtractor={(item) => item._id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigateToToiletDetail(item)}
        >
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.subtext}>
            {item?.location?.latitude?.toFixed(2)},{' '}
            {item?.location?.longitude?.toFixed(2)}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  subtext: { fontSize: 14, color: '#6B7280' },
  empty: { alignItems: 'center', padding: 32 },
  emptyText: { color: '#9CA3AF', fontSize: 16 },
});
