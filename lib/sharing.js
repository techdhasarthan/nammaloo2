// Sharing utilities for toilet information
import { Platform, Share, Alert } from 'react-native';

// Share toilet information
export const shareToilet = async (options) => {
  try {
    const { toilet, userMessage } = options;
    
    const toiletName = toilet.name || 'Public Toilet';
    const address = toilet.address || 'Address not available';
    const rating = toilet.rating ? `⭐ ${toilet.rating.toFixed(1)}/5` : 'Not rated';
    
    // Create Google Maps link
    const mapsUrl = toilet.latitude && toilet.longitude 
      ? `https://www.google.com/maps/search/?api=1&query=${toilet.latitude},${toilet.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(toiletName + ' ' + address)}`;
    
    // Create share content
    const title = `Check out this toilet: ${toiletName}`;
    const message = [
      userMessage && `💬 ${userMessage}`,
      `🚻 ${toiletName}`,
      `📍 ${address}`,
      `${rating}`,
      '',
      '🗺️ Get directions:',
      mapsUrl,
      '',
      '📱 Shared via Namma Loo - Smart Toilet Finder'
    ].filter(Boolean).join('\n');
    
    if (Platform.OS === 'web') {
      // Web sharing
      if (navigator.share) {
        await navigator.share({
          title,
          text: message,
          url: mapsUrl
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(message);
        Alert.alert('Copied!', 'Toilet information copied to clipboard.');
      }
    } else {
      // Mobile sharing
      const result = await Share.share({
        title,
        message,
        url: mapsUrl
      });
      
      if (result.action === Share.sharedAction) {
        console.log('Toilet shared successfully');
      }
    }
  } catch (error) {
    console.error('Error sharing toilet:', error);
    Alert.alert('Error', 'Could not share toilet information.');
  }
};

// Share app
export const shareApp = async () => {
  try {
    const message = [
      '🚻 Discover clean, accessible toilets near you!',
      '',
      '📱 Download Namma Loo - Smart Toilet Finder',
      '✨ Features:',
      '• Real-time toilet locations',
      '• User reviews and ratings',
      '• Accessibility information',
      '• Working hours and status',
      '',
      '🔗 Get the app: [App Store/Play Store Link]'
    ].join('\n');
    
    if (Platform.OS === 'web') {
      if (navigator.share) {
        await navigator.share({
          title: 'Namma Loo - Smart Toilet Finder',
          text: message
        });
      } else {
        await navigator.clipboard.writeText(message);
        Alert.alert('Copied!', 'App information copied to clipboard.');
      }
    } else {
      await Share.share({
        title: 'Namma Loo - Smart Toilet Finder',
        message
      });
    }
  } catch (error) {
    console.error('Error sharing app:', error);
    Alert.alert('Error', 'Could not share app information.');
  }
};