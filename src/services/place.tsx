import axios from './request';

export const getAllPlacesByCategorieAPI = async (params: any) => {
  const [, {id}] = params.queryKey;

  const response = await axios.get<any>(`getPlaceByCategory/${id}`);
  return response.data;
};

export const getPlaceByIdAPI = async (params: any) => {
  const [, {id}] = params.queryKey;
  const response = await axios.get<any>(`getPlaceInfoByIdPlace/${id}`);
  return response.data;
};

export const getPlaceNearMeAPI = async (params: any) => {
  const [, {longitude, latitude}] = params.queryKey;
  const response = await axios.get<any>(
    `getNearMe?requestLongitude=${longitude}&requestLatitude=${latitude}`,
  );
  return response.data;
};

export const getFeaturedPlacesAPI = async () => {
  const response = await axios.get<any>('getFeaturedPlaces');
  return response.data;
};

export const getVideoFeedAPI = async ({
  pageParam,
  queryKey,
}: {pageParam?: string | null; queryKey?: readonly unknown[]} = {}) => {
  const options = (queryKey?.[1] as {
    limit?: number;
    mode?: string;
    latitude?: number;
    longitude?: number;
    keyword?: string;
  }) ?? {};
  const response = await axios.get<any>('v1/feed', {
    params: {
      cursor: pageParam || undefined,
      limit: options.limit ?? 8,
      mode: options.mode ?? 'for-you',
      latitude: options.latitude,
      longitude: options.longitude,
      keyword: options.keyword,
    },
  });
  return response.data;
};

export const trackFeedEventsAPI = async (
  events: Array<Record<string, unknown>>,
) => {
  const response = await axios.post('v1/feed/events/batch', {events});
  return response.data;
};

export const searchPlacesCatalogAPI = async (query = '') => {
  const response = await axios.get<any>(
    `search?query=${encodeURIComponent(query)}&sort=name`,
  );
  return response.data;
};
