import {
  Box,
  Button,
  FavouriteIcon,
  Flex,
  Image,
  Divider,
  Text,
  ScrollView,
  Center,
  Pressable,
} from 'native-base';
import React, {useEffect, useRef, useState} from 'react';
import SvgLocation from '../../../assets/Location';
import SvgShare from '../../../assets/Share';
import {
  StyledStatus,
  StyledSubTitle,
} from '../../../components/cardPlace/style';
import {Color, buildLink} from '../../../helpers/constatn';
import {TouchableOpacity, Linking, Platform} from 'react-native';
import Share from 'react-native-share';
import {
  StyledButtonMenu,
  StyledDescrption,
  StyledDetails,
  StyledHappyHour,
  StyledTextStatus,
  StyledTextTag,
  StyledTime,
  StyledTimeOpen,
  StyledTitle,
} from './styles';
import SvgReport from '../../../assets/reportIcon';
import SvgFavorit from '../../../assets/AddFavorit';
import ImageView from 'react-native-image-viewing';
import {useQuery} from '@tanstack/react-query';
import LoadingSpinner from '../../../components/Loader';
import {getPlaceByIdAPI} from '../../../services/place';
import Geolocation from '@react-native-community/geolocation';
import {haversine, isTimeWithinRange} from '../../../helpers/functions';

