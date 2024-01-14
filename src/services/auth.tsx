import axios from './request';

export const signInAPI = async (data: any) => {
  const response = await axios.post<any>('authenticate', data, {});
  return response.data;
};

export const signUpAPI = async (data: any) => {
  const response = await axios.post<any>('signup', data, {});
  return response.data;
};

export const signUpWithGoogleAPI = async (data: any) => {
  const response = await axios.post<any>('auth-external', data, {});
  return response.data;
};

export const deleteAccountAPI = async (data: any) => {
  const response = await axios.post<any>('deleteUser', data, {});
  return response.data;
};

export const setDeviceTokenAPI = async (data: any) => {
  const response = await axios.post<any>('setToken', data, {});
  return response.data;
};
