import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useMutation, useQuery} from '@tanstack/react-query';
import NightArt from '../../../components/discovery/nightArt';
import {fonts, night} from '../../../components/discovery/theme';
import {mutationEffects, queryKeys} from '../../../query/keys';
import {getPlaceByIdAPI} from '../../../services/place';
import {
  createStayBooking,
  getStayAvailability,
  StayBooking,
} from '../../../services/stays';

const pad = (value: number) => String(value).padStart(2, '0');
const toISO = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const fromISO = (value: string) => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
};
const longDate = (value: string) =>
  fromISO(value).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

// 60 jours à partir de demain : on réserve une nuit au plus tôt pour ce soir via l'hôte.
const buildDays = () =>
  Array.from({length: 60}, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + index);
    return {
      value: toISO(date),
      day:
        index === 0
          ? 'Auj.'
          : date
              .toLocaleDateString('fr-FR', {weekday: 'short'})
              .replace('.', ''),
      number: date.getDate(),
      month: date
        .toLocaleDateString('fr-FR', {month: 'short'})
        .replace('.', ''),
    };
  });

function Counter({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.counter}>
      <View style={styles.grow}>
        <Text style={styles.counterLabel}>{label}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Retirer ${label.toLowerCase()}`}
        disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - 1))}
        style={({pressed}) => [
          styles.counterButton,
          value <= min && styles.disabled,
          pressed && styles.pressed,
        ]}>
        <Text style={styles.counterSymbol}>−</Text>
      </Pressable>
      <Text style={styles.counterValue}>{value}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ajouter ${label.toLowerCase()}`}
        disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + 1))}
        style={({pressed}) => [
          styles.counterButton,
          value >= max && styles.disabled,
          pressed && styles.pressed,
        ]}>
        <Text style={styles.counterSymbol}>+</Text>
      </Pressable>
    </View>
  );
}

