import {useEffect, useState} from 'react';
import Geolocation, {
  GeolocationResponse,
} from '@react-native-community/geolocation';

interface GeolocationHookResult {
  position: GeolocationResponse | null;
  error: any;
}

const useGeolocation = (): GeolocationHookResult => {
  const [position, setPosition] = useState<GeolocationResponse | null>(null);
  const [error, setError] = useState<any>(null);
  useEffect(() => {
    Geolocation.getCurrentPosition(info => setPosition(info));

    const watchId = Geolocation.watchPosition(
      position => {
        setPosition(position);
      },
      error => {
        setError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 10000,
      },
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, []);

  return {position, error};
};

export default useGeolocation;
