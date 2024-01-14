import React from 'react';
import {Button, Text, Modal, View} from 'native-base';
import {useMutation} from '@tanstack/react-query';
import {deleteAccountAPI} from '../../../../services/auth';
import LoadingSpinner from '../../../../components/Loader';

const DeleteAccountScreen = ({isModalVisible, toggleModal, logout}: any) => {
  const {mutate: updateReservationlMutate, isLoading} = useMutation(
    (data: any) => deleteAccountAPI(data),
    {
      onSuccess: () => {
        toggleModal();
        logout();
      },
      onError: () => {
        toggleModal();
      },
    },
  );

  const handleDeleteAccount = () => {
    updateReservationlMutate({});
  };

  return (
    <View>
      {<LoadingSpinner visible={isLoading} />}
      <Modal p={0} isOpen={isModalVisible} onClose={toggleModal}>
        <Modal.Content style={{width: '80%', alignSelf: 'center'}}>
          <Modal.Header>
            <Modal.CloseButton />
            <Text fontFamily={'Poppins'} fontWeight={500} fontSize={16}>
              Confirmation de la suppression
            </Text>
          </Modal.Header>
          <Modal.Body>
            <Text fontFamily={'Poppins'} fontWeight={500} fontSize={16}>
              Êtes-vous sûr de vouloir supprimer votre compte ? si oui, votre
              compte sera définitivement supprimé et vous ne pourrez plus
              l'utiliser
            </Text>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="ghost" onPress={toggleModal}>
              <Text>Annuler</Text>
            </Button>
            <Button variant="ghost" onPress={handleDeleteAccount}>
              <Text
                fontFamily={'Poppins'}
                fontWeight={500}
                fontSize={16}
                color={'#a83258'}>
                Supprimer
              </Text>
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </View>
  );
};

export default DeleteAccountScreen;
