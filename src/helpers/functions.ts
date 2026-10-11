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

// Les établissements sont en Tunisie (UTC+1, sans heure d'été) : on compare
// leurs horaires à l'heure de Tunis, quel que soit le fuseau du téléphone.
const TUNIS_UTC_OFFSET_MINUTES = 60;
const HOURS_PATTERN =
  /^\s*(\d{1,2})[:hH](\d{2})\s*[-–—à]\s*(\d{1,2})[:hH](\d{2})\s*$/;

export const tunisMinutesOfDay = (now = new Date()) =>
  (now.getUTCHours() * 60 + now.getUTCMinutes() + TUNIS_UTC_OFFSET_MINUTES) %
  (24 * 60);

const parseHours = (dataTime?: string | null) => {
  const match = dataTime?.match(HOURS_PATTERN);
  if (!match) return null;
  const [openHour, openMinute, closeHour, closeMinute] = match
    .slice(1)
    .map(Number);
  if (openHour > 23 || closeHour > 23 || openMinute > 59 || closeMinute > 59)
    return null;
  return {
    open: openHour * 60 + openMinute,
    close: closeHour * 60 + closeMinute,
    openLabel: `${String(openHour).padStart(2, '0')}:${String(
      openMinute,
    ).padStart(2, '0')}`,
  };
};

export function isTimeWithinRange(dataTime: string, now = new Date()) {
  const hours = parseHours(dataTime);
  if (!hours || hours.open === hours.close) return false;
  const current = tunisMinutesOfDay(now);
  return hours.close > hours.open
    ? current >= hours.open && current < hours.close
    : current >= hours.open || current < hours.close;
}

/** « Ouvre à 09:00 » quand l'établissement est fermé, sinon null. */
export const openingHint = (dataTime?: string | null, now = new Date()) => {
  const hours = parseHours(dataTime);
  if (!hours || isTimeWithinRange(dataTime as string, now)) return null;
  return `Ouvre à ${hours.openLabel}`;
};

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
