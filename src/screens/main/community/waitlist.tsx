import {useMutation, useQuery} from '@tanstack/react-query';
import {Box, Button, HStack, Input, ScrollView, Text, useToast} from 'native-base';
import React, {useState} from 'react';
import LoadingSpinner from '../../../components/Loader';
import Toast from '../../../components/toast';
import CommunityHeader from '../../../components/communityHeader';
import {Color} from '../../../helpers/constatn';
import {cancelWaitlistAPI, confirmWaitlistAPI, getMyWaitlistAPI, joinWaitlistAPI} from '../../../services/community';
import {getFeaturedPlacesAPI} from '../../../services/place';

const tomorrow = () => {const d = new Date(Date.now() + 86400000); return d.toISOString().slice(0, 10);};
const labels: Record<string, string> = {WAITING: 'En attente', OFFERED: 'Place disponible', CONFIRMED: 'Confirmée', EXPIRED: 'Offre expirée', CANCELLED: 'Annulée'};

export default function WaitlistScreen({navigation}: any) {
  const toast = useToast();
  const {data: places = []} = useQuery(['waitlistPlaces'], getFeaturedPlacesAPI);
  const {data: entries = [], isLoading, refetch} = useQuery(['myWaitlist'], getMyWaitlistAPI);
  const [placeId, setPlaceId] = useState<number | null>(null);
  const [date, setDate] = useState(tomorrow());
  const [time, setTime] = useState('20:00');
  const [people, setPeople] = useState('2');
  const done = () => refetch();
  const {mutate: join, isLoading: joining} = useMutation(joinWaitlistAPI, {onSuccess: () => {toast.show({render: () => <Toast message="Ajouté à la liste d’attente" status={Color.success} />}); done();}});
  const {mutate: cancel} = useMutation(cancelWaitlistAPI, {onSuccess: done});
  const {mutate: confirm} = useMutation(confirmWaitlistAPI, {onSuccess: done});

  return <ScrollView bg={Color.background} px={5} contentContainerStyle={{paddingBottom: 80}}>
    <LoadingSpinner visible={isLoading || joining} />
    <CommunityHeader title="Liste d’attente" subtitle="Recevez une offre limitée dans le temps lorsqu’une table se libère." eyebrow="NE MANQUEZ AUCUNE TABLE" onBack={() => navigation.goBack()} />
    <Box bg="white" p={5} borderRadius={24} borderWidth={1} borderColor={Color.border} mb={5}>
      <HStack alignItems="center" mb={5}><Box bg={Color.mainLight} borderRadius={12} px={3} py={2}><Text color={Color.main} fontWeight={800}>01</Text></Box><Box ml={3}><Text color={Color.text} fontSize={18} fontWeight={800}>Votre table idéale</Text><Text color={Color.muted} fontSize={12}>Nous vous prévenons dès qu’elle se libère</Text></Box></HStack>
      <Text color={Color.text} fontSize={12} fontWeight={700} mb={3}>ÉTABLISSEMENT</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>{places.slice(0, 8).map((p: any) => {const active = placeId === p.idPlace; return <Button key={p.idPlace} mr={2} px={4} size="sm" borderRadius={14} variant={active ? 'solid' : 'outline'} bg={active ? Color.main : Color.mainLight} borderColor={active ? Color.main : Color.mainLight} _text={{color: active ? 'white' : Color.main, fontWeight: 700}} onPress={() => setPlaceId(p.idPlace)}>{active ? '✓ ' : ''}{p.placeName}</Button>;})}</ScrollView>
      <HStack space={3} mt={5}><Box flex={1}><Text color={Color.text} fontSize={12} fontWeight={700} mb={2}>DATE</Text><Input value={date} onChangeText={setDate} placeholder="AAAA-MM-JJ" bg="#FAFAFC" borderColor={Color.border} borderRadius={14} h={12} /></Box><Box width={20}><Text color={Color.text} fontSize={12} fontWeight={700} mb={2}>HEURE</Text><Input value={time} onChangeText={setTime} placeholder="20:00" bg="#FAFAFC" borderColor={Color.border} borderRadius={14} h={12} /></Box><Box width={16}><Text color={Color.text} fontSize={12} fontWeight={700} mb={2}>PERS.</Text><Input keyboardType="number-pad" value={people} onChangeText={setPeople} bg="#FAFAFC" borderColor={Color.border} borderRadius={14} h={12} /></Box></HStack>
      <Button mt={5} minHeight={13} py={3.5} borderRadius={16} bg={Color.main} _pressed={{bg: '#352A61'}} _disabled={{bg: '#D5D0E2', opacity: 1}} _text={{color: '#FFFFFF', fontSize: 15, fontWeight: 800}} isLoading={joining} isLoadingText="Ajout en cours…" isDisabled={!placeId} onPress={() => placeId && join({placeId, reservationDate: date, reservationTime: time, numberOfPersons: Number(people)})}>Rejoindre la liste</Button>
    </Box>
    <HStack justifyContent="space-between" alignItems="center" mb={3}><Text color={Color.text} fontSize={21} fontWeight={800}>Mes demandes</Text><Text color={Color.muted} fontSize={12}>{entries.length} demande(s)</Text></HStack>
    {entries.map((entry: any) => <Box key={entry.id} bg="white" p={4} borderRadius={18} mb={3}>
      <Text fontWeight={800}>{entry.place?.name}</Text><Text color={Color.muted}>{entry.reservationDate?.slice(0, 10)} · {entry.reservationTime} · {entry.numberOfPersons} pers.</Text><Text color={entry.status === 'OFFERED' ? Color.success : Color.main} fontWeight={700} mt={2}>{labels[entry.status] ?? entry.status}</Text>
      {entry.status === 'OFFERED' && <Button mt={3} bg={Color.success} onPress={() => confirm(entry.id)}>Confirmer avant expiration</Button>}
      {['WAITING', 'OFFERED'].includes(entry.status) && <Button mt={2} variant="ghost" onPress={() => cancel(entry.id)}>Quitter la liste</Button>}
    </Box>)}
    {!entries.length && <Box bg="white" borderWidth={1} borderColor={Color.border} borderRadius={20} p={6}><Text fontSize={28} textAlign="center">⏳</Text><Text color={Color.text} fontWeight={800} textAlign="center" mt={2}>Aucune demande active</Text><Text color={Color.muted} textAlign="center" mt={2}>Choisissez une adresse et nous surveillerons les disponibilités.</Text></Box>}
  </ScrollView>;
}
