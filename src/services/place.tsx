import axios from './request';

export const getAllPlacesByCategorieAPI = async (params: any) => {
  const [, {id}] = params.queryKey;

  const response = await axios.get<any>(`getPlaceByCategory/${id}`, {
    signal: params.signal,
  });
  return response.data;
};

/**
 * Fiche d'un établissement. `source` (fil vidéo, recherche…) n'est passé que
 * par l'écran de la fiche : c'est ce qui compte une vue dans les statistiques.
 */
export const getPlaceByIdAPI = async (params: any, source?: string) => {
  const [, {id}] = params.queryKey;
  const response = await axios.get<any>(`getPlaceInfoByIdPlace/${id}`, {
    signal: params.signal,
    params: source ? {source} : undefined,
  });
  return response.data;
};

export const getPlaceNearMeAPI = async (params: any) => {
  const [, {longitude, latitude}] = params.queryKey;
  const response = await axios.get<any>(
    `getNearMe?requestLongitude=${longitude}&requestLatitude=${latitude}`,
    {signal: params.signal},
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
  signal,
}: {
  pageParam?: string | null;
  queryKey?: readonly unknown[];
  signal?: AbortSignal;
} = {}) => {
  const options =
    (queryKey?.[1] as {
      limit?: number;
      mode?: string;
      latitude?: number;
      longitude?: number;
      keyword?: string;
    }) ?? {};
  const response = await axios.get<any>('v1/feed', {
    signal,
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
