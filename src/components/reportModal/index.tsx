// ReportModal.js
import React, {useContext, useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextArea,
  Button,
  HStack,
  useToast,
} from 'native-base';
import {Color} from '../../helpers/constatn';
import {useMutation} from '@tanstack/react-query';
import {reportAPI} from '../../services/report';
import {AuthContext} from '../../routes/auth/authProvider';
import LoadingSpinner from '../Loader';
import Toast from '../toast';

const ReportModal = ({isOpen, onClose, onSubmit, placeID}: any) => {
  const {userInfo} = useContext(AuthContext) || {};
  const toast = useToast();

  const [reportText, setReportText] = useState('');

  const {mutate: sendReportMutate, isLoading} = useMutation(
    (data: any) => reportAPI(data),
    {
      onSuccess: () => {
        onSubmit(reportText);
        // Close the modal
        onClose();
        toast.show({
          placement: 'top',
          render: () => {
            return (
              <Toast
                message={'Votre signal a été envoyé avec succès'}
                status={'#008000'}
              />
            );
          },
        });
      },
      onError: () => {
        onClose();
      },
    },
  );

  const handleInputChange = (text: string) => {
    setReportText(text);
  };

  const handleSubmit = () => {
    // Call the onSubmit prop with the report text
    sendReportMutate({
      idUser: userInfo.idUser,
      reportedId: placeID,
      note: reportText,
    });

    // Close the modal
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <View
        style={{
          margin: 3,
          padding: 10,
          backgroundColor: 'white',
          borderRadius: 8,
        }}>
        {<LoadingSpinner visible={isLoading} />}

        <Text fontFamily={'Poppins'} fontSize={16} mb={3} bold>
          Signaler un problème
        </Text>
        <Text fontFamily={'Poppins'} mb={2}>
          Aidez-nous à résoudre le problème en décrivant ce qui s'est passé :
        </Text>
        <TextArea
          style={{
            backgroundColor: '#F9F9F9',
            borderColor: Color.main,
          }}
          placeholder="Entrez votre rapport ici..."
          value={reportText}
          onChangeText={handleInputChange}
          autoCompleteType={undefined}
        />
        <HStack alignSelf={'flex-end'}>
          <Button variant="ghost" onPress={onClose}>
            <Text>Annuler</Text>
          </Button>
          <Button variant="ghost" onPress={handleSubmit}>
            <Text
              fontFamily={'Poppins'}
              fontWeight={500}
              fontSize={16}
              color={'#a83258'}>
              Envoyer le rapport
            </Text>
          </Button>
        </HStack>
      </View>
    </Modal>
  );
};

export default ReportModal;
