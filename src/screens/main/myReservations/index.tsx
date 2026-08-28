/* eslint-disable react-native/no-inline-styles */
import Geolocation from '@react-native-community/geolocation';
import {useMutation, useQuery} from '@tanstack/react-query';
import {Box, Button, Flex, HStack, Text, View} from 'native-base';
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, ImageBackground, Pressable, RefreshControl} from 'react-native';
import SvgLocation from '../../../assets/Location';
import LoadingSpinner from '../../../components/Loader';
import {haversine} from '../../../helpers/functions';
import {getAdminReservations, getAllReservationsByUser, updateReservationStatusAPI} from '../../../services/reservation';
import {useFocusEffect} from '@react-navigation/native';
import {useAuth} from '../../../routes/auth/authProvider';

// import NoFavit from './noFav';

export default function MyReservation({navigation}: any) {
  const {userInfo} = useAuth();
  const isAdmin = userInfo?.userRole === 'admin';
  const statusList: Record<string, {status: string; color: string}> = {
    PENDING: {status: 'En attente', color: '#D97706'},
    CONFIRMED: {status: 'Confirmée', color: '#059669'},
    CANCELLED: {status: 'Annulée', color: '#DC2626'},
    DECLINED: {status: 'Refusée', color: '#B91C1C'},
    COMPLETED: {status: 'Terminée', color: '#2563EB'},
    NO_SHOW: {status: 'Client absent', color: '#6B7280'},
  };

  const {isLoading, isRefetching, data, refetch} = useQuery(
    [isAdmin ? 'getAdminReservations' : 'getAllReservationsByUser'],
    isAdmin ? getAdminReservations : getAllReservationsByUser,
  );
  const {mutate: updateStatus, isLoading: statusLoading} = useMutation(
    updateReservationStatusAPI,
    {onSuccess: () => refetch()},
  );
  const [latitude, setLatitude] = useState<any>(null);
  const [longitude, setLongitude] = useState<any>(null);
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

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
        !isAdmin && navigation.navigate('UpdateReservation', {
          id: item.idReservation,
        })
      }
      style={{marginBottom: 16}}>
      <ImageBackground
        style={{
          height: 210,
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
        imageStyle={{borderRadius: 22}}
        source={{uri: item?.image}}
        resizeMode="cover">
        <Flex
          px={5}
          pb={4}
          flexDirection={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}>
          <Box>
            <Text
              fontFamily={'Manrope'}
              fontSize={20}
              fontWeight={700}
              color={'#fff'}>
              {item?.placeName}
            </Text>
            {item?.subTitle && (
              <Text
                fontFamily={'Inter'}
                fontSize={10}
                fontWeight={500}
                color={'#fff'}>
                {item?.subTitle}
              </Text>
            )}
            {item.status && (
              <Text
                fontFamily={'Manrope'}
                fontSize={8}
                color={'#fff'}
                style={{
                  backgroundColor: statusList[item.status]?.color ?? '#6B7280',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  alignSelf: 'flex-start',
                  borderRadius: 4,
                }}>
                {statusList[item.status]?.status ?? item.status}
              </Text>
            )}
          </Box>
          <Flex flexDirection={'row'} alignItems={'center'}>
            <SvgLocation />
            {item?.latitude && (
              <Text
                fontFamily={'Inter'}
                fontSize={14}
                fontWeight={500}
                color={'#fff'}>
                {`${disatance(item)?.toFixed(0) ?? '-'} KM`}
              </Text>
            )}
          </Flex>
        </Flex>
        {isAdmin && (
          <HStack bg="white" px={4} py={3} space={3} borderBottomLeftRadius={22} borderBottomRightRadius={22}>
            <Button flex={1} bg="#059669" isLoading={statusLoading} onPress={() => updateStatus({id: item.idReservation, status: 'CONFIRMED'})}>Accepter</Button>
            <Button flex={1} bg="#DC2626" isLoading={statusLoading} onPress={() => updateStatus({id: item.idReservation, status: 'DECLINED'})}>Refuser</Button>
          </HStack>
        )}
      </ImageBackground>
    </Pressable>
  );
  return (
    <View flex={1} bg="#F7F7FB">
      <LoadingSpinner visible={isLoading || statusLoading} />
      <Box px={5} pt={8}>
        <Text color="#45377A" fontSize={11} fontWeight={800} letterSpacing={2}>
          {isAdmin ? 'GESTION ÉTABLISSEMENT' : 'VOS SORTIES'}
        </Text>
        <Text color="#777382" fontSize={14} mt={2}>
          {isAdmin ? 'Acceptez ou refusez les demandes en attente' : 'Consultez et gérez vos prochaines sorties'}
        </Text>
      </Box>
      <FlatList
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => {void refetch();}} colors={['#45377A']} tintColor="#45377A"/>}
        contentContainerStyle={{paddingBottom: 100, paddingHorizontal: 20}}
        style={{marginTop: 20}}
        data={data}
        renderItem={renderItem}
        keyExtractor={item => String(item.idReservation)}
      />
    </View>
  );
}
