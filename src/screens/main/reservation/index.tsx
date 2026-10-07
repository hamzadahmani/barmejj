import {queryKeys, mutationEffects} from '../../../query/keys';
import {useMutation, useQuery} from '@tanstack/react-query';
import {useToast} from 'native-base';
import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LoadingSpinner from '../../../components/Loader';
import Toast from '../../../components/toast';
import {Color} from '../../../helpers/constatn';
import NightArt from '../../../components/discovery/nightArt';
import {fonts, night} from '../../../components/discovery/theme';
import {getPlaceByIdAPI} from '../../../services/place';
import {
  addReservationAPI,
  AvailabilitySlot,
  getPlaceAvailability,
} from '../../../services/reservation';

const pad = (value: number) => String(value).padStart(2, '0');
const toLocalISO = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const buildDates = () =>
  Array.from({length: 14}, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + index);
    return {
      value: toLocalISO(date),
      day:
        index === 0
          ? 'Aujourd’hui'
          : date
              .toLocaleDateString('fr-FR', {weekday: 'short'})
              .replace('.', ''),
      number: date.getDate(),
      month: date
        .toLocaleDateString('fr-FR', {month: 'short'})
        .replace('.', ''),
    };
  });

export default function Reservation({route, navigation}: any) {
  const {id} = route.params;
  const toast = useToast();
  const dates = useMemo(buildDates, []);
  const [guests, setGuests] = useState(2);
  const [selectedDate, setSelectedDate] = useState(dates[0].value);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [seatingPreference, setSeatingPreference] = useState('NO_PREFERENCE');
  const [occasion, setOccasion] = useState('');
  const [allergies, setAllergies] = useState('');

  const {
    data: availability,
    isLoading: availabilityLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.placeAvailability, id, selectedDate, guests],
    queryFn: () =>
      getPlaceAvailability({placeId: Number(id), date: selectedDate, guests}),
    staleTime: 15_000,
  });
  const slots: AvailabilitySlot[] = useMemo(
    () => availability?.slots ?? [],
    [availability?.slots],
  );

  useEffect(() => {
    if (
      selectedTime &&
      !slots.some(slot => slot.time === selectedTime && slot.available)
    )
      setSelectedTime(null);
  }, [selectedTime, slots]);

  // Fiche du lieu déjà en cache depuis l'écran de détail : nom et photo dans l'en-tête.
  const {data: placeData} = useQuery({
    queryKey: [...queryKeys.getPlaceById, {id}],
    queryFn: getPlaceByIdAPI,
    staleTime: 60_000,
  });
  const placeName: string | undefined = placeData?.place?.placeName;

  const {mutate: createReservation, isPending: isLoading} = useMutation({
    meta: mutationEffects.reservation,
    mutationFn: addReservationAPI,
    onSuccess: (reservation: any) => {
      toast.show({
        placement: 'top',
        render: () => (
          <Toast
            message="Votre réservation a bien été enregistrée"
            status={Color.success}
          />
        ),
      });
      navigation.replace('ReservationSuccess', {reservation});
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Impossible de créer la réservation';
      toast.show({
        placement: 'top',
        render: () => <Toast message={message} status={Color.error} />,
      });
    },
  });

  const canSubmit = Boolean(
    selectedDate &&
      selectedTime &&
      guests >= 1 &&
      guests <= 20 &&
      !isLoading &&
      !isFetching &&
      !availabilityLoading,
  );

  const submit = () => {
    if (!selectedTime) {
      toast.show({
        placement: 'top',
        render: () => (
          <Toast
            message="Sélectionnez un créneau horaire"
            status={Color.error}
          />
        ),
      });
      return;
    }
    const moment = new Date(`${selectedDate}T${selectedTime}:00`);
    if (Number.isNaN(moment.getTime()) || moment.getTime() <= Date.now()) {
      toast.show({
        placement: 'top',
        render: () => (
          <Toast
            message="Choisissez une date et une heure futures"
            status={Color.error}
          />
        ),
      });
      return;
    }
    createReservation({
      idPlace: id,
      reservationDate: selectedDate,
      reservationTime: selectedTime,
      numberOfPersons: guests,
      message: note.trim() || undefined,
      seatingPreference,
      occasion: occasion || undefined,
      allergies: allergies
        .split(',')
        .map(value => value.trim())
        .filter(Boolean),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <LoadingSpinner visible={isLoading} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <NightArt />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retour"
              hitSlop={10}
              onPress={() => navigation.goBack()}
              style={({pressed}) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>
            <View style={styles.rule}>
              <View style={styles.ruleLine} />
              <Text style={styles.eyebrow}>NOUVELLE RÉSERVATION</Text>
            </View>
            <Text style={styles.title}>
              Réserver une table{placeName ? '\n' : ''}
              {placeName ? (
                <Text style={styles.titleAccent}>chez {placeName}</Text>
              ) : null}
            </Text>
            <Text style={styles.subtitle}>
              Quelques choix, et votre sortie est organisée.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepText}>1</Text>
              </View>
              <View>
                <Text style={styles.sectionTitle}>Nombre de personnes</Text>
                <Text style={styles.sectionHint}>
                  La disponibilité s’adapte à votre groupe
                </Text>
              </View>
            </View>
            <View style={styles.counterRow}>
              <Pressable
                disabled={guests <= 1}
                onPress={() => setGuests(value => Math.max(1, value - 1))}
                style={({pressed}) => [
                  styles.counterButton,
                  guests <= 1 && styles.counterDisabled,
                  pressed && styles.pressed,
                ]}>
                <Text style={styles.counterSymbol}>−</Text>
              </Pressable>
              <View style={styles.counterValue}>
                <Text style={styles.guestNumber}>{guests}</Text>
                <Text style={styles.guestLabel}>
                  {guests > 1 ? 'personnes' : 'personne'}
                </Text>
              </View>
              <Pressable
                disabled={guests >= 20}
                onPress={() => setGuests(value => Math.min(20, value + 1))}
                style={({pressed}) => [
                  styles.counterButton,
                  guests >= 20 && styles.counterDisabled,
                  pressed && styles.pressed,
                ]}>
                <Text style={styles.counterSymbol}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepText}>2</Text>
              </View>
              <View>
                <Text style={styles.sectionTitle}>Choisissez une date</Text>
                <Text style={styles.sectionHint}>Les 14 prochains jours</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateList}>
              {dates.map(date => {
                const active = selectedDate === date.value;
                return (
                  <Pressable
                    key={date.value}
                    onPress={() => {
                      setSelectedDate(date.value);
                      setSelectedTime(null);
                    }}
                    style={({pressed}) => [
                      styles.dateCard,
                      active && styles.dateCardActive,
                      pressed && styles.pressed,
                    ]}>
                    <Text
                      style={[styles.dateDay, active && styles.dateTextActive]}>
                      {date.day}
                    </Text>
                    <Text
                      style={[
                        styles.dateNumber,
                        active && styles.dateTextActive,
                      ]}>
                      {date.number}
                    </Text>
                    <Text
                      style={[
                        styles.dateMonth,
                        active && styles.dateTextActive,
                      ]}>
                      {date.month}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepText}>3</Text>
              </View>
              <View style={styles.headingCopy}>
                <Text style={styles.sectionTitle}>Sélectionnez l’heure</Text>
                <Text style={styles.sectionHint}>
                  {selectedTime
                    ? `Créneau choisi : ${selectedTime}`
                    : availability?.isClosed
                    ? availability.closureReason ||
                      'Établissement fermé ce jour'
                    : 'Disponibilités mises à jour en temps réel'}
                </Text>
              </View>
            </View>
            {availabilityLoading || isFetching ? (
              <View style={styles.slotLoading}>
                <ActivityIndicator color={night.violet} />
                <Text style={styles.slotLoadingText}>
                  Vérification des tables…
                </Text>
              </View>
            ) : slots.length ? (
              <>
                <View style={styles.timeGrid}>
                  {slots.map(slot => {
                    const active = selectedTime === slot.time;
                    const disabled = !slot.available;
                    return (
                      <Pressable
                        key={slot.time}
                        disabled={disabled}
                        onPress={() => setSelectedTime(slot.time)}
                        style={({pressed}) => [
                          styles.timeChip,
                          slot.status === 'LIMITED' && styles.timeChipLimited,
                          active && styles.timeChipActive,
                          disabled && styles.timeChipDisabled,
                          pressed && !disabled && styles.pressed,
                        ]}>
                        <Text
                          style={[
                            styles.timeText,
                            active && styles.timeTextActive,
                            disabled && styles.timeTextDisabled,
                          ]}>
                          {slot.time}
                        </Text>
                        {slot.status === 'LIMITED' && !active ? (
                          <Text style={styles.remainingText}>
                            {slot.remainingCapacity} places
                          </Text>
                        ) : null}
                        {slot.status === 'FULL' ? (
                          <Text style={styles.fullText}>Complet</Text>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.legend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, styles.legendAvailable]} />
                    <Text style={styles.legendText}>Disponible</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, styles.legendLimited]} />
                    <Text style={styles.legendText}>Presque complet</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, styles.legendFull]} />
                    <Text style={styles.legendText}>Complet</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.closedState}>
                <Text style={styles.closedIcon}>◷</Text>
                <Text style={styles.closedTitle}>Aucun créneau disponible</Text>
                <Text style={styles.closedText}>
                  {availability?.closureReason ||
                    'L’établissement est fermé ou complet pour cette date.'}
                </Text>
                <Pressable onPress={() => refetch()} style={styles.retryButton}>
                  <Text style={styles.retryText}>Actualiser</Text>
                </Pressable>
              </View>
            )}
          </View>

          <View style={styles.noteSection}>
            <Text style={styles.sectionTitle}>Votre expérience</Text>
            <Text style={styles.sectionHint}>
              Choisissez votre emplacement préféré
            </Text>
            <View style={styles.optionRow}>
              {[
                ['NO_PREFERENCE', 'Sans préférence'],
                ['INDOOR', 'Intérieur'],
                ['TERRACE', 'Terrasse'],
                ['NON_SMOKING', 'Non-fumeur'],
              ].map(([value, label]) => (
                <Pressable
                  key={value}
                  onPress={() => setSeatingPreference(value)}
                  style={[
                    styles.optionChip,
                    seatingPreference === value && styles.optionChipActive,
                  ]}>
                  <Text
                    style={[
                      styles.optionText,
                      seatingPreference === value && styles.optionTextActive,
                    ]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.sectionTitle, styles.fieldTitle]}>
              Occasion
            </Text>
            <View style={styles.optionRow}>
              {['Anniversaire', 'Rendez-vous', 'Famille', 'Business'].map(
                value => (
                  <Pressable
                    key={value}
                    onPress={() => setOccasion(occasion === value ? '' : value)}
                    style={[
                      styles.optionChip,
                      occasion === value && styles.optionChipActive,
                    ]}>
                    <Text
                      style={[
                        styles.optionText,
                        occasion === value && styles.optionTextActive,
                      ]}>
                      {value}
                    </Text>
                  </Pressable>
                ),
              )}
            </View>
            <Text style={[styles.sectionTitle, styles.fieldTitle]}>
              Allergies
            </Text>
            <TextInput
              value={allergies}
              onChangeText={setAllergies}
              placeholder="Ex. arachides, gluten (séparées par des virgules)"
              placeholderTextColor="#96909E"
              style={styles.singleInput}
            />
          </View>

          <View style={styles.noteSection}>
            <Text style={styles.sectionTitle}>Une demande particulière ?</Text>
            <Text style={styles.sectionHint}>
              Optionnel — allergie, occasion ou préférence de table
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              maxLength={500}
              multiline
              placeholder="Ajoutez un message pour l’établissement…"
              placeholderTextColor="#96909E"
              textAlignVertical="top"
              style={styles.noteInput}
            />
            <Text style={styles.noteCount}>{note.length}/500</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>Votre choix</Text>
            <Text style={styles.summaryValue}>
              {selectedTime
                ? `${selectedDate.slice(8, 10)}/${selectedDate.slice(
                    5,
                    7,
                  )} à ${selectedTime} · ${guests} pers.`
                : 'Sélectionnez une heure'}
            </Text>
          </View>
          <Pressable
            disabled={!canSubmit}
            onPress={submit}
            style={({pressed}) => [
              styles.submitButton,
              !canSubmit && styles.submitDisabled,
              pressed && canSubmit && styles.submitPressed,
            ]}>
            {isLoading ? (
              <ActivityIndicator color={night.ink} />
            ) : (
              <>
                <Text style={styles.submitText}>Réserver</Text>
                <View style={styles.submitArrow}>
                  <Text style={styles.submitArrowText}>→</Text>
                </View>
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const card = {
  backgroundColor: '#FFFFFF',
  borderRadius: 26,
  borderWidth: 1,
  borderColor: night.line,
} as const;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: night.page},
  screen: {flex: 1},
  content: {paddingHorizontal: 18, paddingTop: 12, paddingBottom: 200},
  header: {
    marginHorizontal: -18,
    marginTop: -12,
    marginBottom: 18,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    backgroundColor: night.deep,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  backIcon: {color: '#FFFFFF', fontSize: 33, lineHeight: 35, marginTop: -3},
  rule: {flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 24},
  ruleLine: {width: 24, height: 1, backgroundColor: night.gold},
  eyebrow: {
    color: night.gold,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
  },
  title: {
    fontFamily: fonts.display,
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 37,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginTop: 10,
  },
  titleAccent: {color: night.gold, fontStyle: 'italic'},
  subtitle: {color: '#BDB2CE', fontSize: 13, lineHeight: 19, marginTop: 8},
  section: {...card, paddingVertical: 18, marginBottom: 14},
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headingCopy: {flex: 1},
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: night.ink,
    borderWidth: 2,
    borderColor: night.gold,
    marginRight: 12,
  },
  stepText: {color: night.gold, fontSize: 12, fontWeight: '900'},
  sectionTitle: {
    fontFamily: fonts.display,
    color: night.text,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700',
  },
  sectionHint: {color: night.muted, fontSize: 11, lineHeight: 15, marginTop: 2},
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  counterButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: night.ink,
  },
  counterDisabled: {backgroundColor: '#D9D5E2'},
  counterSymbol: {
    color: night.gold,
    fontSize: 27,
    lineHeight: 30,
    fontWeight: '500',
  },
  counterValue: {
    flex: 1,
    height: 52,
    marginHorizontal: 10,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: night.page,
  },
  guestNumber: {
    fontFamily: fonts.display,
    color: night.text,
    fontSize: 20,
    lineHeight: 23,
    fontWeight: '700',
  },
  guestLabel: {color: night.muted, fontSize: 9, marginTop: 1},
  dateList: {paddingHorizontal: 16, paddingRight: 8},
  dateCard: {
    width: 64,
    height: 86,
    marginRight: 9,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: night.page,
    borderWidth: 1,
    borderColor: night.line,
  },
  dateCardActive: {backgroundColor: night.ink, borderColor: night.ink},
  dateDay: {
    color: night.muted,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  dateNumber: {
    fontFamily: fonts.display,
    color: night.text,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '700',
    marginTop: 2,
  },
  dateMonth: {
    color: night.muted,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateTextActive: {color: night.gold},
  timeGrid: {flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12},
  timeChip: {
    width: '23%',
    minHeight: 48,
    marginHorizontal: '1%',
    marginBottom: 9,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: night.page,
    borderWidth: 1,
    borderColor: night.line,
  },
  timeChipActive: {backgroundColor: night.ink, borderColor: night.ink},
  timeChipLimited: {backgroundColor: night.goldSoft, borderColor: '#F1C981'},
  timeChipDisabled: {backgroundColor: '#F3F2F4', opacity: 0.55},
  timeText: {color: night.text, fontSize: 12, fontWeight: '800'},
  timeTextActive: {color: night.gold},
  timeTextDisabled: {color: '#A7A2AB', textDecorationLine: 'line-through'},
  remainingText: {
    color: '#A46512',
    fontSize: 8,
    fontWeight: '800',
    marginTop: 2,
  },
  fullText: {color: '#9C969F', fontSize: 8, fontWeight: '700', marginTop: 2},
  slotLoading: {height: 105, alignItems: 'center', justifyContent: 'center'},
  slotLoadingText: {color: night.muted, fontSize: 11, marginTop: 9},
  closedState: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: night.page,
  },
  closedIcon: {color: night.violet, fontSize: 25},
  closedTitle: {
    fontFamily: fonts.display,
    color: night.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  closedText: {
    color: night.muted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 4,
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: night.violetSoft,
  },
  retryText: {color: night.violet, fontSize: 11, fontWeight: '800'},
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  legendDot: {width: 8, height: 8, borderRadius: 4, marginRight: 5},
  legendAvailable: {backgroundColor: night.page, borderWidth: 1, borderColor: night.line},
  legendLimited: {backgroundColor: night.goldSoft, borderWidth: 1, borderColor: '#F1C981'},
  legendFull: {backgroundColor: '#ECEAEC'},
  legendText: {color: night.muted, fontSize: 9, fontWeight: '600'},
  noteSection: {...card, padding: 17, marginBottom: 14},
  noteInput: {
    height: 92,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    borderRadius: 18,
    color: night.text,
    fontSize: 13,
    lineHeight: 19,
    backgroundColor: night.page,
    borderWidth: 1,
    borderColor: night.line,
  },
  noteCount: {
    color: night.muted,
    fontSize: 9,
    textAlign: 'right',
    marginTop: 5,
  },
  optionRow: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 10},
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: night.page,
    borderWidth: 1,
    borderColor: night.line,
    marginRight: 7,
    marginBottom: 7,
  },
  optionChipActive: {backgroundColor: night.violetSoft, borderColor: night.violet},
  optionText: {color: night.muted, fontSize: 11, fontWeight: '700'},
  optionTextActive: {color: night.violet},
  fieldTitle: {marginTop: 14},
  singleInput: {
    height: 50,
    marginTop: 9,
    paddingHorizontal: 14,
    borderRadius: 18,
    color: night.text,
    backgroundColor: night.page,
    borderWidth: 1,
    borderColor: night.line,
  },
  footer: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 94,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 20,
    paddingRight: 8,
    borderRadius: 32,
    backgroundColor: night.ink,
    elevation: 12,
    shadowColor: '#120C1E',
    shadowOpacity: 0.3,
    shadowRadius: 22,
    shadowOffset: {width: 0, height: 14},
  },
  summary: {flex: 1, paddingRight: 8},
  summaryLabel: {
    color: '#A99CC4',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  summaryValue: {
    fontFamily: fonts.display,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 3,
  },
  submitButton: {
    height: 52,
    paddingLeft: 20,
    paddingRight: 6,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: night.gold,
  },
  submitDisabled: {opacity: 0.45},
  submitPressed: {transform: [{scale: 0.97}]},
  submitText: {color: night.ink, fontSize: 14, fontWeight: '800'},
  submitArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: night.ink,
  },
  submitArrowText: {color: night.gold, fontSize: 16, fontWeight: '800'},
  pressed: {opacity: 0.82, transform: [{scale: 0.97}]},
});
