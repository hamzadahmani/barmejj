import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

const arch = (x: number, w: number, top: number) => {
  const r = w / 2;
  return `M${x} 420 V${top + r} A${r} ${r} 0 0 1 ${x + w} ${top + r} V420`;
};

// Décor du héros : dégradé de nuit, arches inspirées des portes tunisiennes
// et quelques étoiles. Purement décoratif.
export default function NightArt() {
  // Taille mesurée : les tailles en pourcentage ne couvrent pas tout le héros sur Android.
  const [size, setSize] = useState({width: 0, height: 0});
  return (
    <View
      pointerEvents="none"
      accessible={false}
      style={[StyleSheet.absoluteFill, styles.base]}
      onLayout={event => {
        const {width, height} = event.nativeEvent.layout;
        setSize({width, height});
      }}>
      {size.width > 0 ? (
        <Svg
          pointerEvents="none"
          accessible={false}
          width={size.width}
          height={size.height}
          viewBox="0 0 400 420"
          preserveAspectRatio="xMaxYMin slice">
          <Defs>
            <LinearGradient id="nightSky" x1="0" y1="0" x2="0.4" y2="1">
              <Stop offset="0" stopColor="#1A1327" />
              <Stop offset="0.6" stopColor="#261C3A" />
              <Stop offset="1" stopColor="#34264F" />
            </LinearGradient>
            <RadialGradient id="nightGlow" cx="0.85" cy="0.15" r="0.6">
              <Stop offset="0" stopColor="#7251C9" stopOpacity="0.45" />
              <Stop offset="1" stopColor="#7251C9" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="goldGlow" cx="0.05" cy="0.95" r="0.5">
              <Stop offset="0" stopColor="#F6B65C" stopOpacity="0.16" />
              <Stop offset="1" stopColor="#F6B65C" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect width="400" height="420" fill="url(#nightSky)" />
          <Rect width="400" height="420" fill="url(#nightGlow)" />
          <Rect width="400" height="420" fill="url(#goldGlow)" />
          <Path
            d={arch(262, 150, 18)}
            stroke="#F6B65C"
            strokeOpacity="0.1"
            strokeWidth="1.2"
            fill="none"
          />
          <Path
            d={arch(282, 110, 48)}
            stroke="#F6B65C"
            strokeOpacity="0.16"
            strokeWidth="1.2"
            fill="none"
          />
          <Path
            d={arch(302, 70, 78)}
            stroke="#C9B8FF"
            strokeOpacity="0.22"
            strokeWidth="1.2"
            fill="none"
          />
          <Path
            d="M337 92 v10 M332 97 h10"
            stroke="#F6B65C"
            strokeOpacity="0.55"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <Circle cx="214" cy="40" r="1.6" fill="#FFFFFF" fillOpacity="0.55" />
          <Circle cx="168" cy="86" r="1.1" fill="#FFFFFF" fillOpacity="0.4" />
          <Circle cx="248" cy="132" r="1.3" fill="#F6B65C" fillOpacity="0.6" />
          <Circle cx="120" cy="30" r="1" fill="#FFFFFF" fillOpacity="0.35" />
          <Circle cx="388" cy="200" r="1.2" fill="#FFFFFF" fillOpacity="0.4" />
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {backgroundColor: '#1A1327'},
});
