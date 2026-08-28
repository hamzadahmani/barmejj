import {
  Box,
  Button,
  Flex,
  Image,
  Divider,
  Text,
  ScrollView,
  Pressable,
} from 'native-base';
import React, {useEffect, useState} from 'react';
import {Color, buildLink} from '../../../helpers/constatn';
import {TouchableOpacity, Linking, Platform, RefreshControl, Share, StyleSheet} from 'react-native';
import {
  StyledTitle,
} from './styles';
import ImageView from 'react-native-image-viewing';
import {useQuery} from '@tanstack/react-query';
import LoadingSpinner from '../../../components/Loader';
import {getPlaceByIdAPI} from '../../../services/place';
import Geolocation from '@react-native-community/geolocation';
import {haversine, isOpen} from '../../../helpers/functions';
import MapPlaceLocation from './mapLocation';
import ReportModal from '../../../components/reportModal';
import {getPlaceReviewsAPI} from '../../../services/community';
import Video from 'react-native-video';
import {getLoyaltyPlaceAPI} from '../../../services/loyalty';
import Svg, {Circle, Path} from 'react-native-svg';

type DetailIconName = 'back' | 'heart' | 'camera' | 'navigation' | 'phone' | 'share' | 'gift' | 'clock' | 'pin' | 'flag' | 'star' | 'hanger' | 'music' | 'mail';
const DetailIcon = ({name, size = 22, color = Color.main, filled = false}: {name: DetailIconName; size?: number; color?: string; filled?: boolean}) => {
  const common = {stroke: color, strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none'};
  return <Svg width={size} height={size} viewBox="0 0 24 24">
    {name === 'back' && <Path {...common} d="m15 18-6-6 6-6"/>}
    {name === 'heart' && <Path {...common} fill={filled ? color : 'none'} d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>}
    {name === 'camera' && <><Path {...common} d="M14.5 4H9.5L8 6H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3l-1.5-2Z"/><Circle {...common} cx="12" cy="12.5" r="3.5"/></>}
    {name === 'navigation' && <Path {...common} d="m3 11 18-8-8 18-2-8-8-2Z"/>}
    {name === 'phone' && <Path {...common} d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1Z"/>}
    {name === 'share' && <><Circle {...common} cx="18" cy="5" r="3"/><Circle {...common} cx="6" cy="12" r="3"/><Circle {...common} cx="18" cy="19" r="3"/><Path {...common} d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></>}
    {name === 'gift' && <><Path {...common} d="M20 12v9H4v-9M2 7h20v5H2zM12 7v14"/><Path {...common} d="M12 7H7.5a2.5 2.5 0 1 1 2.3-3.5L12 7Zm0 0h4.5a2.5 2.5 0 1 0-2.3-3.5L12 7Z"/></>}
    {name === 'clock' && <><Circle {...common} cx="12" cy="12" r="9"/><Path {...common} d="M12 7v5l3 2"/></>}
    {name === 'pin' && <><Path {...common} d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><Circle {...common} cx="12" cy="10" r="2.5"/></>}
    {name === 'flag' && <><Path {...common} d="M5 21V4M5 5h11l-2 4 2 4H5"/></>}
    {name === 'star' && <Path {...common} fill={filled ? color : 'none'} d="m12 2.7 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.3l6.2-.9L12 2.7Z"/>}
    {name === 'hanger' && <><Path {...common} d="M12 7V5.8a2.3 2.3 0 1 1 2.3-2.3"/><Path {...common} d="m3 19 8.1-7a1.4 1.4 0 0 1 1.8 0l8.1 7H3Z"/></>}
    {name === 'music' && <><Path {...common} d="M9 18V5l11-2v13"/><Circle {...common} cx="6" cy="18" r="3"/><Circle {...common} cx="17" cy="16" r="3"/></>}
    {name === 'mail' && <><Path {...common} d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><Path {...common} d="m22 7-10 6L2 7"/></>}
  </Svg>;
};

export default function PlaceDetails({navigation, route}: any) {
  const {id} = route.params;
  const [favorit, setFavorit] = useState(false);

  const [latitude, setLatitude] = useState<any>(null);
  const [longitude, setLongitude] = useState<any>(null);

  useEffect(() => {
    // Get the user's location when the component mounts
    getLocation();
  }, []);
  const getLocation = () => {
    // Check if geolocation is available on the device
    if (Geolocation) {
      // Get the current position
      Geolocation.getCurrentPosition(
        position => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        error => {
          console.log('Error getting location:', error);
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
      );
    } else {
      console.log('Geolocation is not available on this device.');
    }
  };
  const [visible, setIsVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const openMapDirection = () => {
    const destinationLatitude = data?.place?.latitude;
    const destinationLongitude = data?.place?.longitude;
    if (!destinationLatitude || !destinationLongitude) return;
    const url: any = Platform.select({
      ios: `comgooglemaps://?center=${destinationLatitude},${destinationLongitude}&q=${destinationLatitude},${destinationLongitude}&zoom=14&views=traffic`,
      android: `geo:0,0?q=${destinationLatitude},${destinationLongitude}(${encodeURIComponent(
        data?.place?.placeName ?? 'Établissement',
      )})`,
    });
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          const browser_url = `https://www.google.com/maps/search/?api=1&query=${destinationLatitude},${destinationLongitude}`;
          return Linking.openURL(browser_url);
        }
      })
      .catch(() => {
        if (Platform.OS === 'ios') {
          Linking.openURL(
            `maps://?q=${destinationLatitude},${destinationLongitude}`,
          );
        }
      });
  };

  const linkingMailTo = () =>
    Linking.openURL(`mailto:${data?.placeinfo?.placeMail}`);

  const {isLoading, isRefetching: placeRefreshing, data, refetch: refetchPlace} = useQuery(['getPlaceById', {id}], getPlaceByIdAPI, {
    onSuccess: response => {
      console.log('response123', response);
    },
  });
  const images = (data?.media ?? []).filter((item: any) => item.type !== 'VIDEO').map((item: any) => ({uri: item.secureUrl}));
  if (!images.length && data?.place?.image) images.push({uri: data.place.image});
  const presentationVideo = (data?.media ?? []).find((item: any) => item.type === 'VIDEO');
  const {data: reviewsData, isRefetching: reviewsRefreshing, refetch: refetchReviews} = useQuery(
    ['placeReviews', Number(id)],
    () => getPlaceReviewsAPI(Number(id)),
    {enabled: Boolean(id)},
  );
  const {data: loyaltyData, isRefetching: loyaltyRefreshing, refetch: refetchLoyalty} = useQuery(
    ['placeLoyalty', Number(id)],
    () => getLoyaltyPlaceAPI(Number(id)),
    {enabled: Boolean(id), retry: false},
  );
  const disatance = () => {
    return (
      data?.place?.latitude &&
      latitude &&
      haversine(
        data?.place?.latitude,
        data?.place?.longitude,
        latitude,
        longitude,
      )
    );
  };

  const shareContent = {
    title: data?.place?.placeName ?? 'Découverte Barmej',
    message: `Découvrez ${
      data?.place?.placeName ?? 'cet établissement'
    } sur Barmej.`,
  };

  const shareRestaurant = async () => {
    try {
      const url = await buildLink(`placeID=${id}`);
      await Share.share({
        title: shareContent.title,
        message: `${shareContent.message} ${url}`,
        url,
      });
    } catch (error: any) {
      console.error('Error sharing:', error?.message);
    }
  };

  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const handleReportSubmit = (reportText: string) => {
    // Handle the report submission logic (e.g., send it to a server)
    console.log('Report submitted:', reportText);
  };
  return (
    <Box flex={1} backgroundColor="#F7F7FB">
      <ScrollView
        paddingX={5}
        refreshControl={<RefreshControl refreshing={placeRefreshing || reviewsRefreshing || loyaltyRefreshing} onRefresh={() => {void Promise.all([refetchPlace(), refetchReviews(), refetchLoyalty()]);}} colors={[Color.main]} tintColor={Color.main}/>} 
        contentContainerStyle={{paddingBottom: 270}}
        backgroundColor={'#F7F7FB'}>
        {<LoadingSpinner visible={isLoading} />}

        <Box
          rounded={30}
          overflow="hidden"
          width={'100%'}
          bg="#171124"
          shadow={4}
          mt={3}>
          <Pressable
            position="absolute"
            top={3}
            left={3}
            zIndex={2}
            bg="rgba(24,17,36,0.70)"
            width={12}
            height={12}
            borderRadius={18}
            alignItems="center"
            justifyContent="center"
            onPress={() => navigation.goBack()}>
            <DetailIcon name="back" color="white" size={27}/>
          </Pressable>
          <Pressable
            position="absolute"
            top={3}
            right={3}
            zIndex={3}
            bg="rgba(24,17,36,0.70)"
            width={12}
            height={12}
            borderRadius={18}
            alignItems="center"
            justifyContent="center"
            onPress={() => setFavorit(!favorit)}
            accessibilityLabel={favorit ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
            <DetailIcon name="heart" color={favorit ? '#FF647C' : 'white'} filled={favorit} size={23}/>
          </Pressable>

          <Pressable
            onPress={() => {
              setSelectedImageIndex(0);
              setIsVisible(true);
            }}>
            <Image
              source={{uri: images[0]?.uri ?? data?.place?.image}}
              alt={data?.place?.placeName ?? 'Photo de l’établissement'}
              size="xl"
              resizeMode="cover"
              height={355}
              width={'100%'}
              rounded={0}
              zIndex={-1}
            />
          </Pressable>
          <Box position="absolute" left={0} right={0} bottom={0} height={190} bg="rgba(17,11,27,.72)" />
          <Box position="absolute" left={5} right={5} bottom={5}>
            <Flex direction="row" alignItems="center" mb={2}>
              <Box bg={isOpen(data?.placeinfo?.horaire) ? '#DDF7E8' : '#FFE3E3'} px={3} py={1.5} borderRadius={20}>
                <Text color={isOpen(data?.placeinfo?.horaire) ? '#147A45' : '#B32D2D'} fontSize={9} fontWeight={900}>{isOpen(data?.placeinfo?.horaire) ? '● OUVERT MAINTENANT' : '● FERMÉ ACTUELLEMENT'}</Text>
              </Box>
              {data?.place?.verified ? <Box bg="rgba(255,255,255,.17)" px={3} py={1.5} borderRadius={20} ml={2}><Text color="white" fontSize={9} fontWeight={900}>✓ VÉRIFIÉ</Text></Box> : null}
            </Flex>
            <Text color="white" fontSize={31} lineHeight={36} fontWeight={900} letterSpacing={-1}>{data?.place?.placeName ?? '-'}</Text>
            <Text color="#E6DFEE" fontSize={13} mt={1}>{data?.place?.subTitle ?? 'Une adresse à découvrir sur Barmej'}</Text>
            <Flex direction="row" alignItems="center" mt={3}>
              <Text color="#FFCA79" fontSize={13} fontWeight={900}>{data?.place?.rating ? `${Number(data.place.rating).toFixed(1)} ★` : 'Nouveau'}</Text>
              <Text color="#D9D0E3" fontSize={11} ml={2}>{data?.place?.reviewCount ? `${data.place.reviewCount} avis vérifiés` : 'sur Barmej'}</Text>
              {disatance() && Number(disatance()) < 500 ? <><Box width={1} height={1} borderRadius={3} bg="#BEB4C9" mx={3}/><Flex direction="row" alignItems="center"><DetailIcon name="pin" size={14} color="#D9D0E3"/><Text color="#D9D0E3" fontSize={11} ml={1}>{disatance()?.toFixed(1)} km</Text></Flex></> : null}
            </Flex>
          </Box>
        </Box>

        <Flex direction="row" mt={4} bg="white" borderRadius={23} borderWidth={1} borderColor="#E9E3EE" py={3} px={1} shadow={1}>
          {[{icon:'camera' as DetailIconName,label:'Photos',press:()=>{setSelectedImageIndex(0);setIsVisible(true)}},{icon:'navigation' as DetailIconName,label:'Itinéraire',press:openMapDirection},{icon:'phone' as DetailIconName,label:'Appeler',press:()=>data?.placeinfo?.placeTel&&Linking.openURL(`tel:${data.placeinfo.placeTel}`)},{icon:'share' as DetailIconName,label:'Partager',press:shareRestaurant}].map((action,index)=><Pressable key={action.label} accessibilityLabel={action.label} onPress={action.press} flex={1} minHeight={14} alignItems="center" justifyContent="center" borderRightWidth={index<3?1:0} borderRightColor="#EEE9F2"><Box width={10} height={10} borderRadius={14} bg={Color.mainLight} alignItems="center" justifyContent="center"><DetailIcon name={action.icon} size={19}/></Box><Text color={Color.text} fontSize={9} fontWeight={800} mt={1.5}>{action.label}</Text></Pressable>)}
        </Flex>

        {data?.placeinfo?.placeDescription ? <Box bg="white" borderRadius={24} p={5} mt={5} borderWidth={1} borderColor="#ECE7F0"><Text color="#9A6A20" fontSize={9} fontWeight={900} letterSpacing={1.4}>À PROPOS</Text><Text color={Color.text} fontSize={21} fontWeight={900} mt={2}>L’expérience {data?.place?.placeName}</Text><Text color={Color.muted} fontSize={13} lineHeight={21} mt={3}>{data.placeinfo.placeDescription}</Text><Flex direction="row" mt={4}><Box bg={Color.mainLight} px={3} py={2} borderRadius={13}><Text color={Color.main} fontSize={10} fontWeight={800}>◷ {data?.placeinfo?.horaire || 'Horaires à confirmer'}</Text></Box>{data?.place?.averagePrice ? <Box bg="#FFF2DF" px={3} py={2} borderRadius={13} ml={2}><Text color="#8A5815" fontSize={10} fontWeight={800}>≈ {data.place.averagePrice} DT / pers.</Text></Box> : null}</Flex></Box> : null}

        {loyaltyData?.rewards?.length ? <Box bg={Color.main} borderRadius={25} p={5} mt={5} overflow="hidden"><Box position="absolute" width={32} height={32} borderRadius={100} bg="rgba(255,255,255,.07)" right={-8} top={-10}/><Flex direction="row" justifyContent="space-between" alignItems="flex-start"><Box flex={1} pr={4}><Text color="#FFCA79" fontSize={9} fontWeight={900} letterSpacing={1.3}>FIDÉLITÉ {String(data?.place?.placeName || '').toUpperCase()}</Text><Text color="white" fontSize={21} fontWeight={900} mt={2}>{loyaltyData.balance} points disponibles</Text><Text color="#DDD5E9" fontSize={11} lineHeight={17} mt={1}>Gagnez +{loyaltyData.pointsPerVisit} points après chaque visite terminée.</Text></Box><Box width={12} height={12} borderRadius={18} bg="rgba(255,255,255,.14)" alignItems="center" justifyContent="center"><DetailIcon name="gift" size={21} color="#FFCA79"/></Box></Flex><ScrollView horizontal showsHorizontalScrollIndicator={false} mt={4}>{loyaltyData.rewards.slice(0,4).map((reward:any)=><Box key={reward.id} bg="rgba(255,255,255,.12)" borderRadius={16} p={3} mr={3} width={150}><Text color="white" fontSize={11} fontWeight={900} numberOfLines={2}>{reward.name}</Text><Text color="#FFCA79" fontSize={10} fontWeight={900} mt={2}>{reward.pointsCost} POINTS</Text></Box>)}</ScrollView></Box> : null}
        {images.length > 1 && (
          <Box mt={4}>
            <Flex direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Text color={Color.text} fontSize={17} fontWeight={900}>Galerie</Text>
              <Text color={Color.muted} fontSize={12}>{images.length} photos</Text>
            </Flex>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((image: {uri: string}, index: number) => (
                <Pressable
                  key={`${image.uri}-${index}`}
                  mr={3}
                  onPress={() => {
                    setSelectedImageIndex(index);
                    setIsVisible(true);
                  }}>
                  <Image
                    source={image}
                    alt={`Photo ${index + 1}`}
                    width={112}
                    height={82}
                    borderRadius={16}
                    resizeMode="cover"
                  />
                </Pressable>
              ))}
            </ScrollView>
          </Box>
        )}
        {presentationVideo && (
          <Box mt={5}>
            <Flex direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Text color={Color.text} fontSize={20} fontWeight={900}>Découvrez l’ambiance</Text>
                <Text color={Color.muted} fontSize={12} mt={1}>Présentation vidéo de l’établissement</Text>
              </Box>
              <Box bgColor={Color.mainLight} px={3} py={2} borderRadius={14}>
                <Text color={Color.main} fontSize={10} fontWeight={900}>▶ VIDÉO</Text>
              </Box>
            </Flex>
            <Pressable
              height={220}
              borderRadius={22}
              overflow="hidden"
              bg="black"
              onPress={() => setVideoPlaying(value => !value)}>
              <Video
                source={{uri: presentationVideo.secureUrl}}
                style={videoStyles.player}
                resizeMode="cover"
                controls={videoPlaying}
                paused={!videoPlaying}
                poster={presentationVideo.secureUrl.replace(/\.[^/.]+$/, '.jpg')}
                posterResizeMode="cover"
                onEnd={() => setVideoPlaying(false)}
              />
              {!videoPlaying && (
                <Box position="absolute" top={0} right={0} bottom={0} left={0} alignItems="center" justifyContent="center" bg="rgba(20,14,35,.2)">
                  <Box width={16} height={16} borderRadius={30} bg="rgba(255,255,255,.94)" alignItems="center" justifyContent="center">
                    <Text color={Color.main} fontSize={24} ml={1}>▶</Text>
                  </Box>
                </Box>
              )}
            </Pressable>
          </Box>
        )}
        <Box mt={5} mb={2}>
          <Text color={Color.text} fontSize={22} fontWeight={900}>Coordonnées</Text>
          <Text color={Color.muted} fontSize={11} mt={1}>Contactez l’établissement ou préparez votre trajet</Text>
          <Box bgColor="white" borderRadius={24} mt={3} px={3} borderWidth={1} borderColor="#E8E2ED">
            {[{icon:'phone' as DetailIconName,label:'Téléphone',value:data?.placeinfo?.placeTel,press:()=>data?.placeinfo?.placeTel&&Linking.openURL(`tel:${data.placeinfo.placeTel}`),iconBg:'#F0EAF9',iconColor:Color.main},{icon:'pin' as DetailIconName,label:'Adresse',value:data?.placeinfo?.placeAdress,press:openMapDirection,iconBg:'#FFF0DC',iconColor:'#A66A14'},{icon:'mail' as DetailIconName,label:'Email',value:data?.placeinfo?.placeMail,press:linkingMailTo,iconBg:'#E9F3FF',iconColor:'#3F65A8'}].filter(item=>item.value).map((item,index,array)=><React.Fragment key={item.label}><Pressable onPress={item.press} py={3.5} px={1} flexDirection="row" alignItems="center"><Box style={{width:42,height:42,flexShrink:0}} borderRadius={14} bg={item.iconBg} alignItems="center" justifyContent="center"><DetailIcon name={item.icon} size={20} color={item.iconColor}/></Box><Box flex={1} ml={3} mr={2}><Text color={Color.muted} fontSize={8} fontWeight={900} letterSpacing={1}>{item.label.toUpperCase()}</Text><Text color={Color.text} fontSize={12} lineHeight={18} fontWeight={800} mt={.5} numberOfLines={2}>{item.value}</Text></Box><Box style={{width:34,height:34,flexShrink:0}} borderRadius={12} bg="#F4F0F7" alignItems="center" justifyContent="center"><Text color={Color.main} fontSize={19} lineHeight={22}>›</Text></Box></Pressable>{index<array.length-1?<Divider ml={14}/>:null}</React.Fragment>)}
          </Box>
        </Box>
        {(data?.placeinfo?.placeOutfit || data?.placeinfo?.placeMusicStyle) ? <Box mt={5}>
          <Text color={Color.text} fontSize={22} fontWeight={900}>Informations pratiques</Text>
          <Text color={Color.muted} fontSize={11} mt={1}>Pour savoir à quoi vous attendre avant de sortir</Text>
          <Box bgColor="white" mt={3} borderRadius={24} p={4} borderWidth={1} borderColor="#E8E2ED">
            {data?.placeinfo?.placeOutfit ? <Flex direction="row" alignItems="flex-start"><Box width={12} height={12} borderRadius={16} bg="#F2ECFA" alignItems="center" justifyContent="center"><DetailIcon name="hanger" size={22}/></Box><Box flex={1} ml={3}><Text color={Color.muted} fontSize={9} fontWeight={900} letterSpacing={1}>TENUE CONSEILLÉE</Text><Flex direction="row" flexWrap="wrap" mt={2}>{data.placeinfo.placeOutfit.split(',').map((item:string,index:number)=><Box key={`${item}-${index}`} bg="#F4EFFA" borderRadius={12} px={3} py={2} mr={2} mb={2}><Text color={Color.main} fontSize={10} fontWeight={800}>{item.trim()}</Text></Box>)}</Flex></Box></Flex> : null}
            {data?.placeinfo?.placeOutfit && data?.placeinfo?.placeMusicStyle ? <Divider my={4}/> : null}
            {data?.placeinfo?.placeMusicStyle ? <Flex direction="row" alignItems="flex-start"><Box width={12} height={12} borderRadius={16} bg="#FFF2DF" alignItems="center" justifyContent="center"><DetailIcon name="music" size={22} color="#A66A14"/></Box><Box flex={1} ml={3}><Text color={Color.muted} fontSize={9} fontWeight={900} letterSpacing={1}>AMBIANCE MUSICALE</Text><Flex direction="row" flexWrap="wrap" mt={2}>{data.placeinfo.placeMusicStyle.split(',').map((item:string,index:number)=><Box key={`${item}-${index}`} bg="#FFF4E4" borderRadius={12} px={3} py={2} mr={2} mb={2}><Text color="#8D5A12" fontSize={10} fontWeight={800}>{item.trim()}</Text></Box>)}</Flex></Box></Flex> : null}
          </Box>
        </Box> : null}

        {(data?.events ?? []).length > 0 && (
          <Box mt={5}>
            <Flex direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Text color={Color.text} fontSize={22} fontWeight={900}>Événements</Text>
                <Text color={Color.muted} fontSize={12} mt={1}>Les temps forts de l’établissement</Text>
              </Box>
              <Box bgColor={Color.mainLight} px={3} py={2} borderRadius={14}>
                <Text color={Color.main} fontSize={11} fontWeight={800}>{data.events.length} À VENIR</Text>
              </Box>
            </Flex>
            {(data.events ?? []).map((event: any, index: number) => (
              <Box key={event.idEvent} bgColor={index === 0 ? Color.main : '#fff'} borderRadius={22} p={5} mb={3} shadow={1}>
                <Flex direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1} pr={3}>
                    <Text color={index === 0 ? '#FFCA79' : Color.main} fontSize={10} fontWeight={900} letterSpacing={1.3}>✦ ÉVÉNEMENT</Text>
                    <Text color={index === 0 ? '#fff' : Color.text} fontSize={20} fontWeight={900} mt={2}>{event.title}</Text>
                  </Box>
                  <Box width={42} height={42} borderRadius={15} bgColor={index === 0 ? 'rgba(255,255,255,.14)' : Color.mainLight} alignItems="center" justifyContent="center">
                    <DetailIcon name="gift" size={20} color={Color.main}/>
                  </Box>
                </Flex>
                <Text color={index === 0 ? '#E4DDF3' : Color.muted} mt={3} lineHeight={21}>{event.description}</Text>
                {(event.startDate || event.startTime) && (
                  <Box alignSelf="flex-start" bgColor={index === 0 ? 'rgba(255,255,255,.13)' : Color.mainLight} borderRadius={13} px={3} py={2} mt={4}>
                    <Text color={index === 0 ? '#fff' : Color.main} fontSize={11} fontWeight={800}>
                      ◷ {event.startDate ?? ''}{event.endDate ? ` → ${event.endDate}` : ''}{event.startTime ? ` · ${event.startTime}${event.endTime ? `–${event.endTime}` : ''}` : ''}
                    </Text>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}

        {data?.place.latitude && (
          <Box borderRadius={26} overflow="hidden" mt={5} borderWidth={1} borderColor="#E8E2ED">
            <MapPlaceLocation
              latitude={data?.place?.latitude}
              longitude={data?.place?.longitude}
              placeName={data?.place?.placeName ?? '-'}
            />
          </Box>
        )}
        <Box bgColor="#fff" mt={4} borderRadius={24} p={5} borderWidth={1} borderColor="#E8E2ED">
          <Flex direction="row" justifyContent="space-between" alignItems="center">
            <Flex direction="row" alignItems="center"><Box width={11} height={11} borderRadius={15} bg={Color.mainLight} alignItems="center" justifyContent="center"><DetailIcon name="clock" size={21}/></Box><Box ml={3}><Text color={Color.text} fontSize={16} fontWeight={900}>Horaires aujourd’hui</Text><Text color={Color.muted} fontSize={12} mt={1}>{data?.placeinfo?.horaire || 'À confirmer avec l’établissement'}</Text></Box></Flex>
            <Box bg={isOpen(data?.placeinfo?.horaire) ? '#E5F7ED' : '#FDE8E8'} px={3} py={2} borderRadius={13}><Text color={isOpen(data?.placeinfo?.horaire) ? '#177B48' : '#B23A3A'} fontSize={9} fontWeight={900}>{isOpen(data?.placeinfo?.horaire) ? 'OUVERT' : 'FERMÉ'}</Text></Box>
          </Flex>
          {(data?.placeinfo?.placeFavorableDay || data?.placeinfo?.placeFavorableHour) ? <><Divider my={4}/><Flex direction="row" alignItems="center"><Box width={11} height={11} borderRadius={15} bg="#FFF2DF" alignItems="center" justifyContent="center"><DetailIcon name="star" size={20} color="#A56A17"/></Box><Box ml={3}><Text color={Color.text} fontSize={14} fontWeight={900}>Meilleur moment pour venir</Text><Text color={Color.muted} fontSize={12} mt={1}>{[data?.placeinfo?.placeFavorableDay,data?.placeinfo?.placeFavorableHour].filter(Boolean).join(' · ')}</Text></Box></Flex></> : null}
        </Box>
        {data?.place?.reviewsEnabled !== false ? <Box bgColor="#fff" mt={4} borderRadius={24} p={5} borderWidth={1} borderColor="#E8E2ED">
          <Flex direction="row" justifyContent="space-between" alignItems="center">
            <Box><Text color={Color.text} fontSize={20} fontWeight={900}>Avis vérifiés</Text><Text color={Color.muted} fontSize={11} mt={1}>Après une réservation réellement terminée</Text></Box>
            <Box bg="#FFF2DF" px={3} py={2} borderRadius={14}><Flex direction="row" alignItems="center"><DetailIcon name="star" size={14} color="#A9690C" filled/><Text color="#A9690C" ml={1} fontWeight={900}>{reviewsData?.average ? Number(reviewsData.average).toFixed(1) : 'Nouveau'}</Text></Flex></Box>
          </Flex>
          {(reviewsData?.reviews ?? []).slice(0, 3).map((review: any) => (
            <Box key={review.idReview} mt={4} pt={4} borderTopWidth={1} borderTopColor={Color.border}>
              <Flex direction="row" justifyContent="space-between">
                <Text color={Color.text} fontWeight={800}>{review.userName ?? 'Client Barmej'}</Text>
                <Text color="#B36B00" fontWeight={800}>{review.overallRating} ★</Text>
              </Flex>
              {review.comment ? <Text color={Color.muted} mt={2} lineHeight={20}>{review.comment}</Text> : null}
              {review.response ? (
                <Box bgColor={Color.mainLight} borderRadius={14} p={3} mt={3}>
                  <Text color={Color.main} fontSize={11} fontWeight={800}>Réponse de l’établissement</Text>
                  <Text color={Color.text} fontSize={12} mt={1}>{review.response}</Text>
                </Box>
              ) : null}
            </Box>
          ))}
          {!reviewsData?.reviews?.length ? <Box bg="#F8F5FB" borderRadius={17} p={4} mt={4}><Text color={Color.text} fontWeight={800}>Soyez parmi les premiers</Text><Text color={Color.muted} fontSize={11} lineHeight={17} mt={1}>Après votre sortie, vous pourrez partager un avis certifié avec la communauté.</Text></Box> : null}
        </Box> : null}
        <Box bgColor="#fff" mt={4} borderRadius={24} px={4} borderWidth={1} borderColor="#E8E2ED">
          <Pressable onPress={()=>setFavorit(!favorit)} minHeight={16} flexDirection="row" alignItems="center"><Box width={10} height={10} borderRadius={14} bg="#FFF0F3" alignItems="center" justifyContent="center"><DetailIcon name="heart" size={19} color="#E14F69" filled={favorit}/></Box><Box ml={3} flex={1}><Text color={Color.text} fontSize={13} fontWeight={900}>{favorit ? 'Ajouté à vos favoris' : 'Ajouter aux favoris'}</Text><Text color={Color.muted} fontSize={10} mt={1}>Retrouvez cette adresse depuis l’accueil</Text></Box><Text color={Color.muted} fontSize={22}>›</Text></Pressable>
          <Divider/>
          <Pressable onPress={openModal} minHeight={16} flexDirection="row" alignItems="center"><Box width={10} height={10} borderRadius={14} bg="#F2EEF7" alignItems="center" justifyContent="center"><DetailIcon name="flag" size={19}/></Box><Box ml={3} flex={1}><Text color={Color.text} fontSize={13} fontWeight={900}>Signaler une information</Text><Text color={Color.muted} fontSize={10} mt={1}>Horaire, adresse ou contenu incorrect</Text></Box><Text color={Color.muted} fontSize={22}>›</Text></Pressable>
        </Box>
        <ImageView
          images={images}
          imageIndex={selectedImageIndex}
          visible={visible}
          onRequestClose={() => setIsVisible(false)}
        />
        <ReportModal
          isOpen={modalVisible}
          onClose={closeModal}
          onSubmit={handleReportSubmit}
          placeID={id}
        />
      </ScrollView>
      <Flex
        position="absolute"
        bottom={92}
        left={4}
        right={4}
        bg="white"
        borderTopWidth={1}
        borderTopColor="#ECEAF1"
        px={5}
        py={3}
        borderRadius={22}
        shadow={4}
        direction="row"
        alignItems="center"
        justifyContent="space-between">
        <Box width="42%">
          <Text color="#777382" fontSize="10">
            Prêt pour votre sortie ?
          </Text>
          <Text
            color="#19152A"
            fontSize="14"
            fontWeight="800"
            mt={1}
            numberOfLines={1}>
            {data?.place?.placeName ?? 'Établissement'}
          </Text>
        </Box>
        <Button
          width="54%"
          height={52}
          borderRadius={16}
          backgroundColor={Color.main}
          onPress={() =>
            navigation.navigate('Resevation', {id: data?.place?.idPlace})
          }>
          Voir les disponibilités
        </Button>
      </Flex>
    </Box>
  );
}

const videoStyles = StyleSheet.create({player: {width: '100%', height: '100%'}});
