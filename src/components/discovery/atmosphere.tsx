import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

// Decorative vector layers stay out of the accessibility tree and never intercept gestures.
export function Atmosphere() {
  return (
    <View pointerEvents="none" accessible={false} style={styles.background}>
      <Svg
        width="100%"
        height="620"
        viewBox="0 0 400 620"
        preserveAspectRatio="xMidYMin slice">
        <Defs>
          <RadialGradient id="violetAura">
            <Stop offset="0" stopColor="#7452EF" stopOpacity="0.13" />
            <Stop offset="1" stopColor="#7452EF" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="blueAura">
            <Stop offset="0" stopColor="#29B8CF" stopOpacity="0.08" />
            <Stop offset="1" stopColor="#29B8CF" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Ellipse cx="340" cy="100" rx="270" ry="240" fill="url(#violetAura)" />
        <Ellipse cx="5" cy="420" rx="240" ry="240" fill="url(#blueAura)" />
        <Ellipse
          cx="345"
          cy="95"
          rx="120"
          ry="44"
          rotation="-30"
          origin="345,95"
          stroke="#A994FF"
          strokeOpacity="0.15"
          fill="none"
        />
        <Circle cx="254" cy="142" r="3" fill="#B7A4FF" />
      </Svg>
    </View>
  );
}

export function PortalArt({
  color = '#AB91FF',
  variant = 0,
}: {
  color?: string;
  variant?: number;
}) {
  return (
    <Svg
      pointerEvents="none"
      width="100%"
      height="100%"
      viewBox="0 0 180 140"
      style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id={`portal-${variant}`}>
          <Stop offset="0" stopColor={color} stopOpacity="0.16" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width="180" height="140" fill={`url(#portal-${variant})`} />
      {[0, 1, 2, 3, 4].map(ring => (
        <Ellipse
          key={ring}
          cx="139"
          cy="44"
          rx={22 + ring * 10}
          ry={12 + ring * 7}
          rotation={-35 + variant * 12}
          origin="139,44"
          stroke={color}
          strokeOpacity={0.65 - ring * 0.1}
          strokeWidth="1.2"
          fill="none"
        />
      ))}
      <Circle cx="127" cy="17" r="4" fill={color} />
    </Svg>
  );
}

export function RadarArt() {
  return (
    <Svg width="112" height="112" viewBox="0 0 112 112" pointerEvents="none">
      <Circle
        cx="56"
        cy="56"
        r="50"
        stroke="#6A68A4"
        strokeOpacity="0.3"
        fill="#F1F7FC"
      />
      <Circle
        cx="56"
        cy="56"
        r="34"
        stroke="#7777A8"
        strokeOpacity="0.3"
        fill="none"
      />
      <Circle
        cx="56"
        cy="56"
        r="17"
        stroke="#7777A8"
        strokeOpacity="0.3"
        fill="none"
      />
      <Path
        d="M56 6v100M6 56h100M56 56 91 21"
        stroke="#8B82D7"
        strokeOpacity="0.4"
      />
      <Circle cx="56" cy="56" r="5" fill="#21988C" />
      <Circle cx="79" cy="32" r="4" fill="#8663D9" />
      <Circle cx="26" cy="68" r="3" fill="#21988C" />
    </Svg>
  );
}
const styles = StyleSheet.create({
  background: {position: 'absolute', top: 0, left: 0, right: 0, height: 620},
});
