import {interests} from '../../helpers/interests';
import React, {useState} from 'react';
import {ActivityIndicator, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View} from 'react-native';
import request from '../../services/request';
import VectorIcon from '../../components/vectorIcon';
import {useAuth} from '../../routes/auth/authProvider';



export default function InterestOnboardingScreen() {
  const {updateUserInfo} = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const toggle = (key: string) => setSelected(current => current.includes(key) ? current.filter(item => item !== key) : [...current, key]);
  const finish = async (skip = false) => {
    if (!skip && selected.length < 3) return;
    setLoading(true);
    try {
      const response = skip ? await request.post('/me/interests/skip') : await request.put('/me/interests', {interests: selected});
      updateUserInfo(response.data);
    } finally { setLoading(false); }
  };

  return <SafeAreaView style={s.safe}>
    <StatusBar barStyle="dark-content" />
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.top}><Text style={s.brand}>BARMEJ</Text><Pressable onPress={() => finish(true)} disabled={loading}><Text style={s.skip}>Plus tard</Text></Pressable></View>
      <View style={s.progress}><View style={s.progressActive} /></View>
      <Text style={s.kicker}>PERSONNALISEZ VOTRE EXPÉRIENCE</Text>
      <Text style={s.title}>Qu’est-ce qui vous fait sortir ?</Text>
      <Text style={s.subtitle}>Choisissez au moins 3 envies. Votre accueil et vos vidéos s’adapteront à vous.</Text>
      <View style={s.counter}><Text style={s.counterText}>{selected.length}/12 sélectionnés</Text></View>
      <View style={s.grid}>{interests.map(item => {
        const active = selected.includes(item.key);
        return <Pressable key={item.key} onPress={() => toggle(item.key)} style={[s.card, active && s.cardActive]}>
          <View style={[s.icon, active && s.iconActive]}><VectorIcon name={item.icon} size={23} color={active ? '#FFFFFF' : '#533C92'} /></View>
          <Text style={[s.label, active && s.labelActive]}>{item.label}</Text><Text style={[s.detail, active && s.detailActive]} numberOfLines={1}>{item.detail}</Text>
          <View style={[s.check, active && s.checkActive]}><Text style={[s.checkText, !active && s.checkTextInactive]}>{active ? '✓' : '+'}</Text></View>
        </Pressable>;
      })}</View>
    </ScrollView>
    <View style={s.footer}><Pressable disabled={selected.length < 3 || loading} onPress={() => finish()} style={[s.button, selected.length < 3 && s.buttonDisabled]}>
      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={s.buttonText}>{selected.length < 3 ? `Encore ${3 - selected.length} choix` : 'Créer mon expérience'}</Text>}
    </Pressable></View>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F8F6FC'},content:{padding:22,paddingBottom:118},top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},brand:{fontSize:13,fontWeight:'900',letterSpacing:2,color:'#4C378A'},skip:{fontSize:14,fontWeight:'700',color:'#726A80'},progress:{height:4,backgroundColor:'#E8E3F0',borderRadius:4,marginTop:22},progressActive:{width:'55%',height:4,borderRadius:4,backgroundColor:'#5B43A6'},kicker:{marginTop:27,fontSize:11,fontWeight:'800',letterSpacing:1.2,color:'#856CC7'},title:{marginTop:9,fontSize:31,lineHeight:37,fontWeight:'900',color:'#211A2F'},subtitle:{marginTop:10,fontSize:15,lineHeight:22,color:'#756E7F'},counter:{alignSelf:'flex-start',marginTop:18,paddingHorizontal:12,paddingVertical:7,borderRadius:20,backgroundColor:'#EEE8FA'},counterText:{fontSize:12,fontWeight:'800',color:'#533C92'},grid:{flexDirection:'row',flexWrap:'wrap',gap:12,marginTop:18},card:{width:'48%',minHeight:142,padding:15,borderRadius:22,borderWidth:1,borderColor:'#E8E3ED',backgroundColor:'#FFFFFF'},cardActive:{backgroundColor:'#F0EAFE',borderColor:'#7459C0',borderWidth:1.5},icon:{width:43,height:43,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:'#F0EBF9'},iconActive:{backgroundColor:'#5A419C'},label:{marginTop:13,fontSize:16,fontWeight:'800',color:'#26202F'},labelActive:{color:'#49327F'},detail:{marginTop:4,fontSize:11,color:'#8B8492'},detailActive:{color:'#6E5B98'},check:{position:'absolute',right:12,top:12,width:25,height:25,borderRadius:13,alignItems:'center',justifyContent:'center',backgroundColor:'#F3EFF7'},checkActive:{backgroundColor:'#5A419C'},checkText:{fontSize:16,fontWeight:'800',color:'#FFF'},checkTextInactive:{color:'#5A419C'},footer:{position:'absolute',left:0,right:0,bottom:0,paddingHorizontal:22,paddingTop:12,paddingBottom:18,backgroundColor:'#F8F6FC'},button:{height:58,borderRadius:19,alignItems:'center',justifyContent:'center',backgroundColor:'#523A91'},buttonDisabled:{backgroundColor:'#D6CFE3'},buttonText:{fontSize:16,fontWeight:'800',color:'#FFF'},
});
