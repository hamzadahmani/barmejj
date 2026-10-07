import {queryKeys, mutationEffects} from '../../../query/keys';
import {useFocusEffect} from '@react-navigation/native';
import {useMutation, useQuery} from '@tanstack/react-query';
import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import SvgComponentTrash from '../../../assets/Delete';
import {deleteFavoritesAPI, getFavoritesAPI} from '../../../services/favorites';

type Favorite = {
  idPlace: number | string;
  image?: string | null;
  placeName?: string | null;
  subTitle?: string | null;
};

function FavoriteCard({
  item,
  onOpen,
  onDelete,
  deleting,
}: {
  item: Favorite;
  onOpen: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(item.image?.trim()) && !imageFailed;
  return (
    <View style={styles.column}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ouvrir ${item.placeName || "l'établissement"}`}
        onPress={onOpen}
        style={({pressed}) => [styles.card, pressed && styles.cardPressed]}>
        {hasImage ? (
          <Image
            source={{uri: item.image!}}
            resizeMode="cover"
            style={styles.image}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.imageFallbackText}>BARMEJ</Text>
          </View>
        )}
        <View style={styles.cardContent}>
          <View style={styles.cardCopy}>
            <Text style={styles.placeName} numberOfLines={1}>
              {item.placeName || 'Établissement'}
            </Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {item.subTitle || 'Établissement sélectionné'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retirer des favoris"
            disabled={deleting}
            hitSlop={8}
            onPress={event => {
              event.stopPropagation?.();
              onDelete();
            }}
            style={({pressed}) => [
              styles.deleteButton,
              pressed && styles.deleteButtonPressed,
            ]}>
            {deleting ? (
              <ActivityIndicator size="small" color="#D92D20" />
            ) : (
              <SvgComponentTrash />
            )}
          </Pressable>
        </View>
        <Text style={styles.openLabel}>OUVRIR LA FICHE →</Text>
      </Pressable>
    </View>
  );
}

export default function MyFavorit({navigation}: any) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const {isLoading, isRefetching, isError, data, refetch} = useQuery({
    queryKey: queryKeys.favorites,
    queryFn: getFavoritesAPI,
  });
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );
  const {mutate: deleteFavorite} = useMutation({
    meta: mutationEffects.favorites,
    mutationFn: (id: Favorite['idPlace']) => deleteFavoritesAPI(String(id)),
    onError: error => console.warn('Suppression du favori impossible', error),
    onSettled: () => setDeletingId(null),
  });
  const favorites: Favorite[] = Array.isArray(data)
    ? data.filter(item => item && item.idPlace !== undefined)
    : [];
  const handleDelete = (id: Favorite['idPlace']) => {
    const normalizedId = String(id);
    if (deletingId === normalizedId) return;
    setDeletingId(normalizedId);
    deleteFavorite(id);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={() => navigation.goBack()}
          style={({pressed}) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>VOTRE COLLECTION</Text>
          <Text style={styles.title}>Mes favoris</Text>
        </View>
      </View>
      <Text style={styles.description}>
        Votre collection personnelle d’adresses
      </Text>
      <View style={styles.counter}>
        <Text style={styles.counterText}>{favorites.length} ENREGISTRÉS</Text>
      </View>
      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#33264D" />
          <Text style={styles.stateText}>Chargement de vos favoris…</Text>
        </View>
      ) : isError ? (
        <View style={styles.centerState}>
          <Text style={styles.emptyTitle}>
            Impossible de charger vos favoris
          </Text>
          <Text style={styles.stateText}>
            Vérifiez votre connexion puis réessayez.
          </Text>
          <Pressable onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                void refetch();
              }}
              colors={['#33264D']}
              tintColor="#33264D"
            />
          }
          data={favorites}
          numColumns={2}
          keyExtractor={item => String(item.idPlace)}
          contentContainerStyle={[
            styles.listContent,
            favorites.length === 0 && styles.emptyListContent,
          ]}
          columnWrapperStyle={favorites.length > 1 ? styles.row : undefined}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <FavoriteCard
              item={item}
              deleting={deletingId === String(item.idPlace)}
              onOpen={() => navigation.navigate('Details', {id: item.idPlace})}
              onDelete={() => handleDelete(item.idPlace)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.centerState}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyHeart}>♡</Text>
              </View>
              <Text style={styles.emptyTitle}>Aucun favori pour l’instant</Text>
              <Text style={styles.stateText}>
                Ajoutez vos lieux préférés pour les retrouver facilement ici.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F8F6FC', paddingTop: 20},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  backButtonPressed: {backgroundColor: '#EFE9FC'},
  backIcon: {color: '#33264D', fontSize: 31, lineHeight: 33},
  headerCopy: {flex: 1},
  eyebrow: {
    color: '#33264D',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.7,
  },
  title: {color: '#1F1B2E', fontSize: 27, fontWeight: '900', marginTop: 2},
  description: {
    color: '#6E6880',
    fontSize: 14,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  counter: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFE9FC',
    borderRadius: 14,
    marginLeft: 20,
    marginTop: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  counterText: {color: '#33264D', fontSize: 11, fontWeight: '800'},
  listContent: {paddingHorizontal: 12, paddingTop: 16, paddingBottom: 110},
  emptyListContent: {flexGrow: 1},
  row: {justifyContent: 'space-between'},
  column: {width: '50%', paddingHorizontal: 4, paddingVertical: 4},
  card: {
    height: 238,
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#241B3F',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
  },
  cardPressed: {opacity: 0.92, transform: [{scale: 0.99}]},
  image: {width: '100%', height: 125, backgroundColor: '#EAE8EF'},
  imageFallback: {
    width: '100%',
    height: 125,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9E4F5',
  },
  imageFallbackText: {
    color: '#7464A8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  cardContent: {flexDirection: 'row', alignItems: 'flex-start', padding: 10},
  cardCopy: {flex: 1, minHeight: 58, paddingRight: 4},
  placeName: {color: '#1F1B2E', fontSize: 15, fontWeight: '800'},
  subtitle: {color: '#6E6880', fontSize: 11, marginTop: 4, lineHeight: 15},
  deleteButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#FFF0F1',
  },
  deleteButtonPressed: {backgroundColor: '#FFE0E3'},
  openLabel: {
    color: '#33264D',
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 10,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  stateText: {
    color: '#667085',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  emptyTitle: {
    color: '#101828',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9E4F5',
    marginBottom: 16,
  },
  emptyHeart: {color: '#33264D', fontSize: 38, lineHeight: 44},
  retryButton: {
    backgroundColor: '#33264D',
    borderRadius: 14,
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  retryText: {color: '#FFFFFF', fontSize: 14, fontWeight: '700'},
});
