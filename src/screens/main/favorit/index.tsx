import {useMutation, useQuery} from '@tanstack/react-query';
import {
  Divider,
  FlatList,
  Flex,
  Image,
  Pressable,
  Text,
  useToast,
  View,
} from 'native-base';
import React from 'react';
import {TouchableOpacity} from 'react-native';
import SvgComponentTrash from '../../../assets/Delete';
import LoadingSpinner from '../../../components/Loader';
import Toast from '../../../components/toast';
import {deleteFavoritesAPI, getFavoritesAPI} from '../../../services/favorites';
// import NoFavit from './noFav';

export default function MyFavorit({navigation}: any) {
  const toast = useToast();

  const {isLoading, data, refetch} = useQuery(
    ['getAllFavorites'],
    getFavoritesAPI,
    {},
  );
  const {mutate: deleteFavoritesMutate} = useMutation(
    (id: any) => deleteFavoritesAPI(id),
    {
      onSuccess: res => {
        refetch();
        toast.show({
          placement: 'top',
          render: () => {
            return (
              <Toast message={'supprimé avec succès'} status={'#008000'} />
            );
          },
        });
      },
      onError: err => {
        console.warn('data', err);
      },
    },
  );
  const renderItem = ({item}: any) => (
    <Pressable
      onPress={() => navigation.navigate('Details', {id: item.idPlace})}>
      <Flex
        flexDirection={'row'}
        justifyContent={'space-between'}
        alignItems={'center'}
        marginY={5}>
        {<LoadingSpinner visible={isLoading} />}
        <Flex
          flexDirection={'row'}
          justifyContent={'space-between'}
          alignItems={'center'}>
          <Image
            source={{
              uri: item.image,
            }}
            alt="Alternate Text"
            size="xl"
            resizeMode="cover"
            height={59}
            width={71}
            rounded={'md'}
          />
          <Flex ml={4}>
            <Text
              color={'#090A0A'}
              fontSize={11}
              fontWeight={500}
              fontFamily={'Poppins'}>
              {item.placeName}
            </Text>
            <Text
              color={'#7D808D'}
              fontSize={11}
              fontWeight={500}
              fontFamily={'Poppins'}>
              {item.subTitle ?? 'Bar'}
            </Text>
          </Flex>
        </Flex>

        <TouchableOpacity onPress={() => deleteFavoritesMutate(item.idPlace)}>
          <SvgComponentTrash />
        </TouchableOpacity>
      </Flex>
    </Pressable>
  );

  return (
    <View>
      <Text
        color={'#464646'}
        fontSize={16}
        fontWeight={600}
        fontFamily={'Inter'}
        alignSelf={'center'}
        mt={5}>
        Listes des favoris
      </Text>
      <FlatList
        contentContainerStyle={{paddingBottom: 100}}
        mt={5}
        px={5}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ItemSeparatorComponent={<Divider backgroundColor={'#F6F7F9'} />}
      />
    </View>
  );
}
