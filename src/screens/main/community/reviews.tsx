import {queryKeys, mutationEffects} from '../../../query/keys';
import {useMutation, useQuery} from '@tanstack/react-query';
import {Box, ScrollView as NBScrollView, useToast} from 'native-base';
import React, {useMemo, useState} from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import LoadingSpinner from '../../../components/Loader';
import Toast from '../../../components/toast';
import CommunityHeader from '../../../components/communityHeader';
import {Color} from '../../../helpers/constatn';
import {createReviewAPI} from '../../../services/community';
import {getAllReservationsByUser} from '../../../services/reservation';

type Ratings = {
  cuisineRating: number;
  serviceRating: number;
  ambianceRating: number;
  priceRating: number;
};
const emptyRatings: Ratings = {
  cuisineRating: 0,
  serviceRating: 0,
  ambianceRating: 0,
  priceRating: 0,
};
const ratingLabels: Record<number, string> = {
  1: 'Décevant',
  2: 'À améliorer',
  3: 'Correct',
  4: 'Très bien',
  5: 'Excellent',
};

function RatingRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <View style={s.ratingRow}>
      <View style={s.ratingCopy}>
        <Text style={s.ratingLabel}>{label}</Text>
        <Text style={s.ratingHint}>{value ? ratingLabels[value] : hint}</Text>
      </View>
      <View style={s.starRow}>
        {[1, 2, 3, 4, 5].map(score => (
          <Pressable
            key={score}
            accessibilityRole="button"
            accessibilityLabel={`${label} : ${score} sur 5`}
            onPress={() => onChange(score)}
            style={s.starButton}>
            <Text style={[s.star, score <= value && s.starOn]}>★</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function VerifiedReviewsScreen({navigation}: any) {
  const toast = useToast();
  const {data = [], isLoading} = useQuery({
    queryKey: queryKeys.reservations,
    queryFn: getAllReservationsByUser,
  });
  const eligible = useMemo(
    () =>
      data.filter(
        (r: any) =>
          r.status === 'COMPLETED' &&
          !r.hasReview &&
          r.reviewsEnabled !== false,
      ),
    [data],
  );
  const [selected, setSelected] = useState<any>(null);
  const [ratings, setRatings] = useState<Ratings>(emptyRatings);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const completed = Object.values(ratings).filter(Boolean).length;
  const reset = () => {
    setSelected(null);
    setRatings(emptyRatings);
    setComment('');
    setPhotos([]);
  };
  const {mutate, isPending: sending} = useMutation({
    meta: mutationEffects.review,
    mutationFn: createReviewAPI,
    onSuccess: () => {
      toast.show({
        placement: 'top',
        render: () => (
          <Toast
            message="Merci, votre avis vérifié est publié"
            status={Color.success}
          />
        ),
      });
      reset();
    },
    onError: (error: any) =>
      Alert.alert(
        'Publication impossible',
        error?.response?.data?.message || 'Veuillez réessayer.',
      ),
  });
  const pickPhotos = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 3,
      includeBase64: true,
      quality: 0.5,
    });
    if (result.didCancel) return;
    const selectedPhotos =
      result.assets
        ?.map(asset =>
          asset.base64
            ? `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`
            : '',
        )
        .filter(Boolean) ?? [];
    setPhotos(selectedPhotos);
  };
  const publish = () => {
    if (completed < 4) {
      Alert.alert(
        'Avis incomplet',
        'Donnez une note aux quatre critères avant de publier.',
      );
      return;
    }
    mutate({
      reservationId: selected.idReservation,
      ...ratings,
      comment: comment.trim(),
      photos,
    });
  };

  return (
    <NBScrollView bg={Color.background} contentContainerStyle={s.page}>
      <LoadingSpinner visible={isLoading || sending} />
      <Box px={5}>
        <CommunityHeader
          title="Votre expérience"
          subtitle="Vos avis aident la communauté à choisir en confiance."
          eyebrow="AVIS VÉRIFIÉS"
          onBack={() => navigation.goBack()}
        />
      </Box>
      {!selected ? (
        <View style={s.content}>
          <View style={s.infoCard}>
            <View style={s.verifiedIcon}>
              <Text style={s.verifiedIconText}>✓</Text>
            </View>
            <View style={s.grow}>
              <Text style={s.infoTitle}>Uniquement après une vraie sortie</Text>
              <Text style={s.infoText}>
                Chaque avis est lié à une réservation terminée.
              </Text>
            </View>
          </View>
          <View style={s.heading}>
            <Text style={s.headingTitle}>À évaluer</Text>
            <Text style={s.count}>{eligible.length}</Text>
          </View>
          {eligible.map((r: any) => (
            <Pressable
              key={r.idReservation}
              accessibilityRole="button"
              onPress={() => setSelected(r)}
              style={s.reservationCard}>
              {r.image ? (
                <Image source={{uri: r.image}} style={s.placeImage} />
              ) : (
                <View style={s.placeFallback}>
                  <Text style={s.placeFallbackText}>
                    {r.placeName?.[0] || 'B'}
                  </Text>
                </View>
              )}
              <View style={s.grow}>
                <Text style={s.placeName}>{r.placeName}</Text>
                <Text style={s.visitDate}>
                  Visité le{' '}
                  {new Date(r.reservationDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                <View style={s.verifiedPill}>
                  <Text style={s.verifiedPillText}>✓ Réservation vérifiée</Text>
                </View>
              </View>
              <Text style={s.arrow}>›</Text>
            </Pressable>
          ))}
          {!eligible.length ? (
            <View style={s.empty}>
              <View style={s.emptyIcon}>
                <Text style={s.emptyIconText}>✓</Text>
              </View>
              <Text style={s.emptyTitle}>Tout est à jour</Text>
              <Text style={s.emptyText}>
                Après votre prochaine sortie terminée, vous pourrez partager
                votre expérience ici.
              </Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={s.content}>
          <View style={s.placeHero}>
            {selected.image ? (
              <Image source={{uri: selected.image}} style={s.heroImage} />
            ) : null}
            <View style={s.heroOverlay} />
            <Pressable onPress={reset} style={s.backButton}>
              <Text style={s.backText}>‹</Text>
            </Pressable>
            <View style={s.heroCopy}>
              <Text style={s.heroEyebrow}>VOTRE SORTIE</Text>
              <Text style={s.heroTitle}>{selected.placeName}</Text>
              <Text style={s.heroDate}>
                {new Date(selected.reservationDate).toLocaleDateString(
                  'fr-FR',
                  {day: 'numeric', month: 'long', year: 'numeric'},
                )}
              </Text>
            </View>
          </View>
          <View style={s.progressCard}>
            <View>
              <Text style={s.progressTitle}>
                Comment s’est passée votre sortie ?
              </Text>
              <Text style={s.progressText}>{completed}/4 critères notés</Text>
            </View>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, {width: `${completed * 25}%`}]} />
            </View>
          </View>
          <View style={s.ratingCard}>
            <RatingRow
              label="Cuisine"
              hint="Goût et qualité"
              value={ratings.cuisineRating}
              onChange={value =>
                setRatings(x => ({...x, cuisineRating: value}))
              }
            />
            <RatingRow
              label="Service"
              hint="Accueil et attention"
              value={ratings.serviceRating}
              onChange={value =>
                setRatings(x => ({...x, serviceRating: value}))
              }
            />
            <RatingRow
              label="Ambiance"
              hint="Cadre et atmosphère"
              value={ratings.ambianceRating}
              onChange={value =>
                setRatings(x => ({...x, ambianceRating: value}))
              }
            />
            <RatingRow
              label="Qualité-prix"
              hint="Valeur de l’expérience"
              value={ratings.priceRating}
              onChange={value => setRatings(x => ({...x, priceRating: value}))}
            />
          </View>
          <View style={s.formCard}>
            <Text style={s.sectionLabel}>RACONTEZ-NOUS</Text>
            <Text style={s.sectionTitle}>Un détail à partager ?</Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Le plat que vous recommandez, l’accueil, l’ambiance…"
              placeholderTextColor="#9993A1"
              multiline
              maxLength={1000}
              textAlignVertical="top"
              style={s.commentInput}
            />
            <Text style={s.counter}>{comment.length}/1000</Text>
            <View style={s.photoHeader}>
              <View>
                <Text style={s.photoTitle}>Ajoutez des photos</Text>
                <Text style={s.photoHint}>Optionnel · jusqu’à 3 photos</Text>
              </View>
              <Text style={s.photoCount}>{photos.length}/3</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.photoRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ajouter des photos"
                onPress={pickPhotos}
                style={s.addPhoto}>
                <Text style={s.addIcon}>＋</Text>
                <Text style={s.addText}>Ajouter</Text>
              </Pressable>
              {photos.map((photo, index) => (
                <View key={`${index}-${photo.slice(-12)}`}>
                  <Image source={{uri: photo}} style={s.photo} />
                  <Pressable
                    accessibilityLabel={`Supprimer la photo ${index + 1}`}
                    onPress={() =>
                      setPhotos(x => x.filter((_, i) => i !== index))
                    }
                    style={s.removePhoto}>
                    <Text style={s.removeText}>×</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={publish}
            style={[s.publish, completed < 4 && s.publishIncomplete]}>
            <View>
              <Text style={s.publishText}>Publier mon avis</Text>
              <Text style={s.publishHint}>
                {completed < 4
                  ? 'Notez les 4 critères pour continuer'
                  : 'Avis public et vérifié'}
              </Text>
            </View>
            <Text style={s.publishArrow}>→</Text>
          </Pressable>
          <Pressable onPress={reset} style={s.cancel}>
            <Text style={s.cancelText}>Terminer plus tard</Text>
          </Pressable>
        </View>
      )}
    </NBScrollView>
  );
}

const s = StyleSheet.create({
  page: {paddingBottom: 110},
  content: {paddingHorizontal: 20},
  grow: {flex: 1},
  infoCard: {
    backgroundColor: '#EFE9FC',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: Color.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  verifiedIconText: {color: 'white', fontSize: 20, fontWeight: '900'},
  infoTitle: {fontSize: 13, fontWeight: '900', color: Color.text},
  infoText: {fontSize: 10, lineHeight: 15, color: Color.muted, marginTop: 3},
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 25,
    marginBottom: 11,
  },
  headingTitle: {fontSize: 23, fontWeight: '900', color: Color.text},
  count: {
    minWidth: 34,
    textAlign: 'center',
    backgroundColor: '#EFE9FC',
    color: Color.main,
    fontWeight: '900',
    padding: 7,
    borderRadius: 12,
    overflow: 'hidden',
  },
  reservationCard: {
    minHeight: 112,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Color.border,
  },
  placeImage: {width: 83, height: 88, borderRadius: 18, marginRight: 14},
  placeFallback: {
    width: 83,
    height: 88,
    borderRadius: 18,
    marginRight: 14,
    backgroundColor: '#EFE9FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeFallbackText: {fontSize: 28, fontWeight: '900', color: Color.main},
  placeName: {fontSize: 17, fontWeight: '900', color: Color.text},
  visitDate: {fontSize: 10, color: Color.muted, marginTop: 4},
  verifiedPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5F6EE',
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 9,
  },
  verifiedPillText: {fontSize: 8, fontWeight: '900', color: '#19796F'},
  arrow: {fontSize: 28, color: Color.main, marginLeft: 5},
  empty: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Color.border,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#E5F6EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconText: {fontSize: 25, fontWeight: '900', color: '#19796F'},
  emptyTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: Color.text,
    marginTop: 14,
  },
  emptyText: {
    fontSize: 12,
    lineHeight: 19,
    color: Color.muted,
    textAlign: 'center',
    marginTop: 6,
  },
  placeHero: {
    height: 205,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: Color.main,
    justifyContent: 'flex-end',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(22,16,38,.56)',
  },
  backButton: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {fontSize: 32, color: 'white', lineHeight: 34},
  heroCopy: {padding: 20},
  heroEyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.6,
    color: '#FFBF68',
  },
  heroTitle: {fontSize: 29, fontWeight: '900', color: 'white', marginTop: 5},
  heroDate: {fontSize: 11, color: '#E7E0F0', marginTop: 5},
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 22,
    padding: 17,
    marginTop: 13,
    borderWidth: 1,
    borderColor: Color.border,
  },
  progressTitle: {fontSize: 16, fontWeight: '900', color: Color.text},
  progressText: {fontSize: 10, color: Color.muted, marginTop: 3},
  progressTrack: {
    height: 7,
    backgroundColor: '#EEE8F3',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 13,
  },
  progressFill: {height: 7, backgroundColor: Color.main, borderRadius: 4},
  ratingCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    paddingHorizontal: 17,
    marginTop: 13,
    borderWidth: 1,
    borderColor: Color.border,
  },
  ratingRow: {
    minHeight: 83,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Color.border,
  },
  ratingCopy: {width: 112},
  ratingLabel: {fontSize: 14, fontWeight: '900', color: Color.text},
  ratingHint: {fontSize: 9, color: Color.muted, marginTop: 3},
  starRow: {flex: 1, flexDirection: 'row', justifyContent: 'flex-end'},
  starButton: {
    width: 42,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {fontSize: 27, color: '#DDD6E5'},
  starOn: {color: '#F6A928'},
  formCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 17,
    marginTop: 13,
    borderWidth: 1,
    borderColor: Color.border,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: Color.main,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: Color.text,
    marginTop: 5,
  },
  commentInput: {
    height: 125,
    borderRadius: 18,
    backgroundColor: '#F8F6FC',
    borderWidth: 1.5,
    borderColor: '#E7E1EC',
    padding: 14,
    fontSize: 13,
    color: Color.text,
    marginTop: 14,
  },
  counter: {fontSize: 9, color: Color.muted, textAlign: 'right', marginTop: 5},
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  photoTitle: {fontSize: 14, fontWeight: '900', color: Color.text},
  photoHint: {fontSize: 9, color: Color.muted, marginTop: 3},
  photoCount: {fontSize: 11, fontWeight: '900', color: Color.main},
  photoRow: {gap: 9, paddingTop: 12},
  addPhoto: {
    width: 88,
    height: 88,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Color.main,
    backgroundColor: '#F5F1FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {fontSize: 25, color: Color.main},
  addText: {fontSize: 9, fontWeight: '900', color: Color.main, marginTop: 3},
  photo: {width: 88, height: 88, borderRadius: 18},
  removePhoto: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#272032',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {fontSize: 20, color: 'white', lineHeight: 22},
  publish: {
    minHeight: 68,
    borderRadius: 21,
    backgroundColor: Color.main,
    marginTop: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  publishIncomplete: {opacity: 0.58},
  publishText: {fontSize: 15, fontWeight: '900', color: 'white'},
  publishHint: {fontSize: 9, color: '#DCD4EB', marginTop: 3},
  publishArrow: {fontSize: 24, color: 'white'},
  cancel: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  cancelText: {fontSize: 12, fontWeight: '800', color: Color.muted},
});
