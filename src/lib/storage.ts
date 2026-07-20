import AsyncStorage from '@react-native-async-storage/async-storage';

import { getDefaultAppData } from '@/lib/defaults';
import { AppData } from '@/types';

const STORAGE_KEY = '@replog/data';

export async function loadAppData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultAppData();
    return { ...getDefaultAppData(), ...JSON.parse(raw) } as AppData;
  } catch {
    return getDefaultAppData();
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
