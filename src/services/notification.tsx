import axios from './request';

export const getNotificationsAPI = async () => {
  const response = await axios.get<any>('notifications');
  return response.data;
};

export const markNotificationReadAPI = async (id: number) => {
  await axios.patch(`notifications/${id}/read`);
};

export const syncReservationRemindersAPI = async () => {
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const response = await axios.post('reservations/reminders/sync', {date, time});
  return response.data;
};

export const getUnreadNotificationCountAPI = async () =>
  (await axios.get('notifications/unread-count')).data as {count: number};

export const markAllNotificationsReadAPI = async () =>
  (await axios.patch('notifications/read-all')).data;
