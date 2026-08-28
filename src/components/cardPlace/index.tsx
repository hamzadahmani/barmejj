import {useMutation} from '@tanstack/react-query';
import React, {useState} from 'react';
import {ActivityIndicator, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {Color} from '../../helpers/constatn';
import {isOpen} from '../../helpers/functions';
import {addFavoritesAPI, deleteFavoritesAPI} from '../../services/favorites';
import VectorIcon from '../vectorIcon';

const distanceLabel=(distance?:number|null)=>{
  if(distance==null||!Number.isFinite(distance)) return 'À proximité';
  if(distance<1) return `${Math.max(1,Math.round(distance*1000))} m`;
  return `${distance.toFixed(1)} km`;
};

export default function CardItem({imgUrl,navigation,placeName,subTitle,id,distance,horaire,featured,verified,rating,reviewCount,averagePrice,cuisineType,placeAdress}:any){
  const [favorite,setFavorite]=useState(false);
  const [favoriteBusy,setFavoriteBusy]=useState(false);
  const open=isOpen(horaire);
  const mutation=useMutation(async(next:boolean)=>next?addFavoritesAPI({idPlace:id}):deleteFavoritesAPI(String(id)),{
    onSuccess:(_:any,next:boolean)=>setFavorite(next),
    onSettled:()=>setFavoriteBusy(false),
  });
  const toggleFavorite=()=>{if(favoriteBusy)return;setFavoriteBusy(true);mutation.mutate(!favorite);};
  return <Pressable onPress={()=>navigation.navigate('Details',{id,distance})} style={({pressed})=>[s.card,pressed&&s.pressed]}>
    <View style={s.visual}>
      {imgUrl?<Image source={{uri:imgUrl}} style={s.image}/>:<View style={[s.image,s.fallback]}><VectorIcon name="utensils" size={34} color="#8A799E"/></View>}
      <View style={s.scrim}/>
      <View style={s.topRow}><View style={s.badge}><VectorIcon name={featured?'sparkles':'star'} size={13} color="#F4B45E"/><Text style={s.badgeText}>{featured?'SÉLECTION BARMEJ':verified?'VÉRIFIÉ':'À DÉCOUVRIR'}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={favorite?'Retirer des favoris':'Ajouter aux favoris'} onPress={event=>{event.stopPropagation();toggleFavorite();}} style={s.favorite}>{favoriteBusy?<ActivityIndicator size="small" color={Color.main}/>:<VectorIcon name="heart" size={21} color={favorite?'#D85770':'#4D3B80'} strokeWidth={favorite?2.5:1.9}/>}</Pressable></View>
      <View style={s.distance}><VectorIcon name="mapPin" size={13} color="#FFFFFF"/><Text style={s.distanceText}>{distanceLabel(distance)}</Text></View>
    </View>
    <View style={s.body}>
      <View style={s.titleRow}><View style={s.grow}><Text numberOfLines={1} style={s.title}>{placeName}</Text><Text numberOfLines={1} style={s.subtitle}>{subTitle||cuisineType||'Une adresse Barmej à découvrir'}</Text></View>{rating?<View style={s.rating}><VectorIcon name="star" size={13} color="#9A6821"/><Text style={s.ratingText}>{Number(rating).toFixed(1)}</Text></View>:null}</View>
      <View style={s.metaRow}><View style={[s.status,open?s.statusOpen:s.statusClosed]}><View style={[s.statusDot,open?s.dotOpen:s.dotClosed]}/><Text style={[s.statusText,open?s.textOpen:s.textClosed]}>{open?'Ouvert':'Fermé'}</Text></View><Text numberOfLines={1} style={s.hours}>{horaire||'Horaires à confirmer'}</Text>{averagePrice?<Text style={s.price}>· {averagePrice} TND/pers.</Text>:null}</View>
      <View style={s.divider}/>
      <View style={s.bottom}><View style={s.location}><VectorIcon name="mapPin" size={15} color="#766D7D"/><Text numberOfLines={1} style={s.locationText}>{placeAdress||`${reviewCount||0} avis vérifiés`}</Text></View><Pressable onPress={event=>{event.stopPropagation();navigation.navigate('Resevation',{id});}} style={({pressed})=>[s.reserve,pressed&&s.reservePressed]}><Text style={s.reserveText}>Réserver</Text><VectorIcon name="arrowRight" size={15} color="#FFFFFF"/></Pressable></View>
    </View>
  </Pressable>;
}

const s=StyleSheet.create({
  card:{marginHorizontal:18,borderRadius:27,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#E7E1EA',overflow:'hidden',shadowColor:'#24182F',shadowOpacity:.08,shadowRadius:15,shadowOffset:{width:0,height:7},elevation:3},pressed:{opacity:.94,transform:[{scale:.992}]},visual:{height:215,backgroundColor:'#EAE5ED'},image:{width:'100%',height:'100%'},fallback:{alignItems:'center',justifyContent:'center'},scrim:{position:'absolute',top:0,right:0,bottom:0,left:0,backgroundColor:'rgba(24,16,31,.1)'},topRow:{position:'absolute',top:13,left:13,right:13,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},badge:{height:32,borderRadius:12,backgroundColor:'rgba(31,23,41,.78)',paddingHorizontal:10,flexDirection:'row',alignItems:'center',gap:6},badgeText:{fontSize:8,fontWeight:'900',letterSpacing:.5,color:'#FFFFFF'},favorite:{width:42,height:42,borderRadius:15,backgroundColor:'rgba(255,255,255,.94)',alignItems:'center',justifyContent:'center'},distance:{position:'absolute',right:13,bottom:12,height:29,borderRadius:11,backgroundColor:'rgba(31,23,41,.72)',paddingHorizontal:9,flexDirection:'row',alignItems:'center',gap:4},distanceText:{fontSize:8,fontWeight:'900',color:'#FFFFFF'},body:{padding:16},titleRow:{flexDirection:'row',alignItems:'flex-start'},grow:{flex:1,paddingRight:10},title:{fontSize:20,fontWeight:'900',letterSpacing:-.4,color:'#21182E'},subtitle:{fontSize:10,color:'#85808B',marginTop:3},rating:{height:32,borderRadius:12,backgroundColor:'#FFF2DC',paddingHorizontal:9,flexDirection:'row',alignItems:'center',gap:4},ratingText:{fontSize:10,fontWeight:'900',color:'#8A5A16'},metaRow:{flexDirection:'row',alignItems:'center',marginTop:13},status:{height:25,borderRadius:9,paddingHorizontal:8,flexDirection:'row',alignItems:'center',gap:5},statusOpen:{backgroundColor:'#E5F6EC'},statusClosed:{backgroundColor:'#FDE8E8'},statusDot:{width:5,height:5,borderRadius:3},dotOpen:{backgroundColor:'#258B57'},dotClosed:{backgroundColor:'#CC4B4B'},statusText:{fontSize:8,fontWeight:'900'},textOpen:{color:'#23784E'},textClosed:{color:'#B33D3D'},hours:{fontSize:9,color:'#7D7683',marginLeft:8,maxWidth:105},price:{fontSize:8,fontWeight:'800',color:'#685887',marginLeft:4},divider:{height:1,backgroundColor:'#F0ECF2',marginVertical:14},bottom:{flexDirection:'row',alignItems:'center'},location:{flex:1,flexDirection:'row',alignItems:'center',gap:5,marginRight:9},locationText:{flex:1,fontSize:9,color:'#766D7D'},reserve:{height:44,borderRadius:15,backgroundColor:'#4D3B80',paddingHorizontal:15,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7},reservePressed:{opacity:.76},reserveText:{fontSize:10,fontWeight:'900',color:'#FFFFFF'},
});
