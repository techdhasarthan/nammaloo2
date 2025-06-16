import { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Wifi, Navigation, Star } from 'lucide-react-native';

export default function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <MapPin size={32} color="#FFFFFF" />
          </View>
          <View style={styles.ripple1} />
          <View style={styles.ripple2} />
          <View style={styles.ripple3} />
        </Animated.View>

        <View style={styles.textContainer}>
          <Text style={styles.mainText}>Finding Your Comfort</Text>
          <Text style={styles.subText}>
            Loading real-time toilet details...
          </Text>
          <View style={styles.dotsContainer}>
            <Animated.View
              style={[styles.dot, { opacity: pulseAnim }]}
            />
            <Animated.View
              style={[styles.dot, { opacity: pulseAnim }]}
            />
            <Animated.View
              style={[styles.dot, { opacity: pulseAnim }]}
            />
          </View>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Wifi size={20} color="#10B981" />
            <Text style={styles.featureText}>Live Data</Text>
          </View>
          <View style={styles.featureItem}>
            <Navigation size={20} color="#10B981" />
            <Text style={styles.featureText}>Accurate Distance</Text>
          </View>
          <View style={styles.featureItem}>
            <Star size={20} color="#10B981" />
            <Text style={styles.featureText}>User Reviews</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  ripple1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
  },
  ripple2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    zIndex: 0,
  },
  ripple3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    zIndex: -1,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mainText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 20,
  },
  featureItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    flex: 1,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});