import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

type Props = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  onBack: () => void;
};

export default function CommunityHeader({title, subtitle, eyebrow = 'EXPÉRIENCES BARMEJ', onBack}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.accentLarge} />
      <View style={styles.accentSmall} />
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          hitSlop={10}
          onPress={onBack}
          style={({pressed}) => [styles.backButton, pressed && styles.backButtonPressed]}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <View style={styles.brandPill}><View style={styles.brandDot} /><Text style={styles.brandText}>BARMEJ</Text></View>
      </View>
      <View style={styles.eyebrowRow}><View style={styles.eyebrowLine} /><Text style={styles.eyebrow}>{eyebrow}</Text></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 210,
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 22,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#F0EBF7',
    borderWidth: 1,
    borderColor: '#E8E0F2',
  },
  accentLarge: {
    position: 'absolute', right: -42, top: -62, width: 166, height: 166,
    borderRadius: 83, backgroundColor: '#DED3EC',
  },
  accentSmall: {
    position: 'absolute', right: 58, bottom: -28, width: 76, height: 76,
    borderRadius: 38, backgroundColor: '#F3D9BC',
  },
  topRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20},
  backButton: {
    width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#45377A', shadowColor: '#45377A', shadowOpacity: 0.2,
    shadowRadius: 7, shadowOffset: {width: 0, height: 3}, elevation: 3,
  },
  backButtonPressed: {backgroundColor: '#5A4990', transform: [{scale: 0.96}]},
  backIcon: {color: '#FFFFFF', fontSize: 33, lineHeight: 35, fontWeight: '300', marginTop: -3},
  brandPill: {height: 30, flexDirection: 'row', alignItems: 'center', borderRadius: 15, paddingHorizontal: 11, backgroundColor: 'rgba(255,255,255,0.72)'},
  brandDot: {width: 6, height: 6, borderRadius: 3, marginRight: 6, backgroundColor: '#E8A45B'},
  brandText: {color: '#45377A', fontSize: 9, fontWeight: '800', letterSpacing: 1.4},
  eyebrowRow: {flexDirection: 'row', alignItems: 'center'},
  eyebrowLine: {width: 22, height: 2, borderRadius: 1, marginRight: 9, backgroundColor: '#E8A45B'},
  eyebrow: {color: '#6B5B91', fontSize: 9, lineHeight: 13, fontWeight: '800', letterSpacing: 1.55},
  title: {color: '#19152A', fontSize: 28, lineHeight: 34, fontWeight: '800', marginTop: 7, letterSpacing: -0.45, maxWidth: 310},
  subtitle: {color: '#6F687A', fontSize: 13, lineHeight: 19, marginTop: 7, maxWidth: 305},
});
