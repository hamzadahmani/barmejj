import {queryKeys} from '../../query/keys';
import {useQuery} from '@tanstack/react-query';
import React, {useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {Color} from '../../helpers/constatn';
import useGeolocation from '../../hooks/useLocation';
import {getPlaceNearMeAPI} from '../../services/place';
import VectorIcon from '../vectorIcon';

type Place = {
  idPlace: number;
  idCategory?: number;
  placeName: string;
  subTitle?: string;
  image?: string;
  latitude: number | string;
  longitude: number | string;
  distance?: number | string;
  horaire?: string;
  placeAdress?: string;
};

const filters = [
  {id: 0, label: 'Tous'},
  {id: 1, label: 'Restaurants'},
  {id: 2, label: 'Cafés'},
  {id: 3, label: 'Sorties'},
];

const mapStyle = [
  {elementType: 'geometry', stylers: [{color: '#F3F1F5'}]},
  {elementType: 'labels.text.fill', stylers: [{color: '#6E6880'}]},
  {elementType: 'labels.text.stroke', stylers: [{color: '#FFFFFF'}]},
  {featureType: 'poi', elementType: 'labels', stylers: [{visibility: 'off'}]},
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{color: '#E7F0E8'}],
  },
  {featureType: 'road', elementType: 'geometry', stylers: [{color: '#FFFFFF'}]},
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{color: '#E7E3EA'}],
  },
  {featureType: 'transit', stylers: [{visibility: 'off'}]},
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{color: '#DCEAF2'}],
  },
];

const distanceLabel = (distance?: Place['distance']) => {
  const value = Number(distance);
  if (!Number.isFinite(value)) return 'À proximité';
  if (value < 1) return `${Math.max(1, Math.round(value * 1000))} m`;
  return `${value.toFixed(1)} km`;
};

