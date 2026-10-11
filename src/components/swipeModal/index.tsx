import {Box, Button, Flex, Image, Text} from 'native-base';
import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {Linking, Modal, Platform, Pressable, StyleSheet, TouchableOpacity, View} from 'react-native';
import DirectionSvgComponent from '../../assets/direction';
import {Color} from '../../helpers/constatn';
import VectorIcon from '../vectorIcon';

export type CustomSwipeModalRef = {
  showModal: () => void;
  hideModal: () => void;
};

type CustomSwipeModalProps = {
  coordinate: {latitude: number; longitude: number};
  navigation: any;
  place?: any;
};

const CustomSwipeModal = forwardRef<CustomSwipeModalRef, CustomSwipeModalProps>(
  ({coordinate, navigation, place}, ref) => {
    const [visible, setVisible] = useState(false);
    useImperativeHandle(ref, () => ({
      showModal: () => setVisible(true),
      hideModal: () => setVisible(false),
    }));

    const openDirection = () => {
      const url = Platform.select({
        ios: `maps:0,0?q=${place?.placeName ?? 'Barmej'}@${
          coordinate.latitude
        },${coordinate.longitude}`,
        android: `google.navigation:q=${coordinate.latitude},${coordinate.longitude}&mode=d`,
      });
      if (url) Linking.openURL(url);
    };

    return (
      <Modal transparent visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Box px={5} pb={6}>
          {place?.image && (
            <Image
              source={{uri: place.image}}
              alt={place.placeName}
              width="100%"
              height={36}
              borderRadius={18}
              resizeMode="cover"
            />
          )}
          <Text color={Color.text} fontWeight={800} fontSize={21} mt={4}>
            {place?.placeName || 'Établissement'}
          </Text>
          <Text color={Color.muted} fontSize={13} mt={1}>
            {place?.subTitle || 'Découvrez ce lieu près de vous'}
          </Text>
          <Flex
            direction="row"
            mt={4}
            alignItems="center"
            justifyContent="space-between">
            <Flex direction="row" alignItems="center"><VectorIcon name="mapPin" size={15} color={Color.main}/><Text color={Color.main} fontWeight={700} fontSize={12} ml={1}>À proximité</Text></Flex>
            <TouchableOpacity onPress={openDirection}>
              <Flex
                direction="row"
                alignItems="center"
                bg={Color.mainLight}
                px={3}
                py={2}
                borderRadius={14}>
                <DirectionSvgComponent />
                <Text color={Color.main} ml={2} fontWeight={700}>
                  Itinéraire
                </Text>
              </Flex>
            </TouchableOpacity>
          </Flex>
          <Button
            mt={5}
            height={52}
            borderRadius={16}
            backgroundColor={Color.main}
            onPress={() =>
              navigation.navigate('Details', {id: place?.idPlace ?? place?.id, source: 'map'})
            }>
            Voir l’établissement
          </Button>
            </Box>
          </View>
        </View>
      </Modal>
    );
  },
);

export default CustomSwipeModal;

const styles = StyleSheet.create({
  overlay: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(20,15,30,0.42)'},
  sheet: {maxHeight: 430, backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10},
  handle: {width: 42, height: 5, borderRadius: 3, backgroundColor: '#DDD7E5', alignSelf: 'center', marginBottom: 10},
});
