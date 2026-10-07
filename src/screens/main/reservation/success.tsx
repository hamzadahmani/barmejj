import React from 'react';
import {Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Color} from '../../../helpers/constatn';
import {fonts, night} from '../../../components/discovery/theme';

const statusLabels: Record<string, string> = {
  PENDING: 'EN ATTENTE', CONFIRMED: 'CONFIRMÉE', DECLINED: 'REFUSÉE',
  CANCELLED: 'ANNULÉE', COMPLETED: 'TERMINÉE', NO_SHOW: 'ABSENCE',
};

const Detail = ({label, value}: {label: string; value: string}) => (
  <View style={styles.detail}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>
);

export default function ReservationSuccess({route, navigation}: any) {
  const reservation = route.params?.reservation ?? {};
  const code = `BRM-${String(reservation.idReservation ?? '').padStart(6, '0')}`;
  const openBookings = () => navigation.getParent()?.navigate('Reservations');
  const addToCalendar = () => {
    if (!reservation.reservationDate || !reservation.reservationTime) return;
    const start = new Date(`${reservation.reservationDate}T${reservation.reservationTime}`);
    if (Number.isNaN(start.getTime())) return;
    const end = new Date(start.getTime() + 90 * 60 * 1000);
    const calendarDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Réservation · ${reservation.placeName ?? 'Barmej'}`,
      dates: `${calendarDate(start)}/${calendarDate(end)}`,
      details: `Réservation ${code} pour ${reservation.numberOfPersons ?? ''} personne(s).`,
      location: reservation.placeAddress ?? '',
    });
    Linking.openURL(`https://calendar.google.com/calendar/render?${params.toString()}`);
  };
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityLabel="Fermer" onPress={openBookings} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
        <View style={styles.hero}>
          <View style={styles.check}><Text style={styles.checkText}>✓</Text></View>
          <Text style={styles.eyebrow}>DEMANDE ENREGISTRÉE</Text>
          <Text style={styles.title}>Votre réservation est envoyée</Text>
          <Text style={styles.subtitle}>L’établissement doit encore confirmer votre table. Vous serez averti dès que son statut change.</Text>
          <View style={styles.status}><View style={styles.statusDot}/><Text style={styles.statusText}>{statusLabels[reservation.status] ?? reservation.status}</Text></View>
        </View>
        <View style={styles.ticket}>
          <View style={styles.ticketHeader}><View><Text style={styles.ticketLabel}>RÉSERVATION</Text><Text style={styles.place}>{reservation.placeName ?? 'Établissement'}</Text></View><Text style={styles.code}>{code}</Text></View>
          <View style={styles.divider}/>
          <View style={styles.grid}>
            <Detail label="Date" value={reservation.reservationDate ?? '—'} />
            <Detail label="Heure" value={(reservation.reservationTime ?? '—').slice(0, 5)} />
            <Detail label="Invités" value={`${reservation.numberOfPersons ?? '—'} personne${reservation.numberOfPersons > 1 ? 's' : ''}`} />
            <Detail label="Statut" value={statusLabels[reservation.status] ?? 'En attente'} />
          </View>
          {reservation.message ? <View style={styles.note}><Text style={styles.detailLabel}>NOTE</Text><Text style={styles.noteText}>{reservation.message}</Text></View> : null}
        </View>
        <Pressable onPress={() => navigation.navigate('ReservationTicket', {reservation})} style={({pressed}) => [styles.primary, pressed && styles.pressed]}><Text style={styles.primaryText}>Voir mon e-ticket</Text><Text style={styles.arrow}>›</Text></Pressable>
        <Pressable onPress={addToCalendar} style={styles.calendar}><Text style={styles.calendarText}>＋ Ajouter au calendrier</Text></Pressable>
        <Pressable onPress={openBookings} style={styles.secondary}><Text style={styles.secondaryText}>Voir mes réservations</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:night.page}, content:{padding:20,paddingBottom:110}, back:{width:44,height:44,borderRadius:22,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:Color.border,alignItems:'center',justifyContent:'center'},backText:{fontSize:34,lineHeight:36,color:Color.main,marginTop:-3},
  hero:{alignItems:'center',paddingHorizontal:10,paddingTop:20,paddingBottom:26},check:{width:86,height:86,borderRadius:43,backgroundColor:night.ink,borderWidth:3,borderColor:night.gold,alignItems:'center',justifyContent:'center',shadowColor:night.ink,shadowOpacity:.25,shadowRadius:18,shadowOffset:{width:0,height:9},elevation:7},checkText:{color:night.gold,fontSize:46,lineHeight:52,fontWeight:'700'},eyebrow:{marginTop:22,color:night.violet,fontSize:10,fontWeight:'900',letterSpacing:2},title:{marginTop:8,textAlign:'center',fontFamily:fonts.display,color:Color.text,fontSize:29,lineHeight:36,fontWeight:'700'},subtitle:{marginTop:10,textAlign:'center',color:Color.muted,fontSize:13,lineHeight:20,maxWidth:330},status:{marginTop:16,flexDirection:'row',alignItems:'center',backgroundColor:'#FFF5D9',paddingHorizontal:14,paddingVertical:9,borderRadius:18},statusDot:{width:7,height:7,borderRadius:4,backgroundColor:'#E6A72B',marginRight:7},statusText:{color:'#875F08',fontSize:10,fontWeight:'900',letterSpacing:.6},
  ticket:{backgroundColor:'#FFF',borderRadius:28,borderWidth:1,borderColor:Color.border,padding:20,shadowColor:'#251C40',shadowOpacity:.08,shadowRadius:14,shadowOffset:{width:0,height:7},elevation:3},ticketHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'},ticketLabel:{color:Color.muted,fontSize:9,fontWeight:'800',letterSpacing:1.2},place:{fontFamily:fonts.display,color:Color.text,fontSize:22,fontWeight:'700',marginTop:4,maxWidth:210},code:{color:Color.main,fontSize:11,fontWeight:'800',backgroundColor:Color.mainLight,paddingHorizontal:10,paddingVertical:7,borderRadius:12},divider:{height:1,backgroundColor:Color.border,marginVertical:18},grid:{flexDirection:'row',flexWrap:'wrap'},detail:{width:'50%',marginBottom:18},detailLabel:{color:Color.muted,fontSize:9,fontWeight:'800',letterSpacing:.8,textTransform:'uppercase'},detailValue:{color:Color.text,fontSize:14,fontWeight:'800',marginTop:4},note:{backgroundColor:'#F8F6FC',borderRadius:14,padding:12},noteText:{color:Color.text,fontSize:12,lineHeight:18,marginTop:4},
  primary:{height:58,borderRadius:29,backgroundColor:night.gold,marginTop:18,paddingHorizontal:20,flexDirection:'row',alignItems:'center',justifyContent:'center'},primaryText:{color:night.ink,fontSize:15,fontWeight:'900'},arrow:{position:'absolute',right:22,color:night.ink,fontSize:28},calendar:{height:52,borderRadius:26,borderWidth:1,borderColor:night.line,backgroundColor:'#FFF',marginTop:12,alignItems:'center',justifyContent:'center'},calendarText:{color:Color.main,fontSize:13,fontWeight:'900'},secondary:{height:48,alignItems:'center',justifyContent:'center'},secondaryText:{color:Color.main,fontSize:13,fontWeight:'800'},pressed:{opacity:.85,transform:[{scale:.985}]},
});
