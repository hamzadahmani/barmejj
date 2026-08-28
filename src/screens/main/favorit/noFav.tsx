import {Flex, View, Text} from 'native-base';
import React from 'react';
import SvgComponentAlert from '../../../assets/Alert';

export default function NoFavorit() {
  return (
    <Flex
      mt={24}
      px={8}
      alignItems={'center'}
      justifyContent={'center'}
      flex={1}>
      <View
        style={{
          borderRadius: 28,
          borderWidth: 8,
          borderColor: '#EEEAF8',
          backgroundColor: '#E4DDF5',
        }}>
        <SvgComponentAlert />
      </View>
      <Text
        color={'#101828'}
        textAlign={'center'}
        fontSize={16}
        fontWeight={500}
        fontFamily={'Poppins'}
        lineHeight={20}>
        Aucun favori pour l’instant
      </Text>
      <Text
        color={'#667085'}
        textAlign={'center'}
        fontSize={14}
        fontWeight={400}
        fontFamily={'Poppins'}
        lineHeight={20}>
        Ajoutez vos lieux préférés pour les retrouver facilement ici.
      </Text>
    </Flex>
  );
}
