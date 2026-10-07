import {Platform} from 'react-native';

// Palette « Nuit tunisienne » partagée avec Explorer, déclinée en sombre pour le feed.
export const feedColors = {
  background: '#08070C',
  surface: '#14101C',
  surfaceRaised: '#1E1829',
  glass: 'rgba(16,11,24,.46)',
  glassBorder: 'rgba(255,255,255,.18)',
  primary: '#7251C9',
  primarySoft: '#9B7EE0',
  gold: '#F6B65C',
  goldInk: '#2B2035',
  like: '#FF617C',
  text: '#FFFFFF',
  textSoft: 'rgba(255,255,255,.82)',
  textMuted: 'rgba(255,255,255,.62)',
};

export const displayFont = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
});

export const textShadow = {
  textShadowColor: 'rgba(0,0,0,.45)',
  textShadowOffset: {width: 0, height: 1},
  textShadowRadius: 6,
};

// Barre d'onglets flottante (routes/home) : bottom 8 + hauteur 64.
export const TAB_BAR_SPACE = 80;
