import axios from './request';

export const getPlacesBySearch = async (params: any) => {
  const [, filters] = params.queryKey;
  const response = await axios.get<any>('search', {params: filters});
  return response.data;
};
