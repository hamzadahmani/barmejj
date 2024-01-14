import axios from './request';

export const reportAPI = async (data: any) => {
  const response = await axios.post<any>('addReport', data);
  return response.data;
};
