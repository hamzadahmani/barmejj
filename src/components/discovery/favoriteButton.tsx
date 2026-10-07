import React from 'react';
import {ActivityIndicator, Alert, Pressable, StyleSheet} from 'react-native';
import {useMutation, useQuery} from '@tanstack/react-query';
import {mutationEffects, queryKeys} from '../../query/keys';
import {
  addFavoritesAPI,
  deleteFavoritesAPI,
  getFavoritesAPI,
} from '../../services/favorites';
import VectorIcon from '../vectorIcon';
import {night} from './theme';

/**
 * État « favori » d'un lieu, partagé par toutes les cartes et la fiche détaillée.
 * L'état affiché change tout de suite, avant la réponse du serveur.
 */
export function useFavorite(idPlace: number) {
  const favorites = useQuery({
    queryKey: queryKeys.favorites,
    queryFn: getFavoritesAPI,
  });
  const list = Array.isArray(favorites.data) ? favorites.data : [];
  const saved = list.some(
    (place: {idPlace: number}) => Number(place.idPlace) === Number(idPlace),
  );
  const mutation = useMutation({
    meta: mutationEffects.favorites,
    mutationFn: async (next: boolean) =>
      next ? addFavoritesAPI({idPlace}) : deleteFavoritesAPI(String(idPlace)),
    onError: () => Alert.alert('Favoris indisponibles', 'Veuillez réessayer.'),
  });
  const shown = mutation.isPending ? Boolean(mutation.variables) : saved;
  const loading = favorites.isPending && !favorites.data;
  const toggle = () => {
    if (mutation.isPending || loading) return;
    if (favorites.isError) {
      void favorites.refetch();
      return;
    }
    mutation.mutate(!shown);
  };
  return {saved: shown, loading, busy: mutation.isPending, toggle};
}

// Cœur en verre posé sur la photo : ajoute ou retire des favoris sans ouvrir la fiche.
export default function FavoriteButton({
  idPlace,
  placeName,
}: {
  idPlace: number;
  placeName: string;
}) {
  const {saved: shown, loading, busy, toggle} = useFavorite(idPlace);
  return (
    <Pressable
      testID={`favorite-${idPlace}`}
      accessibilityRole="button"
      accessibilityState={{selected: shown, busy}}
      accessibilityLabel={
        shown
          ? `Retirer ${placeName} des favoris`
          : `Ajouter ${placeName} aux favoris`
      }
      hitSlop={8}
      disabled={busy || loading}
      onPress={event => {
        event.stopPropagation?.();
        toggle();
      }}
      style={({pressed}) => [s.button, shown && s.saved, pressed && s.pressed]}>
      {loading ? (
        <ActivityIndicator size="small" color={night.white} />
      ) : (
        <VectorIcon
          name="heart"
          size={16}
          color={shown ? night.ink : night.white}
        />
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  button: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(18,12,30,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  saved: {backgroundColor: '#FF9FCB', borderColor: '#FF9FCB'},
  pressed: {transform: [{scale: 0.88}]},
});
