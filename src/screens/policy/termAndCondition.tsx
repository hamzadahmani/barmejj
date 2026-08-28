import React from 'react';
import {Text, ScrollView, Box} from 'native-base';

const TermsAndConditionsScreen = () => {
  return (
    <ScrollView backgroundColor="#F7F7FB" flex={1} px={5} pt={8}>
      <Text color="#19152A" fontSize={28} fontWeight={800}>
        Conditions d’utilisation
      </Text>
      <Text color="#777382" mt={1} mb={6}>
        Les règles essentielles pour utiliser Barmej
      </Text>
      <Box bg="white" borderRadius={20} p={5} mb={10}>
        <Text color="#19152A" fontSize={16} fontWeight={700} mb={3}>
          Utilisation du service
        </Text>
        <Text color="#5F5B68" lineHeight={24}>
          Barmej vous permet de découvrir des établissements, gérer vos favoris
          et effectuer des demandes de réservation. Les disponibilités restent
          soumises à la confirmation de l’établissement.
        </Text>
        <Text color="#19152A" fontSize={16} fontWeight={700} mt={6} mb={3}>
          Votre compte
        </Text>
        <Text color="#5F5B68" lineHeight={24}>
          Vous êtes responsable de l’exactitude des informations fournies et de
          la confidentialité de vos identifiants.
        </Text>
        <Text color="#19152A" fontSize={16} fontWeight={700} mt={6} mb={3}>
          Respect de la communauté
        </Text>
        <Text color="#5F5B68" lineHeight={24}>
          Toute utilisation frauduleuse, abusive ou portant atteinte aux
          établissements et aux autres utilisateurs est interdite.
        </Text>
      </Box>
    </ScrollView>
  );
};
export default TermsAndConditionsScreen;
