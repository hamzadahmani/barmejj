/* eslint-disable react/no-unstable-nested-components */
import React, {useRef, forwardRef, useImperativeHandle, useState} from 'react';
import SwipeModal, {
  SwipeModalPublicMethods,
} from '@birdwingo/react-native-swipe-modal';
import {Text, View, Button, Modal, HStack, VStack, Divider} from 'native-base';
import AvatarList from '../avatarList';
import {Color} from '../../helpers/constatn';
import {Linking, Platform, TouchableOpacity} from 'react-native';
import SvgClose from '../../assets/close';
import DirectionSvgComponent from '../../assets/direction';

// Define a type for the custom modal's ref
export type CustomSwipeModalRef = {
  showModal: () => void;
  hideModal: () => void;
};

const CustomSwipeModal = forwardRef<CustomSwipeModalRef>(
  ({coordinate, navigation}: any, ref) => {
    const modalRef = useRef<SwipeModalPublicMethods>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Expose the showModal and hideModal functions via useImperativeHandle
    useImperativeHandle(ref, () => ({
      showModal: () => modalRef.current?.show(),
      hideModal: () => modalRef.current?.hide(),
    }));
    const openGoogleMap = ({latitude, longitude}: any) => {
      const scheme = Platform.select({
        ios: 'maps:0,0?q=',
        android: 'google.navigation:q=',
      });
      const latLng = `${latitude},${longitude}`;
      const label = 'Custom Label';
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}&dirflg=d`,
        android: `${scheme}${latLng}&mode=d`,
      });
      Linking.openURL(url ?? '');
    };

    const users = [
      {
        name: 'Wesley Ray',
        status: 'En ligne',
      },
      {
        name: 'ibrahim Ray ',
        status: 'En ligne',
      },
      {
        name: 'mommtez Ray ',
        status: 'En ligne',
      },
    ];
    const ClientsInfo = ({name, status}: any) => {
      return (
        <HStack mb={2} alignItems={'center'}>
          <View bg={'#29CC394D'} width={30} height={30} mr={5} />
          <Text
            fontFamily={'Inter'}
            fontSize={12}
            fontWeight={700}
            mr={8}
            width={100}>
            {name}
          </Text>
          <Text
            color={'#29CC39'}
            fontFamily={'Inter'}
            fontSize={12}
            fontWeight={700}>
            {status}
          </Text>
        </HStack>
      );
    };
    return (
      <SwipeModal ref={modalRef} bg={'white'} maxHeight={400}>
        <View marginX={19}>
          <Text fontFamily={'Inter'} fontWeight={500} fontSize={20}>
            En ce moment à cet endroit
          </Text>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(true);
            }}>
            <AvatarList />
          </TouchableOpacity>
          <TouchableOpacity
            style={{marginTop: 10}}
            onPress={() => openGoogleMap(coordinate)}>
            <HStack
              width={110}
              paddingLeft={2}
              paddingY={2}
              alignItems={'center'}
              borderRadius={10}
              borderWidth={1}>
              <DirectionSvgComponent />
              <Text
                marginLeft={1}
                color={Color.main}
                fontFamily={'Inter'}
                fontSize={16}
                fontWeight={600}>
                Direction
              </Text>
            </HStack>
          </TouchableOpacity>
          <Button
            borderRadius={'12px'}
            mt={3}
            onPress={() => navigation.navigate('Resevation', {id: 1})}
            backgroundColor={Color.main}>
            Je réserve
          </Button>
        </View>
        <Modal
          isOpen={modalVisible}
          onClose={() => setModalVisible(false)}
          paddingX={2}>
          <VStack
            minHeight={200}
            backgroundColor={'#FFF'}
            width={'100%'}
            py={2}
            borderRadius={8}
            px={5}>
            <HStack
              justifyContent={'space-between'}
              alignItems={'center'}
              my={3}>
              <Text fontFamily={'Inter'} fontWeight={700} fontSize={17}>
                En ce moment à cet endroit
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <SvgClose />
              </TouchableOpacity>
            </HStack>
            <Divider mb={5} />
            <VStack>
              {users.map(el => (
                <ClientsInfo name={el.name} status={el.status} />
              ))}
            </VStack>
          </VStack>
        </Modal>
      </SwipeModal>
    );
  },
);

export default CustomSwipeModal;
