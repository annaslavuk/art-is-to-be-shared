// Shared Supabase client — import { supabase } from '@/lib/supabase' anywhere you need the database.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// AsyncStorage uses window.localStorage on web, which doesn't exist in Node SSR.
// This wrapper returns null/no-ops when running server-side.
const SSRSafeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: SSRSafeStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
