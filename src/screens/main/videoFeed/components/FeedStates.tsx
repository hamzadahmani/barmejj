import React, {memo, useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import {TAB_BAR_SPACE, displayFont, feedColors as c} from '../theme';
import FeedIcon, {FeedIconName} from './FeedIcon';

/* ---------- Squelette de chargement (même gabarit qu'une carte) ---------- */
export const FeedSkeleton = memo(function FeedSkeletonView({
  bottomInset,
}: {
  bottomInset: number;
}) {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const chrome = TAB_BAR_SPACE + bottomInset;
  return (
    <View style={s.skeleton} accessibilityLabel="Chargement des vidéos">
      <Animated.View style={[s.skeletonInner, {opacity: pulse}]}>
        <View style={[s.skRail, {bottom: chrome + 26}]}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={i === 0 ? s.skAvatar : s.skCircle} />
          ))}
        </View>
        <View style={[s.skMeta, {bottom: chrome + 20}]}>
          <View style={[s.skLine, s.skPill]} />
          <View style={[s.skLine, s.skTitle]} />
          <View style={[s.skLine, s.skAddress]} />
          <View style={[s.skLine, s.skText]} />
          <View style={[s.skLine, s.skCta]} />
        </View>
      </Animated.View>
      <Text style={s.skBrand}>Barmej Moments</Text>
    </View>
  );
});

/* ---------- État plein écran (erreur / feed vide / filtre sans résultat) ---------- */
type StateProps = {
  icon: FeedIconName;
  title: string;
  text: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export const FeedMessage = memo(function FeedMessageView({
  icon,
  title,
  text,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: StateProps) {
  return (
    <View style={s.state}>
      <View style={s.iconBadge}>
        <FeedIcon name={icon} size={28} />
      </View>
      <Text style={s.title}>{title}</Text>
      <Text style={s.text}>{text}</Text>
      {primaryLabel && onPrimary ? (
        <Pressable
          onPress={onPrimary}
          style={({pressed}) => [s.primary, pressed && s.pressed]}>
          <Text style={s.primaryText}>{primaryLabel}</Text>
        </Pressable>
      ) : null}
      {secondaryLabel && onSecondary ? (
        <Pressable
          onPress={onSecondary}
          style={({pressed}) => [s.secondary, pressed && s.pressed]}>
          <Text style={s.secondaryText}>{secondaryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
});

const s = StyleSheet.create({
  pressed: {opacity: 0.75, transform: [{scale: 0.98}]},
  skeleton: {flex: 1, backgroundColor: c.surface},
  skeletonInner: {flex: 1},
  skRail: {position: 'absolute', right: 18, gap: 22, alignItems: 'center'},
  skAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: c.surfaceRaised,
  },
  skCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: c.surfaceRaised,
  },
  skMeta: {position: 'absolute', left: 16, right: 90},
  skLine: {height: 14, borderRadius: 7, backgroundColor: c.surfaceRaised},
  skPill: {width: 90, height: 22, borderRadius: 11},
  skTitle: {width: '75%', height: 26, marginTop: 12},
  skAddress: {width: '50%', marginTop: 10},
  skText: {width: '90%', marginTop: 12},
  skCta: {width: 170, height: 42, borderRadius: 21, marginTop: 14},
  skBrand: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    color: 'rgba(255,255,255,.28)',
    fontFamily: displayFont,
    fontSize: 22,
    fontWeight: '700',
  },
  state: {
    flex: 1,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
    paddingBottom: TAB_BAR_SPACE,
  },
  iconBadge: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 18,
    color: c.text,
    fontFamily: displayFont,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '700',
    textAlign: 'center',
  },
  text: {
    marginTop: 8,
    maxWidth: 320,
    color: '#BEB5C8',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  primary: {
    marginTop: 24,
    alignSelf: 'stretch',
    height: 50,
    borderRadius: 25,
    backgroundColor: c.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {color: c.goldInk, fontSize: 14, fontWeight: '900'},
  secondary: {
    marginTop: 10,
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {color: c.text, fontSize: 13, fontWeight: '800'},
});
