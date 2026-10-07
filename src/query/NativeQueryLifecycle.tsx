import {useEffect} from 'react';
import {AppState} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {focusManager, onlineManager} from '@tanstack/react-query';

export default function NativeQueryLifecycle() {
  useEffect(() => {
    focusManager.setFocused(AppState.currentState === 'active');
    const subscription = AppState.addEventListener('change', state => {
      focusManager.setFocused(state === 'active');
    });
    const unsubscribe = NetInfo.addEventListener(state => {
      onlineManager.setOnline(
        state.isConnected !== false && state.isInternetReachable !== false,
      );
    });
    return () => {
      subscription.remove();
      unsubscribe();
      focusManager.setFocused(undefined);
    };
  }, []);
  return null;
}
