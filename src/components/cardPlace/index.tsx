import {queryKeys, mutationEffects} from '../../query/keys';
import {useMutation, useQuery} from '@tanstack/react-query';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Color} from '../../helpers/constatn';
import {isOpen} from '../../helpers/functions';
import {
  addFavoritesAPI,
  deleteFavoritesAPI,
  getFavoritesAPI,
} from '../../services/favorites';
import VectorIcon from '../vectorIcon';

const distanceLabel = (distance?: number | null) => {
  if (distance == null || !Number.isFinite(distance)) return 'À proximité';
  if (distance < 1) return `${Math.max(1, Math.round(distance * 1000))} m`;
  return `${distance.toFixed(1)} km`;
};

export default function CardItem({
  imgUrl,
  navigation,
  placeName,
  subTitle,
  id,
  distance,
  horaire,
  featured,
  verified,
  rating,
  reviewCount,
  averagePrice,
  cuisineType,
  placeAdress,
}: any) {
  const {
    data: favorites = [],
    isPending: favoritesLoading,
    isError: favoritesError,
    refetch: refetchFavorites,
  } = useQuery({queryKey: queryKeys.favorites, queryFn: getFavoritesAPI});
  const favorite = favorites.some(
    (place: {idPlace: number}) => Number(place.idPlace) === Number(id),
  );
  const open = isOpen(horaire);
  const mutation = useMutation({
    meta: mutationEffects.favorites,
    mutationFn: async (next: boolean) =>
      next ? addFavoritesAPI({idPlace: id}) : deleteFavoritesAPI(String(id)),
    onError: () => Alert.alert('Favoris indisponibles', 'Veuillez réessayer.'),
  });
  const favoriteBusy = mutation.isPending || favoritesLoading;
  const toggleFavorite = () => {
    if (favoriteBusy) return;
    if (favoritesError) {
      void refetchFavorites();
      return;
    }
    mutation.mutate(!favorite);
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Découvrir ${placeName}`}
      onPress={() =>
        navigation.navigate('Details', {id, distance, source: 'list'})
      }
      style={({pressed}) => [s.card, pressed && s.pressed]}>
      <View style={s.visual}>
        {imgUrl ? (
          <Image source={{uri: imgUrl}} style={s.image} />
        ) : (
          <View style={[s.image, s.fallback]}>
            <VectorIcon name="utensils" size={34} color="#8A799E" />
          </View>
        )}
        <View style={s.scrim} />
        <View style={s.topRow}>
          {featured || verified ? (
            <View style={s.badge}>
              <VectorIcon
                name={featured ? 'sparkles' : 'check'}
                size={13}
                color="#F6B65C"
              />
              <Text style={s.badgeText}>
                {featured ? 'SÉLECTION BARMEJ' : 'VÉRIFIÉ'}
              </Text>
            </View>
          ) : (
            <View />
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'
            }
            onPress={event => {
              event.stopPropagation();
              toggleFavorite();
            }}
            style={s.favorite}>
            {favoriteBusy ? (
              <ActivityIndicator size="small" color={Color.main} />
            ) : (
              <VectorIcon
                name="heart"
                size={21}
                color={favorite ? '#D85770' : '#33264D'}
                strokeWidth={favorite ? 2.5 : 1.9}
              />
            )}
          </Pressable>
        </View>
        {distance != null && Number.isFinite(distance) ? (
          <View style={s.distance}>
            <VectorIcon name="mapPin" size={13} color="#FFFFFF" />
            <Text style={s.distanceText}>{distanceLabel(distance)}</Text>
          </View>
        ) : null}
      </View>
      <View style={s.body}>
        <View style={s.titleRow}>
          <View style={s.grow}>
            <Text numberOfLines={1} style={s.title}>
              {placeName}
            </Text>
            <Text numberOfLines={1} style={s.subtitle}>
              {subTitle || cuisineType || 'Une adresse Barmej à découvrir'}
            </Text>
          </View>
          {Number(reviewCount) > 0 &&
          Number(rating) >= 1 &&
          Number(rating) <= 5 ? (
            <View style={s.rating}>
              <VectorIcon name="star" size={13} color="#9A6821" />
              <Text style={s.ratingText}>{Number(rating).toFixed(1)}</Text>
            </View>
          ) : null}
        </View>
        <View style={s.metaRow}>
          <View style={[s.status, open ? s.statusOpen : s.statusClosed]}>
            <View style={[s.statusDot, open ? s.dotOpen : s.dotClosed]} />
            <Text style={[s.statusText, open ? s.textOpen : s.textClosed]}>
              {open ? 'Ouvert' : 'Fermé'}
            </Text>
          </View>
          <Text numberOfLines={1} style={s.hours}>
            {horaire || 'Horaires à confirmer'}
          </Text>
          {averagePrice != null ? (
            <Text style={s.price}>· {averagePrice} TND/pers.</Text>
          ) : null}
        </View>
        <View style={s.divider} />
        <View style={s.bottom}>
          <View style={s.location}>
            <VectorIcon name="mapPin" size={15} color="#766D7D" />
            <Text numberOfLines={1} style={s.locationText}>
              {placeAdress || `${reviewCount || 0} avis vérifiés`}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Réserver ${placeName}`}
            onPress={event => {
              event.stopPropagation();
              navigation.navigate('Resevation', {id});
            }}
            style={({pressed}) => [s.reserve, pressed && s.reservePressed]}>
            <Text style={s.reserveText}>Réserver</Text>
            <VectorIcon name="arrowRight" size={15} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    marginHorizontal: 18,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E1EA',
    overflow: 'hidden',
    shadowColor: '#24182F',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: {width: 0, height: 7},
    elevation: 3,
  },
  pressed: {opacity: 0.94, transform: [{scale: 0.992}]},
  visual: {height: 190, backgroundColor: '#EAE5ED'},
  image: {width: '100%', height: '100%'},
  fallback: {alignItems: 'center', justifyContent: 'center'},
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(24,16,31,.1)',
  },
  topRow: {
    position: 'absolute',
    top: 13,
    left: 13,
    right: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    height: 32,
    borderRadius: 12,
    backgroundColor: 'rgba(31,23,41,.78)',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
    color: '#FFFFFF',
  },
  favorite: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  distance: {
    position: 'absolute',
    right: 13,
    bottom: 12,
    height: 29,
    borderRadius: 11,
    backgroundColor: 'rgba(31,23,41,.72)',
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {fontSize: 11, fontWeight: '900', color: '#FFFFFF'},
  body: {padding: 16},
  titleRow: {flexDirection: 'row', alignItems: 'flex-start'},
  grow: {flex: 1, paddingRight: 10},
  title: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
    color: '#21182E',
  },
  subtitle: {fontSize: 13, color: '#85808B', marginTop: 3},
  rating: {
    height: 32,
    borderRadius: 12,
    backgroundColor: '#FFF2DC',
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {fontSize: 13, fontWeight: '900', color: '#8A5A16'},
  metaRow: {flexDirection: 'row', alignItems: 'center', marginTop: 13},
  status: {
    height: 25,
    borderRadius: 9,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusOpen: {backgroundColor: '#E5F6EC'},
  statusClosed: {backgroundColor: '#FDE8E8'},
  statusDot: {width: 6, height: 6, borderRadius: 3},
  dotOpen: {backgroundColor: '#258B57'},
  dotClosed: {backgroundColor: '#CC4B4B'},
  statusText: {fontSize: 11, fontWeight: '900'},
  textOpen: {color: '#23784E'},
  textClosed: {color: '#B33D3D'},
  hours: {flexShrink: 1, fontSize: 12, color: '#7D7683', marginLeft: 8},
  price: {fontSize: 12, fontWeight: '800', color: '#685887', marginLeft: 4},
  divider: {height: 1, backgroundColor: '#F0ECF2', marginVertical: 14},
  bottom: {flexDirection: 'row', alignItems: 'center'},
  location: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginRight: 9,
  },
  locationText: {flex: 1, fontSize: 12, color: '#766D7D'},
  reserve: {
    height: 44,
    borderRadius: 15,
    backgroundColor: '#33264D',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  reservePressed: {opacity: 0.76},
  reserveText: {fontSize: 13, fontWeight: '900', color: '#FFFFFF'},
});
