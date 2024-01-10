import React from 'react';
import {Modal, View, StyleSheet} from 'react-native';
import {Spinner} from 'native-base';
import {Color} from '../../helpers/constatn';

const LoadingSpinner = ({visible}: any) => {
  return (
    <Modal visible={visible} transparent>
      <View style={styles.modalContainer}>
        <Spinner color={Color.main} size="lg" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default LoadingSpinner;
