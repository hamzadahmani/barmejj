function deg2rad(deg: any) {
  return deg * (Math.PI / 180);
}

export function haversine(lat1: any, lon1: any, lat2: any, lon2: any) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

export function transformTime(inputTime: any) {
  // Split the input time string into hours and minutes
  const [hours, minutes] = inputTime?.split(':');

  // Format hours and minutes to ensure they have two digits
  const formattedHours = String(parseInt(hours, 10)).padStart(2, '0');
  const formattedMinutes = minutes.padStart(2, '0');

  // Combine the formatted values to get the desired time format '11:30:00'
  const transformedTime = `${formattedHours}:${formattedMinutes}:00`;

  return transformedTime;
}

export function isTimeWithinRange(dataTime: string, now = new Date()) {
  const currentTime = now;
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  const match = dataTime?.match(/^\s*(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})\s*$/);
  if (!match) return false;
  const [openHour, openMinute, closeHour, closeMinute] = match.slice(1).map(Number);
  if (openHour > 23 || closeHour > 23 || openMinute > 59 || closeMinute > 59) return false;

  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const openTimeInMinutes = openHour * 60 + openMinute;
  const closeTimeInMinutes = closeHour * 60 + closeMinute;

  if (openTimeInMinutes === closeTimeInMinutes) return false;
  return closeTimeInMinutes > openTimeInMinutes
    ? currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes
    : currentTimeInMinutes >= openTimeInMinutes || currentTimeInMinutes < closeTimeInMinutes;
}

export const trasformedReservationTime = (startTime: Date, endTime: Date) => {
  let currentTime = new Date(startTime);

  const timeIntervals = [];
  while (currentTime <= endTime) {
    const formattedTime =
      currentTime.getUTCHours().toString().padStart(2, '0') +
      ':' +
      currentTime.getUTCMinutes().toString().padStart(2, '0');

    timeIntervals.push({label: formattedTime, value: formattedTime});

    currentTime.setUTCMinutes(currentTime.getUTCMinutes() + 30);
  }
  return timeIntervals;
};

export const isOpen = (horaire: string | null) =>
  horaire ? isTimeWithinRange(horaire) : false;
