import {useIsFocused} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {AppState} from 'react-native';

/** Vrai uniquement si l'écran est affiché ET l'application au premier plan. */
export function usePlaybackAllowed() {
  const focused = useIsFocused();
  const [appActive, setAppActive] = useState(
    AppState.currentState === 'active',
  );
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state =>
      setAppActive(state === 'active'),
    );
    return () => subscription.remove();
  }, []);
  return focused && appActive;
}
