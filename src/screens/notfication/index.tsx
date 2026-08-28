import {useMutation, useQuery} from '@tanstack/react-query';
import {Box, Flex, Pressable, Text} from 'native-base';
import React, {useCallback} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import NoNotification from '../../assets/NoNotification';
import LoadingSpinner from '../../components/Loader';
import {Color} from '../../helpers/constatn';
import {
  getNotificationsAPI,
  markAllNotificationsReadAPI,
  markNotificationReadAPI,
  syncReservationRemindersAPI,
} from '../../services/notification';

export default function NotficationScreen({navigation}: any) {
  const {data = [], isLoading, refetch} = useQuery(['notifications'], getNotificationsAPI);
  const {mutate: markRead} = useMutation((id: number) => markNotificationReadAPI(id), {onSuccess: () => refetch()});
  const {mutate: markAllRead} = useMutation(markAllNotificationsReadAPI, {onSuccess: () => refetch()});
  const unreadCount = data.filter((item: any) => !item.read).length;

  useFocusEffect(
    useCallback(() => {
      syncReservationRemindersAPI()
        .then(() => refetch())
        .catch(() => refetch());
    }, [refetch]),
  );

  return (
    <Flex bgColor={Color.background} flex={1}>
      <LoadingSpinner visible={isLoading} />
      <Flex px={5} pt={5} pb={3}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={() => navigation.goBack()}
          width={12}
          height={12}
          borderRadius={16}
          bg="white"
          borderWidth={1}
          borderColor={Color.border}
          alignItems="center"
          justifyContent="center">
          <Text color={Color.main} fontSize={30} lineHeight={32}>‹</Text>
        </Pressable>
        <Flex mt={5} direction="row" justifyContent="space-between" alignItems="flex-end">
          <Box flex={1}>
            <Text color={Color.main} fontSize={11} fontWeight={800} letterSpacing={2}>VOTRE ACTIVITÉ</Text>
            <Text color={Color.text} fontSize={30} fontWeight={800} mt={2}>Notifications</Text>
          </Box>
          {unreadCount > 0 ? (
            <Pressable onPress={() => markAllRead()} minHeight={12} justifyContent="center" pl={3}>
              <Text color={Color.main} fontSize={12} fontWeight={800}>Tout lire ({unreadCount})</Text>
            </Pressable>
          ) : null}
        </Flex>
      </Flex>
      <FlatList
        data={data}
        keyExtractor={(item: any) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({item}: any) => (
          <Pressable onPress={() => !item.read && markRead(item.id)}>
            <Box bg="white" borderRadius={18} p={4} my={2} borderLeftWidth={item.read ? 0 : 4} borderLeftColor={Color.main} shadow={1}>
              <Text color={Color.text} fontWeight={800}>{item.title}</Text>
              <Text color={Color.muted} mt={1} lineHeight={20}>{item.message}</Text>
              <Text color="#9995A3" fontSize={10} mt={3}>{new Date(item.createdAt).toLocaleString('fr-FR')}</Text>
            </Box>
          </Pressable>
        )}
        ListEmptyComponent={(
          <Flex mt={160} justifyContent="center" alignItems="center" px={8}>
            <NoNotification />
            <Text color={Color.text} textAlign="center" fontWeight={700} mt={4}>Pas de notification pour l’instant</Text>
            <Text color={Color.muted} textAlign="center" fontSize={13} mt={1}>Les mises à jour de vos réservations apparaîtront ici.</Text>
          </Flex>
        )}
      />
    </Flex>
  );
}

const styles = StyleSheet.create({
  list: {paddingHorizontal: 20, paddingBottom: 110},
});
