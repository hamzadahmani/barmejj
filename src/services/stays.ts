import axios from './request';

export type StayAvailability = {
  placeId: number;
  nights: number;
  nightlyPrice: number | null;
  roomCount: number | null;
  roomsLeft: number | null;
  /** null : la maison n'a pas déclaré ses chambres, l'hôte confirmera. */
  available: boolean | null;
  estimate: number | null;
};

export type StayBooking = {
  id: number;
  placeId: number;
  placeName?: string;
  placeAddress?: string | null;
  placeImage?: string | null;
  placePhone?: string | null;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  rooms: number;
  estimate: number | null;
  message?: string | null;
  status: string;
};

export const getStayAvailability = async (params: {
  placeId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}) =>
  (
    await axios.get<StayAvailability>(
      `v1/stays/${params.placeId}/availability`,
      {params},
    )
  ).data;

export const createStayBooking = async (data: {
  placeId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  message?: string;
}) => (await axios.post<StayBooking>('v1/stays/bookings', data)).data;

export const getMyStayBookings = async () =>
  (await axios.get<StayBooking[]>('v1/stays/bookings')).data;

export const cancelStayBooking = async (id: number) =>
  (await axios.patch<{cancelled: boolean}>(`v1/stays/bookings/${id}/cancel`))
    .data;
