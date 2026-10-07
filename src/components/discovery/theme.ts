import {Platform} from 'react-native';
// Palette « Nuit tunisienne » partagée par l'écran Explorer.
export const night = {
  ink: '#1C1529',
  deep: '#241B36',
  plum: '#33264D',
  violet: '#7251C9',
  violetSoft: '#EFE9FC',
  lilac: '#C9B8FF',
  gold: '#F6B65C',
  goldSoft: '#FFF3DF',
  mint: '#19796F',
  mintSoft: '#E3F4F0',
  rose: '#E86A92',
  roseSoft: '#FDEAF0',
  sky: '#3E7BD6',
  skySoft: '#E7F0FC',
  text: '#1F1B2E',
  muted: '#6E6880',
  line: '#ECE8F4',
  page: '#F8F6FC',
  white: '#FFFFFF',
};

export const tints = [
  {bg: night.violetSoft, fg: night.violet},
  {bg: night.goldSoft, fg: '#B7741A'},
  {bg: night.mintSoft, fg: night.mint},
  {bg: night.roseSoft, fg: '#C2456E'},
  {bg: night.skySoft, fg: night.sky},
];

// Typographie éditoriale : serif système (Georgia sur iOS, Noto Serif sur Android).
export const fonts = {
  display: Platform.select({ios: 'Georgia', android: 'serif', default: 'serif'}),
};
