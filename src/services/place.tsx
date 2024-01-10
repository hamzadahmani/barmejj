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
