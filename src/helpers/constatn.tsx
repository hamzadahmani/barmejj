// Palette « Nuit tunisienne », alignée sur components/discovery/theme.ts.
export const Color = {
  red: '#D92D20',
  main: '#33264D',
  mainLight: '#EFE9FC',
  accent: '#F6B65C',
  violet: '#7251C9',
  ink: '#1C1529',
  background: '#F8F6FC',
  surface: '#FFFFFF',
  text: '#1F1B2E',
  muted: '#6E6880',
  border: '#ECE8F4',
  success: '#19796F',
  error: '#D92D20',
};
// Configure linking
export const linking = {
  prefixes: ['barmejApp://'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: {
            screens: {
              Details: 'places/:id',
            },
          },
        },
      },
    },
  },
};

export async function buildLink(params: string) {
  const placeId = params.split('=')[1];
  return `barmejApp://places/${placeId}`;
}

export function getQueryParams(url: string) {
  const params: any = {};
  const urlParts = url.split('?');

  if (urlParts.length > 1) {
    const queryString = urlParts[1];
    const pairs = queryString.split('&');

    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      params[key] = decodeURIComponent(value || '');
    }
  }

  return params;
}

export const formList = [
  {name: 'firstName', placeholder: 'Prénom', type: 'text'},
  {name: 'lastName', placeholder: 'Nom', type: 'text'},
  {name: 'userMail', placeholder: 'Adresse e-mail', type: 'text'},
  {name: 'userMobile', placeholder: 'Mobile number', type: 'text'},
  {name: 'userPwd', placeholder: 'Mot de passe', type: 'password'},
  {
    name: 'confirmPassword',
    placeholder: 'Confirme mot de passe',
    type: 'password',
  },
];
