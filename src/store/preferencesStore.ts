import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const STORAGE_KEY = 'preferences_store';

export interface UserPreferences {
  remindersEnabled: boolean;
  autoplayVideos: boolean;
  downloadOnWifiOnly: boolean;
}

interface PreferencesState extends UserPreferences {
  hydrated: boolean;
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  remindersEnabled: true,
  autoplayVideos: true,
  downloadOnWifiOnly: true,
};

const persist = async (state: UserPreferences) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  ...defaultPreferences,
  hydrated: false,

  setPreference: async (key, value) => {
    set({ [key]: value } as Pick<PreferencesState, keyof UserPreferences>);
    const { remindersEnabled, autoplayVideos, downloadOnWifiOnly } = get();
    await persist({ remindersEnabled, autoplayVideos, downloadOnWifiOnly });
  },

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        set({ hydrated: true });
        return;
      }

      const parsed = JSON.parse(raw) as Partial<UserPreferences>;
      set({
        remindersEnabled: typeof parsed.remindersEnabled === 'boolean' ? parsed.remindersEnabled : true,
        autoplayVideos: typeof parsed.autoplayVideos === 'boolean' ? parsed.autoplayVideos : true,
        downloadOnWifiOnly:
          typeof parsed.downloadOnWifiOnly === 'boolean' ? parsed.downloadOnWifiOnly : true,
        hydrated: true,
      });
    } catch (error) {
      console.warn('failed to load preferences', error);
      set({ hydrated: true });
    }
  },
}));
