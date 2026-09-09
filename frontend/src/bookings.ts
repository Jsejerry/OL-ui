import AsyncStorage from '@react-native-async-storage/async-storage';
export type SavedEnquiry = { id: string; title: string; date: string; slot: string; guests: number; created_at: string };
const KEY = 'onelatur.booking-enquiries';
export async function getEnquiries(): Promise<SavedEnquiry[]> { const data = await AsyncStorage.getItem(KEY); return data ? JSON.parse(data) : []; }
export async function saveEnquiry(item: SavedEnquiry) { const items = await getEnquiries(); await AsyncStorage.setItem(KEY, JSON.stringify([item, ...items.filter(i => i.id !== item.id)])); }