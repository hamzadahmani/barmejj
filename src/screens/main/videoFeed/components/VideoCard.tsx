import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Video, {OnLoadData, OnProgressData} from 'react-native-video';
import {
  TAB_BAR_SPACE,
  displayFont,
  feedColors as c,
  textShadow,
} from '../theme';
import type {FeedItem, TrackFn} from '../types';
import {MILESTONES, categoryOf} from '../utils';
import Fade from './Fade';
import FeedIcon, {FeedIconName} from './FeedIcon';

const DOUBLE_TAP_MS = 260;

type Props = {
  item: FeedItem;
  height: number;
  /** Carte visible à l'écran. */
  active: boolean;
  /** Carte suivante : le lecteur est monté en pause pour démarrer instantanément. */
  preload: boolean;
  /** Écran focalisé et application au premier plan. */
  playbackAllowed: boolean;
  saved: boolean;
  muted: boolean;
  lowData: boolean;
  bottomInset: number;
  onToggleSave: (item: FeedItem, nextSaved: boolean) => Promise<unknown>;
  onOpen: (item: FeedItem) => void;
  onTrack: TrackFn;
  onToggleMute: () => void;
};

/* ---------- Bouton du rail d'actions ---------- */
const RailButton = memo(function RailButtonView({
  icon,
  label,
  active,
  activeColor = c.like,
  onPress,
}: {
  icon: FeedIconName;
  label?: string;
  active?: boolean;
  activeColor?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{selected: !!active}}
      hitSlop={6}
      onPress={onPress}
      style={({pressed}) => [s.railButton, pressed && s.pressed]}>
      <View style={s.railCircle}>
        <FeedIcon
          name={icon}
          size={24}
          filled={active}
          color={active ? activeColor : c.text}
        />
      </View>
      {label ? <Text style={s.railLabel}>{label}</Text> : null}
    </Pressable>
  );
});

