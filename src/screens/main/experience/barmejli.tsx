import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {fonts, night} from '../../../components/discovery/theme';
import request from '../../../services/request';

type Plan = {
  id: number;
  status: 'DRAFT' | 'SAVED';
  request: {city: string; budget: number; mood: string; groupType: string};
  weather: {summary: string; temperatureC: number; precipitationProbability: number; adverse: boolean; unavailable?: boolean};
  totals: {cost: number; durationMin: number; distanceKm: number};
  explanation?: {summary: string; assumptions: string[]; travelNote: string};
  steps: Array<{id: number; position: number; placeName: string; title: string; startsAt: string; endsAt: string; estimatedCost: number; travelMinutes: number; travelDistanceKm: number; travelMode: string; address?: string; reason?: string; menuSelection?: {items: Array<{name: string; priceMillimes: number; quantity: number}>; totalMillimes: number; validatedAt: string} | null}>;
};

const hour = (value: string) => new Date(value).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit', hour12: false});
const paths = {back:'M15 18l-6-6 6-6',arrow:'M5 12h14m-5-5 5 5-5 5',refresh:'M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12-1l2 6M4 12l2 6a7 7 0 0 0 12-1',pin:'M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6',bookmark:'M6 3h12v18l-6-4-6 4Z',clock:'M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',check:'m5 12 4 4L19 6',spark:'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z',walk:'M13 4a1.5 1.5 0 1 0 0 .1M10 21l2-6 3 3v3M9 12l2-4 3 2 3 1M11 8l-2 7'};
const Icon = ({name, color = '#514176', size = 20}: {name: keyof typeof paths; color?: string; size?: number}) => <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d={paths[name]} stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
type Mode = 'program' | 'single';
const suggestionsByMode: Record<Mode, string[]> = {
  program: ['Dîner romantique à La Marsa, 120 DT', 'Brunch entre amis au Lac, 80 DT', 'Soirée calme à Sidi Bou Saïd, 50 DT'],
  single: ['Resto calme à La Marsa, 60 DT', 'Café avec vue à Sidi Bou Saïd, 30 DT', 'نحب resto pas cher fi Tunis, 40 DT'],
};
const modes: Array<{key: Mode; label: string}> = [{key: 'program', label: 'Programme complet'}, {key: 'single', label: 'Juste une adresse'}];
// Majuscule initiale uniquement (l'ancien « capitalize » mettait une majuscule à chaque mot).
const sentence = (value: string) => value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
const arch = (x: number, w: number, top: number) => `M${x} 300 V${top + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${top + w / 2} V300`;
const duration = (minutes: number) => `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}`;

