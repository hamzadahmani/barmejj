import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {useEffect, useState} from 'react';

const isLowData = (state: NetInfoState) => {
  const details = state.details as {
    isConnectionExpensive?: boolean;
    cellularGeneration?: string | null;
  } | null;
  return Boolean(
    details?.isConnectionExpensive ||
    details?.cellularGeneration === '2g' ||
    details?.cellularGeneration === '3g',
  );
};

/**
 * Ne re-rend l'écran que lorsque le mode « données réduites » bascule,
 * contrairement à useNetInfo() qui re-rend à chaque événement réseau.
 */
export function useLowDataMode() {
  const [lowData, setLowData] = useState(false);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const next = isLowData(state);
      setLowData(previous => (previous === next ? previous : next));
    });
    return unsubscribe;
  }, []);
  return lowData;
}
