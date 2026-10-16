import {queryKeys} from '../../../query/keys';
import React, {useCallback, useState} from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {RadarArt} from '../../../components/discovery/atmosphere';
import MoodCard from '../../../components/discovery/moodCard';
import {
  DiscoverySkeleton,
  FadeInView,
} from '../../../components/discovery/motion';
import NightArt from '../../../components/discovery/nightArt';
import {fonts, night, tints} from '../../../components/discovery/theme';
import OfferCard from '../../../components/discovery/offerCard';
import SearchBar from '../../../components/search';
import VectorIcon, {VectorIconName} from '../../../components/vectorIcon';
import {
  Notice,
  PlaceRow,
  Section,
  DiscoveryDeck,
} from '../../../components/discovery/sections';
import {interests} from '../../../helpers/interests';
import {requestLocation} from '../../../helpers/location';
import {getDiscovery} from '../../../services/discovery';
import {getProfilAPI} from '../../../services/profil';
import {getUpcomingReservationAPI} from '../../../services/reservation';
import {useAuth} from '../../../routes/auth/authProvider';

const moods = [
  {label: 'Ce soir', icon: 'clock', caption: 'La ville vous attend'},
  {label: 'En amoureux', icon: 'heart', caption: 'Juste vous deux'},
  {label: 'Petit budget', icon: 'wallet', caption: 'Petits prix, grand soir'},
  {label: 'Avec des amis', icon: 'users', caption: 'À plusieurs, c’est mieux'},
  {label: 'Sortie calme', icon: 'moon', caption: 'Ralentir un peu'},
] as const;

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
};

