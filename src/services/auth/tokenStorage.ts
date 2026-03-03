import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const AUTH_TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

const getWebStorage = () => {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage;
};

export const saveAccessToken = async (token: string) => {
  const storage = getWebStorage();
  if (storage) {
    storage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
};

export const getAccessToken = async () => {
  const storage = getWebStorage();
  if (storage) {
    return storage.getItem(AUTH_TOKEN_KEY);
  }
  return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
};

export const removeAccessToken = async () => {
  const storage = getWebStorage();
  if (storage) {
    storage.removeItem(AUTH_TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
};

export const saveRefreshToken = async (token: string) => {
  const storage = getWebStorage();
  if (storage) {
    storage.setItem(REFRESH_TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
};

export const getRefreshToken = async () => {
  const storage = getWebStorage();
  if (storage) {
    return storage.getItem(REFRESH_TOKEN_KEY);
  }
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
};

export const removeRefreshToken = async () => {
  const storage = getWebStorage();
  if (storage) {
    storage.removeItem(REFRESH_TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};

export const clearAuthTokens = async () => {
  await Promise.all([removeAccessToken(), removeRefreshToken()]);
};
