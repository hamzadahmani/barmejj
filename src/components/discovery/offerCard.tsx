import React, {useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {DiscoveryData} from '../../services/discovery';
import VectorIcon from '../vectorIcon';
import {fonts, night} from './theme';

type Offer = NonNullable<DiscoveryData['offers']>[number];

// « Ticket doré » : photo à gauche, talon perforé, offre à droite.
export default function OfferCard({
  offer,
  onPlace,
}: {
  offer: Offer;
  onPlace: (id: number) => void;
}) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const photo = offer.place.image;
  return (
    <Pressable
      testID={`offer-${offer.idPlace}`}
      accessibilityRole="button"
      accessibilityLabel={`Découvrir l’offre ${offer.title} chez ${offer.place.placeName}`}
      onPress={() => onPlace(offer.idPlace)}
      style={({pressed}) => [s.card, pressed && s.pressed]}>
      <View style={s.stub}>
        {photo && photo !== failedImage ? (
          <Image
            source={{uri: photo}}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            onError={() => setFailedImage(photo)}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, s.fallback]}>
            <VectorIcon name="utensils" color={night.lilac} size={30} />
          </View>
        )}
        <View style={s.stubShade} />
        <View style={s.gift}>
          <VectorIcon name="gift" size={16} color={night.ink} />
        </View>
      </View>

      {/* Perforation du ticket */}
      <View style={s.perforation} pointerEvents="none">
        <View style={[s.notch, s.notchTop]} />
        {Array.from({length: 9}).map((_, i) => (
          <View key={i} style={s.hole} />
        ))}
        <View style={[s.notch, s.notchBottom]} />
      </View>

      <View style={s.body}>
        <Text style={s.eyebrow}>LE BON PLAN</Text>
        <Text numberOfLines={2} style={s.title}>
          {offer.title}
        </Text>
        <View style={s.placeRow}>
          <VectorIcon name="mapPin" size={12} color={night.lilac} />
          <Text numberOfLines={1} style={s.place}>
            {offer.place.placeName}
          </Text>
        </View>
        {offer.description ? (
          <Text numberOfLines={2} style={s.description}>
            {offer.description}
          </Text>
        ) : null}
        <View style={s.footer}>
          <Text style={s.action}>Voir l’offre</Text>
          <VectorIcon name="arrowRight" color={night.gold} size={14} />
        </View>
      </View>
    </Pressable>
  );
}

const STUB = 112;

const s = StyleSheet.create({
  card: {
    marginTop: 14,
    minHeight: 168,
    flexDirection: 'row',
    borderRadius: 26,
    backgroundColor: night.ink,
    borderWidth: 1,
    borderColor: 'rgba(246,182,92,0.3)',
    overflow: 'hidden',
  },
  pressed: {opacity: 0.88, transform: [{scale: 0.985}]},
  stub: {width: STUB, backgroundColor: night.plum},
  stubShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(18,12,30,0.18)',
  },
  fallback: {alignItems: 'center', justifyContent: 'center'},
  gift: {
    position: 'absolute',
    left: 12,
    top: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: night.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perforation: {
    width: 14,
    marginLeft: -7,
    marginRight: -7,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: night.page,
  },
  notchTop: {marginTop: -7},
  notchBottom: {marginBottom: -7},
  hole: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(246,182,92,0.55)',
  },
  body: {flex: 1, paddingVertical: 16, paddingLeft: 18, paddingRight: 16},
  eyebrow: {
    color: night.gold,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
  },
  title: {
    fontFamily: fonts.display,
    color: night.white,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    marginTop: 6,
  },
  placeRow: {flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6},
  place: {flex: 1, color: night.lilac, fontSize: 12, fontWeight: '600'},
  description: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  action: {color: night.gold, fontSize: 12, fontWeight: '800'},
});
