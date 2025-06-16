import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TextInput,
} from 'react-native';

export const defaultFilters = {
  minRating: 0,
  features: [],
  maxDistanceMeters: 0,
};

const FEATURE_OPTIONS = [
  'Clean',
  'Paid Access',
  'Open 24/7',
  'Wheelchair Accessible',
];

export default function FilterModal({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
}) {
  const [minRating, setMinRating] = useState(currentFilters.minRating || 0);
  const [features, setFeatures] = useState(currentFilters.features || []);
  const [maxDistanceMeters, setMaxDistanceMeters] = useState(
    currentFilters.maxDistanceMeters || 0
  );

  const toggleFeature = (feature) => {
    setFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const applyFilters = () => {
    onApplyFilters({ minRating, features, maxDistanceMeters });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Filter Toilets</Text>

          {/* Minimum Rating */}
          <Text style={styles.label}>Minimum Rating:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={minRating.toString()}
            onChangeText={(val) => setMinRating(parseFloat(val) || 0)}
          />

          {/* Distance Filter */}
          <Text style={styles.label}>Max Distance (m):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={maxDistanceMeters.toString()}
            onChangeText={(val) => setMaxDistanceMeters(parseInt(val) || 0)}
          />

          {/* Feature Toggles */}
          <Text style={styles.label}>Features:</Text>
          {FEATURE_OPTIONS.map((feature) => (
            <View style={styles.switchRow} key={feature}>
              <Text>{feature}</Text>
              <Switch
                value={features.includes(feature)}
                onValueChange={() => toggleFeature(feature)}
              />
            </View>
          ))}

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.buttonText}>Apply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '90%',
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  label: { marginTop: 12, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  applyButton: { backgroundColor: '#10B981', padding: 12, borderRadius: 10 },
  cancelButton: { backgroundColor: '#EF4444', padding: 12, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
