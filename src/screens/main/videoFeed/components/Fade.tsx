import React, {memo} from 'react';
import {StyleSheet} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';

// Dégradé statique : rendu une seule fois par carte, jamais re-rendu (memo).
function Fade({
  id,
  position,
  height,
}: {
  id: string;
  position: 'top' | 'bottom';
  height: number;
}) {
  const top = position === 'top';
  return (
    <Svg
      pointerEvents="none"
      width="100%"
      height={height}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={[styles.base, top ? styles.top : styles.bottom]}>
      <Defs>
        <LinearGradient
          id={id}
          x1="0"
          y1={top ? '1' : '0'}
          x2="0"
          y2={top ? '0' : '1'}>
          <Stop offset="0" stopColor="#08050E" stopOpacity="0" />
          <Stop
            offset="0.35"
            stopColor="#08050E"
            stopOpacity={top ? '0.12' : '0.2'}
          />
          <Stop
            offset="0.7"
            stopColor="#08050E"
            stopOpacity={top ? '0.35' : '0.62'}
          />
          <Stop
            offset="1"
            stopColor="#08050E"
            stopOpacity={top ? '0.6' : '0.95'}
          />
        </LinearGradient>
      </Defs>
      <Rect width="100" height="100" fill={`url(#${id})`} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  base: {position: 'absolute', left: 0, right: 0},
  top: {top: 0},
  bottom: {bottom: 0},
});

export default memo(Fade);