export default function ExploreHome({navigation}: any) {
  const {userInfo} = useAuth();
  const insets = useSafeAreaInsets();
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const userId = Number(userInfo?.idUser);
  const discovery = useQuery({
    queryKey: [...queryKeys.discovery, userId, coordinates],
    queryFn: () => getDiscovery(userId, coordinates),
    enabled: Number.isInteger(userId) && userId > 0,
    staleTime: 30000,
  });
  const profile = useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfilAPI,
  });
  const booking = useQuery({
    queryKey: [...queryKeys.upcomingReservation, userId],
    queryFn: getUpcomingReservationAPI,
  });
  const {refetch: refreshDiscovery} = discovery;
  const {refetch: refreshBooking} = booking;
  const {refetch: refreshProfile} = profile;
  useFocusEffect(
    useCallback(() => {
      refreshDiscovery();
      refreshBooking();
      refreshProfile();
    }, [refreshDiscovery, refreshBooking, refreshProfile]),
  );
  const openPlace = (id: number) =>
    navigation.navigate('Details', {id, source: 'list'});
  const openTab = (name: string, params?: object) =>
    navigation.getParent()?.navigate(name, params);
  const locate = async () => {
    setLocating(true);
    setLocationError('');
    try {
      setCoordinates(await requestLocation());
    } catch (error) {
      setLocationError(
        error instanceof Error ? error.message : 'Position indisponible.',
      );
    } finally {
      setLocating(false);
    }
  };
  const data = discovery.data;
  const currentBooking = booking.data;
  const hasDeck = (data?.forYou.length ?? 0) > 0;
  const firstName =
    profile.data?.firstName || userInfo?.firstName || 'explorateur';

  const quickActions: Array<{
    testID: string;
    icon: VectorIconName;
    label: string;
    caption: string;
    tint: {bg: string; fg: string};
    onPress: () => void;
    a11y?: string;
  }> = [
    {
      testID: 'explorer-map',
      icon: 'mapPin',
      label: 'Carte',
      caption: 'Autour de moi',
      tint: {bg: 'rgba(201,184,255,0.14)', fg: night.lilac},
      onPress: () => navigation.navigate('NearMe'),
      a11y: 'Explorer la carte',
    },
    {
      testID: 'explorer-planner',
      icon: 'sparkles',
      label: 'Barmejli',
      caption: 'Planifier ma sortie',
      tint: {bg: 'rgba(246,182,92,0.16)', fg: night.gold},
      // initial: false garde l'accueil Expérience sous Barmejli : le bouton
      // Retour y ramène au lieu de quitter l'onglet.
      onPress: () =>
        openTab('Expérience Barmej', {screen: 'Barmejli', initial: false}),
      a11y: 'Planifier une sortie avec Barmejli',
    },
    {
      testID: 'explorer-favorites',
      icon: 'heart',
      label: 'Favoris',
      caption: 'Mes adresses',
      tint: {bg: 'rgba(255,159,203,0.14)', fg: '#FF9FCB'},
      onPress: () => navigation.navigate('FavoriteList'),
      a11y: 'Mes adresses favorites',
    },
  ];

  return (
    <ScrollView
      testID="explorer-home"
      style={s.screen}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: insets.bottom + 120}}
      refreshControl={
        <RefreshControl
          refreshing={
            discovery.isRefetching ||
            booking.isRefetching ||
            profile.isRefetching
          }
          onRefresh={() => {
            Promise.all([
              discovery.refetch(),
              booking.refetch(),
              profile.refetch(),
            ]);
          }}
          colors={[night.violet]}
          tintColor={night.gold}
          progressBackgroundColor={night.white}
        />
      }>
      {/* Héros de nuit : salutation, titre éditorial, recherche et raccourcis */}
      <View style={[s.hero, hasDeck && s.heroWithDeck]}>
        <NightArt />
        <View style={s.top}>
          <Pressable
            testID="explorer-profile"
            accessibilityRole="button"
            accessibilityLabel="Ouvrir mon profil"
            onPress={() => openTab('Profile')}
            style={({pressed}) => [s.avatar, pressed && s.pressed]}>
            {profile.data?.userPhoto ? (
              <Image
                source={{uri: profile.data.userPhoto}}
                style={s.avatarImage}
              />
            ) : (
              <Text style={s.avatarLetter}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            )}
          </Pressable>
          <View style={s.grow}>
            <Text style={s.hello}>{greeting()}</Text>
            <Text numberOfLines={1} style={s.name}>
              {firstName}
            </Text>
          </View>
          <View style={s.cityPill}>
            <VectorIcon name="mapPin" size={13} color={night.gold} />
            <Text style={s.cityText}>Tunisie</Text>
          </View>
        </View>

        <View style={s.rule}>
          <View style={s.ruleLine} />
          <Text style={s.ruleText}>L’ART DE SORTIR</Text>
        </View>
        <Text style={s.heroTitle}>
          Quelle sera votre{'\n'}prochaine <Text style={s.accent}>sortie</Text>{' '}
          ?
        </Text>
        <Text style={s.heroCopy}>
          Des adresses choisies selon votre humeur, votre moment et votre
          budget.
        </Text>
        <View style={s.search}>
          <SearchBar navigation={navigation} appearance="pearl" />
        </View>

        {/* Raccourcis regroupés dans une seule barre en verre */}
        <View style={s.dock}>
          {quickActions.map((action, index) => (
            <React.Fragment key={action.testID}>
              {index > 0 ? <View style={s.dockDivider} /> : null}
              <Pressable
                testID={action.testID}
                accessibilityRole="button"
                accessibilityLabel={action.a11y}
                onPress={action.onPress}
                style={({pressed}) => [s.dockItem, pressed && s.pressed]}>
                <View style={[s.dockIcon, {backgroundColor: action.tint.bg}]}>
                  <VectorIcon
                    name={action.icon}
                    size={18}
                    color={action.tint.fg}
                  />
                </View>
                <Text style={s.dockLabel}>{action.label}</Text>
                <Text numberOfLines={1} style={s.dockCaption}>
                  {action.caption}
                </Text>
              </Pressable>
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* La sélection du moment chevauche le héros */}
      <DiscoveryDeck
        tone="light"
        style={s.deckOverlap}
        places={data?.forYou ?? []}
        onPlace={openPlace}
      />

      {/* Prochaine réservation */}
      {booking.isError ? (
        <Notice
          message="Votre prochaine réservation n’a pas pu être chargée."
          onRetry={() => {
            booking.refetch();
          }}
        />
      ) : null}
      {currentBooking ? (
        <Section eyebrow="VOTRE AGENDA" title="C’est prévu">
          <Pressable
            testID="explorer-booking"
            accessibilityRole="button"
            onPress={() => openTab('Reservations')}
            style={({pressed}) => [s.ticket, pressed && s.pressed]}>
            <View style={s.ticketDate}>
              <VectorIcon name="ticket" size={20} color={night.ink} />
              <Text style={s.ticketTime}>
                {currentBooking.reservationTime?.slice(0, 5)}
              </Text>
            </View>
            <View style={s.ticketNotch} />
            <View style={s.grow}>
              <Text numberOfLines={1} style={s.ticketTitle}>
                {currentBooking.placeName}
              </Text>
              <Text style={s.ticketMeta}>
                {currentBooking.reservationDate?.slice(0, 10)} ·{' '}
                {currentBooking.numberOfPersons} pers.
              </Text>
              <View style={s.ticketLinkRow}>
                <Text style={s.ticketLink}>Voir mes réservations</Text>
                <VectorIcon name="arrowRight" size={13} color={night.gold} />
              </View>
            </View>
          </Pressable>
        </Section>
      ) : null}

      {/* Catégories en puces */}
      <Section eyebrow="PAR ENVIE" title="Envie de…">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.bleed}
          contentContainerStyle={s.categories}>
          {interests.map((interest, index) => {
            const tint = tints[index % tints.length];
            return (
              <Pressable
                key={interest.key}
                testID={`interest-${interest.key}`}
                accessibilityRole="button"
                accessibilityLabel={`Explorer ${interest.label}`}
                onPress={() =>
                  navigation.navigate('HomeScreen', {interest: interest.key})
                }
                style={({pressed}) => [s.interest, pressed && s.pressed]}>
                <View style={[s.interestIcon, {backgroundColor: tint.bg}]}>
                  <VectorIcon name={interest.icon} size={17} color={tint.fg} />
                </View>
                <Text numberOfLines={1} style={s.interestText}>
                  {interest.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Section>

      {/* Humeurs */}
      <Section eyebrow="VOTRE HUMEUR" title="Selon votre humeur">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.bleed}
          contentContainerStyle={s.moods}>
          {moods.map((mood, index) => (
            <FadeInView key={mood.label} delay={index * 70}>
              <MoodCard
                index={index}
                testID={`mood-${mood.label}`}
                label={mood.label}
                caption={mood.caption}
                icon={mood.icon}
                onPress={() =>
                  navigation.navigate('HomeScreen', {intent: mood.label})
                }
              />
            </FadeInView>
          ))}
        </ScrollView>
      </Section>

      {profile.isError ? (
        <Notice
          message="Vos préférences n’ont pas pu être actualisées."
          onRetry={() => {
            profile.refetch();
          }}
        />
      ) : null}
      {discovery.isLoading ? (
        <DiscoverySkeleton message="Nous préparons vos découvertes…" />
      ) : null}
      {discovery.isError ? (
        <Notice
          message="Impossible de charger vos découvertes. Vérifiez votre connexion."
          onRetry={() => {
            discovery.refetch();
          }}
        />
      ) : null}
      {data && !data.forYou.length ? (
        <Notice
          message="Aucune adresse disponible pour le moment."
          onRetry={() => {
            discovery.refetch();
          }}
        />
      ) : null}

      <PlaceRow
        title="Votre prochaine obsession"
        subtitle="Des adresses choisies selon vos envies."
        places={data?.forYou.slice(3) ?? []}
        onPlace={openPlace}
      />
      <PlaceRow
        title="Disponible maintenant"
        subtitle="Une table pour deux dans l’heure. À confirmer en réservant."
        places={data?.availableNow ?? []}
        onPlace={openPlace}
      />
      {data?.offers?.length ? (
        <Section
          eyebrow="PRIVILÈGES"
          title="Les bons plans"
          subtitle="Une bonne adresse. Un petit plus.">
          {data.offers.map((offer, index) => (
            <FadeInView key={offer.idPlace} delay={index * 90}>
              <OfferCard offer={offer} onPlace={openPlace} />
            </FadeInView>
          ))}
        </Section>
      ) : null}

      {/* Radar */}
      <Section eyebrow="À DEUX PAS" title="Autour de vous">
        <Pressable
          testID="explorer-locate"
          accessibilityRole="button"
          accessibilityState={{disabled: locating}}
          disabled={locating}
          onPress={locate}
          style={({pressed}) => [s.radar, pressed && s.pressed]}>
          <View style={s.radarArt}>
            <RadarArt />
          </View>
          <View style={s.grow}>
            <Text style={s.radarTitle}>
              {locating
                ? 'Localisation…'
                : coordinates
                  ? 'Actualiser ma position'
                  : 'Afficher les adresses proches'}
            </Text>
            <Text style={s.radarCopy}>
              Trois adresses proches, pour improviser une sortie.
            </Text>
            <View style={s.radarButton}>
              <Text style={s.radarButtonText}>Activer mon radar</Text>
              <VectorIcon name="arrowRight" size={15} color={night.ink} />
            </View>
          </View>
        </Pressable>
        {locationError ? (
          <Notice message={locationError} onRetry={locate} />
        ) : null}
        {coordinates && data && !discovery.isFetching && !data.nearby.length ? (
          <Text style={s.copy}>Aucune adresse à moins de 20 km.</Text>
        ) : null}
      </Section>
      <PlaceRow
        title="À proximité"
        places={data?.nearby ?? []}
        onPlace={openPlace}
      />
      <PlaceRow
        title="Tout juste arrivés"
        subtitle="Adresses ajoutées au cours des 30 derniers jours."
        places={data?.newPlaces ?? []}
        onPlace={openPlace}
      />
      <View style={s.footer}>
        <View style={s.footerLine} />
        <Text style={s.footerText}>MOINS DE ROUTINE. PLUS DE DEHORS.</Text>
        <View style={s.footerLine} />
      </View>
    </ScrollView>
  );
}

const glass = 'rgba(255,255,255,0.07)';
const glassLine = 'rgba(255,255,255,0.13)';

const s = StyleSheet.create({
  screen: {flex: 1, backgroundColor: night.page},
  grow: {flex: 1},
  pressed: {opacity: 0.85, transform: [{scale: 0.97}]},
  hero: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 26,
    backgroundColor: night.deep,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  // Espace réservé sous les raccourcis pour la carte qui chevauche le héros.
  heroWithDeck: {paddingBottom: 172},
  deckOverlap: {marginTop: -150},
  top: {flexDirection: 'row', alignItems: 'center', gap: 12},
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: night.violet,
    borderWidth: 1.5,
    borderColor: night.gold,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {width: 41, height: 41, borderRadius: 21},
  avatarLetter: {
    fontFamily: fonts.display,
    fontSize: 19,
    fontWeight: '700',
    color: night.white,
  },
  hello: {
    color: '#A99CC4',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  name: {color: night.white, fontSize: 17, fontWeight: '800', marginTop: 1},
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    backgroundColor: glass,
    borderWidth: 1,
    borderColor: glassLine,
  },
  cityText: {color: night.white, fontSize: 12, fontWeight: '700'},
  rule: {flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 24},
  ruleLine: {width: 26, height: 1, backgroundColor: night.gold},
  ruleText: {
    color: night.gold,
    fontSize: 10,
    letterSpacing: 2.4,
    fontWeight: '700',
  },
  heroTitle: {
    fontFamily: fonts.display,
    color: night.white,
    fontSize: 33,
    lineHeight: 40,
    letterSpacing: -0.6,
    fontWeight: '700',
    marginTop: 12,
  },
  accent: {color: night.gold, fontStyle: 'italic'},
  heroCopy: {
    color: '#BDB2CE',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 18,
    maxWidth: 290,
  },
  search: {zIndex: 20},
  dock: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: glass,
    borderWidth: 1,
    borderColor: glassLine,
  },
  dockItem: {flex: 1, alignItems: 'center', paddingHorizontal: 4},
  dockDivider: {width: 1, marginVertical: 8, backgroundColor: glassLine},
  dockIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dockLabel: {color: night.white, fontSize: 13, fontWeight: '800'},
  dockCaption: {color: '#A99CC4', fontSize: 10, marginTop: 2},
  ticket: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    borderRadius: 24,
    backgroundColor: night.ink,
    overflow: 'hidden',
  },
  ticketDate: {
    width: 84,
    alignSelf: 'stretch',
    paddingVertical: 18,
    backgroundColor: night.gold,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  ticketTime: {
    fontFamily: fonts.display,
    color: night.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  ticketNotch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: -7,
    marginRight: 9,
    backgroundColor: night.page,
  },
  ticketTitle: {
    fontFamily: fonts.display,
    color: night.white,
    fontSize: 18,
    fontWeight: '700',
    paddingRight: 16,
  },
  ticketMeta: {color: '#BDB2CE', fontSize: 12, marginTop: 5},
  ticketLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  ticketLink: {color: night.gold, fontWeight: '700', fontSize: 12},
  bleed: {marginHorizontal: -22},
  categories: {paddingHorizontal: 22, paddingTop: 14, gap: 10},
  interest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    paddingLeft: 6,
    paddingRight: 16,
    borderRadius: 23,
    backgroundColor: night.white,
    borderWidth: 1,
    borderColor: night.line,
  },
  interestIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interestText: {fontSize: 13, fontWeight: '700', color: night.text},
  moods: {gap: 12, paddingHorizontal: 22, paddingTop: 14},
  radar: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    marginTop: 14,
    padding: 18,
    borderRadius: 26,
    backgroundColor: night.deep,
  },
  radarArt: {transform: [{scale: 0.9}]},
  radarTitle: {
    fontFamily: fonts.display,
    fontSize: 17,
    fontWeight: '700',
    color: night.white,
  },
  radarCopy: {color: '#BDB2CE', fontSize: 12, lineHeight: 18, marginTop: 6},
  copy: {color: night.muted, fontSize: 12, lineHeight: 18, marginTop: 6},
  radarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
    backgroundColor: night.gold,
  },
  radarButtonText: {color: night.ink, fontWeight: '800', fontSize: 12},
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 44,
    marginHorizontal: 22,
  },
  footerLine: {flex: 1, height: 1, backgroundColor: night.line},
  footerText: {
    fontFamily: fonts.display,
    fontStyle: 'italic',
    fontSize: 10,
    letterSpacing: 2,
    color: night.muted,
  },
});
