export type FeedMode = 'for-you' | 'nearby';

export type FeedItem = {
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

export type FeedPage = {
  items: FeedItem[];
  nextCursor?: string | null;
  sessionId?: string;
  availableFilters?: Array<{keyword: string; count: number}>;
};

export type FeedEventType =
  | 'FEED_IMPRESSION'
  | 'VIDEO_START'
  | 'VIDEO_25_PERCENT'
  | 'VIDEO_50_PERCENT'
  | 'VIDEO_75_PERCENT'
  | 'VIDEO_COMPLETE'
  | 'VIDEO_SKIP'
  | 'PLACE_OPEN';

export type TrackFn = (
  item: FeedItem,
  type: FeedEventType,
  watchMs?: number,
  positionMs?: number,
) => void;
