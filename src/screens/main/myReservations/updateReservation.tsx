import {useMutation, useQuery} from '@tanstack/react-query';
import {
  Box,
  Button,
  Divider,
  Flex,
  Image,
  Pressable,
  ScrollView,
  Text,
  useToast,
} from 'native-base';
import React from 'react';
import {Alert} from 'react-native';
import LoadingSpinner from '../../../components/Loader';
import Toast from '../../../components/toast';
import {Color} from '../../../helpers/constatn';
import {
  acceptReservationProposalAPI,
  cancelReservationAPI,
  declineReservationProposalAPI,
  getReservationsById,
} from '../../../services/reservation';

const statusLabel: Record<string, string> = {
  PENDING: 'En attente',
  PROPOSED: 'Nouvel horaire proposé',
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
  DECLINED: 'Refusée',
  COMPLETED: 'Terminée',
  NO_SHOW: 'Client absent',
};

export default function ReservationDetailsScreen({route, navigation}: any) {
  const {id} = route.params;
  const toast = useToast();
  const {data: reservation, isLoading, refetch} = useQuery(
    ['getReservationsById', {id}],
    getReservationsById,
  );
  const {mutate: cancelReservation, isLoading: deleteLoading} = useMutation(
    (reason?: string) => cancelReservationAPI(id, reason),
    {
      onSuccess: () => {
        toast.show({
          placement: 'top',
          render: () => (
            <Toast
              message="Réservation annulée avec succès"
              status={Color.success}
            />
          ),
        });
        navigation.goBack();
      },
    },
  );
  const proposal = useMutation((action: 'accept' | 'decline') => action === 'accept' ? acceptReservationProposalAPI(id) : declineReservationProposalAPI(id, 'Horaire non adapté'), {onSuccess: () => {toast.show({placement: 'top', render: () => <Toast message="Votre réponse a été enregistrée" status={Color.success}/>}); refetch();}});

  const confirmCancel = () => {
    Alert.alert(
      'Annuler la réservation',
      'La réservation sera conservée dans votre historique avec le statut « Annulée ».',
      [{text: 'Retour', style: 'cancel'}, {text: 'Changement de programme', onPress: () => cancelReservation('Changement de programme')}, {text: 'Problème avec l’horaire', onPress: () => cancelReservation('Problème avec l’horaire')}, {text: 'Autre raison', style: 'destructive', onPress: () => cancelReservation('Autre raison')}],
    );
  };

  return (
    <ScrollView
      backgroundColor={Color.background}
      paddingX={5}
      contentContainerStyle={{paddingBottom: 100}}>
      <LoadingSpinner visible={isLoading || deleteLoading} />
      <Box pt={8} pb={5}>
        <Pressable onPress={() => navigation.goBack()} mb={5}>
          <Text color={Color.muted} fontSize="sm" fontWeight={700}>
            ‹ Retour
          </Text>
        </Pressable>
        <Text
          color={Color.main}
          fontSize={11}
          fontWeight={800}
          letterSpacing={2}>
          VOTRE SORTIE
        </Text>
        <Text
          color={Color.text}
          fontSize={30}
          lineHeight={38}
          fontWeight={800}
          mt={2}>
          Détails de la réservation
        </Text>
        <Text color={Color.muted} fontSize={14} mt={1}>
          Retrouvez les informations de votre sortie
        </Text>
      </Box>
      {reservation && (
        <>
          <Box bg="white" borderRadius={20} overflow="hidden" shadow={1} mb={4}>
            {reservation.image && (
              <Image
                source={{uri: reservation.image}}
                alt={reservation.placeName ?? 'Établissement'}
                height={210}
                width="100%"
                resizeMode="cover"
              />
            )}
            <Box p={5}>
              <Text color={Color.text} fontSize={22} fontWeight={800}>
                {reservation.placeName}
              </Text>
              <Text color={Color.muted} mt={1}>
                {reservation.subTitle}
              </Text>
              <Text color={Color.muted} fontSize={12} mt={2}>
                {reservation.placeAddress || 'Adresse indisponible'}
              </Text>
              <Text
                alignSelf="flex-start"
                bg={Color.mainLight}
                color={Color.main}
                px={3}
                py={1}
                mt={4}
                borderRadius={20}
                fontSize={12}
                fontWeight={700}>
                {statusLabel[reservation.status] ?? reservation.status}
              </Text>
            </Box>
          </Box>
          <Box bg="white" borderRadius={20} p={5} shadow={1}>
            <Text color={Color.text} fontSize={17} fontWeight={800} mb={4}>
              Informations de la réservation
            </Text>
            <Flex flexDirection="row" justifyContent="space-between" mb={3}>
              <Text color={Color.muted}>Date</Text>
              <Text color={Color.text} fontWeight={700}>
                {reservation.reservationDate}
              </Text>
            </Flex>
            <Flex flexDirection="row" justifyContent="space-between" mb={3}>
              <Text color={Color.muted}>Heure</Text>
              <Text color={Color.text} fontWeight={700}>
                {reservation.reservationTime?.substring(0, 5)}
              </Text>
            </Flex>
            <Flex flexDirection="row" justifyContent="space-between" mb={3}>
              <Text color={Color.muted}>Nombre d’invités</Text>
              <Text color={Color.text} fontWeight={700}>
                {reservation.numberOfPersons}
              </Text>
            </Flex>
            <Divider my={2} />
            <Text color={Color.muted} mb={1}>
              Note
            </Text>
            <Text color={Color.text}>
              {reservation.message || 'Aucune demande particulière'}
            </Text>
          </Box>
          {reservation.status === 'PROPOSED' && <Box mt={4} bg="#FFF7E8" borderWidth={1} borderColor="#F3C978" borderRadius={20} p={5}>
            <Text color="#8A5510" fontSize={11} fontWeight={800} letterSpacing={1.5}>PROPOSITION DE L’ÉTABLISSEMENT</Text>
            <Text color={Color.text} fontSize={21} fontWeight={800} mt={2}>{reservation.proposedDate} · {reservation.proposedTime?.slice(0,5)}</Text>
            {reservation.proposalMessage ? <Text color={Color.muted} mt={2}>{reservation.proposalMessage}</Text> : null}
            <Flex direction="row" mt={4} justifyContent="space-between"><Button width="47%" variant="outline" borderColor="#D92D20" _text={{color:'#D92D20',fontWeight:700}} onPress={() => proposal.mutate('decline')}>Refuser</Button><Button width="49%" bg={Color.main} _text={{fontWeight:700}} onPress={() => proposal.mutate('accept')}>Accepter</Button></Flex>
          </Box>}
          <Button
            height={54}
            borderRadius={16}
            mt={5}
            backgroundColor={Color.main}
            _text={{fontWeight: '700'}}
            onPress={() => navigation.navigate('ReservationTicket', {reservation})}>
            Afficher mon e-ticket
          </Button>
          {['PENDING', 'PROPOSED', 'CONFIRMED'].includes(reservation.status) && <Button
            height={54}
            borderRadius={16}
            mt={5}
            backgroundColor="#D92D20"
            _text={{fontWeight: '700'}}
            onPress={confirmCancel}>
            Annuler la réservation
          </Button>}
        </>
      )}
    </ScrollView>
  );
}
