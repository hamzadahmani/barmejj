import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Video from 'react-native-video';
import {useNetInfo} from '@react-native-community/netinfo';
import Geolocation from '@react-native-community/geolocation';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import {
  addFavoritesAPI,
  deleteFavoritesAPI,
  getFavoritesAPI,
} from '../../../services/favorites';
import {getVideoFeedAPI, trackFeedEventsAPI} from '../../../services/place';

type Item = {
  idMedia: number;
  secureUrl: string;
  duration?: number | null;
  sponsored?: boolean;
  campaignId?: number | null;
  reason?: string;
  place: {
    idPlace: number;
    placeName: string;
    subTitle?: string;
    placeDescription?: string;
    placeAdress?: string;
    verified?: boolean;
    image?: string | null;
    categories?: Array<{name?: string; categoryName?: string}>;
  };
};
const normalizeKeyword = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const uuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, value => {
    const random = Math.floor(Math.random() * 16);
    return (value === 'x' ? random : (random & 3) | 8).toString(16);
  });
type IconName = 'play' | 'pin' | 'heart' | 'share' | 'search';
const Icon = ({
  name,
  size = 23,
  color = '#FFF',
  filled = false,
}: {
  name: IconName;
  size?: number;
  color?: string;
  filled?: boolean;
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    {name === 'play' && <Path d="m9 6 9 6-9 6V6Z" fill={color} />}
    {name === 'pin' && (
      <>
        <Path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <Circle cx="12" cy="10" r="2.5" />
      </>
    )}
    {name === 'heart' && (
      <Path
        fill={filled ? color : 'none'}
        d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z"
      />
    )}
    {name === 'share' && (
      <>
        <Circle cx="18" cy="5" r="3" />
        <Circle cx="6" cy="12" r="3" />
        <Circle cx="18" cy="19" r="3" />
        <Path d="m8.6 10.5 6.8-4m-6.8 7 6.8 4" />
      </>
    )}
    {name === 'search' && (
      <>
        <Circle cx="11" cy="11" r="7" />
        <Path d="m20 20-4-4" />
      </>
    )}
  </Svg>
);
const Action = ({
  icon,
  label,
  active,
  busy,
  onPress,
}: {
  icon: IconName;
  label: string;
  active?: boolean;
  busy?: boolean;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress} disabled={busy} style={s.action}>
    <View style={[s.actionCircle, active && s.activeCircle]}>
      {busy ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <Icon name={icon} filled={active} color={active ? '#FF617C' : '#FFF'} />
      )}
    </View>
    <Text style={s.actionLabel}>{label}</Text>
  </Pressable>
);

const BottomGradient = () => (
  <Svg
    pointerEvents="none"
    width="100%"
    height={205}
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    style={s.bottomGradient}>
    <Defs>
      <SvgLinearGradient id="feedBottomFade" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#08050E" stopOpacity="0" />
        <Stop offset="0.32" stopColor="#08050E" stopOpacity="0.18" />
        <Stop offset="0.62" stopColor="#08050E" stopOpacity="0.62" />
        <Stop offset="1" stopColor="#08050E" stopOpacity="0.94" />
      </SvgLinearGradient>
    </Defs>
    <Rect width="100" height="100" fill="url(#feedBottomFade)" />
  </Svg>
);

