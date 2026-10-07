import React, {useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import {DiscoveryPlace} from '../../services/discovery';
import VectorIcon from '../vectorIcon';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import {fonts, night} from './theme';
import FavoriteButton from './favoriteButton';
import {FadeInView} from './motion';

const CARD_WIDTH = 216;
const CARD_GAP = 12;

const validRating = (place: DiscoveryPlace) =>
  Number(place.reviewCount) > 0 &&
  Number(place.rating) >= 1 &&
  Number(place.rating) <= 5;

const priceLabel = (place: DiscoveryPlace) =>
  place.averagePrice == null
    ? null
    : place.averagePrice === 0
      ? 'Gratuit'
      : `${place.averagePrice} TND / pers.`;

// Le serveur renvoie le créneau en UTC (« HH:mm ») : on l'affiche à l'heure locale.
const localSlot = (utc: string) => {
  const [h, m] = utc.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return utc;
  const date = new Date();
  date.setUTCHours(h, m, 0, 0);
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
};

export function DiscoveryDeck({
  places,
  onPlace,
  tone = 'dark',
  style,
}: {
  places: DiscoveryPlace[];
  onPlace: (id: number) => void;
  // « light » : titre clair, quand le deck chevauche le héros sombre.
  tone?: 'light' | 'dark';
  style?: StyleProp<ViewStyle>;
}) {
  const light = tone === 'light';
  const {width} = useWindowDimensions();
  const [page, setPage] = useState(0);
  const scroll = useRef<React.ElementRef<typeof ScrollView>>(null);
  const selected = places.slice(0, 3);
  if (!selected.length) return null;
  return (
    <View style={[styles.deck, style]}>
      <View style={styles.deckHeading}>
        <View style={styles.grow}>
          <Text style={[styles.deckLabel, light && styles.deckLabelLight]}>
            LAISSEZ-VOUS SURPRENDRE
          </Text>
          <Text
            accessibilityRole="header"
            style={[styles.title, light && styles.titleLight]}>
            Le match du moment
          </Text>
        </View>
        <Text style={[styles.deckCount, light && styles.deckCountLight]}>
          {String(Math.min(page + 1, selected.length)).padStart(2, '0')} /{' '}
          {String(selected.length).padStart(2, '0')}
        </Text>
      </View>
      <ScrollView
        ref={scroll}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={event =>
          setPage(Math.round(event.nativeEvent.contentOffset.x / width))
        }>
        {selected.map(place => (
          <View key={place.idPlace} style={{width}}>
            <Spotlight place={place} onPlace={onPlace} />
          </View>
        ))}
      </ScrollView>
      {selected.length > 1 ? (
        <View style={styles.deckDots}>
          {selected.map((place, index) => (
            <Pressable
              key={place.idPlace}
              accessibilityRole="button"
              accessibilityLabel={`Afficher ${place.placeName}`}
              accessibilityState={{selected: page === index}}
              onPress={() => {
                scroll.current?.scrollTo({x: width * index, animated: false});
                setPage(index);
              }}
              style={styles.dotHit}>
              <View style={[styles.dot, page === index && styles.dotActive]} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function Spotlight({
  place,
  onPlace,
}: {
  place: DiscoveryPlace;
  onPlace: (id: number) => void;
}) {
  const price = priceLabel(place);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Découvrir ${place.placeName}`}
      onPress={() => onPlace(place.idPlace)}
      style={({pressed}) => [styles.spotlight, pressed && styles.pressed]}>
      {place.image ? (
        <Image
          source={{uri: place.image}}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.spotlightArt}>
          <VectorIcon name="utensils" size={96} color={night.lilac} />
        </View>
      )}
      <Svg
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFill}
        pointerEvents="none">
        <Defs>
          <LinearGradient id="spotlightShade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#120C1E" stopOpacity="0.35" />
            <Stop offset="0.38" stopColor="#120C1E" stopOpacity="0.05" />
            <Stop offset="1" stopColor="#120C1E" stopOpacity="0.95" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#spotlightShade)" />
      </Svg>
      <View style={styles.spotlightTop}>
        <View style={styles.glassTag}>
          <VectorIcon name="sparkles" color={night.gold} size={14} />
          <Text style={styles.spotlightTag}>CHOISI POUR VOUS</Text>
        </View>
        <View style={styles.pills}>
          {validRating(place) ? (
            <View style={styles.glassTag}>
              <VectorIcon name="star" color={night.gold} size={13} />
              <Text style={styles.spotlightTag}>
                {Number(place.rating).toFixed(1)}
              </Text>
            </View>
          ) : null}
          <FavoriteButton idPlace={place.idPlace} placeName={place.placeName} />
        </View>
      </View>
      <View style={styles.spotlightBottom}>
        <Text numberOfLines={2} style={styles.spotlightTitle}>
          {place.placeName}
        </Text>
        {place.subTitle ? (
          <Text numberOfLines={2} style={styles.spotlightSubtitle}>
            {place.subTitle}
          </Text>
        ) : null}
        <View style={styles.spotlightAction}>
          <View style={styles.spotlightMeta}>
            {price ? <Text style={styles.metaChip}>{price}</Text> : null}
            {place.distance != null ? (
              <Text style={styles.metaChip}>
                {place.distance.toFixed(1)} km
              </Text>
            ) : null}
            <Text style={styles.spotlightActionText}>Découvrir l’adresse</Text>
          </View>
          <View style={styles.spotlightArrow}>
            <VectorIcon name="arrowRight" color={night.ink} size={22} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export function Section({
  title,
  subtitle,
  eyebrow,
  children,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

export function Notice({
  message,
  loading,
  onRetry,
}: {
  message: string;
  loading?: boolean;
  onRetry?: () => void;
}) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.notice}>
      {loading ? <ActivityIndicator color={night.violet} /> : null}
      <Text style={styles.noticeText}>{message}</Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={styles.button}>
          <Text style={styles.buttonText}>Réessayer</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// Carte immersive : la photo occupe toute la carte, les informations
// flottent sur un dégradé, les statuts sont des pastilles en verre.
export function PlaceRow({
  title,
  subtitle,
  places,
  onPlace,
}: {
  title: string;
  subtitle?: string;
  places: DiscoveryPlace[];
  onPlace: (id: number) => void;
}) {
  if (!places.length) return null;
  return (
    <Section title={title} subtitle={subtitle}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_GAP}
        style={styles.bleed}
        contentContainerStyle={styles.row}>
        {places.map((place, index) => {
          const price = priceLabel(place);
          const rated = validRating(place);
          const meta = [
            price,
            place.distance != null ? `${place.distance.toFixed(1)} km` : null,
          ].filter(Boolean);
          return (
            <FadeInView key={place.idPlace} delay={index * 80}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Découvrir ${place.placeName}`}
                onPress={() => onPlace(place.idPlace)}
                style={({pressed}) => [styles.card, pressed && styles.pressed]}>
                {place.image ? (
                  <Image
                    source={{uri: place.image}}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
                    <VectorIcon name="mapPin" size={34} color={night.lilac} />
                  </View>
                )}
                <Svg
                  width="100%"
                  height="100%"
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none">
                  <Defs>
                    <LinearGradient id="cardShade" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor="#120C1E" stopOpacity="0.3" />
                      <Stop offset="0.3" stopColor="#120C1E" stopOpacity="0" />
                      <Stop
                        offset="0.55"
                        stopColor="#120C1E"
                        stopOpacity="0.25"
                      />
                      <Stop offset="1" stopColor="#120C1E" stopOpacity="0.92" />
                    </LinearGradient>
                  </Defs>
                  <Rect width="100%" height="100%" fill="url(#cardShade)" />
                </Svg>

                <View style={styles.cardTop}>
                  <View style={styles.pills}>
                    {rated ? (
                      <View style={styles.glassPill}>
                        <VectorIcon name="star" size={11} color={night.gold} />
                        <Text style={styles.glassPillText}>
                          {Number(place.rating).toFixed(1)}
                        </Text>
                      </View>
                    ) : null}
                    {place.availableTime ? (
                      <View style={[styles.glassPill, styles.livePill]}>
                        <View style={styles.liveDot} />
                        <Text style={styles.glassPillText}>
                          {localSlot(place.availableTime)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <FavoriteButton
                    idPlace={place.idPlace}
                    placeName={place.placeName}
                  />
                </View>

                <View style={styles.cardBottom}>
                  <Text numberOfLines={2} style={styles.name}>
                    {place.placeName}
                  </Text>
                  <Text numberOfLines={1} style={styles.cardSubtitle}>
                    {place.subTitle || 'Adresse à découvrir'}
                  </Text>
                  <View style={styles.cardFoot}>
                    <View style={styles.grow}>
                      {meta.length ? (
                        <Text numberOfLines={1} style={styles.cardMeta}>
                          {meta.join('  ·  ')}
                        </Text>
                      ) : null}
                      <Text numberOfLines={1} style={styles.reviews}>
                        {rated
                          ? `${place.reviewCount} avis`
                          : 'Pas encore d’avis'}
                        {place.availableTime ? '  ·  2 personnes' : ''}
                      </Text>
                    </View>
                    <View style={styles.cardArrow}>
                      <VectorIcon
                        name="arrowRight"
                        size={16}
                        color={night.ink}
                      />
                    </View>
                  </View>
                </View>
              </Pressable>
            </FadeInView>
          );
        })}
      </ScrollView>
    </Section>
  );
}

const styles = StyleSheet.create({
  grow: {flex: 1},
  pressed: {opacity: 0.88, transform: [{scale: 0.98}]},
  deck: {marginTop: 30},
  deckHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginHorizontal: 22,
    marginBottom: 14,
  },
  deckLabel: {
    color: night.violet,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 6,
  },
  deckLabelLight: {color: night.gold},
  deckCountLight: {color: night.lilac},
  deckCount: {
    color: night.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  deckDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    marginTop: 4,
  },
  dotHit: {
    minWidth: 32,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {width: 6, height: 6, borderRadius: 3, backgroundColor: '#DCD4EC'},
  dotActive: {width: 26, backgroundColor: night.ink},
  spotlight: {
    marginHorizontal: 20,
    height: 350,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: night.deep,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(246,182,92,0.28)',
    elevation: 10,
    shadowColor: '#120C1E',
    shadowOffset: {width: 0, height: 18},
    shadowOpacity: 0.3,
    shadowRadius: 26,
  },
  spotlightArt: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 90,
  },
  spotlightTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  glassTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(18,12,30,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  spotlightTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: night.white,
  },
  spotlightBottom: {padding: 22},
  spotlightTitle: {
    fontFamily: fonts.display,
    fontSize: 31,
    lineHeight: 36,
    letterSpacing: -0.4,
    fontWeight: '700',
    color: night.white,
  },
  spotlightSubtitle: {
    color: '#D7D0E4',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  spotlightAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  spotlightMeta: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  metaChip: {
    color: night.white,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
  },
  spotlightActionText: {color: night.white, fontSize: 13, fontWeight: '700'},
  spotlightArrow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: night.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {marginTop: 36, paddingHorizontal: 22},
  eyebrow: {
    color: night.violet,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 6,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.3,
    fontWeight: '700',
    color: night.text,
  },
  titleLight: {color: night.white},
  subtitle: {fontSize: 12, lineHeight: 18, color: night.muted, marginTop: 3},
  bleed: {marginHorizontal: -22},
  row: {gap: CARD_GAP, paddingVertical: 14, paddingHorizontal: 22},
  card: {
    width: CARD_WIDTH,
    height: 300,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: night.deep,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  placeholder: {
    backgroundColor: night.plum,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  pills: {flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1},
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  glassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: 'rgba(18,12,30,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  livePill: {borderColor: 'rgba(91,224,196,0.45)'},
  glassPillText: {color: night.white, fontSize: 11, fontWeight: '800'},
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#5BE0C4',
  },
  cardBottom: {padding: 16},
  name: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: night.white,
    letterSpacing: -0.2,
  },
  cardSubtitle: {color: '#D7D0E4', fontSize: 12, marginTop: 4},
  cardFoot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.22)',
  },
  cardMeta: {color: night.white, fontSize: 12, fontWeight: '700'},
  reviews: {color: '#B9AFCB', fontSize: 11, marginTop: 3},
  cardArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: night.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notice: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 18,
    borderRadius: 20,
    backgroundColor: night.white,
    borderWidth: 1,
    borderColor: night.line,
    gap: 10,
  },
  noticeText: {fontSize: 13, lineHeight: 19, color: night.muted},
  button: {
    minHeight: 40,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: night.violet,
    borderRadius: 20,
  },
  buttonText: {color: 'white', fontWeight: '700'},
});
