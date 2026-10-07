import {queryKeys, mutationEffects} from '../../../query/keys';
import Geolocation from '@react-native-community/geolocation';
import {useMutation, useQuery} from '@tanstack/react-query';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LoadingSpinner from '../../../components/Loader';
import {fonts, night} from '../../../components/discovery/theme';
import {haversine} from '../../../helpers/functions';
import {
  getAdminReservations,
  getAllReservationsByUser,
  updateReservationStatusAPI,
} from '../../../services/reservation';
import {
  cancelStayBooking,
  getMyStayBookings,
  StayBooking,
} from '../../../services/stays';
import {useFocusEffect} from '@react-navigation/native';
import {useAuth} from '../../../routes/auth/authProvider';

const statusList: Record<string, {label: string; tone: 'wait' | 'ok' | 'ko' | 'done'}> = {
  PENDING: {label: 'En attente', tone: 'wait'},
  PROPOSED: {label: 'Nouvelle proposition', tone: 'wait'},
  CONFIRMED: {label: 'Confirmée', tone: 'ok'},
  CANCELLED: {label: 'Annulée', tone: 'ko'},
  DECLINED: {label: 'Refusée', tone: 'ko'},
  COMPLETED: {label: 'Terminée', tone: 'done'},
  NO_SHOW: {label: 'Absence', tone: 'ko'},
};
const tones = StyleSheet.create({
  waitPill: {backgroundColor: 'rgba(246,182,92,0.22)', borderColor: 'rgba(246,182,92,0.5)'},
  okPill: {backgroundColor: 'rgba(91,224,196,0.18)', borderColor: 'rgba(91,224,196,0.5)'},
  koPill: {backgroundColor: 'rgba(255,143,143,0.18)', borderColor: 'rgba(255,143,143,0.5)'},
  donePill: {backgroundColor: 'rgba(201,184,255,0.18)', borderColor: 'rgba(201,184,255,0.5)'},
  waitInk: {color: '#F6B65C', backgroundColor: '#F6B65C'},
  okInk: {color: '#5BE0C4', backgroundColor: '#5BE0C4'},
  koInk: {color: '#FF8F8F', backgroundColor: '#FF8F8F'},
  doneInk: {color: '#C9B8FF', backgroundColor: '#C9B8FF'},
  waitText: {color: '#F6B65C'},
  okText: {color: '#5BE0C4'},
  koText: {color: '#FF8F8F'},
  doneText: {color: '#C9B8FF'},
});

const shortDate = (value: string) => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d, 12).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

function StatusPill({status}: {status?: string}) {
  if (!status) return null;
  const info = statusList[status] ?? {label: status, tone: 'done' as const};
  return (
    <View style={[styles.pill, tones[`${info.tone}Pill`]]}>
      <View style={[styles.pillDot, tones[`${info.tone}Ink`]]} />
      <Text style={[styles.pillText, tones[`${info.tone}Text`]]}>
        {info.label}
      </Text>
    </View>
  );
}

