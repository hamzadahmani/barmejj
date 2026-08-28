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

export const searchPlacesCatalogAPI = async (query = '') => {
  const response = await axios.get<any>(`search?query=${encodeURIComponent(query)}&sort=name`);
  return response.data;
};
