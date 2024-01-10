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
  // Regular expression to validate input time in format 'hh:mm AM/PM'
  const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;

  if (!timeRegex.test(inputTime)) {
    // Return an error message or throw an exception if the input is not valid
    return "Invalid input time format. Please use 'hh:mm AM/PM' format.";
  }

  // Split the input time string into hours, minutes, and AM/PM
  const [time, ampm] = inputTime?.split(' ');
  const [hours, minutes] = time?.split(':');

  // Convert hours to 24-hour format if PM
  let transformedHours = parseInt(hours, 10);
  if (ampm.toUpperCase() === 'PM') {
    transformedHours = (transformedHours % 12) + 12;
  }

  // Format hours and minutes to ensure they have two digits
  const formattedHours = String(transformedHours).padStart(2, '0');
  const formattedMinutes = minutes.padStart(2, '0');

  // Combine the formatted values to get the desired time format '11:30:00'
  const transformedTime = `${formattedHours}:${formattedMinutes}:00`;

  return transformedTime;
}

export function isTimeWithinRange(dataTime: string) {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  const [openTimeStr, closeTimeStr] = dataTime?.split(' - ');
  const [openHour, openMinute] = openTimeStr?.split(':').map(Number);
  const [closeHour, closeMinute] = closeTimeStr?.split(':').map(Number);

  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const openTimeInMinutes = openHour * 60 + openMinute;
  const closeTimeInMinutes = closeHour * 60 + closeMinute;

  return (
    currentTimeInMinutes >= openTimeInMinutes &&
    currentTimeInMinutes <= closeTimeInMinutes
  );
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
