import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import VectorIcon, {VectorIconName} from '../vectorIcon';
import {fonts, night} from './theme';

// Chaque humeur a sa propre « lumière » : un dégradé profond et un halo.
const palettes = [
  {from: '#2A1D4A', to: '#120C1E', glow: '#F6B65C', accent: night.gold},
  {from: '#5A1E3C', to: '#1E0C18', glow: '#FF8FB8', accent: '#FFB3CF'},
  {from: '#0F4A45', to: '#08201E', glow: '#5BE0C4', accent: '#8FF0DA'},
  {from: '#5C3410', to: '#1F1208', glow: '#FFB25C', accent: '#FFCB8A'},
  {from: '#1B2A5C', to: '#0A1024', glow: '#8FB4FF', accent: '#B5CCFF'},
];

export default function MoodCard({
  index,
  label,
  caption,
  icon,
  testID,
  onPress,
}: {
  index: number;
  label: string;
  caption: string;
  icon: VectorIconName;
  testID: string;
  onPress: () => void;
}) {
  const p = palettes[index % palettes.length];
  const id = `mood-${index}`;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${caption}`}
      onPress={onPress}
      style={({pressed}) => [s.card, pressed && s.pressed]}>
      <Svg
        pointerEvents="none"
        width="100%"
        height="100%"
        viewBox="0 0 160 210"
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={`${id}-bg`} x1="0" y1="0" x2="0.3" y2="1">
            <Stop offset="0" stopColor={p.from} />
            <Stop offset="1" stopColor={p.to} />
          </LinearGradient>
          <RadialGradient id={`${id}-glow`} cx="0.85" cy="0.12" r="0.75">
            <Stop offset="0" stopColor={p.glow} stopOpacity="0.55" />
            <Stop offset="1" stopColor={p.glow} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="160" height="210" fill={`url(#${id}-bg)`} />
        <Rect width="160" height="210" fill={`url(#${id}-glow)`} />
        <Circle
          cx="132"
          cy="34"
          r="46"
          stroke={p.accent}
          strokeOpacity="0.22"
          fill="none"
        />
        <Circle
          cx="132"
          cy="34"
          r="70"
          stroke={p.accent}
          strokeOpacity="0.12"
          fill="none"
        />
      </Svg>
      <View style={s.watermark} pointerEvents="none">
        <VectorIcon name={icon} size={86} color={p.accent} />
      </View>

      <View style={s.iconWrap}>
        <VectorIcon name={icon} size={17} color={p.accent} />
      </View>

      <View>
        <Text style={[s.index, {color: p.accent}]}>
          {String(index + 1).padStart(2, '0')}
        </Text>
        <Text numberOfLines={2} style={s.label}>
          {label}
        </Text>
        <View style={s.footer}>
          <Text numberOfLines={1} style={s.caption}>
            {caption}
          </Text>
          <VectorIcon name="arrowRight" size={14} color={p.accent} />
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    width: 160,
    height: 210,
    padding: 16,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'space-between',
    backgroundColor: night.ink,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pressed: {opacity: 0.88, transform: [{scale: 0.97}]},
  watermark: {position: 'absolute', top: 18, right: -14, opacity: 0.14},
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  index: {fontSize: 10, fontWeight: '800', letterSpacing: 2},
  label: {
    fontFamily: fonts.display,
    color: night.white,
    fontSize: 21,
    lineHeight: 25,
    fontWeight: '700',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.22)',
  },
  caption: {flex: 1, color: 'rgba(255,255,255,0.72)', fontSize: 11},
});