function Card({
  item,
  active,
  height,
  saved,
  toggle,
  open,
  onVideoEvent,
  lowData,
  bottomInset,
}: {
  item: Item;
  active: boolean;
  height: number;
  saved: boolean;
  toggle: () => Promise<any>;
  open: () => void;
  onVideoEvent: (type: string, watchMs?: number, positionMs?: number) => void;
  lowData: boolean;
  bottomInset: number;
}) {
  const milestones = useRef(new Set<number>());
  const [paused, setPaused] = useState(false),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false);
  const favorite = async () => {
    setBusy(true);
    try {
      await toggle();
    } finally {
      setBusy(false);
    }
  };
  const category =
    item.place.categories?.[0]?.name ||
    item.place.categories?.[0]?.categoryName ||
    item.place.subTitle ||
    'À découvrir';
  return (
    <View style={[s.card, {height}]}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => setPaused(v => !v)}>
        {active ? (
          <Video
            source={{uri: item.secureUrl}}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            repeat
            paused={paused}
            maxBitRate={lowData ? 900000 : 0}
            bufferConfig={{
              minBufferMs: lowData ? 2500 : 10000,
              maxBufferMs: lowData ? 10000 : 30000,
              bufferForPlaybackMs: lowData ? 800 : 1800,
              bufferForPlaybackAfterRebufferMs: lowData ? 1500 : 3500,
              cacheSizeMB: 64,
            }}
            onLoadStart={() => setReady(false)}
            onReadyForDisplay={() => setReady(true)}
            onProgress={({currentTime, playableDuration}) => {
              const duration = playableDuration || item.duration || 0;
              if (!duration) return;
              const ratio = currentTime / duration;
              ([25, 50, 75] as const).forEach(mark => {
                if (ratio >= mark / 100 && !milestones.current.has(mark)) {
                  milestones.current.add(mark);
                  onVideoEvent(
                    `VIDEO_${mark}_PERCENT`,
                    Math.round(currentTime * 1000),
                    Math.round(currentTime * 1000),
                  );
                }
              });
            }}
            onEnd={() => {
              if (!milestones.current.has(100)) {
                milestones.current.add(100);
                onVideoEvent(
                  'VIDEO_COMPLETE',
                  Math.round((item.duration || 0) * 1000),
                  Math.round((item.duration || 0) * 1000),
                );
              }
            }}
          />
        ) : item.place.image ? (
          <Image
            source={{uri: item.place.image}}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <View style={s.videoPlaceholder} />
        )}
        <BottomGradient />
      </Pressable>
      {!ready && active ? (
        <ActivityIndicator style={s.loader} size="large" color="#FFF" />
      ) : null}
      {paused && active ? (
        <Pressable style={s.play} onPress={() => setPaused(false)}>
          <Icon name="play" size={30} />
        </Pressable>
      ) : null}
      <View style={[s.rail, {bottom: 142 + bottomInset}]}>
        <Action
          icon="heart"
          label={saved ? 'Enregistré' : 'Sauvegarder'}
          active={saved}
          busy={busy}
          onPress={favorite}
        />
        <Action
          icon="share"
          label="Partager"
          onPress={() =>
            Share.share({
              message: `Découvrez ${item.place.placeName} sur Barmej.`,
            })
          }
        />
      </View>
      <View style={[s.meta, {bottom: 72 + bottomInset}]}>
        <View style={s.pills}>
          <View style={s.category}>
            <Text style={s.categoryText}>{category.toUpperCase()}</Text>
          </View>
          {item.sponsored ? (
            <View style={s.sponsored}>
              <Text style={s.sponsoredText}>SPONSORISÉ</Text>
            </View>
          ) : item.place.verified ? (
            <View style={s.verified}>
              <Text style={s.verifiedText}>✓ VÉRIFIÉ</Text>
            </View>
          ) : null}
        </View>
        <Pressable onPress={open}>
          {item.place.placeDescription ? (
            <Text numberOfLines={1} style={s.description}>
              {item.place.placeDescription}
            </Text>
          ) : null}
          {item.place.placeAdress ? (
            <View style={s.address}>
              <Icon name="pin" size={15} />
              <Text numberOfLines={1} style={s.addressText}>
                {item.place.placeAdress}
              </Text>
            </View>
          ) : null}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ouvrir ${item.place.placeName}`}
          onPress={open}
          style={({pressed}) => [
            s.placeIdentity,
            pressed && s.identityPressed,
          ]}>
          {item.place.image ? (
            <Image source={{uri: item.place.image}} style={s.placeAvatar} />
          ) : (
            <View style={s.placeAvatarFallback}>
              <Text style={s.placeInitial}>
                {item.place.placeName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={s.placeIdentityText}>
            <Text numberOfLines={1} style={s.placeIdentityName}>
              {item.place.placeName}
            </Text>
            <Text style={s.placeIdentityHint}>Voir l’établissement</Text>
          </View>
          <Text style={s.placeChevron}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function VideoFeedScreen({navigation}: any) {
  const insets = useSafeAreaInsets(),
    client = useQueryClient();
  const netInfo = useNetInfo();
  const [mode, setMode] = useState<'for-you' | 'nearby'>('for-you');
  const [keyword, setKeyword] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [location, setLocation] = useState<{
    latitude?: number;
    longitude?: number;
  }>({});
  const cellularGeneration = (netInfo.details as any)?.cellularGeneration;
  const lowData = Boolean(
    (netInfo.details as any)?.isConnectionExpensive ||
      cellularGeneration === '2g' ||
      cellularGeneration === '3g',
  );
  const [index, setIndex] = useState(0),
    [height, setHeight] = useState(0);
  const {
    data,
    isLoading,
    isError,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    [
      'video-feed-v1',
      {
        limit: lowData ? 4 : 8,
        mode,
        latitude: mode === 'nearby' ? location.latitude : undefined,
        longitude: mode === 'nearby' ? location.longitude : undefined,
        keyword: keyword || undefined,
      },
    ],
    getVideoFeedAPI,
    {
    getNextPageParam: page => page.nextCursor || undefined,
    staleTime: 60000,
    },
  );
  const feed = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data],
  );
  const visibleFilters = useMemo(() => {
    const available: Array<{keyword: string; count: number}> = data?.pages[0]?.availableFilters ?? [];
    const quick = [{key: '', label: 'Tout'}, ...available.map(filter => ({key: filter.keyword, label: filter.keyword}))];
    const known = quick.some(filter => filter.key === keyword);
    const withCurrent = keyword && !known ? [quick[0], {key: keyword, label: keyword}, ...quick.slice(1)] : quick;
    return withCurrent.slice(0, 6);
  }, [data, keyword]);
  const availableKeywords: string[] = useMemo(
    () => (data?.pages[0]?.availableFilters ?? []).map((filter: {keyword: string}) => filter.keyword),
    [data],
  );
  const searchSuggestions = useMemo(() => {
    const query = normalizeKeyword(searchValue);
    return availableKeywords
      .filter(item => !query || normalizeKeyword(item).includes(query))
      .slice(0, 6);
  }, [availableKeywords, searchValue]);
  const selectKeyword = (value: string) => {
    setIndex(0);
    setKeyword(value);
    setSearchValue(value);
    setSearchOpen(false);
  };
  const submitSearch = () => {
    const exact = availableKeywords.find(item => normalizeKeyword(item) === normalizeKeyword(searchValue));
    const selected = exact ?? searchSuggestions[0];
    if (selected) selectKeyword(selected);
  };
  const sessionId = data?.pages[0]?.sessionId;
  const tracked = useRef(new Set<number>());
  const {data: favorites = []} = useQuery(['favorites'], getFavoritesAPI, {
    retry: false,
  });
  const ids = new Set(
    (Array.isArray(favorites) ? favorites : []).map((x: any) =>
      Number(x.idPlace),
    ),
  );
  const mutation = useMutation(
    ({id, saved}: {id: number; saved: boolean}) =>
      saved ? deleteFavoritesAPI(String(id)) : addFavoritesAPI({idPlace: id}),
    {onSuccess: () => client.invalidateQueries(['favorites'])},
  );
  const changed = useRef(
    ({viewableItems}: {viewableItems: Array<{index?: number | null}>}) => {
      if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
    },
  ).current;
  const track = useCallback((
    item: Item,
    type: string,
    watchMs?: number,
    positionMs?: number,
  ) => {
    if (!sessionId) return;
    void trackFeedEventsAPI([
      {
        eventId: uuid(),
        sessionId,
        videoId: item.idMedia,
        placeId: item.place.idPlace,
        type,
        watchMs,
        positionMs,
        occurredAt: new Date().toISOString(),
        ...(item.campaignId
          ? {metadata: {campaignId: item.campaignId}}
          : {}),
      },
    ]).catch(() => undefined);
  }, [sessionId]);
  useEffect(() => {
    if (mode !== 'nearby' || location.latitude !== undefined) return;
    Geolocation.getCurrentPosition(
      position =>
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      () => undefined,
      {enableHighAccuracy: false, timeout: 8000, maximumAge: 300000},
    );
  }, [mode, location.latitude]);
  useEffect(() => {
    const item = feed[index];
    if (!item || tracked.current.has(item.idMedia)) return;
    tracked.current.add(item.idMedia);
    track(item, 'FEED_IMPRESSION');
    track(item, 'VIDEO_START');
  }, [feed, index, track]);
  useEffect(() => {
    const next = feed[index + 1];
    if (next?.place.image) void Image.prefetch(next.place.image);
    if (index >= feed.length - 3 && hasNextPage && !isFetchingNextPage)
      void fetchNextPage();
  }, [feed, index, hasNextPage, isFetchingNextPage, fetchNextPage]);
  if (isLoading)
    return (
      <State
        title="Barmej Moments"
        text="Les meilleures adresses arrivent…"
        loading
      />
    );
  if (isError || (!feed.length && !keyword))
    return (
      <State
        title={
          isError ? 'Le feed ne répond pas' : 'Les premières vidéos arrivent'
        }
        text={
          isError
            ? 'Vérifiez votre connexion puis réessayez.'
            : 'Les établissements partageront bientôt leurs plats et leurs ambiances.'
        }
        retry={() => refetch()}
      />
    );
  return (
    <View
      style={s.container}
      onLayout={e => setHeight(e.nativeEvent.layout.height)}>
      {height && feed.length ? (
        <FlatList
          data={feed as Item[]}
          keyExtractor={x => String(x.idMedia)}
          pagingEnabled
          snapToInterval={height}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={changed}
          viewabilityConfig={{itemVisiblePercentThreshold: 75}}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={2}
          removeClippedSubviews
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
          }}
          onEndReachedThreshold={0.7}
          getItemLayout={(_, itemIndex) => ({
            length: height,
            offset: height * itemIndex,
            index: itemIndex,
          })}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
              tintColor="#FFF"
            />
          }
          renderItem={({item, index: itemIndex}) => (
            <Card
              item={item}
              active={itemIndex === index}
              height={height}
              saved={ids.has(item.place.idPlace)}
              toggle={() =>
                mutation.mutateAsync({
                  id: item.place.idPlace,
                  saved: ids.has(item.place.idPlace),
                })
              }
              open={() => {
                track(item, 'PLACE_OPEN');
                navigation.navigate('Details', {id: item.place.idPlace});
              }}
              onVideoEvent={(type, watchMs, positionMs) =>
                track(item, type, watchMs, positionMs)
              }
              lowData={lowData}
              bottomInset={insets.bottom}
            />
          )}
        />
      ) : height ? (
        <View style={s.filteredEmpty}>
          <View style={s.filteredEmptyIcon}><Icon name="search" size={27} /></View>
          <Text style={s.filteredEmptyTitle}>Aucune vidéo pour « {keyword} »</Text>
          <Text style={s.filteredEmptyText}>Essayez un autre mot ou revenez à toutes les vidéos. Vos filtres restent disponibles en haut.</Text>
          <Pressable onPress={() => {setKeyword(''); setSearchValue(''); setIndex(0);}} style={s.clearFilter}>
            <Text style={s.clearFilterText}>Voir toutes les vidéos</Text>
          </Pressable>
          <Pressable onPress={() => {setSearchValue(keyword); setSearchOpen(true);}} style={s.editSearch}>
            <Text style={s.editSearchText}>Modifier la recherche</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={[s.header, {top: insets.top + 8}]}>
        <View style={s.tabs}>
          <Pressable onPress={() => setMode('nearby')}>
            <Text style={mode === 'nearby' ? s.tabActive : s.tabMuted}>À proximité</Text>
            {mode === 'nearby' ? <View style={s.dot} /> : null}
          </Pressable>
          <Pressable onPress={() => setMode('for-you')}>
            <Text style={mode === 'for-you' ? s.tabActive : s.tabMuted}>Pour vous</Text>
            {mode === 'for-you' ? <View style={s.dot} /> : null}
          </Pressable>
        </View>
        <Pressable
          accessibilityLabel="Rechercher dans les vidéos"
          onPress={() => {setSearchValue(keyword); setSearchOpen(value => !value);}}
          style={s.search}>
          <Icon name="search" size={20} />
        </Pressable>
      </View>
      {searchOpen ? (
        <View style={[s.feedSearchPanel, {top: insets.top + 61}]}>
          <View style={s.feedSearch}>
            <Icon name="search" size={17} color="#5943A6" />
            <TextInput
              autoFocus
              value={searchValue}
              onChangeText={setSearchValue}
              onSubmitEditing={submitSearch}
              returnKeyType="search"
              placeholder="Rechercher un mot-clé existant"
              placeholderTextColor="#8B8493"
              style={s.feedSearchInput}
            />
            <Pressable onPress={() => {setSearchOpen(false); setSearchValue(keyword);}} style={s.feedSearchClose}><Text style={s.feedSearchCloseText}>×</Text></Pressable>
          </View>
          {searchSuggestions.length ? <View style={s.suggestionList}>{searchSuggestions.map(item => (
            <Pressable key={item} onPress={() => selectKeyword(item)} style={s.suggestionChip}><Text style={s.suggestionText}>{item}</Text></Pressable>
          ))}</View> : <Text style={s.noSuggestion}>Aucun mot-clé disponible. Essayez un autre terme.</Text>}
        </View>
      ) : <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterContent}
        style={[s.filterBar, {top: insets.top + 61}]}>
        {visibleFilters.map(filter => {
          const selected = keyword === filter.key;
          return (
            <Pressable
              key={filter.key || 'all'}
              accessibilityRole="button"
              accessibilityState={{selected}}
              onPress={() => {setIndex(0); setKeyword(filter.key);}}
              style={[s.filterChip, selected && s.filterChipActive]}>
              <Text style={[s.filterText, selected && s.filterTextActive]}>{filter.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>}
    </View>
  );
}
const State = ({
  title,
  text,
  loading,
  retry,
}: {
  title: string;
  text: string;
  loading?: boolean;
  retry?: () => void;
}) => (
  <View style={s.state}>
    {loading ? (
      <ActivityIndicator size="large" color="#5943A6" />
    ) : (
      <View style={s.empty}>
        <Icon name="play" />
      </View>
    )}
    <Text style={s.stateTitle}>{title}</Text>
    <Text style={s.stateText}>{text}</Text>
    {retry ? (
      <Pressable onPress={retry} style={s.retry}>
        <Text style={s.retryText}>Actualiser</Text>
      </Pressable>
    ) : null}
  </View>
);

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#08070C'},
  card: {width: '100%', backgroundColor: '#111', overflow: 'hidden'},
  bottomGradient: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
  },
  header: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    height: 40,
    paddingHorizontal: 17,
    borderRadius: 20,
    backgroundColor: 'rgba(16,11,24,.4)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  tabMuted: {color: 'rgba(255,255,255,.65)', fontSize: 13, fontWeight: '700'},
  tabActive: {color: '#FFF', fontSize: 14, fontWeight: '900'},
  dot: {
    alignSelf: 'center',
    width: 18,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#F4B45E',
    marginTop: 3,
  },
  search: {
    position: 'absolute',
    right: 0,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(16,11,24,.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBar: {position: 'absolute', left: 0, right: 0, height: 42},
  filterContent: {paddingHorizontal: 16, gap: 8, alignItems: 'center'},
  filterChip: {height: 32, paddingHorizontal: 13, borderRadius: 16, backgroundColor: 'rgba(18,13,27,.48)', borderWidth: 1, borderColor: 'rgba(255,255,255,.22)', alignItems: 'center', justifyContent: 'center'},
  filterChipActive: {backgroundColor: '#F4B45E', borderColor: '#F4B45E'},
  filterText: {color: 'rgba(255,255,255,.88)', fontSize: 10, fontWeight: '800'},
  filterTextActive: {color: '#2B2035'},
  feedSearchPanel: {position: 'absolute', left: 16, right: 16, padding: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,.97)'},
  feedSearch: {height: 38, paddingLeft: 7, flexDirection: 'row', alignItems: 'center', gap: 8},
  feedSearchInput: {flex: 1, height: 42, paddingVertical: 0, color: '#21182E', fontSize: 12, fontWeight: '700'},
  feedSearchClose: {width: 30, height: 30, borderRadius: 15, backgroundColor: '#EEE9F4', alignItems: 'center', justifyContent: 'center'},
  feedSearchCloseText: {color: '#5943A6', fontSize: 20, lineHeight: 22},
  suggestionList: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 6, paddingTop: 2},
  suggestionChip: {height: 28, paddingHorizontal: 10, borderRadius: 14, backgroundColor: '#EEE9F7', alignItems: 'center', justifyContent: 'center'},
  suggestionText: {color: '#4D3A8D', fontSize: 10, fontWeight: '800'},
  noSuggestion: {paddingHorizontal: 8, paddingBottom: 7, color: '#746D7B', fontSize: 10},
  filteredEmpty: {flex: 1, backgroundColor: '#100B18', paddingHorizontal: 34, alignItems: 'center', justifyContent: 'center'},
  filteredEmptyIcon: {width: 64, height: 64, borderRadius: 22, backgroundColor: '#5943A6', alignItems: 'center', justifyContent: 'center'},
  filteredEmptyTitle: {marginTop: 18, color: '#FFF', fontSize: 20, lineHeight: 27, fontWeight: '900', textAlign: 'center'},
  filteredEmptyText: {marginTop: 8, maxWidth: 320, color: '#BEB5C8', fontSize: 12, lineHeight: 19, textAlign: 'center'},
  clearFilter: {marginTop: 22, width: '100%', height: 50, borderRadius: 17, backgroundColor: '#F4B45E', alignItems: 'center', justifyContent: 'center'},
  clearFilterText: {color: '#2B2035', fontSize: 13, fontWeight: '900'},
  editSearch: {marginTop: 10, height: 42, paddingHorizontal: 18, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,.25)', alignItems: 'center', justifyContent: 'center'},
  editSearchText: {color: '#FFF', fontSize: 11, fontWeight: '800'},
  loader: {position: 'absolute', top: '46%', alignSelf: 'center'},
  play: {
    position: 'absolute',
    left: '50%',
    top: '43%',
    width: 64,
    height: 64,
    marginLeft: -32,
    borderRadius: 32,
    backgroundColor: 'rgba(20,14,35,.58)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rail: {position: 'absolute', right: 10, bottom: 142, gap: 12},
  action: {alignItems: 'center', width: 62},
  actionCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(20,14,30,.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCircle: {backgroundColor: 'rgba(255,255,255,.95)'},
  actionLabel: {color: '#FFF', fontSize: 8, fontWeight: '800', marginTop: 4},
  meta: {position: 'absolute', left: 16, right: 76, bottom: 72},
  pills: {flexDirection: 'row', gap: 6, marginBottom: 6},
  category: {
    height: 25,
    borderRadius: 9,
    paddingHorizontal: 9,
    backgroundColor: '#F4B45E',
    justifyContent: 'center',
  },
  categoryText: {fontSize: 8, fontWeight: '900', color: '#2B2035'},
  verified: {
    height: 25,
    borderRadius: 9,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,.2)',
    justifyContent: 'center',
  },
  verifiedText: {color: '#FFF', fontSize: 8, fontWeight: '900'},
  sponsored: {
    height: 25,
    borderRadius: 9,
    paddingHorizontal: 9,
    backgroundColor: 'rgba(20,16,30,.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.45)',
    justifyContent: 'center',
  },
  sponsoredText: {color: '#FFF', fontSize: 8, fontWeight: '900'},
  name: {color: '#FFF', fontSize: 27, fontWeight: '900'},
  description: {
    color: 'rgba(255,255,255,.84)',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  address: {flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5},
  addressText: {color: 'rgba(255,255,255,.82)', fontSize: 10, flex: 1},
  placeIdentity: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    height: 46,
    marginTop: 8,
    paddingRight: 8,
    borderRadius: 15,
    backgroundColor: 'rgba(18,13,27,.38)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  identityPressed: {opacity: 0.72, transform: [{scale: 0.98}]},
  placeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#DDD',
  },
  placeAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F4B45E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeInitial: {color: '#2B2035', fontSize: 20, fontWeight: '900'},
  placeIdentityText: {marginLeft: 9, maxWidth: 170},
  placeIdentityName: {color: '#FFF', fontSize: 12, fontWeight: '900'},
  placeIdentityHint: {
    color: 'rgba(255,255,255,.68)',
    fontSize: 9,
    marginTop: 2,
  },
  placeChevron: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '400',
    marginLeft: 10,
    marginBottom: 3,
  },
  buttons: {flexDirection: 'row', gap: 8, marginTop: 14},
  secondary: {
    height: 43,
    paddingHorizontal: 13,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,.18)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  primary: {
    height: 43,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#5943A6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  buttonText: {color: '#FFF', fontSize: 10, fontWeight: '900'},
  state: {
    flex: 1,
    backgroundColor: '#F7F6FB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  empty: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: '#5943A6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTitle: {
    color: '#171326',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 16,
  },
  stateText: {
    color: '#777184',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 9,
  },
  retry: {
    marginTop: 24,
    backgroundColor: '#5943A6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  retryText: {color: '#FFF', fontWeight: '800'},
  videoPlaceholder: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#17131D',
  },
});
