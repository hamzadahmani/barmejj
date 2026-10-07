import React, {useEffect, useRef} from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {night} from './theme';

// Respecte le réglage « Réduire les animations » du téléphone.
function useReducedMotion() {
  const reduced = useRef(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then(value => {
        if (active) reduced.current = value;
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return reduced;
}

// Apparition douce : léger fondu et montée de 14 px.
export function FadeInView({
  delay = 0,
  style,
  children,
}: {
  delay?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();
  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: reduced.current ? 0 : 420,
      delay: reduced.current ? 0 : Math.min(delay, 420),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [delay, progress, reduced]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [14, 0],
              }),
            },
          ],
        },
      ]}>
      {children}
    </Animated.View>
  );
}

// Bloc gris qui « respire » pendant le chargement.
function usePulse() {
  const pulse = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return pulse;
}

function Bone({style}: {style: StyleProp<ViewStyle>}) {
  return <View style={[s.bone, style]} />;
}

// Squelette de l'écran Explorer : carte en vedette puis une rangée d'adresses.
export function DiscoverySkeleton({message}: {message: string}) {
  const pulse = usePulse();
  return (
    <View
      accessible
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
      style={s.wrap}>
      <Animated.View style={{opacity: pulse}}>
        <Bone style={s.eyebrow} />
        <Bone style={s.title} />
        <Bone style={s.hero} />
        <Bone style={[s.eyebrow, s.spaced]} />
        <Bone style={s.title} />
        <View style={s.row}>
          <Bone style={s.card} />
          <Bone style={s.card} />
        </View>
      </Animated.View>
      <Text style={s.message}>{message}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {paddingHorizontal: 20, marginTop: 30},
  bone: {backgroundColor: '#E6E0F1', borderRadius: 10},
  eyebrow: {width: 110, height: 9, borderRadius: 5},
  title: {width: 210, height: 22, marginTop: 10, borderRadius: 8},
  hero: {height: 300, borderRadius: 32, marginTop: 16},
  spaced: {marginTop: 34},
  row: {flexDirection: 'row', gap: 12, marginTop: 16, overflow: 'hidden'},
  card: {width: 216, height: 300, borderRadius: 28},
  message: {
    color: night.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});
