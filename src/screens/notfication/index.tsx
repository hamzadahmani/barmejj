/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import {Flex, FlatList, View, Divider} from 'native-base';
import React from 'react';
import {
  PlaceName,
  StyledHappyHour,
  StyledNoDataSubTitle,
  StyledNoDataTitle,
  StyledReservationTitle,
  StyledStatus,
  StyledTime,
  StyledTitle,
} from './styles';
import NoNotification from '../../assets/NoNotification';
interface EnumItem {
  place: string;
  time: string;
  status: string;
  type: string;
}

export default function NotficationScreen() {
  const data = [
    {
      place: 'Circus',
      time: '12:00',
      status: '',
      type: 'happyHour',
    },
    {
      place: 'Circus',
      time: '12:00',
      status: 'pending',
      type: 'reservation',
    },
  ];
  const renderReservationNotif = (item: EnumItem) => {
    return (
      <View py={5} px={4} backgroundColor={'white'} my={2} gap={2}>
        <StyledReservationTitle>
          Réservation á {item.place}
        </StyledReservationTitle>
        <StyledTime> {item.time}</StyledTime>

        <StyledStatus> {item.status}</StyledStatus>
      </View>
    );
  };

  const renderHappyHour = (item: EnumItem) => {
    return (
      <View py={5} px={4} backgroundColor={'white'} my={2} gap={1}>
        <StyledHappyHour>Happy Hour Aujourd'hui</StyledHappyHour>
        <PlaceName> Chez {item.place}</PlaceName>
        <StyledTime> {item.time}</StyledTime>
      </View>
    );
  };

  const renderItems = (item: EnumItem) => {
    return item?.type === 'reservation'
      ? renderReservationNotif(item)
      : renderHappyHour(item);
  };
  const noData = () => {
    return (
      <Flex mt={200} justifyContent={'center'} alignItems={'center'}>
        <NoNotification />
        <StyledNoDataTitle>
          Pas de notification pour l’instant
        </StyledNoDataTitle>
        <StyledNoDataSubTitle>
          Tu n’as pas encore des nouvelles notifications
        </StyledNoDataSubTitle>
      </Flex>
    );
  };
  return (
    <Flex bgColor={'white'} flex={1}>
      <StyledTitle>Notifications</StyledTitle>

      <FlatList
        contentContainerStyle={{paddingBottom: 100}}
        showsVerticalScrollIndicator={false}
        renderItem={({item}: any) => renderItems(item)}
        data={data}
        ItemSeparatorComponent={() => (
          <Divider alignSelf={'center'} width={300} />
        )}
        ListEmptyComponent={() => noData()}
      />
    </Flex>
  );
}
