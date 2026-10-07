import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import NightArt from '../discovery/nightArt';
import {fonts, night} from '../discovery/theme';

type Props = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  onBack: () => void;
};

// En-tête « nuit » partagé par les écrans Expérience : même langage que le héros d'Explorer.
export default function CommunityHeader({title, subtitle, eyebrow = 'EXPÉRIENCES BARMEJ', onBack}: Props) {
  return (
    <View style={styles.container}>
      <NightArt />
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          hitSlop={10}
          onPress={onBack}
          style={({pressed}) => [styles.backButton, pressed && styles.pressed]}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <View style={styles.brandPill}>
          <View style={styles.brandDot} />
          <Text style={styles.brandText}>BARMEJ</Text>
        </View>
      </View>
      <View style={styles.eyebrowRow}>
        <View style={styles.eyebrowLine} />
        <Text style={styles.eyebrow}>{eyebrow}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const glass = 'rgba(255,255,255,0.08)';
const glassLine = 'rgba(255,255,255,0.14)';

const styles = StyleSheet.create({
  container: {
    minHeight: 210,
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 24,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: night.deep,
  },
  topRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22},
  backButton: {
    width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
    backgroundColor: glass, borderWidth: 1, borderColor: glassLine,
  },
  pressed: {opacity: 0.85, transform: [{scale: 0.96}]},
  backIcon: {color: night.white, fontSize: 33, lineHeight: 35, fontWeight: '300', marginTop: -3},
  brandPill: {
    height: 28, flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 11,
    backgroundColor: glass, borderWidth: 1, borderColor: glassLine,
  },
  brandDot: {width: 6, height: 6, borderRadius: 3, marginRight: 6, backgroundColor: night.gold},
  brandText: {color: night.gold, fontSize: 9, fontWeight: '800', letterSpacing: 1.6},
  eyebrowRow: {flexDirection: 'row', alignItems: 'center'},
  eyebrowLine: {width: 24, height: 1, marginRight: 10, backgroundColor: night.gold},
  eyebrow: {color: night.gold, fontSize: 9, lineHeight: 13, fontWeight: '800', letterSpacing: 2},
  title: {
    fontFamily: fonts.display, color: night.white, fontSize: 29, lineHeight: 35, fontWeight: '700',
    marginTop: 10, letterSpacing: -0.4, maxWidth: 310,
  },
  subtitle: {color: '#BDB2CE', fontSize: 13, lineHeight: 19, marginTop: 8, maxWidth: 305},
});
