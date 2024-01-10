import axios from './request';

export const getCategoriesAPI = async () => {
  const response = await axios.get<any>('getAllCategories');
  return response.data;
};