export default function MapScreen({navigation}: any) {
  const mapRef = useRef<MapView>(null);
  const {
    position,
    error: locationError,
    retry: retryLocation,
  } = useGeolocation();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const latitude = position?.coords.latitude;
  const longitude = position?.coords.longitude;

  const {isLoading, isError, data, refetch} = useQuery({
    queryKey: [...queryKeys.getPlacesNearMe, {latitude, longitude}],
    queryFn: getPlaceNearMeAPI,
    enabled: latitude != null && longitude != null,
    retry: 1,
  });

  const places: Place[] = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    const normalizedQuery = query.trim().toLocaleLowerCase('fr');
    return rows.filter((place: Place) => {
      const matchesCategory =
        !category || Number(place.idCategory) === category;
      const haystack = `${place.placeName || ''} ${
        place.subTitle || ''
      }`.toLocaleLowerCase('fr');
      return (
        matchesCategory &&
        (!normalizedQuery || haystack.includes(normalizedQuery))
      );
    });
  }, [category, data, query]);

  const centerOnUser = () => {
    if (latitude == null || longitude == null) return;
    mapRef.current?.animateToRegion(
      {latitude, longitude, latitudeDelta: 0.025, longitudeDelta: 0.022},
      500,
    );
  };

  const focusPlace = (place: Place) => {
    setSelectedId(place.idPlace);
    mapRef.current?.animateToRegion(
      {
        latitude: Number(place.latitude),
        longitude: Number(place.longitude),
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      },
      450,
    );
  };

  if (latitude == null || longitude == null) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingIcon}>
          <VectorIcon name="mapPin" size={32} />
        </View>
        <Text style={styles.loadingTitle}>
          {locationError ? 'Position indisponible' : 'Localisation en cours'}
        </Text>
        <Text style={styles.loadingCopy}>
          {locationError
            ? 'Activez la localisation pour découvrir les adresses autour de vous.'
            : 'Nous cherchons les meilleures adresses près de vous…'}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={retryLocation}
          style={styles.chip}>
          <Text style={styles.retryText}>Réessayer</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={() => navigation.goBack()}
          style={styles.chip}>
          <Text style={styles.retryText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        customMapStyle={mapStyle}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.025,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        showsBuildings={false}
        showsPointsOfInterests={false}
        toolbarEnabled={false}>
        {places.map(place => {
          const selected = selectedId === place.idPlace;
          return (
            <Marker
              key={place.idPlace}
              coordinate={{
                latitude: Number(place.latitude),
                longitude: Number(place.longitude),
              }}
              tracksViewChanges={false}
              onPress={() => focusPlace(place)}>
              <View
                style={[
                  styles.markerShadow,
                  selected && styles.markerShadowSelected,
                ]}>
                <View
                  style={[styles.marker, selected && styles.markerSelected]}>
                  <VectorIcon
                    name={
                      Number(place.idCategory) === 2 ? 'coffee' : 'utensils'
                    }
                    size={17}
                    color={selected ? '#FFFFFF' : Color.main}
                  />
                </View>
                <View
                  style={[
                    styles.markerTip,
                    selected && styles.markerTipSelected,
                  ]}
                />
              </View>
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.topArea} pointerEvents="box-none">
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <VectorIcon name="search" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Restaurant, café, ambiance…"
              placeholderTextColor="#96909E"
              returnKeyType="search"
              style={styles.searchInput}
            />
            {query.length > 0 && (
              <Pressable hitSlop={8} onPress={() => setQuery('')}>
                <VectorIcon name="x" />
              </Pressable>
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour"
            onPress={() => navigation.goBack()}
            style={styles.filterButton}>
            <VectorIcon name="x" color="white" />
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}>
          {filters.map(filter => {
            const active = category === filter.id;
            return (
              <Pressable
                key={filter.id}
                onPress={() => setCategory(filter.id)}
                style={[styles.chip, active && styles.chipActive]}>
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <Pressable
        accessibilityLabel="Recentrer sur ma position"
        onPress={centerOnUser}
        style={styles.locationButton}>
        <VectorIcon name="mapPin" />
      </Pressable>

      <View style={styles.bottomArea} pointerEvents="box-none">
        <View style={styles.nearbyHeader}>
          <View>
            <Text style={styles.nearbyTitle}>À proximité</Text>
            <Text style={styles.nearbySubtitle}>
              {places.length} adresse(s) autour de vous
            </Text>
          </View>
          {isLoading && <ActivityIndicator color={Color.main} />}
        </View>
        {isError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              Impossible de charger les adresses.
            </Text>
            <Pressable onPress={() => refetch()}>
              <Text style={styles.retryText}>Réessayer</Text>
            </Pressable>
          </View>
        ) : places.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={302}
            decelerationRate="fast"
            contentContainerStyle={styles.cards}>
            {places.map(place => (
              <Pressable
                key={place.idPlace}
                onPress={() => focusPlace(place)}
                style={[
                  styles.card,
                  selectedId === place.idPlace && styles.cardSelected,
                ]}>
                {place.image ? (
                  <Image source={{uri: place.image}} style={styles.cardImage} />
                ) : (
                  <View style={[styles.cardImage, styles.cardImageFallback]}>
                    <Text style={styles.cardImageText}>BARMEJ</Text>
                  </View>
                )}
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>
                    {distanceLabel(place.distance)}
                  </Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardTitleRow}>
                    <View style={styles.cardCopy}>
                      <Text numberOfLines={1} style={styles.cardTitle}>
                        {place.placeName}
                      </Text>
                      <Text numberOfLines={1} style={styles.cardSubtitle}>
                        {place.subTitle || 'Une adresse à découvrir'}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Découvrir ${place.placeName}`}
                      onPress={() =>
                        navigation.navigate('Details', {id: place.idPlace})
                      }
                      style={styles.openButton}>
                      <VectorIcon name="arrowRight" color="white" />
                    </Pressable>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>
                      {place.horaire || 'Horaires disponibles'}
                    </Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.metaText}>
                      {Number(place.idCategory) === 2
                        ? 'Café'
                        : Number(place.idCategory) === 3
                        ? 'Sortie'
                        : 'Restaurant'}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.errorCard}>
            <Text style={styles.emptyText}>
              Aucune adresse ne correspond à ces filtres.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F3F1F5'},
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 38,
    backgroundColor: Color.background,
  },
  loadingIcon: {
    width: 70,
    height: 70,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.mainLight,
  },
  loadingPin: {color: Color.main, fontSize: 34, fontWeight: '700'},
  loadingTitle: {
    color: Color.text,
    fontSize: 21,
    fontWeight: '800',
    marginTop: 20,
  },
  loadingCopy: {
    color: Color.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },
  topArea: {position: 'absolute', top: 18, left: 14, right: 14},
  searchRow: {flexDirection: 'row', alignItems: 'center'},
  searchBox: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#251C40',
    shadowOpacity: 0.13,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 5},
  },
  searchIcon: {
    color: Color.main,
    fontSize: 26,
    lineHeight: 28,
    marginRight: 8,
    marginTop: -3,
  },
  searchInput: {flex: 1, color: Color.text, fontSize: 14, paddingVertical: 0},
  clearIcon: {color: Color.muted, fontSize: 24, lineHeight: 26},
  filterButton: {
    width: 52,
    height: 52,
    marginLeft: 9,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.main,
    elevation: 5,
  },
  filterIcon: {
    color: '#FFFFFF',
    fontSize: 25,
    lineHeight: 27,
    fontWeight: '700',
    transform: [{rotate: '90deg'}],
  },
  filters: {paddingTop: 11, paddingRight: 20},
  chip: {
    height: 36,
    justifyContent: 'center',
    marginRight: 8,
    paddingHorizontal: 15,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: '#ECE8F4',
  },
  chipActive: {backgroundColor: Color.main, borderColor: Color.main},
  chipText: {color: Color.text, fontSize: 12, fontWeight: '700'},
  chipTextActive: {color: '#FFFFFF'},
  markerShadow: {alignItems: 'center'},
  markerShadowSelected: {transform: [{scale: 1.15}]},
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6B65C',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  markerSelected: {backgroundColor: Color.main},
  markerIcon: {color: '#FFFFFF', fontSize: 14, fontWeight: '900'},
  markerTip: {
    width: 0,
    height: 0,
    marginTop: -3,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#F6B65C',
  },
  markerTipSelected: {borderTopColor: Color.main},
  locationButton: {
    position: 'absolute',
    right: 16,
    bottom: 310,
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    elevation: 6,
    shadowColor: '#251C40',
    shadowOpacity: 0.16,
    shadowRadius: 10,
  },
  locationIcon: {color: Color.main, fontSize: 27, fontWeight: '800'},
  bottomArea: {position: 'absolute', left: 0, right: 0, bottom: 94},
  nearbyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  nearbyTitle: {color: Color.text, fontSize: 20, fontWeight: '800'},
  nearbySubtitle: {
    color: Color.muted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  cards: {paddingHorizontal: 14, paddingBottom: 5},
  card: {
    width: 288,
    height: 192,
    marginRight: 14,
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 5,
    shadowColor: '#251C40',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 5},
  },
  cardSelected: {borderColor: Color.main},
  cardImage: {width: '100%', height: 108, backgroundColor: '#E9E4F5'},
  cardImageFallback: {alignItems: 'center', justifyContent: 'center'},
  cardImageText: {
    color: Color.main,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  distanceBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  distanceText: {color: Color.main, fontSize: 10, fontWeight: '800'},
  cardContent: {paddingHorizontal: 13, paddingVertical: 10},
  cardTitleRow: {flexDirection: 'row', alignItems: 'center'},
  cardCopy: {flex: 1, paddingRight: 8},
  cardTitle: {
    color: Color.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: Color.muted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 1,
  },
  openButton: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.main,
  },
  openArrow: {color: '#FFFFFF', fontSize: 26, lineHeight: 27, marginTop: -2},
  metaRow: {flexDirection: 'row', alignItems: 'center', marginTop: 7},
  metaText: {color: Color.muted, fontSize: 9, fontWeight: '600'},
  metaDot: {color: '#C4BEC9', fontSize: 9, marginHorizontal: 6},
  errorCard: {
    marginHorizontal: 14,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    elevation: 3,
  },
  errorText: {color: Color.error, fontSize: 13, fontWeight: '700'},
  retryText: {color: Color.main, fontSize: 13, fontWeight: '800', marginTop: 8},
  emptyText: {color: Color.muted, fontSize: 13, textAlign: 'center'},
});
