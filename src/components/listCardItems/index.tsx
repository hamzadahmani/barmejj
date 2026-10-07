import {queryKeys} from '../../query/keys';
import {requestLocation} from '../../helpers/location';
import {interests} from '../../helpers/interests';
import {getPlacesByInterest} from '../../services/discovery';
import {Notice} from '../discovery/sections';
import {useQuery} from '@tanstack/react-query';
import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {haversine, isOpen} from '../../helpers/functions';
import {getAllPlacesByCategorieAPI} from '../../services/place';
import {getPlacesBySearch} from '../../services/search';
import CardItem from '../cardPlace';
import LoadingSpinner from '../Loader';
import SearchBar from '../search';
import VectorIcon from '../vectorIcon';

const categoryTitles: Record<number, string> = {
  1: 'Restaurants',
  2: 'Cafés',
  3: 'Sorties',
};
const intentFilters: Record<string, any> = {
  'Ce soir': {query: '', openNow: 'true', sort: 'relevance'},
  'En amoureux': {query: '', ambience: 'Romantique', sort: 'relevance'},
  'Petit budget': {query: '', maxPrice: 40, sort: 'price'},
  'Avec des amis': {query: '', ambience: 'Festif', sort: 'relevance'},
  'Sortie calme': {query: '', ambience: 'Calme', sort: 'relevance'},
};
const intentCopy: Record<string, string> = {
  'Ce soir': 'Des adresses disponibles pour votre soirée',
  'En amoureux': 'Des ambiances pensées pour deux',
  'Petit budget': 'Les meilleures expériences à moins de 40 TND',
  'Avec des amis': 'Des lieux vivants pour sortir ensemble',
};

