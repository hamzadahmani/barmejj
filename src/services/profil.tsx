import axios from './request';

export const updateProfilAPI = async (data: any) => {
  const response = await axios.put<any>('updateUser', data, {});
  return response.data;
};

export const getProfilAPI = async () => {
  const response = await axios.get<any>('getUserById');
  return response.data;
};
