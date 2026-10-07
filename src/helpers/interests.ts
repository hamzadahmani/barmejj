import type {VectorIconName} from '../components/vectorIcon';

export const interests: Array<{
  key: string;
  label: string;
  detail: string;
  icon: VectorIconName;
}> = [
  {
    key: 'restaurant',
    label: 'Restaurants',
    detail: 'Tables & découvertes',
    icon: 'utensils',
  },
  {
    key: 'cafe',
    label: 'Cafés',
    detail: 'Coffee shops & terrasses',
    icon: 'coffee',
  },
  {key: 'brunch', label: 'Brunch', detail: 'Matins gourmands', icon: 'egg'},
  {
    key: 'fast_food',
    label: 'Fast-food',
    detail: 'Burgers & street food',
    icon: 'burger',
  },
  {
    key: 'pastry',
    label: 'Pâtisserie',
    detail: 'Douceurs & salons de thé',
    icon: 'cupcake',
  },
  {
    key: 'sport',
    label: 'Sport',
    detail: 'Bouger & se dépasser',
    icon: 'activity',
  },
  {key: 'gaming', label: 'Gaming', detail: 'Jeux & expériences', icon: 'game'},
  {key: 'cinema', label: 'Cinéma', detail: 'Films & projections', icon: 'film'},
  {
    key: 'leisure',
    label: 'Loisirs',
    detail: 'Activités entre amis',
    icon: 'sparkles',
  },
  {key: 'culture', label: 'Culture', detail: 'Art & patrimoine', icon: 'star'},
  {
    key: 'walks',
    label: 'Balades',
    detail: 'Sorties en plein air',
    icon: 'walk',
  },
  {
    key: 'nightlife',
    label: 'Vie nocturne',
    detail: 'Ambiances du soir',
    icon: 'moon',
  },
  {
    key: 'guesthouse',
    label: 'Maisons d’hôtes',
    detail: 'Dars & séjours de charme',
    icon: 'bed',
  },
];
