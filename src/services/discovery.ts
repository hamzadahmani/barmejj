import AsyncStorage from '@react-native-async-storage/async-storage';
import request from './request';

export type DiscoveryPlace = {
  idPlace: number;
  placeName: string;
  image?: string | null;
  subTitle?: string | null;
  rating?: number | null;
  reviewCount?: number;
  averagePrice?: number | null;
  distance?: number | null;
  availableDate?: string;
  availableTime?: string;
};
export type DiscoveryData = {
  forYou: DiscoveryPlace[];
  availableNow: DiscoveryPlace[];
  nearby: DiscoveryPlace[];
  recent: DiscoveryPlace[];
  newPlaces: DiscoveryPlace[];
  interests: Array<{key: string; label: string; count: number}>;
  events: Array<{
    idEvent: number;
    idPlace: number;
    title: string;
    description?: string;
    place: DiscoveryPlace;
  }>;
  offers?: Array<{
    idPlace: number;
    title: string;
    description: string;
    place: DiscoveryPlace;
  }>;
};
const historyKey = (userId: number) => `discovery:recent:${userId}`;
let historyQueue: Promise<unknown> = Promise.resolve();
export async function getRecentPlaces(userId: number): Promise<number[]> {
  const value = await AsyncStorage.getItem(historyKey(userId));
  try {
    const ids: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(ids)
      ? ids.filter(id => Number.isInteger(id) && id > 0).slice(0, 12)
      : [];
  } catch {
    return [];
  }
}
export function rememberPlace(userId: number, placeId: number) {
  if (
    !Number.isInteger(userId) ||
    !Number.isInteger(placeId) ||
    userId <= 0 ||
    placeId <= 0
  )
    return Promise.resolve();
  historyQueue = historyQueue
    .catch(() => undefined)
    .then(async () => {
      const ids = await getRecentPlaces(userId);
      await AsyncStorage.setItem(
        historyKey(userId),
        JSON.stringify(
          [placeId, ...ids.filter(id => id !== placeId)].slice(0, 12),
        ),
      );
    });
  return historyQueue;
}
export async function getDiscovery(
  userId: number,
  coordinates?: {latitude: number; longitude: number} | null,
): Promise<DiscoveryData> {
  const recent = await getRecentPlaces(userId);
  return (
    await request.get<DiscoveryData>('v1/discovery', {
      params: {
        ...coordinates,
        recent: recent.length ? recent.join(',') : undefined,
      },
    })
  ).data;
}
export async function getPlacesByInterest({
  queryKey,
}: {
  queryKey: readonly unknown[];
}) {
  const {interest} = queryKey[1] as {interest: string};
  return (
    await request.get<DiscoveryPlace[]>('v1/discovery', {params: {interest}})
  ).data;
}
