import { useRouter, useNavigationContainerRef } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsReady(true);
    }, 100); // wait briefly to ensure layout is mounted

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isReady && response?.type === 'success') {
      router.replace('/(tabs)');
    }
  }, [isReady, response]);

  return (
    <View>
      <Text>Logging in...</Text>
    </View>
  );
}
