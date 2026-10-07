import {useCallback, useEffect, useRef} from 'react';
import {AppState} from 'react-native';
import {trackFeedEventsAPI} from '../../../../services/place';
import type {FeedEventType, FeedItem, TrackFn} from '../types';
import {uuid} from '../utils';

const FLUSH_DELAY_MS = 4000;
const MAX_BATCH = 12;
const IMMEDIATE: FeedEventType[] = ['PLACE_OPEN'];

/**
 * Regroupe les événements analytics et les envoie par lot
 * (au lieu d'une requête HTTP par événement).
 * `track` est stable : il ne provoque aucun re-rendu des cartes.
 */
export function useFeedTracker(sessionId?: string) {
  const sessionRef = useRef(sessionId);
  sessionRef.current = sessionId;
  const queue = useRef<Array<Record<string, unknown>>>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (!queue.current.length) return;
    const batch = queue.current.splice(0, queue.current.length);
    void trackFeedEventsAPI(batch).catch(() => undefined);
  }, []);

  const track = useCallback<TrackFn>(
    (item: FeedItem, type, watchMs, positionMs) => {
      const session = sessionRef.current;
      if (!session) return;
      queue.current.push({
        eventId: uuid(),
        sessionId: session,
        videoId: item.idMedia,
        placeId: item.place.idPlace,
        type,
        watchMs,
        positionMs,
        occurredAt: new Date().toISOString(),
        ...(item.campaignId ? {metadata: {campaignId: item.campaignId}} : {}),
      });
      if (queue.current.length >= MAX_BATCH || IMMEDIATE.includes(type)) {
        flush();
      } else if (!timer.current) {
        timer.current = setTimeout(flush, FLUSH_DELAY_MS);
      }
    },
    [flush],
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') flush();
    });
    return () => {
      subscription.remove();
      flush();
    };
  }, [flush]);

  return track;
}
