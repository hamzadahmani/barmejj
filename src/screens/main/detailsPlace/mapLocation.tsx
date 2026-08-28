import React from 'react';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import {Color} from '../../../helpers/constatn';
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  map: {
    height: 190,
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
      pointerEvents="none"
      showsCompass={false}
      customMapStyle={mapStyle}
      scrollEnabled={false}
      zoomEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      toolbarEnabled={false}
      zoomControlEnabled={false}
      showsMyLocationButton={false}
      followsUserLocation={false}
      provider={PROVIDER_GOOGLE}
      loadingEnabled={true}
      loadingIndicatorColor={Color.main}
      tintColor={Color.main}
      showsPointsOfInterests={false}
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
