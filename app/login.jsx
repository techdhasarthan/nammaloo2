import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import {
  createGoogleAuthRequest,
  exchangeCodeForToken,
  getUserInfo,
  storeUserData,
} from '../lib/auth';
import * as AuthSession from 'expo-auth-session';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const [request, response, promptAsync] = createGoogleAuthRequest();

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse(response);
    } else if (response?.type === 'error') {
      Alert.alert('Authentication Error', 'Failed to authenticate with Google');
      setIsLoading(false);
    }
  }, [response]);

  const handleGoogleResponse = async (response) => {
    try {
      setIsLoading(true);
      
      const { code } = response.params;
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'nammaloo',
        path: 'auth',
      });

      // Exchange code for token
      const tokenResponse = await exchangeCodeForToken(code, redirectUri);
      
      // Get user info
      const userInfo = await getUserInfo(tokenResponse.accessToken);
      
      // Prepare user data
      const userData = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
        loginTime: new Date().toISOString(),
      };

      // Store user data
      await storeUserData(userData);
      
      // Update auth context
      login(userData);
      
      // Navigate to main app
      router.replace('/(tabs)');
      
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert(
        'Login Failed',
        'Unable to complete Google login. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await promptAsync();
    } catch (error) {
      console.error('Login prompt error:', error);
      Alert.alert('Error', 'Unable to start login process');
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    // For demo purposes, create a guest user
    const guestData = {
      id: 'guest',
      email: 'guest@nammaloo.com',
      name: 'Guest User',
      picture: null,
      isGuest: true,
      loginTime: new Date().toISOString(),
    };
    
    login(guestData);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="location" size={64} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>Namma Loo</Text>
            <Text style={styles.tagline}>Smart Toilet Finder</Text>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <View style={styles.featureItem}>
              <Ionicons name="search" size={24} color="#FFFFFF" />
              <Text style={styles.featureText}>Find nearby toilets</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="star" size={24} color="#FFFFFF" />
              <Text style={styles.featureText}>Read reviews & ratings</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="navigate" size={24} color="#FFFFFF" />
              <Text style={styles.featureText}>Get directions instantly</Text>
            </View>
          </View>

          {/* Login Section */}
          <View style={styles.loginSection}>
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              disabled={isLoading || !request}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#1F2937" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={20} color="#1F2937" />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestLogin}
              disabled={isLoading}
            >
              <Ionicons name="person" size={20} color="#FFFFFF" />
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 48,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresSection: {
    marginVertical: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 16,
    fontWeight: '500',
  },
  loginSection: {
    marginBottom: 40,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 24,
    gap: 12,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disclaimer: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});