import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  AccessibilityInfo,
  Animated,
  Dimensions,
  Easing,
  LayoutChangeEvent,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import Svg, {
  ClipPath,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import {DROP_PATH, DROP_VIEWBOX} from '../../assets/brand/dropPath';

/*
 * Splash animé de Barmej.
 * La première image est STRICTEMENT identique au splash natif (fond #6A4BC4,
 * goutte blanche de 150 de haut centrée sur l'écran) : l'utilisateur ne voit
 * qu'un seul écran qui prend vie.
 *
 * 1. ondes dorées qui partent de la goutte (une goutte qui tombe dans l'eau) ;
 * 2. la goutte remonte, un reflet doré la traverse ;
 * 3. « Barmej » apparaît lettre par lettre, puis la promesse ;
 * 4. dès que l'app est prête (et au moins ~2 s), la goutte « s'ouvre » vers l'app.
 */

export const SPLASH_BACKGROUND = '#6A4BC4';
const DROP_HEIGHT = 150;
const DROP_WIDTH = (DROP_HEIGHT * DROP_VIEWBOX.width) / DROP_VIEWBOX.height;
const MIN_DURATION_MS = 2000;
const WORD = 'Barmej'.split('');

const AnimatedRect = Animated.createAnimatedComponent(Rect);

type Props = {
  /** L'application est prête à être affichée (session chargée). */
  ready?: boolean;
  /** Appelé à la fin de l'animation de sortie. */
  onFinish?: () => void;
};

function Ripple({delay, progress}: {delay: number; progress: Animated.Value}) {
  // Chaque onde est décalée dans la même boucle (0 → 1).
  const local = Animated.modulo(Animated.add(progress, delay), 1);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ripple,
        {
          opacity: local.interpolate({
            inputRange: [0, 0.15, 1],
            outputRange: [0, 0.55, 0],
          }),
          transform: [
            {
              scale: local.interpolate({
                inputRange: [0, 1],
                outputRange: [0.35, 2.6],
              }),
            },
          ],
        },
      ]}
    />
  );
}

