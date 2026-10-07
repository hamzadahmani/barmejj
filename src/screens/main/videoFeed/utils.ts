import type {FeedItem} from './types';

export const normalizeKeyword = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export const uuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, value => {
    const random = Math.floor(Math.random() * 16);
    return (value === 'x' ? random : (random % 4) + 8).toString(16);
  });

export const categoryOf = (item: FeedItem) =>
  item.place.categories?.[0]?.name ||
  item.place.categories?.[0]?.categoryName ||
  item.place.subTitle ||
  'À découvrir';

export const MILESTONES = [25, 50, 75] as const;
