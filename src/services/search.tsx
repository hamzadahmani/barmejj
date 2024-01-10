import axios from './request';

export const getPlacesBySearch = async (params: any) => {
  const [, {query}] = params.queryKey;
  console.log('query', query);
  const response = await axios.get<any>(`search?query=${query}`);
  console.log('res', response);
  return response.data;
};
