import {useCallback, useEffect, useRef, useState} from 'react';
import {requestLocation} from '../helpers/location';

// This hook is mounted only after the user opens the nearby map.
export default function useGeolocation() {
  const [position, setPosition] = useState<{
    coords: {latitude: number; longitude: number};
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const active = useRef(false);
  const retry = useCallback(async () => {
    setError(null);
    try {
      const coords = await requestLocation();
      if (active.current) setPosition({coords});
    } catch (failure) {
      if (active.current)
        setError(
          failure instanceof Error ? failure.message : 'Position indisponible',
        );
    }
  }, []);
  useEffect(() => {
    active.current = true;
    retry();
    return () => {
      active.current = false;
    };
  }, [retry]);
  return {position, error, retry};
}
