import React from 'react';
import {RefreshControl} from 'react-native';
import renderer, {act} from 'react-test-renderer';
import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import ExploreHome from '../src/screens/main/categories';
import ListCardItems from '../src/components/listCardItems';
import {DiscoveryDeck, PlaceRow} from '../src/components/discovery/sections';
import {interests} from '../src/helpers/interests';
import {requestLocation} from '../src/helpers/location';

const mockRefresh = jest.fn();
let mockError = false;
let mockLoading = false;
let mockPlaces: any[] = [];
let mockData: any;
jest.mock('@tanstack/react-query', () => ({
  useQuery: ({queryKey: key}: {queryKey: readonly unknown[]}) => ({
    data:
      key[0] === 'discovery'
        ? mockData
        : key[0] === 'profile'
        ? {firstName: 'Sarra'}
        : key[0] === 'upcomingReservation'
        ? {
            placeName: 'Café',
            reservationDate: '2026-09-15',
            reservationTime: '18:00',
            numberOfPersons: 2,
          }
        : mockPlaces,
    isError: mockError,
    isLoading: mockLoading,
    isFetching: false,
    isRefetching: false,
    refetch: mockRefresh,
  }),
  useMutation: () => ({mutate: jest.fn(), isPending: false}),
}));
jest.mock('@react-navigation/native', () => ({useFocusEffect: jest.fn()}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 24, bottom: 20}),
}));
jest.mock('../src/routes/auth/authProvider', () => ({
  useAuth: () => ({userInfo: {idUser: 1, firstName: 'Sarra'}}),
}));
jest.mock('../src/helpers/location', () => ({requestLocation: jest.fn()}));
jest.mock('../src/components/search', () => 'SearchBar');
jest.mock('../src/components/Loader', () => 'Loader');
jest.mock('../src/components/cardPlace', () => 'CardPlace');
jest.mock('../src/services/discovery', () => ({
  getDiscovery: jest.fn(),
  getPlacesByInterest: jest.fn(),
}));
jest.mock('../src/services/profil', () => ({getProfilAPI: jest.fn()}));
jest.mock('../src/services/reservation', () => ({
  getUpcomingReservationAPI: jest.fn(),
}));
jest.mock('../src/services/place', () => ({
  getAllPlacesByCategorieAPI: jest.fn(),
}));
jest.mock('../src/services/search', () => ({getPlacesBySearch: jest.fn()}));

const place = {idPlace: 7, placeName: 'Café Test', rating: 4.2, reviewCount: 3};
function allText(node: any): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(allText).join(' ');
  return node?.children ? allText(node.children) : '';
}
const textOf = (tree: renderer.ReactTestRenderer) => allText(tree.toJSON());
async function render(element: React.ReactElement) {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(element);
  });
  return tree;
}
async function press(tree: renderer.ReactTestRenderer, testID: string) {
  await act(async () => {
    await tree.root
      .findAll(
        node =>
          node.props.testID === testID &&
          typeof node.props.onPress === 'function',
      )[0]
      .props.onPress();
  });
}
beforeEach(() => {
  jest.clearAllMocks();
  mockError = false;
  mockLoading = false;
  mockPlaces = [];
  mockData = {
    forYou: [place],
    availableNow: [place],
    nearby: [],
    recent: [place],
    newPlaces: [place],
    interests: [],
    events: [{idEvent: 1, idPlace: 7, title: 'Concert', place}],
    offers: [
      {
        idPlace: 7,
        title: 'Happy hour',
        description: 'Une offre du café',
        place,
      },
    ],
  };
});

