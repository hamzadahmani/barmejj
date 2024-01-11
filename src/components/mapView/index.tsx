import React, { useRef } from 'react';
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT, Marker } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import useGeolocation from '../../hooks/useLocation';
import CustomSwipeModal, { CustomSwipeModalRef } from '../swipeModal';
import { Color } from '../../helpers/constatn';
import { useQuery } from '@tanstack/react-query';
import { getPlaceNearMeAPI } from '../../services/place';
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: Dimensions.get('screen').height,
    width: Dimensions.get('screen').width,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

const MapScreen = ({ navigation }: any) => {
  const { position } = useGeolocation();

  const { isLoading, data: ListMarker } = useQuery(
    [
      'getPlacesNearMe',
      {
        latitude: position?.coords.latitude,
        longitude: position?.coords.longitude,
      },
    ],
    getPlaceNearMeAPI,

    {
      enabled: !!(position?.coords.latitude && position?.coords.longitude),
    },
  );

  const modalRef = useRef<CustomSwipeModalRef | null>(null); // Create a ref with the appropriate type

  const mapStyle = [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ];

  return (
    <View style={styles.container}>
      {!isLoading && position?.coords.latitude && (
        <MapView
          showsCompass={true}
          customMapStyle={mapStyle}
          scrollEnabled={true}
          zoomEnabled={true}
          showsUserLocation={true}
          showsMyLocationButton={true}
          followsUserLocation={true}
          provider={
            PROVIDER_GOOGLE
          }
          loadingEnabled={true}
          loadingIndicatorColor={Color.main}
          tintColor={Color.main}
          style={styles.map}
          showsPointsOfInterest={false}
          showsBuildings={false}
          region={{
            latitude: position?.coords.latitude ?? 37.78825,
            longitude: position?.coords.longitude ?? -122.4324,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}>
          {ListMarker?.map(el => (
            <Marker
              onPress={() => modalRef.current?.showModal()}
              key={1}
              coordinate={{ latitude: el.latitude, longitude: el.longitude }}
              title={el.placeName}
              pinColor={Color.main}
            />
          ))}
        </MapView>
      )}
      <CustomSwipeModal
        ref={modalRef}
        navigation={navigation}
        coordinate={{ latitude: 36.7633107, longitude: 10.2003265 }}
      />
    </View>
  );
};

export default MapScreen;
