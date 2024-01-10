import {Box, FavouriteIcon, Flex, Image, useToast} from 'native-base';
import React, {useState} from 'react';
import {Color} from '../../helpers/constatn';
import {StyledStatus, StyledSubTitle, StyledTitle} from './style';
import SvgLocation from '../../assets/Location';
import SvgShare from '../../assets/Share';
import {TouchableOpacity} from 'react-native';
import {addFavoritesAPI, deleteFavoritesAPI} from '../../services/favorites';
import {useMutation} from '@tanstack/react-query';
import Toast from '../toast';
export default function CardItem({
  imgUrl,
  navigation,
  placeName,
  id,
  distance,
}: any) {
  const [favorit, setFavorit] = useState(false);
  const handleNavigate = () => {
    navigation.navigate('Details', {id: id, distance});
  };
  const toast = useToast();

  const {mutate: updateFavoritMutate} = useMutation(
    (data: any) => addFavoritesAPI(data),
    {
      onSuccess: () => {
        toast.show({
          placement: 'top',
          render: () => {
            return (
              <Toast
                message={`${placeName} a été ajouté à vos favoris`}
                status={'#008000'}
              />
            );
          },
        });
      },
      onError: err => {
        console.warn('data', err);
      },
    },
  );

  const {mutate: deleteFavoritesMutate} = useMutation(
    (id: any) => deleteFavoritesAPI(id),
    {
      onSuccess: () => {
        toast.show({
          placement: 'top',
          render: () => {
            return (
              <Toast
                message={`${placeName} a été supprimé à vos favoris`}
                status={'#008000'}
              />
            );
          },
        });
      },
      onError: err => {
        console.warn('data', err);
      },
    },
  );

  const handleFavorites = () => {
    setFavorit(!favorit);
    if (!favorit) {
      updateFavoritMutate({idPlace: id});
    } else {
      deleteFavoritesMutate(id);
    }
  };
  const isOpen = true;
  return (
    <TouchableOpacity onPress={handleNavigate}>
      <Box rounded={'3xl'} width={'100%'}>
        <FavouriteIcon
          name="FavouriteIcon"
          color={favorit ? Color.red : 'white'}
          position="absolute"
          top={3}
          right={2}
          size={'lg'}
          onPress={handleFavorites}
        />

        <Image
          source={{
            uri: imgUrl,
          }}
          alt="Alternate Text"
          size="xl"
          resizeMode="cover"
          height={300}
          width={'100%'}
          rounded={'3xl'}
          zIndex={-1}
        />
        <Flex p={2} flexDirection={'row'} justifyContent={'space-between'}>
          <Box gap={4}>
            <StyledTitle>{placeName}</StyledTitle>
            <StyledSubTitle>Bar á tapas & restaurant</StyledSubTitle>
            <StyledStatus
              style={{backgroundColor: isOpen ? 'green' : '#e74c3c'}}>
              {isOpen ? 'ouvert' : 'Fermé'}
            </StyledStatus>
          </Box>
          <Flex
            flexDirection={'row'}
            alignItems={'center'}
            alignSelf={'flex-start'}
            gap={2}>
            <SvgLocation />
            <StyledSubTitle>{distance?.toFixed(0) ?? '-'} KM</StyledSubTitle>
            <SvgShare />
          </Flex>
        </Flex>
      </Box>
    </TouchableOpacity>
  );
}