describe('Explorer navigation and states', () => {
  it('switches the recommendation deck and opens the selected address', async () => {
    const onPlace = jest.fn();
    const second = {...place, idPlace: 8, placeName: 'Autre café'};
    const tree = await render(
      <DiscoveryDeck places={[place, second]} onPlace={onPlace} />,
    );
    const button = (label: string) =>
      tree.root.findAll(
        node =>
          node.props.accessibilityLabel === label &&
          typeof node.props.onPress === 'function',
      )[0];
    await act(async () => {
      button('Afficher Autre café').props.onPress();
    });
    expect(
      button('Afficher Autre café').props.accessibilityState.selected,
    ).toBe(true);
    expect(button('Afficher Café Test').props.accessibilityState.selected).toBe(
      false,
    );
    expect(textOf(tree)).toContain('02');
    await act(async () => {
      button('Découvrir Autre café').props.onPress();
    });
    expect(onPlace).toHaveBeenCalledWith(8);
    await act(async () => {
      tree.unmount();
    });
  });
  it('connects every home action to the registered stack and tab names', async () => {
    const navigate = jest.fn();
    const parent = jest.fn();
    const tree = await render(
      <ExploreHome
        navigation={{navigate, getParent: () => ({navigate: parent})}}
      />,
    );
    for (const interest of interests) {
      await press(tree, `interest-${interest.key}`);
      expect(navigate).toHaveBeenLastCalledWith('HomeScreen', {
        interest: interest.key,
      });
    }
    for (const mood of [
      'Ce soir',
      'En amoureux',
      'Petit budget',
      'Avec des amis',
      'Sortie calme',
    ]) {
      const button = tree.root.findAll(
        node =>
          node.props.testID === `mood-${mood}` &&
          typeof node.props.onPress === 'function',
      )[0];
      expect(button.props.accessibilityState?.selected).not.toBe(true);
      await press(tree, `mood-${mood}`);
      expect(navigate).toHaveBeenLastCalledWith('HomeScreen', {intent: mood});
    }
    await press(tree, 'explorer-profile');
    expect(parent).toHaveBeenLastCalledWith('Profile', undefined);
    await press(tree, 'explorer-map');
    expect(navigate).toHaveBeenLastCalledWith('NearMe');
    await press(tree, 'explorer-favorites');
    expect(navigate).toHaveBeenLastCalledWith('FavoriteList');
    expect(textOf(tree)).not.toContain('Barmejli express');
    expect(textOf(tree)).not.toContain('Créer une expérience');
    expect(textOf(tree)).not.toContain('Continuer votre découverte');
    const placeButton = tree.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Découvrir Café Test' &&
        typeof node.props.onPress === 'function',
    )[0];
    await act(async () => {
      placeButton.props.onPress();
    });
    expect(navigate).toHaveBeenLastCalledWith('Details', {id: 7});
    expect(textOf(tree)).not.toContain('À l’affiche');
    expect(textOf(tree)).not.toContain('Concert');
    await press(tree, 'offer-7');
    expect(navigate).toHaveBeenLastCalledWith('Details', {id: 7});
    await press(tree, 'explorer-booking');
    expect(parent).toHaveBeenLastCalledWith('Reservations', undefined);
    await act(async () => {
      tree.unmount();
    });
  });
  it('never requests location at mount and offers a retry on denial', async () => {
    jest
      .mocked(requestLocation)
      .mockRejectedValue(new Error('Permission refusée'));
    const tree = await render(<ExploreHome navigation={{}} />);
    expect(requestLocation).not.toHaveBeenCalled();
    await press(tree, 'explorer-locate');
    expect(requestLocation).toHaveBeenCalledTimes(1);
    expect(textOf(tree)).toContain('Permission refusée');
    await act(async () => {
      tree.unmount();
    });
  });
  it('hides empty discovery sections and refreshes all home data', async () => {
    mockData = {
      ...mockData,
      forYou: [],
      availableNow: [],
      recent: [],
      newPlaces: [],
      events: [],
    };
    const tree = await render(<ExploreHome navigation={{}} />);
    expect(textOf(tree)).not.toContain('Disponible maintenant');
    expect(textOf(tree)).not.toContain('Tout juste arrivés');
    expect(textOf(tree)).toContain('Aucune adresse disponible');
    await act(async () => {
      tree.root.findByType(RefreshControl).props.onRefresh();
    });
    expect(mockRefresh).toHaveBeenCalledTimes(3);
    await act(async () => {
      tree.unmount();
    });
  });
  it('shows recoverable loading and error states', async () => {
    mockData = undefined;
    mockLoading = true;
    const tree = await render(<ExploreHome navigation={{}} />);
    expect(textOf(tree)).toContain('Nous préparons');
    mockLoading = false;
    mockError = true;
    await act(async () => {
      tree.update(<ExploreHome navigation={{}} />);
    });
    expect(textOf(tree)).toContain('Impossible de charger vos découvertes');
    expect(textOf(tree)).toContain('Réessayer');
    await act(async () => {
      tree.unmount();
    });
  });
  it('does not label a place as new or rated without real reviews', async () => {
    const tree = await render(
      <PlaceRow
        title="Pour vous"
        places={[{...place, reviewCount: 0}]}
        onPlace={jest.fn()}
      />,
    );
    expect(textOf(tree)).toContain('Pas encore d’avis');
    expect(textOf(tree)).not.toContain('4.2');
    expect(textOf(tree)).not.toContain('Nouveau');
    await act(async () => {
      tree.unmount();
    });
  });
  it('requests location only when the proximity filter is selected', async () => {
    jest
      .mocked(requestLocation)
      .mockResolvedValue({latitude: 36.8, longitude: 10.1});
    const tree = await render(
      <ListCardItems navigation={{}} interest="gaming" />,
    );
    expect(requestLocation).not.toHaveBeenCalled();
    await press(tree, 'filter-À proximité');
    expect(requestLocation).toHaveBeenCalledTimes(1);
    await act(async () => {
      tree.unmount();
    });
  });
});
