import React,{useContext,useState} from 'react';
import {Box,Button,Flex,Input,Modal,Pressable,Text,useToast} from 'native-base';
import Svg,{Path} from 'react-native-svg';
import {useMutation} from '@tanstack/react-query';
import {Color} from '../../helpers/constatn';
import {reportAPI} from '../../services/report';
import {AuthContext} from '../../routes/auth/authProvider';
import Toast from '../toast';

const categories=['Horaire incorrect','Adresse incorrecte','Photos ou contenu','Autre problème'];
const FlagIcon=()=> <Svg width={23} height={23} viewBox="0 0 24 24" fill="none"><Path d="M5 21V4m0 1h11l-2 4 2 4H5" stroke={Color.main} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"/></Svg>;

const ReportModal=({isOpen,onClose,onSubmit,placeID}:any)=>{
 const {userInfo}=useContext(AuthContext)||{};const toast=useToast();
 const [category,setCategory]=useState(categories[0]);const [reportText,setReportText]=useState('');
 const {mutate:sendReport,isLoading}=useMutation((data:any)=>reportAPI(data),{
  onSuccess:()=>{onSubmit(reportText);setReportText('');setCategory(categories[0]);onClose();toast.show({placement:'top',render:()=> <Toast message="Merci, votre signalement a bien été envoyé" status="#168653"/>})},
  onError:()=>toast.show({placement:'top',render:()=> <Toast message="Envoi impossible. Veuillez réessayer." status="#C94747"/>}),
 });
 const close=()=>{if(!isLoading)onClose()};
 const submit=()=>{if(reportText.trim().length<10)return;sendReport({idUser:userInfo?.idUser,reportedId:placeID,note:`${category} — ${reportText.trim()}`})};
 const valid=reportText.trim().length>=10;
 return <Modal isOpen={isOpen} onClose={close} avoidKeyboard justifyContent="flex-end" safeAreaTop>
  <Modal.Content width="100%" maxWidth="100%" marginBottom={0} borderTopRadius={30} borderBottomRadius={0} px={5} pt={3} pb={7}>
   <Box width={12} height={1.5} borderRadius={5} bg="#D8D2DE" alignSelf="center" mb={5}/>
   <Flex direction="row" alignItems="center"><Box width={13} height={13} borderRadius={18} bg={Color.mainLight} alignItems="center" justifyContent="center"><FlagIcon/></Box><Box ml={3} flex={1}><Text color={Color.text} fontSize={21} fontWeight={900}>Signaler une information</Text><Text color={Color.muted} fontSize={11} mt={1}>Aidez-nous à garder Barmej fiable et à jour.</Text></Box><Pressable onPress={close} width={10} height={10} borderRadius={14} bg="#F2EEF5" alignItems="center" justifyContent="center"><Text color={Color.text} fontSize={20}>×</Text></Pressable></Flex>
   <Text color={Color.text} fontSize={10} fontWeight={900} letterSpacing={1} mt={6} mb={3}>QUEL EST LE PROBLÈME ?</Text>
   <Flex direction="row" flexWrap="wrap">{categories.map(item=><Pressable key={item} onPress={()=>setCategory(item)} bg={category===item?Color.main:Color.mainLight} borderRadius={14} px={3} py={2.5} mr={2} mb={2}><Text color={category===item?'white':Color.main} fontSize={10} fontWeight={800}>{item}</Text></Pressable>)}</Flex>
   <Text color={Color.text} fontSize={10} fontWeight={900} letterSpacing={1} mt={4}>VOTRE MESSAGE</Text>
   <Input mt={3} minHeight={32} borderRadius={18} borderWidth={1.5} borderColor="#E3DDE8" bg="#FAF9FC" px={4} py={4} value={reportText} onChangeText={setReportText} placeholder="Décrivez précisément l’information à corriger…" placeholderTextColor="#9B94A2" multiline textAlignVertical="top" fontSize={13} maxLength={500} _focus={{borderColor:Color.main,bg:'white'}}/>
   <Flex direction="row" justifyContent="space-between" mt={2}><Text color={valid?'#248153':Color.muted} fontSize={9}>{valid?'Message prêt à être envoyé':'10 caractères minimum'}</Text><Text color={Color.muted} fontSize={9}>{reportText.length}/500</Text></Flex>
   <Flex direction="row" mt={5}><Button flex={1} height={13} borderRadius={17} variant="ghost" bg="#F1EDF5" onPress={close} isDisabled={isLoading}><Text color={Color.text} fontWeight={800}>Annuler</Text></Button><Button flex={1.7} height={13} borderRadius={17} ml={3} bg={valid?Color.main:'#C8C1D0'} onPress={submit} isDisabled={!valid||isLoading} isLoading={isLoading} _pressed={{bg:'#35256A'}}><Text color="white" fontWeight={900}>Envoyer le signalement</Text></Button></Flex>
   <Text color={Color.muted} fontSize={9} lineHeight={14} textAlign="center" mt={4}>Votre signalement sera vérifié avant toute modification publique.</Text>
  </Modal.Content>
 </Modal>
};
export default ReportModal;
