import axios from './request';

export const getAllReservationsByUser = async () => {
  const response = await axios.get<any>('getAllReservationsByUser');
  return response.data;
};

export const getUpcomingReservationAPI = async () => {
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return (await axios.get<any>('reservations/upcoming', {params: {date, time}})).data;
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

export type AvailabilitySlot = {
  time: string;
  capacity: number;
  occupied: number;
  remainingCapacity: number;
  status: 'AVAILABLE' | 'LIMITED' | 'FULL' | 'CLOSED' | 'PAST';
  available: boolean;
};

export const getPlaceAvailability = async ({placeId, date, guests}: {placeId: number; date: string; guests: number}) => {
  const response = await axios.get<any>(`places/${placeId}/availability`, {params: {date, guests}});
  return response.data as {isClosed: boolean; closureReason?: string | null; capacityPerSlot?: number; slots: AvailabilitySlot[]};
};

export const updateReservationAPI = async (data: any) => {
  const response = await axios.put<any>('updateReservation', data, {});
  return response.data;
};

export const cancelReservationAPI = async (id: number, reason?: string) => {
  const response = await axios.patch(`reservations/${id}/cancel`, {reason});
  return response.data;
};

export const acceptReservationProposalAPI = async (id: number) =>
  (await axios.patch(`reservations/${id}/accept-proposal`)).data;

export const declineReservationProposalAPI = async (id: number, reason?: string) =>
  (await axios.patch(`reservations/${id}/decline-proposal`, {reason})).data;

// Alias temporaire pour les anciens imports.
export const deleteReservationAPI = cancelReservationAPI;

export const getAdminReservations = async () => {
  const response = await axios.get<any>('admin/reservations?status=PENDING');
  return response.data;
};

export const updateReservationStatusAPI = async ({id, status}: {id: number; status: string}) => {
  const response = await axios.patch<any>(`admin/reservations/${id}/status`, {status});
  return response.data;
};
