import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { registerUser, loginUser, logoutUser, getCurrentUser, createAnonymousUser } from './api';

// Configure WebBrowser for mobile OAuth
WebBrowser.maybeCompleteAuthSession();

export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Storage keys
const AUTH_STORAGE_KEY = 'auth_user';
const TOKEN_STORAGE_KEY = 'auth_token';

class AuthManager {
  private listeners: Set<(authState: AuthState) => void> = new Set();
  private currentState: AuthState = {
    user: null,
    loading: true,
    error: null
  };

  constructor() {
    this.initializeAuth();
  }

  // Subscribe to auth state changes
  subscribe(callback: (authState: AuthState) => void) {
    this.listeners.add(callback);
    // Immediately call with current state
    callback(this.currentState);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of auth state changes
  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentState));
  }

  // Update auth state
  private updateState(updates: Partial<AuthState>) {
    this.currentState = { ...this.currentState, ...updates };
    this.notifyListeners();
  }

  // Initialize authentication
  private async initializeAuth() {
    try {
      console.log('🔐 === INITIALIZING AUTHENTICATION ===');
      
      // Check for existing user in storage
      const userData = await this.getUserFromStorage();
      
      if (userData) {
        console.log('✅ Found existing user data');
        this.updateState({ 
          user: userData, 
          loading: false, 
          error: null 
        });
        
        // Verify token is still valid by fetching current user
        try {
          const currentUser = await getCurrentUser();
          if (currentUser) {
            console.log('✅ Token is valid, user is authenticated');
            this.updateState({ 
              user: currentUser,
              loading: false,
              error: null
            });
          } else {
            console.log('⚠️ Token is invalid, logging out');
            await this.signOut();
          }
        } catch (error) {
          console.error('❌ Error verifying token:', error);
          await this.signOut();
        }
      } else {
        console.log('ℹ️ No existing user found');
        this.updateState({ 
          user: null, 
          loading: false, 
          error: null 
        });
      }
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
      this.updateState({ 
        user: null, 
        loading: false, 
        error: error.message 
      });
    }
  }

  // Save user to local storage
  private async saveUserToStorage(user: User) {
    try {
      const userData = JSON.stringify(user);
      if (Platform.OS === 'web') {
        localStorage.setItem(AUTH_STORAGE_KEY, userData);
      } else {
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, userData);
      }
    } catch (error) {
      console.error('❌ Error saving user to storage:', error);
    }
  }

  // Get user from local storage
  private async getUserFromStorage(): Promise<User | null> {
    try {
      let userData: string | null;
      
      if (Platform.OS === 'web') {
        userData = localStorage.getItem(AUTH_STORAGE_KEY);
      } else {
        userData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      }
      
      if (!userData) return null;
      
      return JSON.parse(userData);
    } catch (error) {
      console.error('❌ Error getting user from storage:', error);
      return null;
    }
  }

  // Clear user from local storage
  private async clearUserFromStorage() {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      } else {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch (error) {
      console.error('❌ Error clearing user from storage:', error);
    }
  }

  // Sign in with email
  async signInWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔐 === SIGNING IN WITH EMAIL ===');
      
      this.updateState({ loading: true, error: null });

      const user = await loginUser(email, password);
      
      if (user) {
        await this.saveUserToStorage(user);
        this.updateState({ 
          user, 
          loading: false, 
          error: null 
        });
        return { success: true };
      }
      
      this.updateState({ 
        loading: false, 
        error: 'Failed to sign in' 
      });
      return { success: false, error: 'Failed to sign in' };
    } catch (error: any) {
      console.error('❌ Error signing in with email:', error);
      this.updateState({ 
        loading: false, 
        error: error.message 
      });
      return { success: false, error: error.message };
    }
  }

  // Sign up with email
  async signUpWithEmail(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔐 === SIGNING UP WITH EMAIL ===');
      
      this.updateState({ loading: true, error: null });

      const user = await registerUser(name, email, password);
      
      if (user) {
        await this.saveUserToStorage(user);
        this.updateState({ 
          user, 
          loading: false, 
          error: null 
        });
        return { success: true };
      }
      
      this.updateState({ 
        loading: false, 
        error: 'Failed to sign up' 
      });
      return { success: false, error: 'Failed to sign up' };
    } catch (error: any) {
      console.error('❌ Error signing up with email:', error);
      this.updateState({ 
        loading: false, 
        error: error.message 
      });
      return { success: false, error: error.message };
    }
  }

  // Sign out
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔐 === SIGNING OUT ===');
      
      this.updateState({ loading: true, error: null });

      await logoutUser();
      await this.clearUserFromStorage();
      
      this.updateState({ 
        user: null, 
        loading: false, 
        error: null 
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error signing out:', error);
      this.updateState({ 
        loading: false, 
        error: error.message 
      });
      return { success: false, error: error.message };
    }
  }

  // Create or get anonymous user
  async createOrGetAnonymousUser(): Promise<User | null> {
    try {
      console.log('🔐 === CREATING ANONYMOUS USER ===');
      
      // Check if we already have a user
      const existingUser = this.getCurrentUser();
      if (existingUser) {
        return existingUser;
      }
      
      this.updateState({ loading: true, error: null });
      
      const user = await createAnonymousUser();
      
      if (user) {
        await this.saveUserToStorage(user);
        this.updateState({ 
          user, 
          loading: false, 
          error: null 
        });
        return user;
      }
      
      this.updateState({ 
        loading: false, 
        error: 'Failed to create anonymous user' 
      });
      return null;
    } catch (error: any) {
      console.error('❌ Error creating anonymous user:', error);
      this.updateState({ 
        loading: false, 
        error: error.message 
      });
      return null;
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentState.user;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentState.user !== null;
  }

  // Get current auth state
  getAuthState(): AuthState {
    return this.currentState;
  }

  // Reset password
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔐 === RESETTING PASSWORD ===');
      
      // This would be implemented with your backend
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error resetting password:', error);
      return { success: false, error: error.message || 'Failed to reset password' };
    }
  }
}

// Export singleton instance
export const authManager = new AuthManager();

// Convenience functions
export const signInWithEmail = (email: string, password: string) => authManager.signInWithEmail(email, password);
export const signUpWithEmail = (email: string, password: string, name: string) => authManager.signUpWithEmail(email, password, name);
export const signOut = () => authManager.signOut();
export const getCurrentUser = () => authManager.getCurrentUser();
export const isAuthenticated = () => authManager.isAuthenticated();
export const resetPassword = (email: string) => authManager.resetPassword(email);
export const createOrGetAnonymousUser = () => authManager.createOrGetAnonymousUser();