function VideoCard({
  item,
  height,
  active,
  preload,
  playbackAllowed,
  saved,
  muted,
  lowData,
  bottomInset,
  onToggleSave,
  onOpen,
  onTrack,
  onToggleMute,
}: Props) {
  const {place} = item;
  const [userPaused, setUserPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [pendingSaved, setPendingSaved] = useState<boolean | null>(null);

  const progress = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const durationRef = useRef(item.duration ?? 0);
  const lastTimeRef = useRef(0);
  const milestones = useRef(new Set<number>());
  const lastTap = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shownSaved = pendingSaved ?? saved;
  const mountPlayer = active || preload;
  const paused = !active || !playbackAllowed || userPaused;

  // Quand la carte quitte l'écran : on remet la lecture à zéro pour le retour.
  useEffect(() => {
    if (!active) {
      setUserPaused(false);
      setExpanded(false);
    }
  }, [active]);

  useEffect(() => {
    if (!mountPlayer) {
      setReady(false);
      progress.setValue(0);
      lastTimeRef.current = 0;
    }
  }, [mountPlayer, progress]);

  // L'état optimiste s'efface dès que le serveur confirme.
  useEffect(() => {
    if (pendingSaved !== null && pendingSaved === saved) setPendingSaved(null);
  }, [saved, pendingSaved]);

  useEffect(
    () => () => {
      if (tapTimer.current) clearTimeout(tapTimer.current);
    },
    [],
  );

  const source = useMemo(
    () => ({
      uri: item.secureUrl,
      bufferConfig: {
        minBufferMs: lowData ? 2500 : 8000,
        maxBufferMs: lowData ? 10000 : 25000,
        bufferForPlaybackMs: lowData ? 800 : 1500,
        bufferForPlaybackAfterRebufferMs: lowData ? 1500 : 3000,
        cacheSizeMB: 64,
      },
    }),
    [item.secureUrl, lowData],
  );

  /* ---------- Favoris (optimiste) ---------- */
  const toggleSave = useCallback(
    async (forceSave?: boolean) => {
      if (pendingSaved !== null) return;
      const next = forceSave ?? !shownSaved;
      if (next === shownSaved) return;
      setPendingSaved(next);
      try {
        await onToggleSave(item, next);
      } catch {
        setPendingSaved(null);
      }
    },
    [item, onToggleSave, pendingSaved, shownSaved],
  );

  const playBurst = useCallback(() => {
    burst.setValue(0);
    Animated.sequence([
      Animated.spring(burst, {
        toValue: 1,
        friction: 4,
        tension: 160,
        useNativeDriver: true,
      }),
      Animated.timing(burst, {
        toValue: 2,
        duration: 260,
        delay: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [burst]);

  /* ---------- Tap = pause, double tap = sauvegarder ---------- */
  const onSurfacePress = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      if (tapTimer.current) clearTimeout(tapTimer.current);
      tapTimer.current = null;
      playBurst();
      void toggleSave(true);
      return;
    }
    lastTap.current = now;
    tapTimer.current = setTimeout(() => {
      tapTimer.current = null;
      setUserPaused(value => !value);
    }, DOUBLE_TAP_MS);
  }, [playBurst, toggleSave]);

  /* ---------- Lecteur ---------- */
  const reportComplete = useCallback(() => {
    if (milestones.current.has(100)) return;
    milestones.current.add(100);
    const ms = Math.round(durationRef.current * 1000);
    onTrack(item, 'VIDEO_COMPLETE', ms, ms);
  }, [item, onTrack]);

  const onLoad = useCallback(({duration}: OnLoadData) => {
    if (duration > 0) durationRef.current = duration;
  }, []);

  const onProgress = useCallback(
    ({currentTime}: OnProgressData) => {
      const duration = durationRef.current;
      if (!duration) return;
      // Boucle détectée (repeat) : onEnd n'est pas toujours émis sur Android.
      if (currentTime + 0.5 < lastTimeRef.current) reportComplete();
      lastTimeRef.current = currentTime;
      const ratio = Math.min(currentTime / duration, 1);
      progress.setValue(ratio);
      for (const mark of MILESTONES) {
        if (ratio >= mark / 100 && !milestones.current.has(mark)) {
          milestones.current.add(mark);
          const ms = Math.round(currentTime * 1000);
          onTrack(item, `VIDEO_${mark}_PERCENT` as const, ms, ms);
        }
      }
    },
    [item, onTrack, progress, reportComplete],
  );

  const onBuffer = useCallback(
    ({isBuffering}: {isBuffering: boolean}) => setBuffering(isBuffering),
    [],
  );
  const onReady = useCallback(() => setReady(true), []);
  const open = useCallback(() => onOpen(item), [item, onOpen]);
  const share = useCallback(() => {
    void Share.share({
      message: `Découvrez ${place.placeName}${
        place.placeAdress ? ` (${place.placeAdress})` : ''
      } sur Barmej.`,
    });
  }, [place.placeAdress, place.placeName]);
  const toggleExpanded = useCallback(() => setExpanded(v => !v), []);
  const onSaveButton = useCallback(() => {
    void toggleSave();
  }, [toggleSave]);

  const category = categoryOf(item);
  const chrome = TAB_BAR_SPACE + bottomInset;

  const burstStyle = {
    opacity: burst.interpolate({
      inputRange: [0, 0.2, 1, 2],
      outputRange: [0, 1, 1, 0],
    }),
    transform: [
      {
        scale: burst.interpolate({
          inputRange: [0, 1, 2],
          outputRange: [0.4, 1, 1.35],
        }),
      },
    ],
  };
  const progressStyle = {
    width: progress.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    }),
  };

  return (
    <View style={[s.card, {height}]}>
      <Pressable
        accessibilityLabel={
          userPaused ? 'Reprendre la vidéo' : 'Mettre en pause'
        }
        accessibilityHint="Touchez deux fois pour sauvegarder"
        style={StyleSheet.absoluteFill}
        onPress={onSurfacePress}>
        {mountPlayer ? (
          <Video
            source={source}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            repeat
            paused={paused}
            muted={muted || !active}
            maxBitRate={lowData ? 900000 : 0}
            progressUpdateInterval={250}
            playInBackground={false}
            playWhenInactive={false}
            hideShutterView
            shutterColor="transparent"
            onLoad={onLoad}
            onReadyForDisplay={onReady}
            onBuffer={onBuffer}
            onProgress={active ? onProgress : undefined}
            onEnd={reportComplete}
          />
        ) : null}
        {!ready ? (
          place.image ? (
            <Image
              source={{uri: place.image}}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              blurRadius={mountPlayer ? 0 : 1}
            />
          ) : (
            <View style={s.placeholder} />
          )
        ) : null}
        <Fade id={`top-${item.idMedia}`} position="top" height={170} />
        <Fade
          id={`bottom-${item.idMedia}`}
          position="bottom"
          height={chrome + 300}
        />
      </Pressable>

      {/* Indicateurs centraux */}
      {active && (!ready || buffering) && !userPaused ? (
        <View pointerEvents="none" style={s.center}>
          <ActivityIndicator color={c.text} />
        </View>
      ) : null}
      {active && userPaused ? (
        <View pointerEvents="none" style={s.center}>
          <View style={s.playBadge}>
            <FeedIcon name="play" size={30} />
          </View>
        </View>
      ) : null}
      <Animated.View pointerEvents="none" style={[s.center, burstStyle]}>
        <FeedIcon
          name="heart"
          size={96}
          color={c.like}
          filled
          strokeWidth={1}
        />
      </Animated.View>

      {/* Rail d'actions */}
      <View style={[s.rail, {bottom: chrome + 26}]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ouvrir ${place.placeName}`}
          onPress={open}
          style={({pressed}) => [s.avatarWrap, pressed && s.pressed]}>
          {place.image ? (
            <Image source={{uri: place.image}} style={s.avatar} />
          ) : (
            <View style={[s.avatar, s.avatarFallback]}>
              <Text style={s.avatarInitial}>
                {place.placeName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {place.verified ? (
            <View style={s.avatarBadge}>
              <Text style={s.avatarBadgeText}>✓</Text>
            </View>
          ) : null}
        </Pressable>
        <RailButton
          icon="heart"
          label={shownSaved ? 'Enregistré' : 'Sauver'}
          active={shownSaved}
          onPress={onSaveButton}
        />
        <RailButton icon="share" label="Partager" onPress={share} />
        <RailButton
          icon={muted ? 'mute' : 'sound'}
          label={muted ? 'Son coupé' : 'Son'}
          onPress={onToggleMute}
        />
      </View>

      {/* Informations du lieu */}
      <View style={[s.meta, {bottom: chrome + 20}]}>
        <View style={s.pills}>
          <View style={s.category}>
            <Text numberOfLines={1} style={s.categoryText}>
              {category.toUpperCase()}
            </Text>
          </View>
          {item.sponsored ? (
            <View style={s.ghostPill}>
              <Text style={s.ghostPillText}>SPONSORISÉ</Text>
            </View>
          ) : place.verified ? (
            <View style={s.ghostPill}>
              <Text style={s.ghostPillText}>✓ VÉRIFIÉ</Text>
            </View>
          ) : null}
        </View>

        <Pressable onPress={open} accessibilityRole="link">
          <Text numberOfLines={2} style={s.name}>
            {place.placeName}
          </Text>
        </Pressable>

        {place.placeAdress ? (
          <View style={s.address}>
            <FeedIcon name="pin" size={14} color={c.gold} />
            <Text numberOfLines={1} style={s.addressText}>
              {place.placeAdress}
            </Text>
          </View>
        ) : null}

        {place.placeDescription ? (
          <Pressable onPress={toggleExpanded} hitSlop={4}>
            <Text numberOfLines={expanded ? 6 : 2} style={s.description}>
              {place.placeDescription}
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={open}
          style={({pressed}) => [s.cta, pressed && s.pressed]}>
          <Text style={s.ctaText}>Voir l’établissement</Text>
          <FeedIcon name="arrow" size={17} />
        </Pressable>
      </View>

      {/* Progression */}
      {active ? (
        <View pointerEvents="none" style={[s.track, {bottom: chrome + 6}]}>
          <Animated.View style={[s.trackFill, progressStyle]} />
        </View>
      ) : null}
    </View>
  );
}

export default memo(VideoCard);

const s = StyleSheet.create({
  card: {width: '100%', backgroundColor: c.surface, overflow: 'hidden'},
  placeholder: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: c.surfaceRaised,
  },
  pressed: {opacity: 0.7, transform: [{scale: 0.96}]},
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    paddingLeft: 4,
    backgroundColor: 'rgba(20,14,35,.55)',
    borderWidth: 1,
    borderColor: c.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rail: {position: 'absolute', right: 10, alignItems: 'center', gap: 16},
  avatarWrap: {marginBottom: 4},
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: c.text,
    backgroundColor: c.surfaceRaised,
  },
  avatarFallback: {
    backgroundColor: c.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {color: c.goldInk, fontSize: 21, fontWeight: '900'},
  avatarBadge: {
    position: 'absolute',
    bottom: -7,
    alignSelf: 'center',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: c.primary,
    borderWidth: 2,
    borderColor: c.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadgeText: {color: c.text, fontSize: 10, fontWeight: '900'},
  railButton: {alignItems: 'center', width: 64},
  railCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: c.glass,
    borderWidth: 1,
    borderColor: c.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  railLabel: {
    color: c.text,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
    ...textShadow,
  },

  meta: {position: 'absolute', left: 16, right: 86},
  pills: {flexDirection: 'row', gap: 6, marginBottom: 10},
  category: {
    height: 24,
    maxWidth: 180,
    borderRadius: 12,
    paddingHorizontal: 10,
    backgroundColor: c.gold,
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
    color: c.goldInk,
  },
  ghostPill: {
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.3)',
    justifyContent: 'center',
  },
  ghostPillText: {
    color: c.text,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  name: {
    color: c.text,
    fontFamily: displayFont,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '700',
    letterSpacing: -0.3,
    ...textShadow,
  },
  address: {flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6},
  addressText: {
    flex: 1,
    color: c.textSoft,
    fontSize: 12.5,
    fontWeight: '600',
    ...textShadow,
  },
  description: {
    color: c.textSoft,
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: 8,
    ...textShadow,
  },
  cta: {
    alignSelf: 'flex-start',
    height: 42,
    marginTop: 14,
    paddingLeft: 18,
    paddingRight: 14,
    borderRadius: 21,
    backgroundColor: c.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: c.primary,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {color: c.text, fontSize: 13.5, fontWeight: '800'},

  track: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,.22)',
    overflow: 'hidden',
  },
  trackFill: {height: '100%', borderRadius: 2, backgroundColor: c.gold},
});