export default function AnimatedSplash({ready = true, onFinish}: Props) {
  const [centerY, setCenterY] = useState(Dimensions.get('window').height / 2);
  const [reduceMotion, setReduceMotion] = useState(false);
  const container = useRef<React.ComponentRef<typeof View>>(null);
  const startedAt = useRef(Date.now());
  const exiting = useRef(false);

  const intro = useRef(new Animated.Value(0)).current; // montée de la goutte
  const glow = useRef(new Animated.Value(0)).current;
  const ripples = useRef(new Animated.Value(0)).current;
  const shine = useRef(new Animated.Value(-DROP_VIEWBOX.width)).current;
  const letters = useRef(WORD.map(() => new Animated.Value(0))).current;
  const tagline = useRef(new Animated.Value(0)).current;
  const loader = useRef(new Animated.Value(0)).current;
  const exit = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduceMotion)
      .catch(() => undefined);
  }, []);

  // Aligne la goutte sur le centre de l'écran, comme le splash natif
  // (sous Android, la vue React peut commencer sous la barre d'état).
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const {height} = event.nativeEvent.layout;
    container.current?.measureInWindow((_x: number, y: number) => {
      const screen = Dimensions.get('screen').height;
      const target = screen / 2 - (Number.isFinite(y) ? y : 0);
      setCenterY(target > 0 && target < height ? target : height / 2);
    });
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      Animated.timing(tagline, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      letters.forEach(value => value.setValue(1));
      return;
    }
    const native = {useNativeDriver: true} as const;
    Animated.sequence([
      Animated.delay(180),
      Animated.parallel([
        Animated.timing(glow, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.quad),
          ...native,
        }),
        Animated.spring(intro, {
          toValue: 1,
          friction: 7,
          tension: 46,
          ...native,
        }),
        Animated.sequence([
          Animated.delay(260),
          Animated.timing(shine, {
            toValue: DROP_VIEWBOX.width * 1.6,
            duration: 950,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: false,
          }),
        ]),
        Animated.sequence([
          Animated.delay(320),
          Animated.stagger(
            70,
            letters.map(value =>
              Animated.spring(value, {
                toValue: 1,
                friction: 6,
                tension: 120,
                ...native,
              }),
            ),
          ),
          Animated.timing(tagline, {
            toValue: 1,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            ...native,
          }),
        ]),
      ]),
    ]).start();

    const rippleLoop = Animated.loop(
      Animated.timing(ripples, {
        toValue: 1,
        duration: 2400,
        easing: Easing.linear,
        ...native,
      }),
    );
    const loaderLoop = Animated.loop(
      Animated.timing(loader, {
        toValue: 1,
        duration: 1300,
        easing: Easing.inOut(Easing.quad),
        ...native,
      }),
    );
    const startLoops = setTimeout(() => {
      rippleLoop.start();
      loaderLoop.start();
    }, 200);
    return () => {
      clearTimeout(startLoops);
      rippleLoop.stop();
      loaderLoop.stop();
    };
  }, [glow, intro, letters, loader, reduceMotion, ripples, shine, tagline]);

  // Sortie : dès que l'app est prête et que l'intro a eu le temps de se jouer.
  useEffect(() => {
    if (!ready || exiting.current) return;
    const wait = Math.max(
      0,
      (reduceMotion ? 500 : MIN_DURATION_MS) - (Date.now() - startedAt.current),
    );
    const timer = setTimeout(() => {
      exiting.current = true;
      Animated.timing(exit, {
        toValue: 1,
        duration: reduceMotion ? 250 : 520,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => onFinish?.());
    }, wait);
    return () => clearTimeout(timer);
  }, [exit, onFinish, ready, reduceMotion]);

  const dropTop = centerY - DROP_HEIGHT / 2;
  const lift = intro.interpolate({inputRange: [0, 1], outputRange: [0, -64]});
  const dropScale = Animated.multiply(
    intro.interpolate({inputRange: [0, 1], outputRange: [1, 0.84]}),
    exit.interpolate({inputRange: [0, 1], outputRange: [1, 9]}),
  );
  const contentOpacity = exit.interpolate({
    inputRange: [0, 0.35],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const screenOpacity = exit.interpolate({
    inputRange: [0.4, 1],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const loaderX = loader.interpolate({
    inputRange: [0, 1],
    outputRange: [-48, 120],
  });

  return (
    <Animated.View
      pointerEvents={ready ? 'none' : 'auto'}
      accessible
      accessibilityLabel="Chargement de Barmej"
      style={[styles.screen, {opacity: screenOpacity}]}>
      <StatusBar barStyle="light-content" />
      <View
        ref={container}
        onLayout={onLayout}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />

      {/* Halo qui donne de la profondeur (invisible sur la première image). */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, {opacity: glow}]}>
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient
              id="splashGlow"
              cx="50%"
              cy="44%"
              rx="75%"
              ry="55%"
              fx="50%"
              fy="44%">
              <Stop offset="0" stopColor="#9C82F0" stopOpacity="0.85" />
              <Stop offset="0.55" stopColor="#6A4BC4" stopOpacity="0.2" />
              <Stop offset="1" stopColor="#3B2577" stopOpacity="0.9" />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#splashGlow)" />
        </Svg>
      </Animated.View>

      {/* Ondes dorées autour de la goutte. */}
      {reduceMotion ? null : (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.rippleHost,
            {
              top: centerY - 90,
              opacity: contentOpacity,
              transform: [{translateY: lift}],
            },
          ]}>
          <Ripple delay={0} progress={ripples} />
          <Ripple delay={0.33} progress={ripples} />
          <Ripple delay={0.66} progress={ripples} />
        </Animated.View>
      )}

      {/* La goutte : identique au logo natif au départ. */}
      <Animated.View
        style={[
          styles.drop,
          {top: dropTop, transform: [{translateY: lift}, {scale: dropScale}]},
        ]}>
        <Svg
          width={DROP_WIDTH}
          height={DROP_HEIGHT}
          viewBox={`0 0 ${DROP_VIEWBOX.width} ${DROP_VIEWBOX.height}`}>
          <Defs>
            <ClipPath id="dropClip">
              <Path d={DROP_PATH} fillRule="evenodd" clipRule="evenodd" />
            </ClipPath>
            <LinearGradient id="shineGradient" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#F6B65C" stopOpacity="0" />
              <Stop offset="0.5" stopColor="#FFD796" stopOpacity="1" />
              <Stop offset="1" stopColor="#F6B65C" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Path d={DROP_PATH} fill="#FFFFFF" fillRule="evenodd" />
          {reduceMotion ? null : (
            <AnimatedRect
              x={shine as any}
              y={-200}
              width={DROP_VIEWBOX.width * 0.55}
              height={DROP_VIEWBOX.height + 400}
              fill="url(#shineGradient)"
              clipPath="url(#dropClip)"
              transform={`rotate(18 ${DROP_VIEWBOX.width / 2} ${DROP_VIEWBOX.height / 2})`}
            />
          )}
        </Svg>
      </Animated.View>

      {/* Nom, promesse et chargement. */}
      <Animated.View
        style={[styles.copy, {top: centerY + 34, opacity: contentOpacity}]}>
        <View style={styles.word}>
          {WORD.map((letter, index) => (
            <Animated.Text
              key={`${letter}-${index}`}
              style={[
                styles.letter,
                {
                  opacity: letters[index],
                  transform: [
                    {
                      translateY: letters[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [22, 0],
                      }),
                    },
                  ],
                },
              ]}>
              {letter}
            </Animated.Text>
          ))}
        </View>
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: tagline,
              transform: [
                {
                  translateY: tagline.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}>
          Votre prochaine sortie commence ici
        </Animated.Text>
        <Animated.View style={[styles.track, {opacity: tagline}]}>
          <Animated.View
            style={[styles.loader, {transform: [{translateX: loaderX}]}]}
          />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: SPLASH_BACKGROUND,
    overflow: 'hidden',
    zIndex: 1000,
    elevation: 1000,
  },
  rippleHost: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: '#F6B65C',
  },
  drop: {
    position: 'absolute',
    alignSelf: 'center',
    width: DROP_WIDTH,
    height: DROP_HEIGHT,
  },
  copy: {position: 'absolute', left: 0, right: 0, alignItems: 'center'},
  word: {flexDirection: 'row'},
  letter: {
    color: '#FFFFFF',
    fontSize: 46,
    lineHeight: 54,
    fontWeight: '900',
    letterSpacing: -1,
  },
  tagline: {
    marginTop: 6,
    color: 'rgba(255,255,255,.82)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  track: {
    width: 120,
    height: 3,
    borderRadius: 2,
    marginTop: 26,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,.18)',
  },
  loader: {width: 48, height: 3, borderRadius: 2, backgroundColor: '#F6B65C'},
});
