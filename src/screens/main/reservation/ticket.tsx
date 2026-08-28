import React from 'react';
import {Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {API_URI} from '../../../config/api';
import {Color} from '../../../helpers/constatn';
import {useAuth} from '../../../routes/auth/authProvider';

const statusLabels: Record<string, string> = {PENDING:'En attente',CONFIRMED:'Confirmée',DECLINED:'Refusée',CANCELLED:'Annulée',COMPLETED:'Terminée',NO_SHOW:'Absence'};
const Detail = ({label,value}:{label:string;value:string}) => <View style={styles.detail}><Text style={styles.label}>{label}</Text><Text style={styles.value} numberOfLines={2}>{value}</Text></View>;

export default function ReservationTicket({route,navigation}:any) {
  const reservation = route.params?.reservation ?? {};
  const {userInfo} = useAuth();
  const verifyUrl = `${API_URI}/tickets/${reservation.ticketToken ?? ''}`;
  const code = `BRM-${String(reservation.idReservation ?? '').padStart(6,'0')}`;
  const customerName = `${userInfo?.firstName ?? ''} ${userInfo?.lastName ?? ''}`.trim() || 'Client Barmej';
  const openDirections = () => {
    const latitude = Number(reservation.latitude);
    const longitude = Number(reservation.longitude);
    const destination = Number.isFinite(latitude) && Number.isFinite(longitude) ? `${latitude},${longitude}` : encodeURIComponent(reservation.placeAddress ?? reservation.placeName ?? '');
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
  };
  return <SafeAreaView style={styles.safe}>
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Retour" onPress={() => navigation.goBack()} style={({pressed})=>[styles.back,pressed&&styles.pressed]}><Text style={styles.backText}>‹</Text></Pressable>
      <Text style={styles.headerTitle}>E-Ticket</Text><View style={styles.headerSpacer}/>
    </View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.ticket}>
        <View style={styles.qrSection}>
          <View style={styles.qrFrame}><QRCode value={verifyUrl} size={190} color="#111111" backgroundColor="#FFFFFF" quietZone={6}/></View>
          <Text style={styles.scanTitle}>Présentez ce QR code à l’établissement</Text>
          <Text style={styles.scanHint}>Le personnel peut le scanner pour vérifier votre réservation.</Text>
          <View style={styles.reference}><Text style={styles.referenceText}>{code}</Text></View>
        </View>
        <View style={styles.cutLine}><View style={styles.leftCut}/><View style={styles.dashes}/><View style={styles.rightCut}/></View>
        <View style={styles.information}>
          <Text style={styles.place}>{reservation.placeName ?? 'Établissement'}</Text>
          <Text style={styles.address}>{reservation.placeAddress ?? 'Adresse disponible dans la fiche'}</Text>
          <View style={styles.grid}>
            <Detail label="Nom" value={customerName}/><Detail label="Date" value={reservation.reservationDate ?? '—'}/>
            <Detail label="Heure" value={(reservation.reservationTime ?? '—').slice(0,5)}/><Detail label="Invités" value={`${reservation.numberOfPersons ?? '—'} personne${reservation.numberOfPersons > 1 ? 's' : ''}`}/>
            <Detail label="Statut" value={statusLabels[reservation.status] ?? '—'}/><Detail label="Référence" value={code}/>
          </View>
        </View>
      </View>
      <Pressable onPress={openDirections} style={({pressed})=>[styles.primary,pressed&&styles.pressed]}><Text style={styles.primaryText}>Itinéraire vers l’établissement</Text></Pressable>
      <Pressable onPress={() => navigation.getParent()?.navigate('Reservations')} style={styles.secondary}><Text style={styles.secondaryText}>Voir mes réservations</Text></Pressable>
    </ScrollView>
  </SafeAreaView>;
}

const styles=StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F8F8FA'},header:{height:66,paddingHorizontal:20,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},back:{width:42,height:42,borderRadius:21,backgroundColor:'#FFF',borderWidth:1,borderColor:'#ECEAF0',alignItems:'center',justifyContent:'center'},backText:{fontSize:32,lineHeight:34,color:Color.text,marginTop:-3},headerTitle:{color:Color.text,fontSize:17,fontWeight:'800'},headerSpacer:{width:42},content:{paddingHorizontal:16,paddingTop:8,paddingBottom:118},
  ticket:{backgroundColor:'#FFF',borderRadius:20,borderWidth:1,borderColor:'#EFEDF2',overflow:'hidden',shadowColor:'#211A37',shadowOpacity:.07,shadowRadius:20,shadowOffset:{width:0,height:9},elevation:3},qrSection:{alignItems:'center',paddingTop:30,paddingHorizontal:24,paddingBottom:25},qrFrame:{padding:8,backgroundColor:'#FFF'},scanTitle:{marginTop:16,color:Color.text,fontSize:13,fontWeight:'800',textAlign:'center'},scanHint:{marginTop:5,maxWidth:275,color:Color.muted,fontSize:10,lineHeight:15,textAlign:'center'},reference:{marginTop:13,paddingHorizontal:12,paddingVertical:6,borderRadius:12,backgroundColor:Color.mainLight},referenceText:{color:Color.main,fontSize:9,fontWeight:'900',letterSpacing:1},
  cutLine:{height:28,justifyContent:'center'},dashes:{height:1,marginHorizontal:22,borderTopWidth:1,borderStyle:'dashed',borderColor:'#D9D6DE'},leftCut:{position:'absolute',left:-15,width:30,height:30,borderRadius:15,backgroundColor:'#F8F8FA',borderRightWidth:1,borderColor:'#EFEDF2',zIndex:2},rightCut:{position:'absolute',right:-15,width:30,height:30,borderRadius:15,backgroundColor:'#F8F8FA',borderLeftWidth:1,borderColor:'#EFEDF2',zIndex:2},
  information:{paddingHorizontal:22,paddingTop:16,paddingBottom:12},place:{color:Color.text,fontSize:20,fontWeight:'900'},address:{color:Color.muted,fontSize:10,lineHeight:15,marginTop:4},grid:{flexDirection:'row',flexWrap:'wrap',marginTop:22},detail:{width:'50%',minHeight:58,paddingRight:12,marginBottom:9},label:{color:'#9995A0',fontSize:9,fontWeight:'600'},value:{color:Color.text,fontSize:12,lineHeight:17,fontWeight:'700',marginTop:5},
  primary:{height:56,borderRadius:28,backgroundColor:Color.main,marginTop:18,alignItems:'center',justifyContent:'center',shadowColor:Color.main,shadowOpacity:.2,shadowRadius:12,shadowOffset:{width:0,height:6},elevation:4},primaryText:{color:'#FFF',fontSize:13,fontWeight:'800'},secondary:{height:50,alignItems:'center',justifyContent:'center'},secondaryText:{color:Color.main,fontSize:12,fontWeight:'800'},pressed:{opacity:.84,transform:[{scale:.98}]},
});
