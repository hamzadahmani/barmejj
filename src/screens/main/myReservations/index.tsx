/* eslint-disable react-native/no-inline-styles */
import Geolocation from '@react-native-community/geolocation';
import {useQuery} from '@tanstack/react-query';
import {Box, FlatList, Flex, Text, View} from 'native-base';
import React, {useEffect, useState} from 'react';
import {ImageBackground, Pressable} from 'react-native';
import SvgLocation from '../../../assets/Location';
import LoadingSpinner from '../../../components/Loader';
import {haversine} from '../../../helpers/functions';
import {getAllReservationsByUser} from '../../../services/reservation';

// import NoFavit from './noFav';

export default function MyReservation({navigation}: any) {
  const statusList = [
    {
      status: 'en attente',
      color: '#FDBA74',
    },
    {
      status: 'accepter',
      color: '#059669',
    },
    {
      status: 'refusé',
      color: '#DC2626',
    },
  ];

  const {isLoading, data} = useQuery(
    ['getAllReservationsByUser'],
    getAllReservationsByUser,
  );
  const handelIndex = (status: string) => {
    if (status === 'pending') {
      return 0;
    } else if (status === 'accepted') {
      return 1;
    } else {
      return 2;
    }
  };
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

  const disatance = (el: any) => {
    return (
      el.latitude &&
      latitude &&
      haversine(el.latitude, el.longitude, latitude, longitude)
    );
  };
  const renderItem = ({item}: any) => (
    <Pressable
      onPress={() =>
        navigation.navigate('UpdateReservation', {
          id: item.reservation.idReservation,
        })
      }
      style={{marginBottom: 10}}>
      <ImageBackground
        style={{
          height: 185,
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
        imageStyle={{borderRadius: 24}}
        source={{uri: item?.place?.image}}
        resizeMode="cover">
        <Flex
          px={31}
          pb={2}
          flexDirection={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}>
          <Box gap={4}>
            <Text
              fontFamily={'Manrope'}
              fontSize={18}
              fontWeight={700}
              color={'#fff'}>
              {item?.place?.placeName}
            </Text>
            {item?.place?.subTitle && (
              <Text
                fontFamily={'Inter'}
                fontSize={10}
                fontWeight={500}
                color={'#fff'}>
                {item?.place?.subTitle}
              </Text>
            )}
            {item.reservation.status && (
              <Text
                fontFamily={'Manrope'}
                fontSize={8}
                color={'#fff'}
                style={{
                  backgroundColor:
                    statusList[handelIndex(item.reservation.status)].color,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  alignSelf: 'flex-start',
                  borderRadius: 4,
                }}>
                {statusList[handelIndex(item.reservation.status)].status}
              </Text>
            )}
          </Box>
          <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
            <SvgLocation />
            {item?.place && (
              <Text
                fontFamily={'Inter'}
                fontSize={14}
                fontWeight={500}
                color={'#fff'}>
                {`${disatance(item.place)?.toFixed(0) ?? '-'} KM`}
              </Text>
            )}
          </Flex>
        </Flex>
      </ImageBackground>
    </Pressable>
  );
  return (
    <View>
      {<LoadingSpinner visible={isLoading} />}
      <FlatList
        contentContainerStyle={{paddingBottom: 100}}
        mt={5}
        px={5}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}
