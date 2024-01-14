import React from 'react';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import {Color} from '../../../helpers/constatn';
import {StyleSheet, Dimensions} from 'react-native';

const styles = StyleSheet.create({
  map: {
    marginTop: 10,
    borderRadius: 90,
    height: 150,
  },
});

export default function MapPlaceLocation({
  latitude,
  longitude,
  placeName,
}: any) {
  const mapStyle = [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{visibility: 'off'}],
    },
  ];

  return (
    <MapView
      showsCompass={true}
      customMapStyle={mapStyle}
      scrollEnabled={true}
      zoomEnabled={true}
      showsMyLocationButton={true}
      followsUserLocation={true}
      provider={PROVIDER_GOOGLE}
      loadingEnabled={true}
      loadingIndicatorColor={Color.main}
      tintColor={Color.main}
      showsPointsOfInterest={false}
      showsBuildings={false}
      style={styles.map}
      region={{
        latitude: latitude ?? 37.78825,
        longitude: longitude ?? -122.4324,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      }}>
      <Marker
        coordinate={{
          latitude: latitude,
          longitude: longitude,
        }}
        title={placeName}
        pinColor={Color.main}
      />
    </MapView>
  );
}
