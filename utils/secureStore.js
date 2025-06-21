import * as SecureStore from 'expo-secure-store';

export const saveUserSession = async (user) => {
  await SecureStore.setItemAsync('user', JSON.stringify(user));
};

export const getUserSession = async () => {
  const result = await SecureStore.getItemAsync('user');
  return result ? JSON.parse(result) : null;
};

export const clearUserSession = async () => {
  await SecureStore.deleteItemAsync('user');
};
