/* eslint-disable react/no-unstable-nested-components */
import {
  SearchIcon,
  CloseIcon,
  VStack,
  FlatList,
  Divider,
  Image,
  Flex,
} from 'native-base';
import {Pressable, TouchableOpacity} from 'react-native';

import React, {useState} from 'react';
import {
  StyledName,
  StyledSearchInput,
  StyledSubName,
  StyledTextStatus,
} from './styles';
import {getPlacesBySearch} from '../../services/search';
import {useQuery} from '@tanstack/react-query';
import {haversine, isTimeWithinRange} from '../../helpers/functions';
import useGeolocation from '../../hooks/useLocation';
export default function SearchBar({navigation}: any) {
  const [query, setQuery] = useState('');
  const {position} = useGeolocation();

  const handleInputChange = (text: string) => {
    setQuery(text);
  };
  const disatance = (el: any) => {
    return (
      el?.latitude &&
      position?.coords?.latitude &&
      haversine(
        el.latitude,
        el.longitude,
        position?.coords?.latitude,
        position?.coords?.longitude,
      )
    );
  };
  const isOpen = (horaire: string | null) =>
    horaire ? isTimeWithinRange(horaire) : false;

  const renderItem = ({item}: any) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('Details', {id: item.idPlace});
        setQuery('');
      }}>
      <Flex flex={1} flexDirection={'row'} ml={2} key={item.placeName}>
        <Image
          source={{
            uri: item.image,
          }}
          alt="Alternate Text"
          size="xl"
          resizeMode="cover"
          height={50}
          width={50}
          rounded={'sm'}
        />
        <Flex flexDir={'column'} ml={2}>
          <Flex flexDir={'row'} width={'70%'} justifyContent={'space-between'}>
            <StyledName>{item.placeName}</StyledName>
            <StyledTextStatus>
              {isOpen(item.horaire) ? 'ouvert' : 'Fermé'}
            </StyledTextStatus>
          </Flex>
          <Flex flexDir={'row'} width={'70%'} justifyContent={'space-between'}>
            <StyledSubName>{item.subTitle}</StyledSubName>

            <StyledSubName>{`${
              disatance(item)?.toFixed(0) ?? '-'
            } KM`}</StyledSubName>
          </Flex>
        </Flex>
      </Flex>
    </TouchableOpacity>
  );

  const isQueryValid = query?.length > 3;

  const {data: searchResult} = useQuery(
    ['getPlacesBySearch', {query}],
    getPlacesBySearch,
    {
      onSuccess: response => {
        console.log('response', response);
      },
      enabled: isQueryValid,
    },
  );

  return (
    <VStack w="100%" space={5} alignSelf="center" bgColor={'white'}>
      <StyledSearchInput
        value={query}
        onChangeText={handleInputChange}
        placeholder="Rechercher"
        InputLeftElement={<SearchIcon paddingLeft={10} />}
        InputRightElement={
          <Pressable onPress={() => setQuery('')}>
            <CloseIcon paddingLeft={10} />
          </Pressable>
        }
        bgColor={'#fff'}
        borderWidth={0}
        borderRadius={10}
      />

      {query !== '' && searchResult?.length > 0 && (
        <FlatList
          paddingBottom={2}
          width={'100%'}
          data={searchResult ?? []}
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={() => (
            <Divider alignSelf={'center'} width={300} my={3} />
          )}
          renderItem={renderItem}
        />
      )}
    </VStack>
  );
}
