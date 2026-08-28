import React, {useState} from 'react';
import {VStack, Text, Button, Box, ChevronRightIcon} from 'native-base';
import {TouchableOpacity} from 'react-native';
import {Color} from '../../../../helpers/constatn';
import {useAuth} from '../../../../routes/auth/authProvider';
import DeleteAccountScreen from './deleteAccount';

function SettingsScreen({navigation}: {navigation: any}) {
  const {logout} = useAuth();
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <VStack
      p={5}
      space={3}
      w="100%"
      backgroundColor={Color.background}
      h={'100%'}>
      <Text
        color={Color.main}
        fontSize={11}
        fontWeight={800}
        letterSpacing={2}
        mt={4}>
        VOTRE COMPTE
      </Text>
      <Text
        color={Color.text}
        fontSize={30}
        lineHeight={38}
        fontWeight={800}
        mb={3}>
        Paramètres
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('TermsAndConditions')}>
        <Box
          bg="white"
          p={5}
          borderRadius={16}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center">
          <Text color={Color.text} fontWeight={600} fontSize={15}>
            Termes et conditions
          </Text>
          <ChevronRightIcon />
        </Box>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('policy')}>
        <Box
          bg="white"
          p={5}
          borderRadius={16}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center">
          <Text color={Color.text} fontWeight={600} fontSize={15}>
            Politique de confidentialité
          </Text>
          <ChevronRightIcon />
        </Box>
      </TouchableOpacity>
      <TouchableOpacity>
        <Box bg="#FFF0F1" p={5} borderRadius={16}>
          <Text
            color="#B42335"
            fontWeight={600}
            fontSize={15}
            onPress={toggleModal}>
            Supprimer mon compte
          </Text>
        </Box>
      </TouchableOpacity>

      <Button
        height={52}
        borderRadius={16}
        mt={5}
        backgroundColor={Color.main}
        _text={{color: 'white'}}
        onPress={logout}>
        Déconnexion
      </Button>
      <DeleteAccountScreen
        isModalVisible={isModalVisible}
        toggleModal={toggleModal}
        logout={logout}
      />
    </VStack>
  );
}

export default SettingsScreen;
