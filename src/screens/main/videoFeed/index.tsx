import {useInfiniteQuery, useMutation, useQuery} from '@tanstack/react-query';
import Geolocation from '@react-native-community/geolocation';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  LayoutChangeEvent,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  View,
  ListViewToken,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {mutationEffects, queryKeys} from '../../../query/keys';
import {
  addFavoritesAPI,
  deleteFavoritesAPI,
  getFavoritesAPI,
} from '../../../services/favorites';
import {getVideoFeedAPI} from '../../../services/place';
import FeedHeader, {FeedHeaderHandle} from './components/FeedHeader';
import {FeedMessage, FeedSkeleton} from './components/FeedStates';
import VideoCard from './components/VideoCard';
import {useFeedTracker} from './hooks/useFeedTracker';
import {useLowDataMode} from './hooks/useLowDataMode';
import {usePlaybackAllowed} from './hooks/usePlaybackAllowed';
import {feedColors as c} from './theme';
import type {FeedItem, FeedMode, FeedPage} from './types';

const VIEWABILITY = {itemVisiblePercentThreshold: 60};
const PREFETCH_AHEAD = 3;

export default function VideoFeedScreen({navigation}: any) {
  const insets = useSafeAreaInsets();
  const lowData = useLowDataMode();
  const playbackAllowed = usePlaybackAllowed();
  const headerRef = useRef<FeedHeaderHandle>(null);
  const listRef = useRef<FlatList<FeedItem>>(null);

  const [mode, setMode] = useState<FeedMode>('for-you');
  const [keyword, setKeyword] = useState('');
  const [index, setIndex] = useState(0);
  const [height, setHeight] = useState(0);
  const [muted, setMuted] = useState(false);
  const [location, setLocation] = useState<{
    latitude?: number;
    longitude?: number;
  }>({});

  // La taille de page n'est pas dans la clé : un changement de réseau
  // ne doit pas invalider tout le feed déjà chargé.
  const pageSize = useRef(8);
  pageSize.current = lowData ? 4 : 8;

  const filters = useMemo(
    () => ({
      mode,
      latitude: mode === 'nearby' ? location.latitude : undefined,
      longitude: mode === 'nearby' ? location.longitude : undefined,
      keyword: keyword || undefined,
    }),
    [keyword, location.latitude, location.longitude, mode],
  );

  const {
    data,
    isLoading,
    isError,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [...queryKeys['video-feed-v1'], filters],
    queryFn: ({pageParam, signal}) =>
      getVideoFeedAPI({
        pageParam,
        signal,
        queryKey: [
          queryKeys['video-feed-v1'][0],
          {...filters, limit: pageSize.current},
        ],
      }) as Promise<FeedPage>,
    getNextPageParam: page => page.nextCursor || undefined,
    initialPageParam: null as string | null,
    staleTime: 60_000,
  });

  const feed = useMemo(
    () => data?.pages.flatMap(p => p.items ?? []) ?? [],
    [data],
  );
  const keywords = useMemo(
    () => (data?.pages[0]?.availableFilters ?? []).map(f => f.keyword),
    [data],
  );
  const track = useFeedTracker(data?.pages[0]?.sessionId);

  /* ---------- Favoris ---------- */
  const {data: favorites} = useQuery({
    queryKey: queryKeys.favorites,
    queryFn: getFavoritesAPI,
    retry: false,
  });
  const savedIds = useMemo(
    () =>
      new Set<number>(
        (Array.isArray(favorites) ? favorites : []).map((f: any) =>
          Number(f.idPlace),
        ),
      ),
    [favorites],
  );
  const {mutateAsync: saveMutation} = useMutation({
    meta: mutationEffects.favorites,
    mutationFn: ({id, save}: {id: number; save: boolean}) =>
      save ? addFavoritesAPI({idPlace: id}) : deleteFavoritesAPI(String(id)),
  });

  /* ---------- Callbacks stables (aucun re-rendu des cartes) ---------- */
  const onToggleSave = useCallback(
    (item: FeedItem, save: boolean) =>
      saveMutation({id: item.place.idPlace, save}),
    [saveMutation],
  );
  const onOpen = useCallback(
    (item: FeedItem) => {
      track(item, 'PLACE_OPEN');
      navigation.navigate('Details', {id: item.place.idPlace, source: 'video'});
    },
    [navigation, track],
  );
  const onToggleMute = useCallback(() => setMuted(v => !v), []);

  const resetToTop = useCallback(() => {
    setIndex(0);
    listRef.current?.scrollToOffset({offset: 0, animated: false});
  }, []);
  const onKeywordChange = useCallback(
    (value: string) => {
      resetToTop();
      setKeyword(value);
    },
    [resetToTop],
  );
  const onModeChange = useCallback(
    (value: FeedMode) => {
      resetToTop();
      setMode(value);
    },
    [resetToTop],
  );

  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: ListViewToken[]}) => {
      const first = viewableItems[0]?.index;
      if (first != null) setIndex(first);
    },
  ).current;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const next = Math.round(e.nativeEvent.layout.height);
    setHeight(prev => (prev === next ? prev : next));
  }, []);

  /* ---------- Effets ---------- */
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

  // Impression + démarrage, une seule fois par vidéo.
  const impressions = useRef(new Set<number>());
  useEffect(() => {
    const item = feed[index];
    if (!item || !playbackAllowed || impressions.current.has(item.idMedia))
      return;
    impressions.current.add(item.idMedia);
    track(item, 'FEED_IMPRESSION');
    track(item, 'VIDEO_START');
  }, [feed, index, playbackAllowed, track]);

  // Préchargement des visuels suivants + pagination anticipée.
  useEffect(() => {
    for (let i = 1; i <= PREFETCH_AHEAD; i++) {
      const uri = feed[index + i]?.place.image;
      if (uri) void Image.prefetch(uri).catch(() => undefined);
    }
    if (index >= feed.length - 3 && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [feed, index, hasNextPage, isFetchingNextPage, fetchNextPage]);

  /* ---------- Rendu de liste ---------- */
  const renderItem = useCallback<ListRenderItem<FeedItem>>(
    ({item, index: i}) => (
      <VideoCard
        item={item}
        height={height}
        active={i === index}
        preload={!lowData && i === index + 1}
        playbackAllowed={playbackAllowed}
        saved={savedIds.has(item.place.idPlace)}
        muted={muted}
        lowData={lowData}
        bottomInset={insets.bottom}
        onToggleSave={onToggleSave}
        onOpen={onOpen}
        onTrack={track}
        onToggleMute={onToggleMute}
      />
    ),
    [
      height,
      index,
      insets.bottom,
      lowData,
      muted,
      onOpen,
      onToggleMute,
      onToggleSave,
      playbackAllowed,
      savedIds,
      track,
    ],
  );
  const getItemLayout = useCallback(
    (_: unknown, i: number) => ({length: height, offset: height * i, index: i}),
    [height],
  );
  const keyExtractor = useCallback((x: FeedItem) => String(x.idMedia), []);
  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  const onRefresh = useCallback(() => {
    impressions.current.clear();
    void refetch();
  }, [refetch]);
  const clearKeyword = useCallback(
    () => onKeywordChange(''),
    [onKeywordChange],
  );
  const editSearch = useCallback(
    () => headerRef.current?.openSearch(keyword),
    [keyword],
  );

  /* ---------- États ---------- */
  let body: React.ReactNode = null;
  if (isLoading) {
    body = <FeedSkeleton bottomInset={insets.bottom} />;
  } else if (isError) {
    body = (
      <FeedMessage
        icon="refresh"
        title="Le feed ne répond pas"
        text="Vérifiez votre connexion puis réessayez."
        primaryLabel="Réessayer"
        onPrimary={onRefresh}
      />
    );
  } else if (!feed.length && keyword) {
    body = (
      <FeedMessage
        icon="search"
        title={`Aucune vidéo pour « ${keyword} »`}
        text="Essayez un autre mot ou revenez à toutes les vidéos."
        primaryLabel="Voir toutes les vidéos"
        onPrimary={clearKeyword}
        secondaryLabel="Modifier la recherche"
        onSecondary={editSearch}
      />
    );
  } else if (!feed.length) {
    body = (
      <FeedMessage
        icon="play"
        title="Les premières vidéos arrivent"
        text="Les établissements partageront bientôt leurs plats et leurs ambiances."
        primaryLabel="Actualiser"
        onPrimary={onRefresh}
      />
    );
  } else if (height) {
    body = (
      <FlatList
        ref={listRef}
        data={feed}
        extraData={index}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        pagingEnabled
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews
        onEndReached={onEndReached}
        onEndReachedThreshold={2}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={onRefresh}
            tintColor={c.text}
            colors={[c.primary]}
            progressViewOffset={insets.top + 40}
          />
        }
      />
    );
  }

  return (
    <View style={s.container} onLayout={onLayout}>
      {body}
      {!isLoading && !isError ? (
        <FeedHeader
          ref={headerRef}
          top={insets.top + 8}
          mode={mode}
          keyword={keyword}
          keywords={keywords}
          onModeChange={onModeChange}
          onKeywordChange={onKeywordChange}
        />
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: c.background},
});