export default function ListCardItems({
  navigation,
  idCategory,
  intent,
  interest,
}: any) {
  const title =
    interests.find(item => item.key === interest)?.label ||
    intent ||
    categoryTitles[Number(idCategory)] ||
    'Établissements';
  const filters = intentFilters[intent];
  const {
    isLoading,
    isError,
    isRefetching,
    data = [],
    refetch,
  } = useQuery<any[]>({
    queryKey: interest
      ? [...queryKeys.placesByInterest, {interest}]
      : filters
      ? [...queryKeys.getPlacesBySearch, filters]
      : [...queryKeys.getAllPlacesByCategorie, {id: idCategory}],
    queryFn: interest
      ? getPlacesByInterest
      : filters
      ? getPlacesBySearch
      : getAllPlacesByCategorieAPI,
  });
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('Tous');

  const [locationError, setLocationError] = useState('');
  const [locating, setLocating] = useState(false);
  const selectFilter = async (filter: string) => {
    if (filter === 'À proximité' && (latitude == null || longitude == null)) {
      setLocating(true);
      setLocationError('');
      try {
        const position = await requestLocation();
        setLatitude(position.latitude);
        setLongitude(position.longitude);
        setSelectedFilter(filter);
      } catch (error) {
        setLocationError(
          error instanceof Error ? error.message : 'Position indisponible.',
        );
      } finally {
        setLocating(false);
      }
    } else {
      setSelectedFilter(filter);
    }
  };

  const visiblePlaces = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    if (selectedFilter === 'Ouverts')
      return rows.filter((item: any) => isOpen(item.horaire));
    if (
      selectedFilter === 'À proximité' &&
      latitude != null &&
      longitude != null
    ) {
      return [...rows].sort(
        (a: any, b: any) =>
          haversine(a.latitude, a.longitude, latitude, longitude) -
          haversine(b.latitude, b.longitude, latitude, longitude),
      );
    }
    if (selectedFilter === 'Mieux notés')
      return [...rows].sort(
        (a: any, b: any) => Number(b.rating || 0) - Number(a.rating || 0),
      );
    return rows;
  }, [data, latitude, longitude, selectedFilter]);

  const cover =
    visiblePlaces[0]?.image ||
    (Array.isArray(data) ? data[0]?.image : undefined);
  return (
    <View style={s.screen}>
      <LoadingSpinner visible={isLoading} />
      <FlatList
        data={visiblePlaces}
        keyExtractor={(item: any) => String(item.idPlace)}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
            }}
            colors={['#33264D']}
            tintColor="#33264D"
          />
        }
        contentContainerStyle={[
          s.content,
          !visiblePlaces.length && s.emptyContent,
        ]}
        ItemSeparatorComponent={Separator}
        renderItem={({item, index}: any) => (
          <CardItem
            {...item}
            id={item.idPlace}
            imgUrl={item.image}
            navigation={navigation}
            distance={
              latitude != null && longitude != null
                ? haversine(item.latitude, item.longitude, latitude, longitude)
                : null
            }
            featured={index < 2}
          />
        )}
        ListHeaderComponent={
          <>
            <View style={s.hero}>
              {cover ? (
                <Image source={{uri: cover}} style={StyleSheet.absoluteFill} />
              ) : null}
              <View style={s.heroOverlay} />
              <View style={s.heroGlow} />
              <Pressable
                accessibilityLabel="Retour"
                onPress={() => navigation.goBack()}
                style={s.back}>
                <VectorIcon name="arrowRight" size={20} color="#FFFFFF" />
                <View style={s.flip} />
              </Pressable>
              <View style={s.heroCopy}>
                <Text style={s.eyebrow}>
                  {intent ? 'SÉLECTION SELON VOTRE ENVIE' : 'DÉCOUVRIR À TUNIS'}
                </Text>
                <Text style={s.title}>{title}</Text>
                <Text style={s.subtitle}>
                  {intentCopy[intent] ||
                    'Des adresses sélectionnées pour une expérience réussie'}
                </Text>
                <View style={s.heroMeta}>
                  <Text style={s.heroMetaText}>
                    {visiblePlaces.length} ADRESSES
                  </Text>
                  <View style={s.dot} />
                  <Text style={s.heroMetaText}>RÉSERVATION RAPIDE</Text>
                </View>
              </View>
            </View>
            <View style={s.searchCard}>
              <SearchBar navigation={navigation} />
            </View>
            <View style={s.filterHeader}>
              <View>
                <Text style={s.resultsTitle}>À découvrir</Text>
                <Text style={s.resultsText}>
                  Affinez la sélection selon votre moment
                </Text>
              </View>
              <View style={s.count}>
                <Text style={s.countText}>{visiblePlaces.length}</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.filters}>
              {['Tous', 'Ouverts', 'À proximité', 'Mieux notés'].map(
                (filter, index) => {
                  const active = selectedFilter === filter;
                  const icons = [
                    'sparkles',
                    'clock',
                    'mapPin',
                    'star',
                  ] as const;
                  return (
                    <Pressable
                      key={filter}
                      testID={`filter-${filter}`}
                      accessibilityRole="button"
                      accessibilityState={{
                        selected: active,
                        disabled: locating,
                      }}
                      disabled={locating}
                      onPress={() => {
                        selectFilter(filter);
                      }}
                      style={({pressed}) => [
                        s.filter,
                        active && s.filterActive,
                        pressed && s.pressed,
                      ]}>
                      <VectorIcon
                        name={icons[index]}
                        size={15}
                        color={active ? '#FFFFFF' : '#685887'}
                      />
                      <Text
                        style={[s.filterText, active && s.filterTextActive]}>
                        {filter}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </ScrollView>
            {locating ? <Notice loading message="Localisation…" /> : null}
            {locationError ? (
              <Notice
                message={locationError}
                onRetry={() => {
                  selectFilter('À proximité');
                }}
              />
            ) : null}
            {isError ? (
              <Notice
                message="Impossible de charger les adresses."
                onRetry={() => {
                  refetch();
                }}
              />
            ) : null}
          </>
        }
        ListEmptyComponent={
          !isLoading && !isError ? (
            <View style={s.empty}>
              <View style={s.emptyIcon}>
                <VectorIcon name="sparkles" size={30} color="#33264D" />
              </View>
              <Text style={s.emptyTitle}>Aucune adresse trouvée</Text>
              <Text style={s.emptyText}>
                Essayez un autre filtre ou lancez une recherche plus large.
              </Text>
              <Pressable
                onPress={() => setSelectedFilter('Tous')}
                style={s.reset}>
                <Text style={s.resetText}>Voir toutes les adresses</Text>
              </Pressable>
            </View>
          ) : undefined
        }
      />
    </View>
  );
}

function Separator() {
  return <View style={s.separator} />;
}

const s = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F7F5F9'},
  content: {paddingBottom: 125},
  emptyContent: {flexGrow: 1},
  separator: {height: 14},
  hero: {
    height: 245,
    marginHorizontal: 13,
    marginTop: 10,
    borderRadius: 30,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  heroImage: {borderRadius: 30},
  heroOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(25,17,38,.62)',
  },
  heroGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(244,180,94,.16)',
    right: -80,
    top: -90,
  },
  back: {
    width: 45,
    height: 45,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.2)',
    margin: 16,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{rotate: '180deg'}],
  },
  flip: {display: 'none'},
  heroCopy: {paddingHorizontal: 19, paddingBottom: 21},
  eyebrow: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#F6B65C',
  },
  title: {
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '900',
    letterSpacing: -1,
    color: '#FFFFFF',
    marginTop: 5,
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 17,
    color: '#DDD6E4',
    marginTop: 5,
    maxWidth: 315,
  },
  heroMeta: {flexDirection: 'row', alignItems: 'center', marginTop: 14},
  heroMetaText: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#FFFFFF',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F6B65C',
    marginHorizontal: 9,
  },
  searchCard: {marginHorizontal: 17, marginTop: -1, zIndex: 20},
  filterHeader: {
    paddingHorizontal: 18,
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultsTitle: {
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: '#21182E',
  },
  resultsText: {fontSize: 9, color: '#8B8491', marginTop: 3},
  count: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#EEE8F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {fontSize: 13, fontWeight: '900', color: '#33264D'},
  filters: {paddingHorizontal: 18, paddingVertical: 14, gap: 8},
  filter: {
    height: 40,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E0EB',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  filterActive: {backgroundColor: '#33264D', borderColor: '#33264D'},
  filterText: {fontSize: 10, fontWeight: '800', color: '#514A59'},
  filterTextActive: {color: '#FFFFFF'},
  pressed: {opacity: 0.7, transform: [{scale: 0.98}]},
  empty: {
    marginHorizontal: 18,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E8E2EB',
    padding: 30,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 21,
    backgroundColor: '#F0EAF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#21182E',
    marginTop: 15,
  },
  emptyText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#817A87',
    textAlign: 'center',
    marginTop: 6,
  },
  reset: {
    height: 44,
    borderRadius: 15,
    backgroundColor: '#33264D',
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 17,
  },
  resetText: {fontSize: 11, fontWeight: '900', color: '#FFFFFF'},
});