export default function MyReservation({navigation}: any) {
  const {userInfo} = useAuth();
  const isAdmin = userInfo?.userRole === 'admin';
  const [tab, setTab] = useState<'tables' | 'stays'>('tables');

  const {isLoading, isRefetching, data, refetch} = useQuery({
    queryKey: isAdmin ? queryKeys.adminReservations : queryKeys.reservations,
    queryFn: isAdmin ? getAdminReservations : getAllReservationsByUser,
  });
  const stays = useQuery({
    queryKey: queryKeys.myStays,
    queryFn: getMyStayBookings,
    enabled: !isAdmin,
  });
  const {mutate: updateStatus, isPending: statusLoading} = useMutation({
    meta: mutationEffects.reservation,
    mutationFn: updateReservationStatusAPI,
  });
  const cancelStay = useMutation({
    meta: mutationEffects.stays,
    mutationFn: cancelStayBooking,
    onError: () =>
      Alert.alert('Annulation impossible', 'Veuillez réessayer dans un instant.'),
  });
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const {refetch: refetchStays} = stays;
  useFocusEffect(
    useCallback(() => {
      refetch();
      if (!isAdmin) refetchStays();
    }, [refetch, refetchStays, isAdmin]),
  );

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      () => {
        // Position indisponible : les distances ne sont simplement pas affichées.
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  }, []);

  const distance = (el: any) =>
    el.latitude && latitude != null && longitude != null
      ? haversine(el.latitude, el.longitude, latitude, longitude)
      : null;

  const confirmCancel = (stay: StayBooking) =>
    Alert.alert(
      'Annuler ce séjour ?',
      `${stay.placeName ?? 'La maison d’hôtes'} sera prévenue.`,
      [
        {text: 'Garder', style: 'cancel'},
        {
          text: 'Annuler le séjour',
          style: 'destructive',
          onPress: () => cancelStay.mutate(stay.id),
        },
      ],
    );

  const renderTable = ({item}: any) => {
    const km = distance(item);
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Réservation chez ${item?.placeName ?? 'l’établissement'}`}
        onPress={() =>
          !isAdmin &&
          navigation.navigate('UpdateReservation', {id: item.idReservation})
        }
        style={({pressed}) => [styles.card, pressed && styles.pressed]}>
        {item?.image ? (
          <Image source={{uri: item.image}} style={StyleSheet.absoluteFill} />
        ) : null}
        <View style={styles.shade} />
        <View style={styles.cardTop}>
          <StatusPill status={item.status} />
          {km != null ? (
            <View style={styles.glass}>
              <Text style={styles.glassText}>{km.toFixed(0)} km</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.cardBottom}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item?.placeName}
          </Text>
          <Text style={styles.cardMeta} numberOfLines={1}>
            {[
              item?.reservationDate ? shortDate(String(item.reservationDate).slice(0, 10)) : null,
              item?.reservationTime ? String(item.reservationTime).slice(0, 5) : null,
              item?.numberOfPersons ? `${item.numberOfPersons} pers.` : null,
            ]
              .filter(Boolean)
              .join(' · ') || item?.subTitle}
          </Text>
        </View>
        {isAdmin ? (
          <View style={styles.adminRow}>
            <Pressable
              accessibilityRole="button"
              disabled={statusLoading}
              onPress={() =>
                updateStatus({id: item.idReservation, status: 'CONFIRMED'})
              }
              style={[styles.adminButton, styles.accept]}>
              <Text style={styles.adminAcceptText}>Accepter</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={statusLoading}
              onPress={() =>
                updateStatus({id: item.idReservation, status: 'DECLINED'})
              }
              style={[styles.adminButton, styles.decline]}>
              <Text style={styles.adminDeclineText}>Refuser</Text>
            </Pressable>
          </View>
        ) : null}
      </Pressable>
    );
  };

  const renderStay = ({item}: {item: StayBooking}) => {
    const active = ['PENDING', 'PROPOSED', 'CONFIRMED'].includes(item.status);
    return (
      <View style={styles.stay}>
        <View style={styles.stayVisual}>
          {item.placeImage ? (
            <Image source={{uri: item.placeImage}} style={StyleSheet.absoluteFill} />
          ) : null}
          <View style={styles.shade} />
          <View style={styles.cardTop}>
            <StatusPill status={item.status} />
            <View style={styles.glass}>
              <Text style={styles.glassText}>
                {item.nights} nuit{item.nights > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <View style={styles.cardBottom}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.placeName ?? 'Maison d’hôtes'}
            </Text>
            <Text style={styles.cardMeta} numberOfLines={1}>
              {item.placeAddress ?? 'Séjour en maison d’hôtes'}
            </Text>
          </View>
        </View>
        <View style={styles.stayBody}>
          <View style={styles.stayDates}>
            <View style={styles.grow}>
              <Text style={styles.label}>ARRIVÉE</Text>
              <Text style={styles.value}>{shortDate(item.checkIn)}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
            <View style={styles.grow}>
              <Text style={styles.label}>DÉPART</Text>
              <Text style={styles.value}>{shortDate(item.checkOut)}</Text>
            </View>
          </View>
          <Text style={styles.stayMeta}>
            {item.guests} voyageur{item.guests > 1 ? 's' : ''} · {item.rooms}{' '}
            chambre{item.rooms > 1 ? 's' : ''}
            {item.estimate != null ? ` · dès ${item.estimate} DT` : ''}
          </Text>
          {active ? (
            <View style={styles.stayActions}>
              {item.placePhone ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => Linking.openURL(`tel:${item.placePhone}`)}
                  style={({pressed}) => [styles.call, pressed && styles.pressed]}>
                  <Text style={styles.callText}>Appeler l’hôte</Text>
                </Pressable>
              ) : null}
              <Pressable
                accessibilityRole="button"
                disabled={cancelStay.isPending}
                onPress={() => confirmCancel(item)}
                style={({pressed}) => [styles.cancel, pressed && styles.pressed]}>
                <Text style={styles.cancelText}>Annuler</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  const showingStays = !isAdmin && tab === 'stays';
  const empty = (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>
        {showingStays ? 'Aucun séjour pour le moment' : 'Aucune réservation'}
      </Text>
      <Text style={styles.emptyText}>
        {showingStays
          ? 'Trouvez une maison d’hôtes depuis « Envie de… » sur Explorer.'
          : 'Vos tables réservées apparaîtront ici.'}
      </Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <LoadingSpinner
        visible={isLoading || statusLoading || cancelStay.isPending}
      />
      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          {isAdmin ? 'GESTION ÉTABLISSEMENT' : 'VOS SORTIES'}
        </Text>
        <Text style={styles.title}>
          {isAdmin ? 'Demandes de réservation' : 'Mes réservations'}
        </Text>
        <Text style={styles.subtitle}>
          {isAdmin
            ? 'Acceptez ou refusez les demandes en attente'
            : 'Vos tables et vos séjours, au même endroit'}
        </Text>
        {!isAdmin ? (
          <View style={styles.tabs} accessibilityRole="tablist">
            {(
              [
                ['tables', 'Tables', data?.length],
                ['stays', 'Séjours', stays.data?.length],
              ] as const
            ).map(([key, label, count]) => (
              <Pressable
                key={key}
                accessibilityRole="tab"
                accessibilityState={{selected: tab === key}}
                onPress={() => setTab(key)}
                style={[styles.tab, tab === key && styles.tabActive]}>
                <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>
                  {label}
                  {count ? ` · ${count}` : ''}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
      {showingStays ? (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={stays.isRefetching}
              onRefresh={() => {
                void stays.refetch();
              }}
              colors={[night.violet]}
              tintColor={night.violet}
            />
          }
          contentContainerStyle={styles.list}
          data={stays.data ?? []}
          renderItem={renderStay}
          keyExtractor={item => `stay-${item.id}`}
          ListEmptyComponent={stays.isLoading ? undefined : empty}
        />
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                void refetch();
              }}
              colors={[night.violet]}
              tintColor={night.violet}
            />
          }
          contentContainerStyle={styles.list}
          data={data ?? []}
          renderItem={renderTable}
          keyExtractor={item => String(item.idReservation)}
          ListEmptyComponent={isLoading ? undefined : empty}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: night.page},
  grow: {flex: 1},
  pressed: {opacity: 0.88, transform: [{scale: 0.985}]},
  header: {paddingHorizontal: 20, paddingTop: 26},
  eyebrow: {color: night.violet, fontSize: 10, fontWeight: '800', letterSpacing: 2},
  title: {
    fontFamily: fonts.display,
    color: night.text,
    fontSize: 30,
    lineHeight: 37,
    fontWeight: '700',
    marginTop: 6,
  },
  subtitle: {color: night.muted, fontSize: 13, lineHeight: 19, marginTop: 4},
  tabs: {
    flexDirection: 'row',
    marginTop: 18,
    padding: 4,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: night.line,
  },
  tab: {flex: 1, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center'},
  tabActive: {backgroundColor: night.ink},
  tabText: {color: night.muted, fontSize: 13, fontWeight: '800'},
  tabTextActive: {color: night.gold},
  list: {paddingTop: 18, paddingHorizontal: 20, paddingBottom: 120},
  card: {
    height: 210,
    marginBottom: 16,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: night.deep,
    justifyContent: 'space-between',
  },
  shade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(18,12,30,0.45)',
  },
  cardTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14},
  cardBottom: {padding: 18},
  cardTitle: {
    fontFamily: fonts.display,
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '700',
  },
  cardMeta: {color: '#E1DAEC', fontSize: 12, marginTop: 4, textTransform: 'capitalize'},
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    paddingHorizontal: 11,
    borderRadius: 14,
    borderWidth: 1,
  },
  pillDot: {width: 7, height: 7, borderRadius: 4, marginRight: 6},
  pillText: {fontSize: 11, fontWeight: '800'},
  glass: {
    height: 28,
    paddingHorizontal: 11,
    borderRadius: 14,
    justifyContent: 'center',
    backgroundColor: 'rgba(18,12,30,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  glassText: {color: '#FFFFFF', fontSize: 11, fontWeight: '800'},
  adminRow: {flexDirection: 'row', gap: 10, padding: 12, backgroundColor: '#FFFFFF'},
  adminButton: {flex: 1, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center'},
  accept: {backgroundColor: night.ink},
  decline: {backgroundColor: night.roseSoft},
  adminAcceptText: {color: night.gold, fontSize: 13, fontWeight: '800'},
  adminDeclineText: {color: '#B42318', fontSize: 13, fontWeight: '800'},
  stay: {
    marginBottom: 16,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: night.line,
  },
  stayVisual: {height: 170, backgroundColor: night.deep, justifyContent: 'space-between'},
  stayBody: {padding: 18},
  stayDates: {flexDirection: 'row', alignItems: 'center'},
  label: {color: night.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.2},
  value: {
    fontFamily: fonts.display,
    color: night.text,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 3,
    textTransform: 'capitalize',
  },
  arrow: {color: night.gold, fontSize: 20, marginHorizontal: 12},
  stayMeta: {color: night.muted, fontSize: 12, marginTop: 12},
  stayActions: {flexDirection: 'row', gap: 10, marginTop: 16},
  call: {flex: 1.3, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: night.gold},
  callText: {color: night.ink, fontSize: 13, fontWeight: '800'},
  cancel: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: night.line,
  },
  cancelText: {color: '#B42318', fontSize: 13, fontWeight: '800'},
  empty: {alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24},
  emptyTitle: {fontFamily: fonts.display, color: night.text, fontSize: 19, fontWeight: '700'},
  emptyText: {color: night.muted, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 6},
});
