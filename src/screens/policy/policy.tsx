import React from 'react';
import {Text, ScrollView, Box} from 'native-base';

const PolicyScreen = () => {
  return (
    <ScrollView backgroundColor="#F8F6FC" flex={1} px={5} pt={8}>
      <Text color="#1F1B2E" fontSize={28} fontWeight={800}>
        Confidentialité
      </Text>
      <Text color="#6E6880" mt={1} mb={6}>
        Comment Barmej protège vos informations
      </Text>
      <Box bg="white" borderRadius={20} p={5} mb={10}>
        <Text color="#1F1B2E" fontSize={16} fontWeight={700} mb={3}>
          Vos données
        </Text>
        <Text color="#5F5B68" lineHeight={24}>
          Barmej utilise uniquement les informations nécessaires au
          fonctionnement de votre compte, à vos réservations et à la
          personnalisation de votre expérience. Vos données ne sont jamais
          vendues.
        </Text>
        <Text color="#1F1B2E" fontSize={16} fontWeight={700} mt={6} mb={3}>
          Localisation
        </Text>
        <Text color="#5F5B68" lineHeight={24}>
          Votre position sert à afficher les lieux proches et à calculer les
          distances. Vous pouvez désactiver cette autorisation depuis les
          réglages de votre téléphone.
        </Text>
        <Text color="#1F1B2E" fontSize={16} fontWeight={700} mt={6} mb={3}>
          Vos choix
        </Text>
        <Text color="#5F5B68" lineHeight={24}>
          Vous pouvez modifier vos informations ou supprimer définitivement
          votre compte depuis la page Paramètres.
        </Text>
      </Box>
    </ScrollView>
  );
};
export default PolicyScreen;