export default function PlaceDetails({navigation, route}: any) {
  const {id} = route.params;
  console.log('id', id);
  const [favorit, setFavorit] = useState(false);
  const scrollViewRef = useRef(null);

  const images = [
    {
      uri: 'https://images.unsplash.com/photo-1571501679680-de32f1e7aad4',
    },
    {
      uri: 'https://images.unsplash.com/photo-1573273787173-0eb81a833b34',
    },
    {
      uri: 'https://images.unsplash.com/photo-1569569970363-df7b6160d111',
    },
  ];

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

  const openMapDirection = () => {
    const url: any = Platform.select({
      ios: `comgooglemaps://?center=${latitude},${longitude}&q=${latitude},${longitude}&zoom=14&views=traffic"`,
      android: `geo://?q=${latitude},${longitude}`,
    });
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          const browser_url = `https://www.google.de/maps/@${latitude},${longitude}`;
          return Linking.openURL(browser_url);
        }
      })
      .catch(() => {
        if (Platform.OS === 'ios') {
          Linking.openURL(`maps://?q=${latitude},${longitude}`);
        }
      });
  };

  const linkingMailTo = () =>
    Linking.openURL(`mailto:${data?.placeinfo?.placeMail}`);

  const scrollToItem = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current?.scrollTo({
        y: 800,
        animated: true,
      });
    }
  };

  const {isLoading, data} = useQuery(['getPlaceById', {id}], getPlaceByIdAPI, {
    onSuccess: response => {
      console.log('response123', response);
    },
  });
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
  const isOpen = data?.placeinfo?.horaire
    ? isTimeWithinRange(data?.placeinfo?.horaire)
    : false;

  const shareContent = {
    title: 'Share Title',
    message: 'Hello, check out this awesome app!',
  };

  const shareRestaurant = async () => {
    try {
      const url = await buildLink(`placeID=${id}`);
      await Share.open({...shareContent, url});
    } catch (error: any) {
      console.error('Error sharing:', error?.message);
    }
  };
  return (
    <ScrollView
      ref={scrollViewRef} //set the ref
      paddingX={15}
      contentContainerStyle={{paddingBottom: 100}}
      backgroundColor={'rgba(246, 246, 246, 0.5)'}>
      {<LoadingSpinner visible={isLoading} />}

      <Box rounded={'3xl'} width={'100%'}>
        <FavouriteIcon
          name="FavouriteIcon"
          color={favorit ? Color.red : 'white'}
          position="absolute"
          top={3}
          right={2}
          size={'lg'}
          onPress={() => setFavorit(!favorit)}
        />

        <Image
          source={{
            uri: data?.place?.image,
          }}
          alt="Alternate Text"
          size="xl"
          resizeMode="cover"
          height={200}
          width={'100%'}
          rounded={'3xl'}
          zIndex={-1}
        />
        <Flex
          p={2}
          flexDirection={'row'}
          justifyContent={'space-between'}
          alignItems={'center'}>
          <Box gap={2}>
            <StyledTitle>{data?.place?.placeName ?? '-'}</StyledTitle>
            {data?.place?.subTitle && (
              <StyledSubTitle>{data?.place?.subTitle}</StyledSubTitle>
            )}
          </Box>
          <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
            <SvgLocation />
            <StyledSubTitle>{disatance()?.toFixed(0)} KM</StyledSubTitle>
            <TouchableOpacity onPress={shareRestaurant}>
              <SvgShare />
            </TouchableOpacity>
          </Flex>
          <StyledStatus style={{backgroundColor: isOpen ? 'green' : '#e74c3c'}}>
            {isOpen ? 'open' : 'Fermé'}
          </StyledStatus>
        </Flex>
      </Box>
      <Button
        borderRadius={'12px'}
        onPress={() =>
          navigation.navigate('Resevation', {id: data?.place?.idPlace})
        }
        backgroundColor={Color.main}>
        Réservez
      </Button>
      <Flex
        flexDirection={'row'}
        gap={2}
        justifyContent={'space-between'}
        marginY={5}>
        <TouchableOpacity>
          <StyledButtonMenu>Menu et vidéo</StyledButtonMenu>
        </TouchableOpacity>
        <TouchableOpacity>
          <StyledButtonMenu onPress={() => setIsVisible(true)}>
            Photos
          </StyledButtonMenu>
        </TouchableOpacity>
        <TouchableOpacity>
          <StyledButtonMenu>Adresse</StyledButtonMenu>
        </TouchableOpacity>
        <TouchableOpacity onPress={scrollToItem}>
          <StyledButtonMenu>Events</StyledButtonMenu>
        </TouchableOpacity>
      </Flex>
      <Box mb={10}>
        <StyledTitle paddingBottom={5}>Details</StyledTitle>
        <Box bgColor={'#fff'} borderRadius={10} py={'12px'}>
          <Box px={5}>
            <Pressable
              onPress={() =>
                data?.placeinfo?.placeTel &&
                Linking.openURL(`tel:${data?.placeinfo?.placeTel}`)
              }>
              <StyledDetails>Téléphone</StyledDetails>
              <Text>{data?.placeinfo?.placeTel}</Text>
            </Pressable>
            <Divider my={2} />
          </Box>
          <Box px={5}>
            <Pressable onPress={() => openMapDirection()}>
              <StyledDetails>Adresse</StyledDetails>
              <Text>{data?.placeinfo?.placeAdress}</Text>
            </Pressable>
            <Divider my={4} />
          </Box>
          <Box px={5}>
            <Pressable onPress={linkingMailTo}>
              <StyledDetails>Email</StyledDetails>
              <Text>{data?.placeinfo?.placeMail}</Text>
            </Pressable>
          </Box>
        </Box>
      </Box>
      <StyledDescrption>{data?.placeinfo?.placeDescription}</StyledDescrption>
      <Box mt={5}>
        <StyledTitle>Informations pratiques</StyledTitle>
        <Box bgColor={'#fff'} mt={2} borderRadius={10} py={'12px'}>
          <Box px={5}>
            <Box>
              <StyledDetails>Tenue Vestimentaire</StyledDetails>
              <Flex flexDirection={'row'} gap={2}>
                {data?.placeinfo?.placeOutfit
                  ? data?.placeinfo?.placeOutfit
                      ?.split(',')
                      ?.map((el: string) => <StyledTextTag>{el}</StyledTextTag>)
                  : '-'}
              </Flex>
            </Box>
            <Divider my={2} />
          </Box>
          <Box px={5}>
            <Box>
              <StyledDetails>Style de Musique</StyledDetails>
              <Flex flexDirection={'row'} gap={2}>
                {data?.placeinfo?.placeMusicStyle
                  ? data?.placeinfo?.placeMusicStyle
                      ?.split(',')
                      ?.map((el: string) => <StyledTextTag>{el}</StyledTextTag>)
                  : '-'}
              </Flex>
            </Box>
          </Box>
        </Box>
      </Box>

      <Flex
        backgroundColor={'red'}
        justifyContent={'center'}
        alignItems={'center'}
        mt={5}>
        <Center
          width={'100%'}
          height={95}
          bg={'rgba(117, 93, 205, 0.1)'}
          borderRadius={10}>
          <StyledHappyHour>Happy hour</StyledHappyHour>
          <StyledTime>{data?.placeinfo?.placeHappyHour ?? '-'}</StyledTime>
        </Center>
      </Flex>
      <Box>
        <StyledTitle py={5}>Maps</StyledTitle>
        <StyledTitle py={5}>Coming Soon</StyledTitle>
      </Box>
      <Box bgColor={'#fff'} mt={2} borderRadius={10} py={'12px'} px={'17px'}>
        <StyledTitle>Horaires</StyledTitle>
        <StyledTimeOpen>{data?.placeinfo?.horaire}</StyledTimeOpen>
        <StyledTextStatus>{isOpen ? 'ouvert' : 'fermé'}</StyledTextStatus>
      </Box>
      <Box bgColor={'#fff'} mt={2} borderRadius={10} py={'12px'} px={'17px'}>
        <StyledTitle>Jour favorable</StyledTitle>
        <StyledTimeOpen>{data?.placeinfo?.placeFavorableDay}</StyledTimeOpen>
        <StyledTimeOpen>{data?.placeinfo?.placeFavorableHour}</StyledTimeOpen>
      </Box>
      <Box bgColor={'#fff'} mt={2} borderRadius={10} py={'12px'} px={'17px'}>
        <TouchableOpacity>
          <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
            <SvgReport />
            <StyledTitle>Signaler un problème</StyledTitle>
          </Flex>
        </TouchableOpacity>
        <Divider my={3} />

        <TouchableOpacity>
          <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
            <SvgFavorit />
            <StyledTitle>Ajouter au favoris</StyledTitle>
          </Flex>
        </TouchableOpacity>
      </Box>
      <ImageView
        images={images}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
      />
    </ScrollView>
  );
}
