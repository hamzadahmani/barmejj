import {useQuery} from '@tanstack/react-query';
import {Box, FlatList, Flex, View} from 'native-base';
import React, {useEffect, useState} from 'react';
import {getAllPlacesByCategorieAPI} from '../../services/place';
import CardItem from '../cardPlace';
import LoadingSpinner from '../Loader';
import SearchBar from '../search';
import UserDetails from '../userHeader';
import Geolocation from '@react-native-community/geolocation';
import {haversine} from '../../helpers/functions';

export default function ListCardItems({navigation, idCategory}: any) {
  const {isLoading, data} = useQuery(
    ['getAllPlacesByCategorie', {id: idCategory}],
    getAllPlacesByCategorieAPI,
    {},
  );

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

  return (
    <>
      {<LoadingSpinner visible={isLoading} />}
      <Flex>
        <FlatList
          contentContainerStyle={{paddingBottom: 100}}
          showsVerticalScrollIndicator={false}
          renderItem={({item}: any) => (
            <CardItem
              imgUrl={item?.image}
              navigation={navigation}
              placeName={item?.placeName}
              distance={haversine(
                item?.latitude,
                item?.longitude,
                latitude,
                longitude,
              )}
              id={item?.idPlace}
            />
          )}
          data={data}
          ItemSeparatorComponent={() => <View style={{width: 5}} />}
          ListHeaderComponent={() => (
            <Box gap={5} paddingY={10}>
              <UserDetails />
              <SearchBar navigation={navigation} />
            </Box>
          )}
        />
      </Flex>
    </>
  );
}
