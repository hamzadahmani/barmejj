import Geolocation from '@react-native-community/geolocation';
import {PermissionsAndroid, Platform} from 'react-native';

export async function requestLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  if (Platform.OS === 'android') {
    const permission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (permission !== PermissionsAndroid.RESULTS.GRANTED)
      throw new Error(
        'Autorisez la localisation pour afficher les adresses proches.',
      );
  }
  return new Promise((resolve, reject) =>
    Geolocation.getCurrentPosition(
      position =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      () =>
        reject(
          new Error(
            'Position indisponible. Activez la localisation puis réessayez.',
          ),
        ),
      {enableHighAccuracy: false, timeout: 12000, maximumAge: 60000},
    ),
  );
}
