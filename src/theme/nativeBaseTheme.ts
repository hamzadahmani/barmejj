import {extendTheme} from 'native-base';
import {Platform} from 'react-native';

// Thème NativeBase aligné sur la palette « Nuit tunisienne » de l'écran Explorer :
// violet de marque, accents or, titres en serif éditorial, formes bien arrondies.
const display = Platform.select({ios: 'Georgia', android: 'serif', default: 'serif'});

// Objet non typé volontairement : l'inférence complète d'extendTheme ralentit fortement tsc.
const overrides: Record<string, unknown> = {
  colors: {
    primary: {
      50: '#F6F2FE', 100: '#EFE9FC', 200: '#DCD0F7', 300: '#C9B8FF', 400: '#9B7EE0',
      500: '#7251C9', 600: '#5B3FAB', 700: '#47318A', 800: '#33264D', 900: '#1C1529',
    },
    secondary: {
      50: '#FFF8EC', 100: '#FFF3DF', 200: '#FDE2B6', 300: '#FACF89', 400: '#F8C273',
      500: '#F6B65C', 600: '#E09A3C', 700: '#B7741A', 800: '#8A5512', 900: '#5C380B',
    },
  },
  fonts: {heading: display},
  components: {
    Heading: {baseStyle: {color: '#1F1B2E', fontWeight: '700', letterSpacing: -0.3}},
    Button: {
      baseStyle: {rounded: 'full', _text: {fontWeight: '800'}},
      defaultProps: {colorScheme: 'primary'},
    },
    Input: {baseStyle: {rounded: 'xl', borderColor: '#ECE8F4', _focus: {borderColor: '#7251C9', backgroundColor: '#FFFFFF'}}},
    TextArea: {baseStyle: {rounded: 'xl', borderColor: '#ECE8F4'}},
    Badge: {baseStyle: {rounded: 'full'}},
  },
};

export const nativeBaseTheme = extendTheme(overrides);
