import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StatusBar, StyleSheet, Text, View} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';

function BarmejMark(){
  return <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <Path d="M32 4C18.2 4 7 15.1 7 28.8 7 45.7 28.5 59 32 61c3.5-2 25-15.3 25-32.2C57 15.1 45.8 4 32 4Z" fill="#F4B45E"/>
    <Circle cx="32" cy="28" r="14" fill="#2B203E"/>
    <Path d="M25 20h8.6c5 0 8.3 2.2 8.3 6 0 2.3-1.2 4.1-3.3 5.1 2.8.8 4.4 2.8 4.4 5.6 0 4.5-3.7 7.3-9.5 7.3H25V20Zm8.1 9.1c2.1 0 3.4-.8 3.4-2.4 0-1.5-1.2-2.3-3.4-2.3h-2.7v4.7h2.7Zm.5 10.4c2.5 0 3.9-1 3.9-2.9 0-1.8-1.4-2.8-3.9-2.8h-3.2v5.7h3.2Z" fill="#FFFFFF"/>
  </Svg>;
}

export default function AnimatedSplash(){
  const markScale=useRef(new Animated.Value(.72)).current;
  const markOpacity=useRef(new Animated.Value(0)).current;
  const copyY=useRef(new Animated.Value(18)).current;
  const copyOpacity=useRef(new Animated.Value(0)).current;
  const line=useRef(new Animated.Value(0)).current;
  const pulse=useRef(new Animated.Value(0)).current;

  useEffect(()=>{
    Animated.sequence([
      Animated.parallel([
        Animated.timing(markOpacity,{toValue:1,duration:420,easing:Easing.out(Easing.cubic),useNativeDriver:true}),
        Animated.spring(markScale,{toValue:1,friction:6,tension:75,useNativeDriver:true}),
      ]),
      Animated.parallel([
        Animated.timing(copyOpacity,{toValue:1,duration:380,useNativeDriver:true}),
        Animated.timing(copyY,{toValue:0,duration:420,easing:Easing.out(Easing.cubic),useNativeDriver:true}),
      ]),
      Animated.timing(line,{toValue:1,duration:650,easing:Easing.inOut(Easing.cubic),useNativeDriver:true}),
    ]).start();
    const loop=Animated.loop(Animated.sequence([
      Animated.timing(pulse,{toValue:1,duration:1100,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
      Animated.timing(pulse,{toValue:0,duration:1100,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
    ]));
    loop.start();
    return()=>loop.stop();
  },[copyOpacity,copyY,line,markOpacity,markScale,pulse]);

  const pulseScale=pulse.interpolate({inputRange:[0,1],outputRange:[1,1.08]});
  const lineScale=line.interpolate({inputRange:[0,1],outputRange:[.05,1]});
  return <View style={s.screen}>
    <StatusBar barStyle="light-content"/>
    <View style={s.orbTop}/><View style={s.orbBottom}/><View style={s.dotOne}/><View style={s.dotTwo}/>
    <View style={s.center}>
      <Animated.View style={[s.halo,{transform:[{scale:pulseScale}]}]}/>
      <Animated.View style={[s.mark,{opacity:markOpacity,transform:[{scale:markScale}]}]}><BarmejMark/></Animated.View>
      <Animated.View style={{opacity:copyOpacity,transform:[{translateY:copyY}]}}>
        <Text style={s.brand}>barmej</Text>
        <Text style={s.tagline}>VOTRE PROCHAINE SORTIE COMMENCE ICI</Text>
      </Animated.View>
      <View style={s.track}><Animated.View style={[s.progress,{transform:[{scaleX:lineScale}]}]}/></View>
    </View>
    <Text style={s.footer}>DÉCOUVRIR · RÉSERVER · VIVRE</Text>
  </View>;
}

const s=StyleSheet.create({
  screen:{flex:1,backgroundColor:'#21172F',alignItems:'center',justifyContent:'center',overflow:'hidden'},center:{alignItems:'center',zIndex:2},orbTop:{position:'absolute',width:310,height:310,borderRadius:155,backgroundColor:'rgba(112,82,157,.22)',right:-120,top:-110},orbBottom:{position:'absolute',width:260,height:260,borderRadius:130,backgroundColor:'rgba(244,180,94,.11)',left:-135,bottom:-65},dotOne:{position:'absolute',width:9,height:9,borderRadius:5,backgroundColor:'#F4B45E',right:56,top:'30%'},dotTwo:{position:'absolute',width:5,height:5,borderRadius:3,backgroundColor:'#8B70B5',left:67,bottom:'29%'},halo:{position:'absolute',top:-18,width:100,height:100,borderRadius:34,backgroundColor:'rgba(244,180,94,.09)'},mark:{width:82,height:82,borderRadius:27,backgroundColor:'rgba(255,255,255,.07)',borderWidth:1,borderColor:'rgba(255,255,255,.11)',alignItems:'center',justifyContent:'center'},brand:{fontSize:43,lineHeight:51,fontWeight:'900',letterSpacing:-1.8,color:'#FFFFFF',textAlign:'center',marginTop:19},tagline:{fontSize:8,fontWeight:'900',letterSpacing:1.7,color:'#C9BED5',textAlign:'center',marginTop:5},track:{width:112,height:3,borderRadius:2,backgroundColor:'rgba(255,255,255,.12)',overflow:'hidden',marginTop:30},progress:{width:'100%',height:3,borderRadius:2,backgroundColor:'#F4B45E'},footer:{position:'absolute',bottom:40,fontSize:7,fontWeight:'800',letterSpacing:1.8,color:'#82758F'},
});