export default function StayBookingScreen({route, navigation}: any) {
  const placeId = Number(route.params?.id);
  const days = useMemo(buildDays, []);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<StayBooking | null>(null);

  const {data: placeData} = useQuery({
    queryKey: [...queryKeys.getPlaceById, {id: placeId}],
    queryFn: getPlaceByIdAPI,
    staleTime: 60_000,
  });
  const placeName: string = placeData?.place?.placeName ?? 'la maison d’hôtes';
  const phone: string | undefined = placeData?.placeinfo?.placeTel;

  const ready = Boolean(checkIn && checkOut);
  const availability = useQuery({
    queryKey: [
      ...queryKeys.stayAvailability,
      placeId,
      checkIn,
      checkOut,
      guests,
      rooms,
    ],
    queryFn: () =>
      getStayAvailability({
        placeId,
        checkIn: checkIn!,
        checkOut: checkOut!,
        guests,
        rooms,
      }),
    enabled: ready,
    staleTime: 15_000,
    retry: false,
  });

  const mutation = useMutation({
    meta: mutationEffects.stays,
    mutationFn: createStayBooking,
    onSuccess: setBooking,
    onError: (failure: any) =>
      setError(
        failure?.response?.data?.message ||
          'La demande n’a pas pu être envoyée. Vérifiez votre connexion.',
      ),
  });

  // Premier toucher : arrivée. Second toucher après l'arrivée : départ.
  const pickDay = (value: string) => {
    setError(null);
    if (!checkIn || checkOut || value <= checkIn) {
      setCheckIn(value);
      setCheckOut(null);
      return;
    }
    setCheckOut(value);
  };

  const nights = availability.data?.nights;
  const full = availability.data?.available === false;
  const canSubmit = ready && !full && !mutation.isPending && !availability.isFetching;

  const submit = () => {
    if (!checkIn || !checkOut) return;
    setError(null);
    mutation.mutate({
      placeId,
      checkIn,
      checkOut,
      guests,
      rooms,
      message: message.trim() || undefined,
    });
  };

  if (booking) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.doneContent}>
        <View style={styles.check}>
          <Text style={styles.checkText}>✓</Text>
        </View>
        <Text style={styles.doneEyebrow}>DEMANDE ENVOYÉE</Text>
        <Text style={styles.doneTitle}>Votre séjour est demandé</Text>
        <Text style={styles.doneText}>
          {placeName} doit confirmer votre demande. Vous serez prévenu dès
          qu’elle change de statut.
        </Text>
        <View style={styles.ticket}>
          <Text style={styles.ticketPlace}>{booking.placeName ?? placeName}</Text>
          <View style={styles.ticketRow}>
            <View style={styles.grow}>
              <Text style={styles.ticketLabel}>ARRIVÉE</Text>
              <Text style={styles.ticketValue}>{longDate(booking.checkIn)}</Text>
            </View>
            <View style={styles.grow}>
              <Text style={styles.ticketLabel}>DÉPART</Text>
              <Text style={styles.ticketValue}>
                {longDate(booking.checkOut)}
              </Text>
            </View>
          </View>
          <View style={styles.ticketRow}>
            <View style={styles.grow}>
              <Text style={styles.ticketLabel}>SÉJOUR</Text>
              <Text style={styles.ticketValue}>
                {booking.nights} nuit{booking.nights > 1 ? 's' : ''} ·{' '}
                {booking.guests} voyageur{booking.guests > 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.grow}>
              <Text style={styles.ticketLabel}>ESTIMATION</Text>
              <Text style={styles.ticketValue}>
                {booking.estimate != null
                  ? `Dès ${booking.estimate} DT`
                  : 'Tarif auprès de l’hôte'}
              </Text>
            </View>
          </View>
        </View>
        {phone ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => Linking.openURL(`tel:${phone}`)}
            style={({pressed}) => [styles.primary, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>Appeler l’hôte</Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.secondary}>
          <Text style={styles.secondaryText}>Retour à la fiche</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <NightArt />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour"
            hitSlop={10}
            onPress={() => navigation.goBack()}
            style={({pressed}) => [styles.back, pressed && styles.pressed]}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <View style={styles.rule}>
            <View style={styles.ruleLine} />
            <Text style={styles.eyebrow}>SÉJOUR EN MAISON D’HÔTES</Text>
          </View>
          <Text style={styles.title}>
            Votre séjour{'\n'}
            <Text style={styles.titleAccent}>chez {placeName}</Text>
          </Text>
          <Text style={styles.subtitle}>
            Choisissez vos dates, l’hôte confirme votre demande.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.heading}>
            <View style={styles.step}>
              <Text style={styles.stepText}>1</Text>
            </View>
            <View style={styles.grow}>
              <Text style={styles.cardTitle}>Vos dates</Text>
              <Text style={styles.hint}>
                {!checkIn
                  ? 'Touchez votre jour d’arrivée'
                  : !checkOut
                  ? 'Touchez maintenant votre jour de départ'
                  : `${longDate(checkIn)} → ${longDate(checkOut)}`}
              </Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.days}>
            {days.map(day => {
              const edge = day.value === checkIn || day.value === checkOut;
              const inside =
                checkIn &&
                checkOut &&
                day.value > checkIn &&
                day.value < checkOut;
              return (
                <Pressable
                  key={day.value}
                  accessibilityRole="button"
                  accessibilityState={{selected: Boolean(edge)}}
                  accessibilityLabel={longDate(day.value)}
                  onPress={() => pickDay(day.value)}
                  style={({pressed}) => [
                    styles.day,
                    inside && styles.dayInside,
                    edge && styles.dayEdge,
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.dayName, edge && styles.dayTextEdge]}>
                    {day.day}
                  </Text>
                  <Text style={[styles.dayNumber, edge && styles.dayTextEdge]}>
                    {day.number}
                  </Text>
                  <Text style={[styles.dayName, edge && styles.dayTextEdge]}>
                    {day.month}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={[styles.card, styles.padded]}>
          <View style={[styles.heading, styles.flush]}>
            <View style={styles.step}>
              <Text style={styles.stepText}>2</Text>
            </View>
            <Text style={styles.cardTitle}>Voyageurs et chambres</Text>
          </View>
          <Counter
            label="Voyageurs"
            hint="Adultes et enfants"
            value={guests}
            min={1}
            max={30}
            onChange={setGuests}
          />
          <View style={styles.divider} />
          <Counter
            label="Chambres"
            hint="Selon la taille de votre groupe"
            value={rooms}
            min={1}
            max={10}
            onChange={setRooms}
          />
        </View>

        {ready ? (
          <View
            accessibilityLiveRegion="polite"
            style={[
              styles.card,
              styles.padded,
              full ? styles.fullCard : styles.okCard,
            ]}>
            {availability.isFetching ? (
              <View style={styles.row}>
                <ActivityIndicator color={night.violet} />
                <Text style={[styles.hint, styles.gap]}>
                  Vérification des disponibilités…
                </Text>
              </View>
            ) : availability.isError ? (
              <Text style={styles.statusText}>
                {(availability.error as any)?.response?.data?.message ||
                  'Disponibilités indisponibles pour le moment.'}
              </Text>
            ) : (
              <>
                <Text style={styles.statusTitle}>
                  {availability.data?.available === true
                    ? `Disponible · ${availability.data.roomsLeft} chambre${
                        (availability.data.roomsLeft ?? 0) > 1 ? 's' : ''
                      } libre${(availability.data.roomsLeft ?? 0) > 1 ? 's' : ''}`
                    : full
                    ? 'Complet pour ces dates'
                    : 'Sur demande'}
                </Text>
                <Text style={styles.statusText}>
                  {full
                    ? 'Essayez d’autres dates ou moins de chambres.'
                    : availability.data?.available == null
                    ? 'La maison n’a pas encore publié son calendrier : l’hôte confirmera votre demande.'
                    : 'Votre demande sera confirmée par l’hôte.'}
                </Text>
                {availability.data?.estimate != null ? (
                  <Text style={styles.estimate}>
                    Dès {availability.data.estimate} DT pour {nights} nuit
                    {(nights ?? 0) > 1 ? 's' : ''}
                  </Text>
                ) : null}
              </>
            )}
          </View>
        ) : null}

        <View style={[styles.card, styles.padded]}>
          <Text style={styles.cardTitle}>Un mot pour l’hôte ?</Text>
          <Text style={styles.hint}>
            Optionnel : heure d’arrivée, occasion, régime alimentaire…
          </Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            maxLength={500}
            multiline
            placeholder="Nous arriverons vers 18h…"
            placeholderTextColor="#96909E"
            textAlignVertical="top"
            style={styles.input}
          />
        </View>
        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.grow}>
          <Text style={styles.footerLabel}>VOTRE SÉJOUR</Text>
          <Text style={styles.footerValue} numberOfLines={1}>
            {checkIn && checkOut && nights
              ? `${nights} nuit${nights > 1 ? 's' : ''} · ${guests} voyageur${
                  guests > 1 ? 's' : ''
                }`
              : 'Choisissez vos dates'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{disabled: !canSubmit}}
          disabled={!canSubmit}
          onPress={submit}
          style={({pressed}) => [
            styles.submit,
            !canSubmit && styles.disabled,
            pressed && styles.pressed,
          ]}>
          {mutation.isPending ? (
            <ActivityIndicator color={night.ink} />
          ) : (
            <>
              <Text style={styles.submitText}>Demander</Text>
              <View style={styles.submitArrow}>
                <Text style={styles.submitArrowText}>→</Text>
              </View>
            </>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const card = {
  backgroundColor: '#FFFFFF',
  borderRadius: 26,
  borderWidth: 1,
  borderColor: night.line,
  marginBottom: 14,
} as const;

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: night.page},
  grow: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  gap: {marginLeft: 10, marginTop: 0},
  pressed: {opacity: 0.85, transform: [{scale: 0.97}]},
  disabled: {opacity: 0.4},
  content: {paddingHorizontal: 18, paddingBottom: 200},
  header: {
    marginHorizontal: -18,
    marginBottom: 18,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    backgroundColor: night.deep,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
  },
  back: {
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
  eyebrow: {color: night.gold, fontSize: 9, fontWeight: '800', letterSpacing: 2},
  title: {
    fontFamily: fonts.display,
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 37,
    fontWeight: '700',
    marginTop: 10,
  },
  titleAccent: {color: night.gold, fontStyle: 'italic'},
  subtitle: {color: '#BDB2CE', fontSize: 13, lineHeight: 19, marginTop: 8},
  card: {...card, paddingVertical: 18},
  padded: {paddingHorizontal: 16},
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  flush: {paddingHorizontal: 0},
  step: {
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
  cardTitle: {
    fontFamily: fonts.display,
    color: night.text,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700',
  },
  hint: {color: night.muted, fontSize: 11, lineHeight: 16, marginTop: 2},
  days: {paddingHorizontal: 16, gap: 8},
  day: {
    width: 60,
    height: 84,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: night.page,
    borderWidth: 1,
    borderColor: night.line,
  },
  dayInside: {backgroundColor: night.violetSoft, borderColor: night.violetSoft},
  dayEdge: {backgroundColor: night.ink, borderColor: night.ink},
  dayName: {
    color: night.muted,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  dayNumber: {
    fontFamily: fonts.display,
    color: night.text,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '700',
  },
  dayTextEdge: {color: night.gold},
  counter: {flexDirection: 'row', alignItems: 'center', paddingVertical: 4},
  counterLabel: {color: night.text, fontSize: 14, fontWeight: '800'},
  counterButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: night.ink,
  },
  counterSymbol: {color: night.gold, fontSize: 22, lineHeight: 26},
  counterValue: {
    width: 44,
    textAlign: 'center',
    fontFamily: fonts.display,
    color: night.text,
    fontSize: 20,
    fontWeight: '700',
  },
  divider: {height: 1, backgroundColor: night.line, marginVertical: 12},
  okCard: {backgroundColor: night.mintSoft, borderColor: night.mintSoft},
  fullCard: {backgroundColor: night.roseSoft, borderColor: night.roseSoft},
  statusTitle: {
    fontFamily: fonts.display,
    color: night.text,
    fontSize: 17,
    fontWeight: '700',
  },
  statusText: {color: night.muted, fontSize: 12, lineHeight: 18, marginTop: 4},
  estimate: {color: night.text, fontSize: 14, fontWeight: '800', marginTop: 10},
  input: {
    height: 96,
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
  error: {color: '#B42318', fontSize: 12, lineHeight: 18, marginTop: 4},
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
  footerLabel: {
    color: '#A99CC4',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  footerValue: {
    fontFamily: fonts.display,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 3,
  },
  submit: {
    height: 52,
    paddingLeft: 20,
    paddingRight: 6,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: night.gold,
  },
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
  doneContent: {padding: 22, paddingTop: 60, paddingBottom: 140, alignItems: 'center'},
  check: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: night.ink,
    borderWidth: 3,
    borderColor: night.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {color: night.gold, fontSize: 44, lineHeight: 50, fontWeight: '700'},
  doneEyebrow: {
    marginTop: 22,
    color: night.violet,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  doneTitle: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: fonts.display,
    color: night.text,
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '700',
  },
  doneText: {
    marginTop: 10,
    textAlign: 'center',
    color: night.muted,
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 330,
  },
  ticket: {
    alignSelf: 'stretch',
    marginTop: 24,
    padding: 20,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: night.line,
  },
  ticketPlace: {
    fontFamily: fonts.display,
    color: night.text,
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 6,
  },
  ticketRow: {flexDirection: 'row', marginTop: 12},
  ticketLabel: {color: night.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1},
  ticketValue: {color: night.text, fontSize: 13, fontWeight: '800', marginTop: 4},
  primary: {
    alignSelf: 'stretch',
    height: 56,
    borderRadius: 28,
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: night.gold,
  },
  primaryText: {color: night.ink, fontSize: 15, fontWeight: '900'},
  secondary: {height: 50, alignItems: 'center', justifyContent: 'center'},
  secondaryText: {color: night.violet, fontSize: 13, fontWeight: '800'},
});
