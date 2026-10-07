import {queryKeys, mutationEffects} from '../../../query/keys';
import {keepPreviousData} from '@tanstack/react-query';
import {useMutation, useQuery} from '@tanstack/react-query';
import {Box, Button, HStack, Input, ScrollView, Text} from 'native-base';
import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingSpinner from '../../../components/Loader';
import CommunityHeader from '../../../components/communityHeader';
import {Color} from '../../../helpers/constatn';
import {
  createGroupPlanAPI,
  finalizeGroupPlanAPI,
  getGroupPlansAPI,
  voteGroupOptionAPI,
} from '../../../services/community';
import {
  getFeaturedPlacesAPI,
  searchPlacesCatalogAPI,
} from '../../../services/place';
import {useAuth} from '../../../routes/auth/authProvider';
import VectorIcon from '../../../components/vectorIcon';

const defaultDate = () =>
  new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
export default function GroupPlannerScreen({navigation}: any) {
  const {userInfo} = useAuth();
  const {data: places = []} = useQuery({
    queryKey: queryKeys.featuredPlaces,
    queryFn: getFeaturedPlacesAPI,
  });
  const {data: plans = [], isLoading} = useQuery({
    queryKey: queryKeys.groupPlans,
    queryFn: getGroupPlansAPI,
  });
  const [title, setTitle] = useState('Sortie entre amis');
  const [emails, setEmails] = useState('');
  const [savedFriends, setSavedFriends] = useState<string[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [placePickerOpen, setPlacePickerOpen] = useState(false);
  const [placeSearch, setPlaceSearch] = useState('');
  const [date, setDate] = useState(defaultDate());
  const [time, setTime] = useState('20:00');
  const [selected, setSelected] = useState<number[]>([]);
  const {data: catalogPlaces = [], isFetching: catalogLoading} = useQuery({
    queryKey: [...queryKeys.groupPlaceCatalog, placeSearch],
    queryFn: () => searchPlacesCatalogAPI(placeSearch),
    enabled: placePickerOpen,
    placeholderData: keepPreviousData,
  });
  const inviteCount = selectedFriends.length;
  const options = useMemo(
    () =>
      selected.map(placeId => ({
        placeId,
        reservationDate: date,
        reservationTime: time,
      })),
    [selected, date, time],
  );
  const {mutate: create, isPending: creating} = useMutation({
    meta: mutationEffects.groupPlan,
    mutationFn: createGroupPlanAPI,
  });
  const {mutate: vote} = useMutation({
    meta: mutationEffects.groupPlan,
    mutationFn: voteGroupOptionAPI,
  });
  const {mutate: finalize} = useMutation({
    meta: mutationEffects.reservation,
    mutationFn: finalizeGroupPlanAPI,
  });
  const toggle = (id: number) =>
    setSelected(current =>
      current.includes(id)
        ? current.filter(value => value !== id)
        : current.length < 4
        ? [...current, id]
        : current,
    );
  const contactsKey = `barmej-group-friends-${userInfo?.idUser ?? 'guest'}`;
  useEffect(() => {
    AsyncStorage.getItem(contactsKey)
      .then(value => {
        if (value) setSavedFriends(JSON.parse(value));
      })
      .catch(() => undefined);
  }, [contactsKey]);
  const addFriend = async () => {
    const email = emails.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('Email invalide', 'Saisissez une adresse email valide.');
      return;
    }
    const next = [...new Set([...savedFriends, email])];
    setSavedFriends(next);
    setSelectedFriends(current => [...new Set([...current, email])]);
    setEmails('');
    await AsyncStorage.setItem(contactsKey, JSON.stringify(next));
  };
  const toggleFriend = (email: string) =>
    setSelectedFriends(current =>
      current.includes(email)
        ? current.filter(value => value !== email)
        : [...current, email],
    );
  const removeFriend = async (email: string) => {
    const next = savedFriends.filter(value => value !== email);
    setSavedFriends(next);
    setSelectedFriends(current => current.filter(value => value !== email));
    await AsyncStorage.setItem(contactsKey, JSON.stringify(next));
  };
  const selectedPlaces = places
    .concat(catalogPlaces)
    .filter(
      (place: any, index: number, array: any[]) =>
        selected.includes(place.idPlace) &&
        array.findIndex(item => item.idPlace === place.idPlace) === index,
    );

  return (
    <>
      <ScrollView
        bg={Color.background}
        px={5}
        contentContainerStyle={layoutStyles.style1}>
        <LoadingSpinner visible={isLoading || creating} />
        <CommunityHeader
          title="Planifier en groupe"
          subtitle="Invitez vos amis, proposez plusieurs restaurants et votez ensemble."
          eyebrow="CHOISISSEZ ENSEMBLE"
          onBack={() => navigation.goBack()}
        />
        <Box
          bg="white"
          p={4}
          borderRadius={28}
          borderWidth={1}
          borderColor={Color.border}
          mb={5}
          shadow={1}>
          <View style={styles.formHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>01</Text>
              <Text style={styles.stepLabel}>SUR 2</Text>
            </View>
            <View style={styles.grow}>
              <Text style={styles.formTitle}>Imaginez votre sortie</Text>
              <Text style={styles.formSubtitle}>
                Les détails essentiels, puis votre sélection
              </Text>
            </View>
          </View>
          <View style={styles.formProgress}>
            <View style={styles.formProgressFill} />
          </View>
          <View style={styles.fieldBlock}>
            <View style={styles.fieldHeading}>
              <View style={styles.fieldIcon}>
                <Text style={styles.fieldIconText}>✦</Text>
              </View>
              <View>
                <Text style={styles.fieldLabel}>Nom de la sortie</Text>
                <Text style={styles.fieldHint}>
                  Un titre simple que vos amis reconnaîtront
                </Text>
              </View>
            </View>
            <Input
              style={styles.nativeInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Ex. Dîner entre amis"
              bg="#F8F6FC"
              borderWidth={1.5}
              borderColor="#ECE8F4"
              borderRadius={17}
              px={4}
              py={0}
              fontSize={14}
              fontWeight={700}
              color={Color.text}
              placeholderTextColor="#9B95A3"
              _focus={{borderColor: Color.main, bg: 'white'}}
            />
          </View>
          <View style={styles.fieldBlock}>
            <View style={styles.fieldHeading}>
              <View style={styles.fieldIcon}>
                <Text style={styles.fieldIconText}>@</Text>
              </View>
              <View style={styles.grow}>
                <Text style={styles.fieldLabel}>Votre carnet d’invités</Text>
                <Text style={styles.fieldHint}>
                  Ajoutez une fois, réutilisez à chaque sortie
                </Text>
              </View>
              {inviteCount ? (
                <View style={styles.inviteCount}>
                  <Text style={styles.inviteCountText}>{inviteCount}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.addFriendRow}>
              <Box flex={1}>
                <Input
                  style={styles.nativeInput}
                  value={emails}
                  onChangeText={setEmails}
                  onSubmitEditing={addFriend}
                  placeholder="ami@email.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="done"
                  bg="#F8F6FC"
                  borderWidth={1.5}
                  borderColor="#ECE8F4"
                  borderRadius={17}
                  px={4}
                  py={0}
                  fontSize={13}
                  color={Color.text}
                  placeholderTextColor="#9B95A3"
                  _focus={{borderColor: Color.main, bg: 'white'}}
                />
              </Box>
              <Pressable onPress={addFriend} style={styles.addFriendButton}>
                <Text style={styles.addFriendButtonText}>＋</Text>
              </Pressable>
            </View>
            {savedFriends.length ? (
              <View style={styles.friendList}>
                {savedFriends.map(email => {
                  const active = selectedFriends.includes(email);
                  return (
                    <View
                      key={email}
                      style={[
                        styles.friendChip,
                        active && styles.friendChipActive,
                      ]}>
                      <Pressable
                        onPress={() => toggleFriend(email)}
                        style={styles.friendMain}>
                        <View
                          style={[
                            styles.friendAvatar,
                            active && styles.friendAvatarActive,
                          ]}>
                          <Text
                            style={[
                              styles.friendAvatarText,
                              active && styles.friendAvatarTextActive,
                            ]}>
                            {active ? '✓' : email[0].toUpperCase()}
                          </Text>
                        </View>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.friendEmail,
                            active && styles.friendEmailActive,
                          ]}>
                          {email}
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityLabel={`Supprimer ${email}`}
                        onPress={() => removeFriend(email)}
                        style={styles.friendRemove}>
                        <Text style={styles.friendRemoveText}>×</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyFriends}>
                <Text style={styles.emptyFriendsText}>
                  Votre carnet est vide. Ajoutez votre premier ami.
                </Text>
              </View>
            )}
          </View>
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleField}>
              <View style={styles.miniHeading}>
                <Text style={styles.miniIcon}>▣</Text>
                <Text style={styles.fieldLabel}>Date</Text>
              </View>
              <Input
                style={styles.nativeInput}
                value={date}
                onChangeText={setDate}
                placeholder="AAAA-MM-JJ"
                bg="#F8F6FC"
                borderWidth={1.5}
                borderColor="#ECE8F4"
                borderRadius={17}
                px={4}
                py={0}
                fontWeight={700}
                color={Color.text}
                placeholderTextColor="#9B95A3"
                _focus={{borderColor: Color.main, bg: 'white'}}
              />
            </View>
            <View style={styles.timeField}>
              <View style={styles.miniHeading}>
                <Text style={styles.miniIcon}>◷</Text>
                <Text style={styles.fieldLabel}>Heure</Text>
              </View>
              <Input
                style={styles.nativeInput}
                value={time}
                onChangeText={setTime}
                placeholder="20:00"
                bg="#F8F6FC"
                borderWidth={1.5}
                borderColor="#ECE8F4"
                borderRadius={17}
                px={4}
                py={0}
                fontWeight={700}
                color={Color.text}
                placeholderTextColor="#9B95A3"
                _focus={{borderColor: Color.main, bg: 'white'}}
              />
            </View>
          </View>
          <View style={styles.selectionHeading}>
            <View>
              <Text style={styles.selectionEyebrow}>ÉTAPE SUIVANTE</Text>
              <Text style={styles.selectionTitle}>
                Choisissez 2 à 4 adresses
              </Text>
            </View>
            <View
              style={[
                styles.selectionCount,
                selected.length >= 2 && styles.selectionCountReady,
              ]}>
              <Text
                style={[
                  styles.selectionCountText,
                  selected.length >= 2 && styles.selectionCountTextReady,
                ]}>
                {selected.length}/4
              </Text>
            </View>
          </View>
          {selectedPlaces.length ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.placePicker}>
              {selectedPlaces.map((p: any) => (
                <Pressable
                  key={p.idPlace}
                  onPress={() => toggle(p.idPlace)}
                  style={[styles.pickCard, styles.pickCardActive]}>
                  {p.image ? (
                    <Image source={{uri: p.image}} style={styles.pickImage} />
                  ) : (
                    <View style={styles.pickFallback}>
                      <Text style={styles.pickFallbackText}>
                        {p.placeName?.[0] || 'B'}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.pickAction, styles.pickActionActive]}>
                    <Text
                      style={[
                        styles.pickActionText,
                        styles.pickActionTextActive,
                      ]}>
                      ×
                    </Text>
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[styles.pickName, styles.pickNameActive]}>
                    {p.placeName}
                  </Text>
                  <Text numberOfLines={1} style={styles.pickSubtitle}>
                    {p.subTitle || 'Adresse Barmej'}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
          <Pressable
            onPress={() => setPlacePickerOpen(true)}
            style={styles.openCatalog}>
            <View style={styles.openCatalogIcon}>
              <Text style={styles.openCatalogIconText}>⌕</Text>
            </View>
            <View style={styles.grow}>
              <Text style={styles.openCatalogTitle}>
                {selected.length
                  ? 'Ajouter une autre adresse'
                  : 'Rechercher des établissements'}
              </Text>
              <Text style={styles.openCatalogText}>
                Parcourez tout le catalogue Barmej
              </Text>
            </View>
            <Text style={styles.openCatalogArrow}>›</Text>
          </Pressable>
          <View style={styles.voteNote}>
            <View style={styles.voteNoteIcon}>
              <Text style={styles.voteNoteIconText}>✓</Text>
            </View>
            <Text style={styles.voteNoteText}>
              Chaque invité pourra voter pour plusieurs adresses.
            </Text>
          </View>
          <Button
            mt={5}
            minHeight={13}
            py={3.5}
            borderRadius={19}
            bg={Color.main}
            _pressed={{bg: '#33264D'}}
            _disabled={{bg: '#D5D0E2', opacity: 1}}
            _text={{color: '#FFFFFF', fontSize: 15, fontWeight: 800}}
            isLoading={creating}
            isLoadingText="Création en cours…"
            spinnerPlacement="end"
            isDisabled={options.length < 2 || !title.trim()}
            onPress={() =>
              create({title, inviteEmails: selectedFriends, options})
            }>
            {selected.length < 2
              ? 'Sélectionnez au moins 2 adresses'
              : 'Créer le vote de groupe  →'}
          </Button>
        </Box>
        <HStack justifyContent="space-between" alignItems="flex-end" mb={3}>
          <Box>
            <Text color={Color.text} fontSize={24} fontWeight={900}>
              Vos plans
            </Text>
            <Text color={Color.muted} fontSize={11} mt={1}>
              Suivez les votes de votre groupe
            </Text>
          </Box>
          <Box bg={Color.mainLight} px={3} py={2} borderRadius={12}>
            <Text color={Color.main} fontSize={11} fontWeight={900}>
              {plans.length}
            </Text>
          </Box>
        </HStack>
        {plans.map((plan: any) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            userId={Number(userInfo?.idUser)}
            isOrganizer={Number(plan.organizerId) === Number(userInfo?.idUser)}
            onVote={vote}
            onFinalize={finalize}
          />
        ))}
        {!plans.length && (
          <Box
            bg="white"
            borderWidth={1}
            borderColor={Color.border}
            borderRadius={20}
            p={6}
            alignItems="center">
            <View style={styles.emptyVectorIcon}>
              <VectorIcon name="ticket" size={28} color={Color.main} />
            </View>
            <Text color={Color.text} fontWeight={800} textAlign="center" mt={2}>
              Aucun vote pour le moment
            </Text>
            <Text color={Color.muted} textAlign="center" mt={2}>
              Créez votre premier plan et laissez le groupe choisir.
            </Text>
          </Box>
        )}
      </ScrollView>
      <Modal
        visible={placePickerOpen}
        animationType="slide"
        onRequestClose={() => setPlacePickerOpen(false)}>
        <View style={styles.catalogScreen}>
          <View style={styles.catalogHeader}>
            <Pressable
              onPress={() => setPlacePickerOpen(false)}
              style={styles.catalogClose}>
              <Text style={styles.catalogCloseText}>‹</Text>
            </Pressable>
            <View style={styles.grow}>
              <Text style={styles.catalogTitle}>Choisir des adresses</Text>
              <Text style={styles.catalogSubtitle}>
                {selected.length}/4 sélectionnées
              </Text>
            </View>
            <Pressable
              onPress={() => setPlacePickerOpen(false)}
              style={styles.catalogDone}>
              <Text style={styles.catalogDoneText}>Terminer</Text>
            </Pressable>
          </View>
          <Input
            style={styles.nativeInput}
            value={placeSearch}
            onChangeText={setPlaceSearch}
            placeholder="Nom, cuisine ou adresse…"
            bg="white"
            borderWidth={1.5}
            borderColor="#E4DDEC"
            borderRadius={18}
            mx={4}
            mt={3}
            px={4}
            py={0}
            color={Color.text}
            placeholderTextColor="#9B95A3"
            _focus={{borderColor: Color.main, bg: 'white'}}
          />
          <FlatList
            data={catalogPlaces}
            keyExtractor={(item: any) => String(item.idPlace)}
            contentContainerStyle={styles.catalogList}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.catalogEmpty}>
                <Text style={styles.catalogEmptyTitle}>
                  {catalogLoading ? 'Recherche…' : 'Aucun établissement trouvé'}
                </Text>
                <Text style={styles.catalogEmptyText}>
                  Essayez un autre nom, type de cuisine ou quartier.
                </Text>
              </View>
            }
            renderItem={({item}: any) => {
              const active = selected.includes(item.idPlace);
              const disabled = !active && selected.length >= 4;
              return (
                <Pressable
                  disabled={disabled}
                  onPress={() => toggle(item.idPlace)}
                  style={[
                    styles.catalogItem,
                    active && styles.catalogItemActive,
                    disabled && styles.catalogItemDisabled,
                  ]}>
                  {item.image ? (
                    <Image
                      source={{uri: item.image}}
                      style={styles.catalogImage}
                    />
                  ) : (
                    <View style={styles.catalogFallback}>
                      <Text style={styles.catalogFallbackText}>
                        {item.placeName?.[0] || 'B'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.grow}>
                    <Text style={styles.catalogName}>{item.placeName}</Text>
                    <Text numberOfLines={1} style={styles.catalogMeta}>
                      {item.subTitle || item.placeAdress || 'Adresse Barmej'}
                    </Text>
                    {item.cuisineType ? (
                      <Text style={styles.catalogCuisine}>
                        {item.cuisineType}
                      </Text>
                    ) : null}
                  </View>
                  <View
                    style={[
                      styles.catalogCheck,
                      active && styles.catalogCheckActive,
                    ]}>
                    <Text
                      style={[
                        styles.catalogCheckText,
                        active && styles.catalogCheckTextActive,
                      ]}>
                      {active ? '✓' : '＋'}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </>
  );
}

function PlanCard({
  plan,
  userId,
  isOrganizer,
  onVote,
  onFinalize,
}: {
  plan: any;
  userId: number;
  isOrganizer: boolean;
  onVote: (id: number) => void;
  onFinalize: (id: number) => void;
}) {
  const open = plan.status === 'VOTING';
  const counts = plan.options.map(
    (option: any) => option._count?.votes ?? option.votes?.length ?? 0,
  );
  const total = counts.reduce((sum: number, value: number) => sum + value, 0);
  const best = Math.max(0, ...counts);
  const first = plan.options[0];
  const date = first?.reservationDate
    ? new Date(first.reservationDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      })
    : null;
  return (
    <View style={styles.planCard}>
      <View style={styles.planTop}>
        <View style={styles.planIcon}>
          <Text style={styles.planIconText}>✦</Text>
        </View>
        <View style={styles.grow}>
          <Text style={styles.planTitle}>{plan.title}</Text>
          <Text style={styles.planMeta}>
            {date ? `${date} · ${first.reservationTime?.slice(0, 5)} · ` : ''}
            {plan.options.length} adresses
          </Text>
        </View>
        <View
          style={[styles.status, open ? styles.statusOpen : styles.statusDone]}>
          <View
            style={[styles.statusDot, open ? styles.dotOpen : styles.dotDone]}
          />
          <Text
            style={[
              styles.statusText,
              open ? styles.statusTextOpen : styles.statusTextDone,
            ]}>
            {open ? 'EN COURS' : 'FINALISÉ'}
          </Text>
        </View>
      </View>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {total} vote{total === 1 ? '' : 's'} enregistré
          {total === 1 ? '' : 's'}
        </Text>
        <Text style={styles.summaryHint}>
          {open ? 'Touchez une adresse pour voter' : 'Le choix du groupe'}
        </Text>
      </View>
      <View style={styles.options}>
        {plan.options.map((option: any, index: number) => {
          const count = counts[index];
          const selectedByMe = option.votes?.some(
            (item: any) => Number(item.userId) === userId,
          );
          const winner =
            (!open && plan.selectedOptionId === option.id) ||
            (open && total > 0 && count === best);
          const progress = total
            ? Math.max(8, Math.round((count / total) * 100))
            : 0;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="checkbox"
              accessibilityState={{checked: selectedByMe, disabled: !open}}
              disabled={!open}
              onPress={() => onVote(option.id)}
              style={({pressed}) => [
                styles.option,
                winner && styles.optionWinner,
                selectedByMe && styles.optionSelected,
                pressed && open && styles.optionPressed,
              ]}>
              {option.place?.image ? (
                <Image
                  source={{uri: option.place.image}}
                  style={styles.optionImage}
                />
              ) : (
                <View style={styles.optionFallback}>
                  <Text style={styles.optionFallbackText}>
                    {option.place?.name?.[0] || 'B'}
                  </Text>
                </View>
              )}
              <View style={styles.optionBody}>
                <View style={styles.optionLine}>
                  <View style={styles.grow}>
                    <Text numberOfLines={1} style={styles.optionName}>
                      {option.place?.name || 'Établissement'}
                    </Text>
                    <Text numberOfLines={1} style={styles.optionSub}>
                      {option.place?.subtitle ||
                        option.place?.address ||
                        'Adresse Barmej'}
                    </Text>
                  </View>
                  {winner ? (
                    <View style={styles.leader}>
                      <Text style={styles.leaderText}>
                        {open ? 'EN TÊTE' : 'CHOISI'}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.voteLine}>
                  <View style={styles.track}>
                    <View style={[styles.fill, {width: `${progress}%`}]} />
                  </View>
                  <Text style={styles.voteCount}>
                    {count} vote{count === 1 ? '' : 's'}
                  </Text>
                </View>
              </View>
              {open ? (
                <View
                  style={[
                    styles.voteButton,
                    selectedByMe && styles.voteButtonSelected,
                  ]}>
                  <Text
                    style={[
                      styles.voteButtonText,
                      selectedByMe && styles.voteButtonTextSelected,
                    ]}>
                    {selectedByMe ? '✓' : '＋'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.doneCheck}>{winner ? '✓' : ''}</Text>
              )}
            </Pressable>
          );
        })}
      </View>
      {open && isOrganizer ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => onFinalize(plan.id)}
          style={styles.finalize}>
          <View>
            <Text style={styles.finalizeText}>Finaliser le choix</Text>
            <Text style={styles.finalizeHint}>
              {total
                ? 'Confirmer l’adresse en tête'
                : 'Vous pouvez finaliser même sans vote'}
            </Text>
          </View>
          <Text style={styles.finalizeArrow}>→</Text>
        </Pressable>
      ) : open ? (
        <View style={styles.waiting}>
          <View style={styles.waitingIcon}>
            <Text style={styles.waitingIconText}>⌛</Text>
          </View>
          <View style={styles.grow}>
            <Text style={styles.waitingTitle}>Décision de l’organisateur</Text>
            <Text style={styles.waitingText}>
              Vous pouvez encore voter. Seul l’organisateur finalisera le choix.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.finished}>
          <Text style={styles.finishedIcon}>✓</Text>
          <Text style={styles.finishedText}>
            Le choix du groupe est confirmé
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyVectorIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#F1ECF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingTop: 2,
  },
  stepBadge: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#EFE9FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumber: {fontSize: 16, fontWeight: '900', color: Color.main},
  stepLabel: {
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#887E94',
    marginTop: 1,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Color.text,
    letterSpacing: -0.3,
  },
  formSubtitle: {fontSize: 10, color: Color.muted, marginTop: 4},
  formProgress: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#EEE9F2',
    overflow: 'hidden',
    marginTop: 17,
    marginBottom: 5,
  },
  formProgressFill: {
    width: '50%',
    height: 5,
    borderRadius: 3,
    backgroundColor: Color.main,
  },
  fieldBlock: {marginTop: 18},
  fieldHeading: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#F2EDF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  fieldIconText: {fontSize: 12, fontWeight: '900', color: Color.main},
  fieldLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: Color.text,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
  },
  fieldHint: {fontSize: 8, color: Color.muted, marginTop: 2},
  nativeInput: {
    height: 56,
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: 'center',
  },
  addFriendRow: {flexDirection: 'row', alignItems: 'center', gap: 9},
  friendInput: {flex: 1},
  addFriendButton: {
    width: 56,
    height: 56,
    borderRadius: 17,
    backgroundColor: Color.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFriendButtonText: {fontSize: 23, fontWeight: '900', color: 'white'},
  inviteCount: {
    minWidth: 27,
    height: 27,
    borderRadius: 10,
    backgroundColor: Color.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteCountText: {fontSize: 10, fontWeight: '900', color: 'white'},
  friendList: {gap: 7, marginTop: 10},
  friendChip: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECE8F4',
    backgroundColor: '#FAF9FB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendChipActive: {borderColor: '#BCA9DD', backgroundColor: '#F3EFF9'},
  friendMain: {
    flex: 1,
    minHeight: 52,
    paddingLeft: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendAvatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#EAE5EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  friendAvatarActive: {backgroundColor: Color.main},
  friendAvatarText: {fontSize: 11, fontWeight: '900', color: Color.main},
  friendAvatarTextActive: {color: 'white'},
  friendEmail: {flex: 1, fontSize: 11, fontWeight: '700', color: Color.text},
  friendEmailActive: {color: Color.main},
  friendRemove: {
    width: 43,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendRemoveText: {fontSize: 21, color: Color.muted},
  emptyFriends: {
    borderRadius: 15,
    backgroundColor: '#F8F6FC',
    padding: 13,
    marginTop: 9,
  },
  emptyFriendsText: {fontSize: 9, color: Color.muted, textAlign: 'center'},
  scheduleRow: {flexDirection: 'row', gap: 11, marginTop: 18},
  scheduleField: {flex: 1},
  timeField: {width: 118},
  miniHeading: {height: 32, flexDirection: 'row', alignItems: 'center'},
  miniIcon: {
    fontSize: 14,
    fontWeight: '900',
    color: Color.main,
    marginRight: 7,
  },
  selectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 26,
    marginBottom: 12,
  },
  selectionEyebrow: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.1,
    color: Color.main,
  },
  selectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: Color.text,
    marginTop: 4,
  },
  selectionCount: {
    minWidth: 44,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#F0ECF3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionCountReady: {backgroundColor: '#E4F5EC'},
  selectionCountText: {fontSize: 11, fontWeight: '900', color: Color.muted},
  selectionCountTextReady: {color: '#19796F'},
  placePicker: {gap: 10, paddingRight: 5},
  pickCard: {
    width: 128,
    minHeight: 155,
    borderRadius: 20,
    backgroundColor: '#F9F7FA',
    borderWidth: 1.5,
    borderColor: '#E9E3ED',
    padding: 8,
    overflow: 'hidden',
  },
  pickCardActive: {backgroundColor: '#F2EDF9', borderColor: Color.main},
  pickImage: {
    width: '100%',
    height: 78,
    borderRadius: 14,
    backgroundColor: '#EAE5EF',
  },
  pickFallback: {
    width: '100%',
    height: 78,
    borderRadius: 14,
    backgroundColor: '#E9E2F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickFallbackText: {fontSize: 25, fontWeight: '900', color: Color.main},
  pickAction: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#21182E',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 2,
  },
  pickActionActive: {backgroundColor: Color.main},
  pickActionText: {fontSize: 16, fontWeight: '900', color: Color.main},
  pickActionTextActive: {fontSize: 13, color: 'white'},
  pickName: {fontSize: 12, fontWeight: '900', color: Color.text, marginTop: 10},
  pickNameActive: {color: Color.main},
  pickSubtitle: {fontSize: 8, color: Color.muted, marginTop: 3},
  openCatalog: {
    minHeight: 67,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#B8A5D7',
    backgroundColor: '#F8F5FC',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  openCatalogIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Color.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  openCatalogIconText: {fontSize: 23, fontWeight: '900', color: 'white'},
  openCatalogTitle: {fontSize: 12, fontWeight: '900', color: Color.main},
  openCatalogText: {fontSize: 8, color: Color.muted, marginTop: 3},
  openCatalogArrow: {fontSize: 25, color: Color.main},
  voteNote: {
    minHeight: 49,
    borderRadius: 16,
    backgroundColor: '#F5F1FA',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 13,
  },
  voteNoteIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  voteNoteIconText: {fontSize: 11, fontWeight: '900', color: Color.main},
  voteNoteText: {flex: 1, fontSize: 9, lineHeight: 14, color: Color.muted},
  catalogScreen: {flex: 1, backgroundColor: '#F7F5FA', paddingTop: 16},
  catalogHeader: {
    minHeight: 66,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  catalogClose: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  catalogCloseText: {fontSize: 32, lineHeight: 34, color: Color.main},
  catalogTitle: {fontSize: 20, fontWeight: '900', color: Color.text},
  catalogSubtitle: {fontSize: 9, color: Color.muted, marginTop: 3},
  catalogDone: {
    height: 42,
    borderRadius: 14,
    backgroundColor: Color.main,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catalogDoneText: {fontSize: 10, fontWeight: '900', color: 'white'},
  catalogList: {padding: 16, paddingBottom: 35, gap: 9},
  catalogItem: {
    minHeight: 88,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#E9E3EE',
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },
  catalogItemActive: {borderColor: Color.main, backgroundColor: '#F3EEF9'},
  catalogItemDisabled: {opacity: 0.42},
  catalogImage: {
    width: 68,
    height: 68,
    borderRadius: 15,
    marginRight: 11,
    backgroundColor: '#ECE7F0',
  },
  catalogFallback: {
    width: 68,
    height: 68,
    borderRadius: 15,
    marginRight: 11,
    backgroundColor: '#ECE6F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catalogFallbackText: {fontSize: 23, fontWeight: '900', color: Color.main},
  catalogName: {fontSize: 14, fontWeight: '900', color: Color.text},
  catalogMeta: {fontSize: 9, color: Color.muted, marginTop: 3},
  catalogCuisine: {
    alignSelf: 'flex-start',
    fontSize: 8,
    fontWeight: '800',
    color: Color.main,
    backgroundColor: '#EFE9FC',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginTop: 6,
  },
  catalogCheck: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#EFE9FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 7,
  },
  catalogCheckActive: {backgroundColor: Color.main},
  catalogCheckText: {fontSize: 18, fontWeight: '900', color: Color.main},
  catalogCheckTextActive: {fontSize: 14, color: 'white'},
  catalogEmpty: {padding: 35, alignItems: 'center'},
  catalogEmptyTitle: {fontSize: 16, fontWeight: '900', color: Color.text},
  catalogEmptyText: {
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    color: Color.muted,
    marginTop: 6,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 26,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAE5EF',
    shadowColor: '#241938',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 7},
    elevation: 2,
  },
  planTop: {flexDirection: 'row', alignItems: 'center'},
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EFE9FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  planIconText: {fontSize: 20, fontWeight: '900', color: Color.main},
  grow: {flex: 1},
  planTitle: {fontSize: 18, fontWeight: '900', color: Color.text},
  planMeta: {fontSize: 10, color: Color.muted, marginTop: 4},
  status: {
    height: 29,
    borderRadius: 11,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusOpen: {backgroundColor: '#FFF3DA'},
  statusDone: {backgroundColor: '#E5F6EE'},
  statusDot: {width: 6, height: 6, borderRadius: 3, marginRight: 5},
  dotOpen: {backgroundColor: '#C27B0A'},
  dotDone: {backgroundColor: '#19796F'},
  statusText: {fontSize: 8, fontWeight: '900'},
  statusTextOpen: {color: '#95600C'},
  statusTextDone: {color: '#19796F'},
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 17,
    marginBottom: 10,
  },
  summaryText: {fontSize: 11, fontWeight: '900', color: Color.text},
  summaryHint: {fontSize: 9, color: Color.muted},
  options: {gap: 9},
  option: {
    minHeight: 88,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#ECE7F0',
    backgroundColor: '#FCFBFD',
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionWinner: {borderColor: '#A992D4', backgroundColor: '#F8F5FC'},
  optionSelected: {borderColor: Color.main, backgroundColor: '#F1ECF9'},
  optionPressed: {transform: [{scale: 0.985}], opacity: 0.85},
  optionImage: {
    width: 68,
    height: 68,
    borderRadius: 15,
    backgroundColor: '#EEE8F2',
  },
  optionFallback: {
    width: 68,
    height: 68,
    borderRadius: 15,
    backgroundColor: '#EFE9FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionFallbackText: {fontSize: 24, fontWeight: '900', color: Color.main},
  optionBody: {flex: 1, marginLeft: 11},
  optionLine: {flexDirection: 'row', alignItems: 'flex-start'},
  optionName: {
    fontSize: 14,
    fontWeight: '900',
    color: Color.text,
    paddingRight: 5,
  },
  optionSub: {fontSize: 9, color: Color.muted, marginTop: 3},
  leader: {
    backgroundColor: Color.main,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
  },
  leaderText: {fontSize: 7, fontWeight: '900', color: 'white'},
  voteLine: {flexDirection: 'row', alignItems: 'center', marginTop: 12},
  track: {
    height: 6,
    flex: 1,
    borderRadius: 4,
    backgroundColor: '#EDE8F2',
    overflow: 'hidden',
  },
  fill: {height: 6, borderRadius: 4, backgroundColor: Color.main},
  voteCount: {
    width: 54,
    textAlign: 'right',
    fontSize: 9,
    fontWeight: '800',
    color: Color.main,
  },
  voteButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#EFE9FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  voteButtonSelected: {backgroundColor: Color.main},
  voteButtonText: {fontSize: 18, fontWeight: '900', color: Color.main},
  voteButtonTextSelected: {fontSize: 15, color: 'white'},
  doneCheck: {
    width: 28,
    textAlign: 'center',
    fontSize: 19,
    fontWeight: '900',
    color: '#19796F',
  },
  finalize: {
    minHeight: 66,
    borderRadius: 18,
    backgroundColor: Color.main,
    marginTop: 14,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  finalizeText: {fontSize: 14, fontWeight: '900', color: 'white'},
  finalizeHint: {fontSize: 8, color: '#DCD4EB', marginTop: 3},
  finalizeArrow: {fontSize: 23, color: 'white'},
  waiting: {
    minHeight: 67,
    borderRadius: 18,
    backgroundColor: '#F3EFF8',
    marginTop: 14,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  waitingIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  waitingIconText: {fontSize: 17},
  waitingTitle: {fontSize: 11, fontWeight: '900', color: Color.main},
  waitingText: {fontSize: 8, lineHeight: 13, color: Color.muted, marginTop: 3},
  finished: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#E7F6EF',
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishedIcon: {
    fontSize: 14,
    fontWeight: '900',
    color: '#19796F',
    marginRight: 7,
  },
  finishedText: {fontSize: 11, fontWeight: '900', color: '#19796F'},
});

const layoutStyles = {
style1: {paddingBottom: 80}
} as const;
