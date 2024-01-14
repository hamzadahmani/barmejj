import {Flex, View, Text} from 'native-base';
import React from 'react';
import SvgComponentAlert from '../../../assets/Alert';

export default function NoFavorit() {
  return (
    <Flex mt={5} alignItems={'center'} justifyContent={'center'} flex={1}>
      <View
        style={{
          borderRadius: 28,
          borderWidth: 8,
          borderColor: '#FFFAEB',
          backgroundColor: '#FEF0C7',
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
        Pas de favoris pour l’instant
      </Text>
      <Text
        color={'#667085'}
        textAlign={'center'}
        fontSize={14}
        fontWeight={400}
        fontFamily={'Poppins'}
        lineHeight={20}>
        Tu n’as pas encore des favoris dans votre liste
      </Text>
    </Flex>
  );
}
