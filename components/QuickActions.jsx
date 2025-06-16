import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function QuickActions({
  navigateToNearMe,
  navigateToTopRated,
  navigateToOpenNow,
}) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={navigateToNearMe}>
        <Text style={styles.text}>Near Me</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={navigateToTopRated}>
        <Text style={styles.text}>Top Rated</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={navigateToOpenNow}>
        <Text style={styles.text}>Open Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  button: { backgroundColor: '#10B981', padding: 12, borderRadius: 8 },
  text: { color: '#fff', fontWeight: 'bold' },
});
