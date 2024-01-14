import React, {useContext, useState} from 'react';
import {VStack, Divider, Text, Button} from 'native-base';
import {TouchableOpacity} from 'react-native';
import {Color} from '../../../../helpers/constatn';
import {AuthContext} from '../../../../routes/auth/authProvider';
import DeleteAccountScreen from './deleteAccount';

function SettingsScreen() {
  const {logout} = useContext(AuthContext) || {};
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <VStack p={5} space={6} w="100%" backgroundColor={'#fff'} h={'100%'}>
      <TouchableOpacity>
        <Text
          fontFamily={'Poppins'}
          color={'#15141F'}
          fontWeight={500}
          fontSize={16}>
          termes et conditions
        </Text>
      </TouchableOpacity>
      <Divider />
      <TouchableOpacity>
        <Text
          fontFamily={'Poppins'}
          color={'#15141F'}
          fontWeight={500}
          fontSize={16}>
          politique
        </Text>
      </TouchableOpacity>
      <Divider />
      <TouchableOpacity>
        <Text
          fontFamily={'Poppins'}
          color={'#a83258'}
          fontWeight={500}
          fontSize={16}
          onPress={toggleModal}>
          Supprimer mon compte
        </Text>
      </TouchableOpacity>
      <Divider />

      <Button
        borderRadius={'5px'}
        mt={5}
        backgroundColor={'#F3F0FF'}
        _text={{color: Color.main}}
        onPress={() => logout()}>
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
