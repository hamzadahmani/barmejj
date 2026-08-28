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
import {addReservationAPI, AvailabilitySlot, getPlaceAvailability} from '../../../services/reservation';

const pad = (value: number) => String(value).padStart(2, '0');
const toLocalISO = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const buildDates = () => Array.from({length: 14}, (_, index) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + index);
  return {
    value: toLocalISO(date),
    day: index === 0 ? "Aujourd’hui" : date.toLocaleDateString('fr-FR', {weekday: 'short'}).replace('.', ''),
    number: date.getDate(),
    month: date.toLocaleDateString('fr-FR', {month: 'short'}).replace('.', ''),
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

  const {data: availability, isLoading: availabilityLoading, isFetching, refetch} = useQuery(
    ['placeAvailability', id, selectedDate, guests],
    () => getPlaceAvailability({placeId: Number(id), date: selectedDate, guests}),
    {keepPreviousData: true, staleTime: 15_000},
  );
  const slots: AvailabilitySlot[] = useMemo(() => availability?.slots ?? [], [availability?.slots]);

  useEffect(() => {
    if (selectedTime && !slots.some(slot => slot.time === selectedTime && slot.available)) setSelectedTime(null);
  }, [selectedTime, slots]);

  const {mutate: createReservation, isLoading} = useMutation(addReservationAPI, {
    onSuccess: (reservation: any) => {
      toast.show({placement: 'top', render: () => <Toast message="Votre réservation a bien été enregistrée" status={Color.success} />});
      navigation.replace('ReservationSuccess', {reservation});
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Impossible de créer la réservation';
      toast.show({placement: 'top', render: () => <Toast message={message} status={Color.error} />});
    },
  });

  const canSubmit = Boolean(selectedDate && selectedTime && guests >= 1 && guests <= 20 && !isLoading);

  const submit = () => {
    if (!selectedTime) {
      toast.show({placement: 'top', render: () => <Toast message="Sélectionnez un créneau horaire" status={Color.error} />});
      return;
    }
    const moment = new Date(`${selectedDate}T${selectedTime}:00`);
    if (Number.isNaN(moment.getTime()) || moment.getTime() <= Date.now()) {
      toast.show({placement: 'top', render: () => <Toast message="Choisissez une date et une heure futures" status={Color.error} />});
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
      allergies: allergies.split(',').map(value => value.trim()).filter(Boolean),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <LoadingSpinner visible={isLoading} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" accessibilityLabel="Retour" hitSlop={10} onPress={() => navigation.goBack()} style={({pressed}) => [styles.backButton, pressed && styles.pressed]}>
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>NOUVELLE RÉSERVATION</Text>
              <Text style={styles.title}>Réserver une table</Text>
              <Text style={styles.subtitle}>Quelques choix, et votre sortie est organisée.</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View style={styles.stepBadge}><Text style={styles.stepText}>1</Text></View>
              <View><Text style={styles.sectionTitle}>Nombre de personnes</Text><Text style={styles.sectionHint}>La disponibilité s’adapte à votre groupe</Text></View>
            </View>
            <View style={styles.counterRow}>
              <Pressable disabled={guests <= 1} onPress={() => setGuests(value => Math.max(1, value - 1))} style={({pressed}) => [styles.counterButton, guests <= 1 && styles.counterDisabled, pressed && styles.pressed]}><Text style={styles.counterSymbol}>−</Text></Pressable>
              <View style={styles.counterValue}><Text style={styles.guestNumber}>{guests}</Text><Text style={styles.guestLabel}>{guests > 1 ? 'personnes' : 'personne'}</Text></View>
              <Pressable disabled={guests >= 20} onPress={() => setGuests(value => Math.min(20, value + 1))} style={({pressed}) => [styles.counterButton, guests >= 20 && styles.counterDisabled, pressed && styles.pressed]}><Text style={styles.counterSymbol}>+</Text></Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View style={styles.stepBadge}><Text style={styles.stepText}>2</Text></View>
              <View><Text style={styles.sectionTitle}>Choisissez une date</Text><Text style={styles.sectionHint}>Les 14 prochains jours</Text></View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
              {dates.map(date => {
                const active = selectedDate === date.value;
                return <Pressable key={date.value} onPress={() => {setSelectedDate(date.value); setSelectedTime(null);}} style={({pressed}) => [styles.dateCard, active && styles.dateCardActive, pressed && styles.pressed]}>
                  <Text style={[styles.dateDay, active && styles.dateTextActive]}>{date.day}</Text>
                  <Text style={[styles.dateNumber, active && styles.dateTextActive]}>{date.number}</Text>
                  <Text style={[styles.dateMonth, active && styles.dateTextActive]}>{date.month}</Text>
                </Pressable>;
              })}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View style={styles.stepBadge}><Text style={styles.stepText}>3</Text></View>
              <View style={styles.headingCopy}><Text style={styles.sectionTitle}>Sélectionnez l’heure</Text><Text style={styles.sectionHint}>{selectedTime ? `Créneau choisi : ${selectedTime}` : availability?.isClosed ? availability.closureReason || 'Établissement fermé ce jour' : 'Disponibilités mises à jour en temps réel'}</Text></View>
            </View>
            {availabilityLoading || isFetching ? <View style={styles.slotLoading}><ActivityIndicator color={Color.main}/><Text style={styles.slotLoadingText}>Vérification des tables…</Text></View> : slots.length ? <>
              <View style={styles.timeGrid}>
                {slots.map(slot => {
                  const active = selectedTime === slot.time;
                  const disabled = !slot.available;
                  return <Pressable key={slot.time} disabled={disabled} onPress={() => setSelectedTime(slot.time)} style={({pressed}) => [styles.timeChip, slot.status === 'LIMITED' && styles.timeChipLimited, active && styles.timeChipActive, disabled && styles.timeChipDisabled, pressed && !disabled && styles.pressed]}>
                    <Text style={[styles.timeText, active && styles.timeTextActive, disabled && styles.timeTextDisabled]}>{slot.time}</Text>
                    {slot.status === 'LIMITED' && !active ? <Text style={styles.remainingText}>{slot.remainingCapacity} places</Text> : null}
                    {slot.status === 'FULL' ? <Text style={styles.fullText}>Complet</Text> : null}
                  </Pressable>;
                })}
              </View>
              <View style={styles.legend}><View style={styles.legendItem}><View style={[styles.legendDot, styles.legendAvailable]}/><Text style={styles.legendText}>Disponible</Text></View><View style={styles.legendItem}><View style={[styles.legendDot, styles.legendLimited]}/><Text style={styles.legendText}>Presque complet</Text></View><View style={styles.legendItem}><View style={[styles.legendDot, styles.legendFull]}/><Text style={styles.legendText}>Complet</Text></View></View>
            </> : <View style={styles.closedState}><Text style={styles.closedIcon}>◷</Text><Text style={styles.closedTitle}>Aucun créneau disponible</Text><Text style={styles.closedText}>{availability?.closureReason || 'L’établissement est fermé ou complet pour cette date.'}</Text><Pressable onPress={() => refetch()} style={styles.retryButton}><Text style={styles.retryText}>Actualiser</Text></Pressable></View>}
          </View>

          <View style={styles.noteSection}>
            <Text style={styles.sectionTitle}>Votre expérience</Text>
            <Text style={styles.sectionHint}>Choisissez votre emplacement préféré</Text>
            <View style={styles.optionRow}>
              {[['NO_PREFERENCE','Sans préférence'],['INDOOR','Intérieur'],['TERRACE','Terrasse'],['NON_SMOKING','Non-fumeur']].map(([value,label]) => <Pressable key={value} onPress={() => setSeatingPreference(value)} style={[styles.optionChip,seatingPreference===value&&styles.optionChipActive]}><Text style={[styles.optionText,seatingPreference===value&&styles.optionTextActive]}>{label}</Text></Pressable>)}
            </View>
            <Text style={[styles.sectionTitle, styles.fieldTitle]}>Occasion</Text>
            <View style={styles.optionRow}>{['Anniversaire','Rendez-vous','Famille','Business'].map(value => <Pressable key={value} onPress={() => setOccasion(occasion===value?'':value)} style={[styles.optionChip,occasion===value&&styles.optionChipActive]}><Text style={[styles.optionText,occasion===value&&styles.optionTextActive]}>{value}</Text></Pressable>)}</View>
            <Text style={[styles.sectionTitle, styles.fieldTitle]}>Allergies</Text>
            <TextInput value={allergies} onChangeText={setAllergies} placeholder="Ex. arachides, gluten (séparées par des virgules)" placeholderTextColor="#96909E" style={styles.singleInput}/>
          </View>

          <View style={styles.noteSection}>
            <Text style={styles.sectionTitle}>Une demande particulière ?</Text>
            <Text style={styles.sectionHint}>Optionnel — allergie, occasion ou préférence de table</Text>
            <TextInput value={note} onChangeText={setNote} maxLength={500} multiline placeholder="Ajoutez un message pour l’établissement…" placeholderTextColor="#96909E" textAlignVertical="top" style={styles.noteInput} />
            <Text style={styles.noteCount}>{note.length}/500</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>Votre choix</Text>
            <Text style={styles.summaryValue}>{selectedTime ? `${selectedDate.slice(8, 10)}/${selectedDate.slice(5, 7)} à ${selectedTime} · ${guests} pers.` : 'Sélectionnez une heure'}</Text>
          </View>
          <Pressable disabled={!canSubmit} onPress={submit} style={({pressed}) => [styles.submitButton, !canSubmit && styles.submitDisabled, pressed && canSubmit && styles.submitPressed]}>
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Continuer</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Color.background},
  screen: {flex: 1},
  content: {paddingHorizontal: 18, paddingTop: 14, paddingBottom: 190},
  header: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 22},
  backButton: {width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: Color.mainLight},
  backIcon: {color: Color.main, fontSize: 34, lineHeight: 36, marginTop: -3},
  headerCopy: {flex: 1, marginLeft: 14},
  eyebrow: {color: Color.main, fontSize: 9, fontWeight: '800', letterSpacing: 1.6},
  title: {color: Color.text, fontSize: 27, lineHeight: 33, fontWeight: '800', marginTop: 3},
  subtitle: {color: Color.muted, fontSize: 12, lineHeight: 18, marginTop: 4},
  section: {backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: Color.border, paddingVertical: 18, marginBottom: 14},
  sectionHeading: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 17},
  headingCopy: {flex: 1},
  stepBadge: {width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Color.mainLight, marginRight: 11},
  stepText: {color: Color.main, fontSize: 13, fontWeight: '800'},
  sectionTitle: {color: Color.text, fontSize: 16, lineHeight: 20, fontWeight: '800'},
  sectionHint: {color: Color.muted, fontSize: 11, lineHeight: 15, marginTop: 2},
  counterRow: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16},
  counterButton: {width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: Color.main},
  counterDisabled: {backgroundColor: '#D9D5E2'},
  counterSymbol: {color: '#FFFFFF', fontSize: 27, lineHeight: 30, fontWeight: '500'},
  counterValue: {flex: 1, height: 52, marginHorizontal: 10, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F7FA'},
  guestNumber: {color: Color.main, fontSize: 18, lineHeight: 20, fontWeight: '800'},
  guestLabel: {color: Color.muted, fontSize: 9, marginTop: 1},
  dateList: {paddingHorizontal: 16, paddingRight: 8},
  dateCard: {width: 66, height: 84, marginRight: 9, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F7FA', borderWidth: 1, borderColor: '#F1EFF4'},
  dateCardActive: {backgroundColor: Color.main, borderColor: Color.main},
  dateDay: {color: Color.muted, fontSize: 9, fontWeight: '700', textTransform: 'capitalize'},
  dateNumber: {color: Color.text, fontSize: 20, lineHeight: 23, fontWeight: '800', marginTop: 2},
  dateMonth: {color: Color.muted, fontSize: 9, fontWeight: '600', textTransform: 'capitalize'},
  dateTextActive: {color: '#FFFFFF'},
  timeGrid: {flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12},
  timeChip: {width: '23%', minHeight: 48, marginHorizontal: '1%', marginBottom: 9, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F7FA', borderWidth: 1, borderColor: '#F1EFF4'},
  timeChipActive: {backgroundColor: Color.main, borderColor: Color.main},
  timeChipLimited: {backgroundColor: '#FFF7EA', borderColor: '#F1C981'},
  timeChipDisabled: {backgroundColor: '#F3F2F4', opacity: 0.55},
  timeText: {color: Color.text, fontSize: 11, fontWeight: '700'},
  timeTextActive: {color: '#FFFFFF'},
  timeTextDisabled: {color: '#A7A2AB', textDecorationLine: 'line-through'},
  remainingText: {color: '#A46512', fontSize: 7, fontWeight: '800', marginTop: 2},
  fullText: {color: '#9C969F', fontSize: 7, fontWeight: '700', marginTop: 2},
  slotLoading: {height: 105, alignItems: 'center', justifyContent: 'center'},
  slotLoadingText: {color: Color.muted, fontSize: 11, marginTop: 9},
  closedState: {marginHorizontal: 16, padding: 20, borderRadius: 18, alignItems: 'center', backgroundColor: '#F8F7FA'},
  closedIcon: {color: Color.main, fontSize: 25},
  closedTitle: {color: Color.text, fontSize: 14, fontWeight: '800', marginTop: 6},
  closedText: {color: Color.muted, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 4},
  retryButton: {marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: Color.mainLight},
  retryText: {color: Color.main, fontSize: 11, fontWeight: '800'},
  legend: {flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 3},
  legendItem: {flexDirection: 'row', alignItems: 'center', marginRight: 12, marginTop: 4},
  legendDot: {width: 8, height: 8, borderRadius: 4, marginRight: 5},
  legendAvailable: {backgroundColor: '#E9F7EF'},
  legendLimited: {backgroundColor: '#FFF0D8'},
  legendFull: {backgroundColor: '#ECEAEC'},
  legendText: {color: Color.muted, fontSize: 8, fontWeight: '600'},
  noteSection: {backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: Color.border, padding: 17},
  noteInput: {height: 88, marginTop: 12, paddingHorizontal: 13, paddingTop: 12, borderRadius: 16, color: Color.text, fontSize: 13, lineHeight: 19, backgroundColor: '#F8F7FA', borderWidth: 1, borderColor: '#F1EFF4'},
  noteCount: {color: Color.muted, fontSize: 9, textAlign: 'right', marginTop: 5},
  optionRow: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 10},
  optionChip: {paddingHorizontal: 12, paddingVertical: 9, borderRadius: 14, backgroundColor: '#F8F7FA', borderWidth: 1, borderColor: '#F1EFF4', marginRight: 7, marginBottom: 7},
  optionChipActive: {backgroundColor: Color.main, borderColor: Color.main},
  optionText: {color: Color.muted, fontSize: 11, fontWeight: '700'},
  optionTextActive: {color: '#FFFFFF'},
  fieldTitle: {marginTop: 14},
  singleInput: {height: 50, marginTop: 9, paddingHorizontal: 13, borderRadius: 16, color: Color.text, backgroundColor: '#F8F7FA', borderWidth: 1, borderColor: '#F1EFF4'},
  footer: {position: 'absolute', left: 12, right: 12, bottom: 94, flexDirection: 'row', alignItems: 'center', padding: 10, paddingLeft: 14, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: Color.border, elevation: 10, shadowColor: '#251C40', shadowOpacity: 0.16, shadowRadius: 15, shadowOffset: {width: 0, height: 7}},
  summary: {flex: 1, paddingRight: 8},
  summaryLabel: {color: Color.muted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8},
  summaryValue: {color: Color.text, fontSize: 11, fontWeight: '800', marginTop: 2},
  submitButton: {width: 132, height: 50, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: Color.main},
  submitDisabled: {backgroundColor: '#D5D0E2'},
  submitPressed: {backgroundColor: '#352A61', transform: [{scale: 0.98}]},
  submitText: {color: '#FFFFFF', fontSize: 14, fontWeight: '800'},
  pressed: {opacity: 0.82, transform: [{scale: 0.97}]},
});