export default function BarmejliScreen({navigation, route}: any) {
  const [prompt, setPrompt] = useState(route?.params?.prompt || 'Sortie romantique à La Marsa samedi soir, budget 120 DT');
  useEffect(() => { if (typeof route?.params?.prompt === 'string') setPrompt(route.params.prompt); }, [route?.params?.prompt]);
  const [mode, setMode] = useState<Mode>(route?.params?.mode === 'single' ? 'single' : 'program');
  useEffect(() => { if (route?.params?.mode === 'single' || route?.params?.mode === 'program') setMode(route.params.mode); }, [route?.params?.mode]);
  const suggestions = suggestionsByMode[mode];
  const [plan, setPlan] = useState<Plan | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const action = async (key: string, work: () => Promise<any>, done: (value: any) => void) => {
    setBusy(key);
    setError(null);
    if (key === 'generate') setPlan(null);
    try { done(await work()); } catch (failure: any) {
      setError(failure?.response?.data?.message || 'Impossible de préparer cette sortie. Vérifiez votre connexion ou essayez un autre horaire ou budget.');
    }
    finally { setBusy(null); }
  };
  const generate = () => action('generate', async () => (await request.post('v1/barmejli/generate', mode === 'single' ? {prompt, stepCount: 1} : {prompt})).data, setPlan);
  const regenerate = () => plan && action('regenerate', async () => (await request.post(`v1/barmejli/${plan.id}/regenerate`)).data, setPlan);
  const replace = (position: number) => plan && action(`step-${position}`, async () => (await request.post(`v1/barmejli/${plan.id}/steps/${position}/replace`)).data, setPlan);
  const adapt = () => plan && action('weather', async () => (await request.post(`v1/barmejli/${plan.id}/adapt-weather`)).data, result => result.plan ? setPlan(result.plan) : result.unavailable ? Alert.alert('Météo indisponible', 'Impossible de vérifier la météo pour le moment. Réessayez plus tard.') : Alert.alert('Météo stable', 'Votre programme reste adapté.'));
  const save = () => plan && action('save', async () => (await request.patch(`v1/barmejli/${plan.id}/save`)).data, () => {setPlan({...plan, status: 'SAVED'}); Alert.alert('Programme sauvegardé');});

  // Ouvert directement (lien, ancien état de navigation) : rien à dépiler,
  // on revient alors à l'accueil Expérience.
  const goBack = () => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('ExperienceHome');
  const canGenerate = busy === null && prompt.trim().length >= 8;
  return <ScrollView style={s.screen} showsVerticalScrollIndicator={false} contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
    {/* Héros de nuit */}
    <View style={s.hero}>
      <Svg pointerEvents="none" width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMaxYMin slice" style={StyleSheet.absoluteFill}>
        <Path d={arch(250, 150, 30)} stroke={night.gold} strokeOpacity={0.12} strokeWidth={1.2} fill="none" />
        <Path d={arch(272, 106, 62)} stroke={night.gold} strokeOpacity={0.2} strokeWidth={1.2} fill="none" />
        <Path d={arch(294, 62, 94)} stroke={night.lilac} strokeOpacity={0.28} strokeWidth={1.2} fill="none" />
        <Path d="M325 74v10M320 79h10" stroke={night.gold} strokeOpacity={0.6} strokeWidth={1.4} strokeLinecap="round" />
      </Svg>
      <View style={s.topbar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Retour" onPress={goBack} style={({pressed}) => [s.back, pressed && s.pressed]}><Icon name="back" color={night.white} /></Pressable>
        <Text style={s.brand}>BARMEJLI</Text>
        <View style={s.topTag}><Icon name="spark" size={12} color={night.gold} /><Text style={s.topTagText}>VOTRE CONCIERGE</Text></View>
      </View>
      <View style={s.rule}><View style={s.ruleLine} /><Text style={s.eyebrowGold}>UNE ENVIE. TOUT UN PROGRAMME.</Text></View>
      <Text style={s.heroTitle}>La bonne sortie,<Text style={s.heroAccent}>{'\n'}sans tout organiser.</Text></Text>
      <Text style={s.heroText}>Une ambiance, un lieu, un budget. On s’occupe de la suite.</Text>
    </View>

    {/* Composeur flottant */}
    <View style={s.composer}>
      <View style={s.composerHead}>
        <View style={s.sparkBadge}><Icon name="spark" size={16} color={night.ink} /></View>
        <Text style={[s.label, s.grow]}>Qu’avez-vous en tête ?</Text>
        <Text style={s.counter}>{prompt.length}/500</Text>
      </View>
      <View accessibilityRole="tablist" style={s.modes}>
        {modes.map(item => <Pressable key={item.key} accessibilityRole="tab" accessibilityState={{selected: mode === item.key}} onPress={() => setMode(item.key)} style={[s.mode, mode === item.key && s.modeActive]}><Text style={[s.modeText, mode === item.key && s.modeTextActive]}>{item.label}</Text></Pressable>)}
      </View>
      <TextInput value={prompt} onChangeText={setPrompt} multiline maxLength={500} placeholder={mode === 'single' ? 'Resto calme pas cher à La Marsa, 50 DT' : 'Brunch entre amis au Lac dimanche, 80 DT'} placeholderTextColor={night.muted} style={s.input}/>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={s.chipsScroll} contentContainerStyle={s.chips}>
        {suggestions.map(idea => <Pressable key={idea} accessibilityRole="button" accessibilityLabel={`Idée : ${idea}`} onPress={() => setPrompt(idea)} style={({pressed}) => [s.chip, prompt === idea && s.chipActive, pressed && s.pressed]}><Text style={[s.chipText, prompt === idea && s.chipTextActive]}>{idea}</Text></Pressable>)}
      </ScrollView>
      <Pressable testID="barmejli-generate" accessibilityRole="button" disabled={!canGenerate} onPress={generate} style={({pressed}) => [s.primary, !canGenerate && s.disabled, pressed && s.pressed]}>
        {busy === 'generate' ? <ActivityIndicator color={night.gold}/> : <><Text style={s.primaryText}>{mode === 'single' ? (plan ? 'Trouver une autre adresse' : 'Trouver mon adresse') : plan ? 'Créer un nouveau programme' : 'Imaginer ma sortie'}</Text><View style={s.primaryArrow}><Icon name="arrow" color={night.ink} size={18} /></View></>}
      </Pressable>
    </View>

    {error ? <View accessibilityRole="alert" style={[s.card, s.errorCard]}><Text style={s.label}>Sortie non générée</Text><Text style={s.body}>{error}</Text><Text style={s.meta}>Modifiez votre demande ci-dessus puis réessayez.</Text></View> : null}

    {plan && <View style={s.plan}>
      {/* Mot du concierge */}
      {plan.explanation ? <View accessibilityRole="summary" style={s.note}>
        <View style={s.noteBar} />
        <View style={s.grow}>
          <Text style={s.eyebrow}>CE QUE J’AI PRÉPARÉ</Text>
          <Text style={s.noteText}>{plan.explanation.summary}</Text>
          {plan.explanation.assumptions.map((assumption, index) => <View key={index} style={s.bullet}><View style={s.bulletDot} /><Text style={s.meta}>{sentence(assumption)}</Text></View>)}
          <View style={s.bullet}><View style={s.bulletDot} /><Text style={s.meta}>{sentence(plan.explanation.travelNote)}</Text></View>
        </View>
      </View> : null}
      {plan.steps.length === 1 ? <Text style={s.meta}>Une sortie courte adaptée à votre budget et aux disponibilités.</Text> : null}

      {/* Résumé */}
      <View style={s.summary}>
        <View style={s.planHead}>
          <View style={s.grow}>
            <Text style={s.eyebrowGold}>{plan.steps.length === 1 ? 'VOTRE ADRESSE' : 'VOTRE ITINÉRAIRE'}</Text>
            <Text style={s.planTitle}>{plan.request.city}</Text>
            <View style={s.tags}><Text style={s.tag}>{sentence(plan.request.mood)}</Text><Text style={s.tag}>{sentence(plan.request.groupType)}</Text></View>
          </View>
          <View style={s.stepCount}><Text style={s.stepCountNumber}>{plan.steps.length}</Text><Text style={s.stepCountLabel}>{plan.steps.length === 1 ? 'ÉTAPE' : 'ÉTAPES'}</Text></View>
        </View>
        <View style={s.totals}>
          <View style={s.metric}><Text style={s.metricLabel}>ESTIMATION</Text><Text style={s.totalStrong}>~{plan.totals.cost} DT</Text></View>
          <View style={s.metricDivider} />
          <View style={s.metric}><Text style={s.metricLabel}>DURÉE</Text><Text style={s.totalStrong}>{duration(plan.totals.durationMin)}</Text></View>
          <View style={s.metricDivider} />
          <View style={s.metric}><Text style={s.metricLabel}>TRAJET</Text><Text style={s.totalStrong}>{plan.totals.distanceKm} km</Text></View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Vérifier la météo et adapter le programme" onPress={adapt} disabled={busy !== null} style={({pressed}) => [s.weather, pressed && s.pressed]}>
          <Text style={s.temperature}>{plan.weather.unavailable ? '–' : `${Math.round(plan.weather.temperatureC)}°`}</Text>
          <View style={s.grow}><Text style={s.weatherTitle}>{plan.weather.summary}</Text><Text style={s.weatherText}>{plan.weather.unavailable ? 'Prévisions non chargées · Réessayer' : `${plan.weather.precipitationProbability}% de pluie · Adapter la sortie`}</Text></View>
          {busy === 'weather' ? <ActivityIndicator color={night.gold} /> : <Icon name="refresh" size={18} color={night.gold}/>}
        </Pressable>
      </View>

      {/* Frise chronologique */}
      <View style={s.timeline}>
        {plan.steps.map((step, index) => <View key={step.id}>
          {index > 0 && <View style={s.travel}>
            <View style={s.rail} />
            <View style={s.travelChip}><Icon name={step.travelMode === 'walk' ? 'walk' : 'pin'} size={13} color={night.violet}/><Text style={s.travelText}>{step.travelMinutes} min {step.travelMode === 'walk' ? 'à pied' : 'de trajet'} · {step.travelDistanceKm.toFixed(1)} km</Text></View>
          </View>}
          <View style={s.stepRow}>
            <View style={s.node}><Text style={s.nodeText}>{String(index + 1).padStart(2, '0')}</Text></View>
            <View style={s.step}>
              <View style={s.stepTop}><Icon name="clock" size={14} color={night.violet}/><Text style={s.time}>{hour(step.startsAt)} – {hour(step.endsAt)}</Text></View>
              <Text style={s.place}>{step.placeName}</Text>
              {step.title && step.title !== step.placeName ? <Text style={s.stepTitle}>{step.title}</Text> : null}
              {step.reason ? <Text style={s.meta}>{sentence(step.reason)}</Text> : null}
              {step.menuSelection ? <View style={s.menu}><Text style={s.menuLabel}>VOTRE SÉLECTION AU MENU</Text>{step.menuSelection.items.map((item, itemIndex) => <Text key={itemIndex} style={s.menuItem}>{item.quantity} × {item.name} · {(item.priceMillimes * item.quantity / 1000).toFixed(3)} DT</Text>)}<Text style={s.menuTotal}>Total menu : {(step.menuSelection.totalMillimes / 1000).toFixed(3)} DT · Vérifié le {new Date(step.menuSelection.validatedAt).toLocaleDateString('fr-FR')}</Text><Text style={s.meta}>Prix indicatifs, hors extras. Budget de l’étape arrondi au dinar supérieur.</Text></View> : null}
              {step.address ? <View style={s.addressRow}><Icon name="pin" size={13} color={night.muted}/><Text style={s.address}>{step.address}</Text></View> : null}
              <View style={s.stepFooter}>
                <Text style={s.price}>{step.estimatedCost === 0 ? 'Gratuit' : `~${step.estimatedCost} DT`} <Text style={s.currency}>{step.estimatedCost === 0 ? 'hors extras' : '/ étape'}</Text></Text>
                <Pressable accessibilityRole="button" accessibilityLabel={`Changer ${step.placeName}`} onPress={() => replace(step.position)} disabled={busy !== null} style={({pressed}) => [s.changeButton, pressed && s.pressed]}>{busy === `step-${step.position}` ? <ActivityIndicator color={night.violet}/> : <><Icon name="refresh" size={15} color={night.violet}/><Text style={s.change}>Changer</Text></>}</Pressable>
              </View>
            </View>
          </View>
        </View>)}
      </View>

      <Text style={s.budgetNote}>Budget souhaité : {plan.request.budget} DT · Prix estimatifs. Transport, stationnement et consommations supplémentaires non inclus.</Text>
      <View style={s.actions}>
        <Pressable accessibilityRole="button" onPress={save} disabled={busy !== null || plan.status === 'SAVED'} style={({pressed}) => [s.saveButton, plan.status === 'SAVED' && s.saved, pressed && s.pressed]}>{busy === 'save' ? <ActivityIndicator color={night.ink}/> : <><Icon name={plan.status === 'SAVED' ? 'check' : 'bookmark'} color={plan.status === 'SAVED' ? night.white : night.ink} size={18}/><Text style={[s.saveText, plan.status === 'SAVED' && s.savedText]}>{plan.status === 'SAVED' ? 'Sauvegardé' : 'Sauvegarder'}</Text></>}</Pressable>
        <Pressable accessibilityRole="button" onPress={regenerate} disabled={busy !== null} style={({pressed}) => [s.secondary, pressed && s.pressed]}><Icon name="refresh" size={18} color={night.ink}/><Text style={s.secondaryText}>{busy === 'regenerate' ? 'Création…' : 'Autre idée'}</Text></Pressable>
      </View>
    </View>}
  </ScrollView>;
}

const glass = 'rgba(255,255,255,0.08)';
const glassLine = 'rgba(255,255,255,0.14)';
const s = StyleSheet.create({
  screen:{flex:1,backgroundColor:night.page}, page:{paddingBottom:150}, grow:{flex:1}, pressed:{opacity:.85,transform:[{scale:.98}]},
  hero:{backgroundColor:night.deep,paddingHorizontal:20,paddingTop:12,paddingBottom:70,borderBottomLeftRadius:36,borderBottomRightRadius:36,overflow:'hidden'},
  topbar:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:28},back:{width:42,height:42,borderRadius:21,backgroundColor:glass,borderWidth:1,borderColor:glassLine,alignItems:'center',justifyContent:'center'},brand:{flex:1,fontSize:12,fontWeight:'900',letterSpacing:3,color:night.white},
  topTag:{flexDirection:'row',alignItems:'center',gap:5,height:28,paddingHorizontal:10,borderRadius:14,backgroundColor:glass,borderWidth:1,borderColor:glassLine},topTagText:{fontSize:8,fontWeight:'800',letterSpacing:1.4,color:night.gold},
  rule:{flexDirection:'row',alignItems:'center',gap:10},ruleLine:{width:24,height:1,backgroundColor:night.gold},
  eyebrow:{fontSize:9,fontWeight:'800',letterSpacing:2,color:night.violet},eyebrowGold:{fontSize:9,fontWeight:'800',letterSpacing:2,color:night.gold},
  heroTitle:{fontFamily:fonts.display,fontSize:32,lineHeight:39,fontWeight:'700',letterSpacing:-.5,color:night.white,marginTop:12},heroAccent:{color:night.gold,fontStyle:'italic'},heroText:{fontSize:13,lineHeight:20,color:'#BDB2CE',marginTop:10,maxWidth:285},
  composer:{marginHorizontal:20,marginTop:-46,backgroundColor:night.white,borderRadius:28,padding:18,borderWidth:1,borderColor:night.line,elevation:8,shadowColor:'#1C1529',shadowOffset:{width:0,height:14},shadowOpacity:.12,shadowRadius:24},
  composerHead:{flexDirection:'row',alignItems:'center',gap:10},sparkBadge:{width:30,height:30,borderRadius:15,backgroundColor:night.gold,alignItems:'center',justifyContent:'center'},label:{fontSize:14,fontWeight:'800',color:night.text},counter:{fontSize:10,color:night.muted,fontVariant:['tabular-nums']},
  modes:{flexDirection:'row',gap:4,marginTop:14,padding:4,borderRadius:18,backgroundColor:night.page,borderWidth:1,borderColor:night.line},mode:{flex:1,height:36,borderRadius:14,alignItems:'center',justifyContent:'center'},modeActive:{backgroundColor:night.ink},modeText:{fontSize:12,fontWeight:'800',color:night.muted},modeTextActive:{color:night.white},
  input:{height:92,minHeight:92,maxHeight:92,flexGrow:0,paddingHorizontal:0,paddingVertical:14,color:night.text,fontSize:15,lineHeight:23,textAlignVertical:'top'},
  chipsScroll:{marginHorizontal:-18,marginBottom:14},chips:{gap:8,paddingHorizontal:18},chip:{height:32,paddingHorizontal:12,borderRadius:16,borderWidth:1,borderColor:night.line,backgroundColor:night.page,justifyContent:'center'},chipActive:{backgroundColor:night.violetSoft,borderColor:night.violet},chipText:{fontSize:11,fontWeight:'700',color:night.muted},chipTextActive:{color:night.violet},
  primary:{minHeight:56,paddingLeft:20,paddingRight:8,borderRadius:28,backgroundColor:night.ink,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},primaryText:{flexShrink:1,color:night.white,fontWeight:'800',fontSize:14},primaryArrow:{width:40,height:40,borderRadius:20,backgroundColor:night.gold,alignItems:'center',justifyContent:'center'},disabled:{opacity:.45},
  card:{marginHorizontal:20,marginTop:16,backgroundColor:night.white,borderRadius:24,padding:18,borderWidth:1,borderColor:night.line},errorCard:{borderColor:'#F3C6D3',backgroundColor:'#FFF7F9'},body:{fontSize:13,lineHeight:20,color:night.muted,marginTop:8},
  plan:{marginTop:28,paddingHorizontal:20},
  note:{flexDirection:'row',gap:14,padding:18,borderRadius:24,backgroundColor:night.white,borderWidth:1,borderColor:night.line},noteBar:{width:3,borderRadius:2,backgroundColor:night.gold},noteText:{fontFamily:fonts.display,fontSize:17,lineHeight:25,color:night.text,marginTop:8,marginBottom:6},
  bullet:{flexDirection:'row',alignItems:'flex-start',gap:8},bulletDot:{width:4,height:4,borderRadius:2,backgroundColor:night.lilac,marginTop:11},meta:{flex:1,fontSize:12,lineHeight:18,color:night.muted,marginTop:5},
  summary:{marginTop:22,padding:20,borderRadius:28,backgroundColor:night.deep},planHead:{flexDirection:'row',alignItems:'center',gap:15},
  planTitle:{fontFamily:fonts.display,fontSize:30,lineHeight:36,fontWeight:'700',color:night.white,marginTop:6},tags:{flexDirection:'row',gap:6,marginTop:8},tag:{fontSize:11,fontWeight:'700',color:night.lilac,paddingHorizontal:10,paddingVertical:4,borderRadius:10,backgroundColor:glass,overflow:'hidden'},
  stepCount:{width:64,height:70,borderRadius:20,backgroundColor:night.gold,alignItems:'center',justifyContent:'center'},stepCountNumber:{fontFamily:fonts.display,fontSize:26,fontWeight:'700',color:night.ink},stepCountLabel:{fontSize:7,fontWeight:'800',letterSpacing:1.2,color:night.ink},
  totals:{flexDirection:'row',marginTop:18,paddingVertical:16,borderTopWidth:1,borderBottomWidth:1,borderColor:glassLine},metric:{flex:1,alignItems:'center',paddingHorizontal:4},metricDivider:{width:1,backgroundColor:glassLine},metricLabel:{fontSize:8,fontWeight:'800',letterSpacing:1.4,color:'#A99CC4'},totalStrong:{fontFamily:fonts.display,fontSize:19,color:night.white,fontWeight:'700',marginTop:6},
  weather:{flexDirection:'row',alignItems:'center',gap:12,marginTop:14,padding:12,borderRadius:18,backgroundColor:glass,borderWidth:1,borderColor:glassLine},temperature:{fontFamily:fonts.display,fontSize:24,fontWeight:'700',color:night.gold},weatherTitle:{fontSize:12,fontWeight:'800',color:night.white},weatherText:{fontSize:10,color:'#A99CC4',marginTop:3},
  timeline:{marginTop:24},stepRow:{flexDirection:'row',gap:12},
  node:{width:34,height:34,borderRadius:17,backgroundColor:night.ink,borderWidth:2,borderColor:night.gold,alignItems:'center',justifyContent:'center',marginTop:16},nodeText:{fontSize:11,fontWeight:'900',color:night.gold,fontVariant:['tabular-nums']},
  step:{flex:1,backgroundColor:night.white,padding:18,borderRadius:24,borderWidth:1,borderColor:night.line},stepTop:{flexDirection:'row',alignItems:'center',gap:6,marginBottom:8},time:{fontSize:12,fontWeight:'800',color:night.violet,fontVariant:['tabular-nums']},
  place:{fontFamily:fonts.display,fontSize:21,lineHeight:26,fontWeight:'700',color:night.text},stepTitle:{fontSize:13,color:night.muted,marginTop:4,lineHeight:19},
  menu:{marginTop:12,padding:12,borderRadius:16,backgroundColor:night.goldSoft},menuLabel:{fontSize:8,fontWeight:'800',letterSpacing:1.4,color:'#B7741A',marginBottom:6},menuItem:{fontSize:13,lineHeight:20,color:night.text},menuTotal:{fontSize:12,fontWeight:'700',color:night.text,marginTop:6},
  addressRow:{flexDirection:'row',alignItems:'center',gap:6,marginTop:10},address:{flex:1,fontSize:11,lineHeight:17,color:night.muted},
  stepFooter:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10,marginTop:14,paddingTop:12,borderTopWidth:1,borderTopColor:night.line},price:{fontFamily:fonts.display,fontSize:18,fontWeight:'700',color:night.text},currency:{fontFamily:undefined,fontSize:10,fontWeight:'500',color:night.muted},
  changeButton:{minHeight:40,paddingHorizontal:14,borderRadius:20,backgroundColor:night.violetSoft,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6},change:{fontSize:11,fontWeight:'800',color:night.violet},
  travel:{height:46,flexDirection:'row',alignItems:'center',paddingLeft:46},rail:{position:'absolute',left:16,top:-16,bottom:-16,width:2,borderRadius:1,backgroundColor:'rgba(246,182,92,0.45)'},travelChip:{flexDirection:'row',alignItems:'center',gap:6,height:28,paddingHorizontal:12,borderRadius:14,backgroundColor:night.white,borderWidth:1,borderColor:night.line},travelText:{fontSize:11,fontWeight:'600',color:night.muted},
  budgetNote:{fontSize:10,lineHeight:15,color:night.muted,textAlign:'center',marginTop:20},
  actions:{flexDirection:'row',gap:10,marginTop:16},saveButton:{flex:1.2,minHeight:54,borderRadius:27,backgroundColor:night.gold,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8},saved:{backgroundColor:night.mint},saveText:{fontSize:13,fontWeight:'800',color:night.ink},savedText:{color:night.white},
  secondary:{flex:1,minHeight:54,borderRadius:27,backgroundColor:night.white,borderWidth:1,borderColor:night.line,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7},secondaryText:{fontSize:12,fontWeight:'800',color:night.ink},
});
