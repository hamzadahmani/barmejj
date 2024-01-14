import axios from './request';

export const getAllReservationsByUser = async () => {
  const response = await axios.get<any>('getAllReservationsByUser');
  return response.data;
};

export const getReservationsById = async (params: any) => {
  const [, {id}] = params.queryKey;

  const response = await axios.get<any>(`getReservationById/${id}`);
  return response.data;
};

export const addReservationAPI = async (data: any) => {
  const response = await axios.post<any>('addReservation', data, {});
  return response.data;
};

export const updateReservationAPI = async (data: any) => {
  const response = await axios.put<any>('updateReservation', data, {});
  return response.data;
};
