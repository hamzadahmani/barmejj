export const Color = {
  red: '#E74C3C',
  main: '#45377A',
  mainLight: '#EEEAF8',
  accent: '#E8A45B',
  background: '#F7F7FB',
  surface: '#FFFFFF',
  text: '#19152A',
  muted: '#777382',
  border: '#ECEAF1',
  success: '#008000',
  error: '#e74c3c',
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
