import {queryKeys} from '../../query/keys';
import {requestLocation} from '../../helpers/location';
import {interests} from '../../helpers/interests';
import {getPlacesByInterest} from '../../services/discovery';
import {Notice} from '../discovery/sections';
import {useQuery} from '@tanstack/react-query';
import React, {useMemo, useState} from 'react';
import {
  FlatList,
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
import {fonts, night} from '../discovery/theme';

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
const intentIcons: Record<
  string,
  'moon' | 'heart' | 'wallet' | 'users' | 'coffee'
> = {
  'Ce soir': 'moon',
  'En amoureux': 'heart',
  'Petit budget': 'wallet',
  'Avec des amis': 'users',
  'Sortie calme': 'coffee',
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

  const allRows = Array.isArray(data) ? data : [];
  const openCount = allRows.filter((item: any) => isOpen(item.horaire)).length;
  const heroIcon = intentIcons[intent] ?? (interest ? 'sparkles' : 'mapPin');
  const filterItems = [
    {key: 'Tous', icon: 'sparkles', count: allRows.length},
    {key: 'Ouverts', icon: 'clock', count: openCount},
    {key: 'À proximité', icon: 'mapPin'},
    {key: 'Mieux notés', icon: 'star'},
  ] as const;
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
            colors={[night.plum]}
            tintColor={night.plum}
          />
        }
        contentContainerStyle={[
          s.content,
          !visiblePlaces.length && s.emptyContent,
        ]}
        ItemSeparatorComponent={Separator}
        renderItem={({item}: any) => (
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
          />
        )}
        ListHeaderComponent={
          <>
            <View style={s.hero}>
              <View style={s.blobViolet} />
              <View style={s.blobGold} />
              <View style={s.heroTop}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Retour"
                  hitSlop={8}
                  onPress={() => navigation.goBack()}
                  style={({pressed}) => [s.back, pressed && s.pressed]}>
                  <View style={s.flipIcon}>
                    <VectorIcon name="arrowRight" size={20} color="#FFFFFF" />
                  </View>
                </Pressable>
                <View style={s.heroBadge}>
                  <VectorIcon name={heroIcon} size={22} color={night.gold} />
                </View>
              </View>
              <Text style={s.eyebrow}>
                {intent ? 'SÉLECTION SELON VOTRE ENVIE' : 'DÉCOUVRIR À TUNIS'}
              </Text>
              <Text style={s.title}>{title}</Text>
              <Text style={s.subtitle}>
                {intentCopy[intent] ||
                  'Des adresses sélectionnées pour une sortie réussie'}
              </Text>
              <View style={s.stats}>
                <View style={s.stat}>
                  <Text style={s.statValue}>{allRows.length}</Text>
                  <Text style={s.statLabel}>
                    adresse{allRows.length > 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.stat}>
                  <View style={s.liveDot} />
                  <Text style={s.statValue}>{openCount}</Text>
                  <Text style={s.statLabel}>
                    ouverte{openCount > 1 ? 's' : ''} maintenant
                  </Text>
                </View>
              </View>
            </View>
            <View style={s.searchCard}>
              <SearchBar navigation={navigation} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.filters}>
              {filterItems.map(filter => {
                const active = selectedFilter === filter.key;
                return (
                  <Pressable
                    key={filter.key}
                    testID={`filter-${filter.key}`}
                    accessibilityRole="button"
                    accessibilityState={{selected: active, disabled: locating}}
                    disabled={locating}
                    onPress={() => {
                      selectFilter(filter.key);
                    }}
                    style={({pressed}) => [
                      s.filter,
                      active && s.filterActive,
                      pressed && s.pressed,
                    ]}>
                    <VectorIcon
                      name={filter.icon}
                      size={15}
                      color={active ? '#FFFFFF' : night.violet}
                    />
                    <Text style={[s.filterText, active && s.filterTextActive]}>
                      {filter.key}
                    </Text>
                    {'count' in filter ? (
                      <View
                        style={[s.filterCount, active && s.filterCountActive]}>
                        <Text
                          style={[
                            s.filterCountText,
                            active && s.filterTextActive,
                          ]}>
                          {filter.count}
                        </Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
            <Text style={s.resultsText}>
              {selectedFilter === 'À proximité'
                ? 'Triées de la plus proche à la plus éloignée'
                : selectedFilter === 'Mieux notés'
                  ? 'Triées par note des clients'
                  : selectedFilter === 'Ouverts'
                    ? `${visiblePlaces.length} adresse${visiblePlaces.length > 1 ? 's' : ''} ouverte${visiblePlaces.length > 1 ? 's' : ''} en ce moment`
                    : `${visiblePlaces.length} adresse${visiblePlaces.length > 1 ? 's' : ''} à découvrir`}
            </Text>
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
                <VectorIcon name="sparkles" size={30} color={night.plum} />
              </View>
              <Text style={s.emptyTitle}>Aucune adresse trouvée</Text>
              <Text style={s.emptyText}>
                {selectedFilter === 'Ouverts'
                  ? 'Rien n’est ouvert en ce moment. Revenez plus tard ou voyez toutes les adresses.'
                  : 'Essayez un autre filtre ou lancez une recherche plus large.'}
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
  screen: {flex: 1, backgroundColor: night.page},
  content: {paddingBottom: 125},
  emptyContent: {flexGrow: 1},
  separator: {height: 16},
  hero: {
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: night.deep,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
  },
  blobViolet: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(114,81,201,.35)',
    right: -90,
    top: -110,
  },
  blobGold: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(246,182,92,.12)',
    left: -70,
    bottom: -90,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipIcon: {transform: [{rotate: '180deg'}]},
  heroBadge: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: 'rgba(246,182,92,.14)',
    borderWidth: 1,
    borderColor: 'rgba(246,182,92,.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.6,
    color: night.gold,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#FFFFFF',
    marginTop: 6,
  },
  subtitle: {fontSize: 14, lineHeight: 20, color: '#D9D1E6', marginTop: 6},
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.12)',
  },
  stat: {flexDirection: 'row', alignItems: 'center', gap: 5},
  statValue: {fontSize: 15, fontWeight: '900', color: '#FFFFFF'},
  statLabel: {fontSize: 12, color: '#D9D1E6', fontWeight: '600'},
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,.2)',
    marginHorizontal: 12,
  },
  liveDot: {width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80'},
  searchCard: {
    marginHorizontal: 26,
    marginTop: -28,
    zIndex: 20,
    borderRadius: 22,
    shadowColor: '#24182F',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
  },
  filters: {paddingHorizontal: 18, paddingTop: 18, paddingBottom: 6, gap: 8},
  filter: {
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: night.line,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  filterActive: {backgroundColor: night.plum, borderColor: night.plum},
  filterText: {fontSize: 13, fontWeight: '700', color: night.text},
  filterTextActive: {color: '#FFFFFF'},
  filterCount: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: night.violetSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountActive: {backgroundColor: 'rgba(255,255,255,.18)'},
  filterCountText: {fontSize: 11, fontWeight: '900', color: night.violet},
  resultsText: {
    fontSize: 13,
    color: night.muted,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 14,
  },
  pressed: {opacity: 0.7, transform: [{scale: 0.98}]},
  empty: {
    marginHorizontal: 18,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: night.line,
    padding: 28,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 21,
    backgroundColor: night.violetSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: night.text,
    marginTop: 15,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: night.muted,
    textAlign: 'center',
    marginTop: 6,
  },
  reset: {
    height: 46,
    borderRadius: 23,
    backgroundColor: night.plum,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  resetText: {fontSize: 14, fontWeight: '800', color: '#FFFFFF'},
});
