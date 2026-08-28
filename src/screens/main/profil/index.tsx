/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
import {
  Actionsheet,
  Avatar,
  Box,
  Button,
  ChevronDownIcon,
  Flex,
  FormControl,
  Input,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  useToast,
  View,
  WarningOutlineIcon,
} from 'native-base';
import React, {useState} from 'react';
import SvgEdit from '../../../assets/edit';
import SvgSettings from '../../../assets/Settings';
import {useForm, Controller} from 'react-hook-form';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import {Color, formList} from '../../../helpers/constatn';
import {Keyboard, Platform, Pressable, RefreshControl} from 'react-native';
import SvgPhoto from '../../../assets/Photo';
import {useMutation, useQuery} from '@tanstack/react-query';
import {getProfilAPI, updateProfilAPI} from '../../../services/profil';
import LoadingSpinner from '../../../components/Loader';
import Toast from '../../../components/toast';
import {launchImageLibrary} from 'react-native-image-picker';
import {TouchableOpacity} from 'react-native-gesture-handler';
import DatePickerForm from '../../../components/form/DatePicker';
import {getLoyaltyAccountsAPI} from '../../../services/loyalty';
type EnumInputs =
  | 'firstName'
  | 'lastName'
  | 'userMobile'
  | 'userMail'
  | 'userGender'
  | 'userPhoto'
  | 'dateOfBirth';
const schema = yup.object({
  firstName: yup.string().required('Champ obligatoire'),
  lastName: yup.string().required('Champ obligatoire'),
  userMail: yup.string().email('invalid format email'),
  userMobile: yup.string().required('Champ obligatoire'),
  userGender: yup.string().required('Champ obligatoire'),
  userPhoto: yup.string(),
  dateOfBirth: yup.string().required('Champ obligatoire'),
});

export default function Profil({navigation}: any) {
  const [editMode, setEditMode] = useState(false);
  const [genderSelectorOpen, setGenderSelectorOpen] = useState(false);
  const toast = useToast();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: {errors},
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      userMail: '',
      userMobile: '',
      userGender: '',
      userPhoto: '',
      dateOfBirth: '',
    },
  });

  const photoUri = watch('userPhoto');

  const {isLoading: getLoading, isRefetching: profileRefreshing, data: currentUser, refetch: refetchProfile} = useQuery(
    ['getUserData'],
    getProfilAPI,
    {
      onSuccess: response => {
        console.log('response', response);
        reset(response);
      },
    },
  );
  const {data: loyaltyAccounts, isRefetching: loyaltyRefreshing, refetch: refetchLoyalty} = useQuery(['loyaltyAccounts'], getLoyaltyAccountsAPI);

  const {mutate: updateProfilMutate, isLoading} = useMutation(
    (data: any) => updateProfilAPI(data),
    {
      onSuccess: () => {
        toast.show({
          placement: 'top',
          render: () => {
            return (
              <Toast
                message={'votre profil a été mis à jour avec succès'}
                status={'#008000'}
              />
            );
          },
        });
        setEditMode(false);
      },
      onError: err => {
        console.warn('data', err);
      },
    },
  );
  const onSubmit = (data: any) => {
    console.log('im in ');
    Keyboard.dismiss();
    const {
      userPwd,
      createdDate,
      userRole,
      userLatitude,
      userLongtitude,
      userMail,
      ...rest
    } = data;
    updateProfilMutate(rest);
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo'});
    result?.assets && setValue('userPhoto', result?.assets?.[0]?.uri);
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Adjust this value as needed
    >
      {<LoadingSpinner visible={isLoading || getLoading} />}

      <ScrollView
        refreshControl={<RefreshControl refreshing={profileRefreshing || loyaltyRefreshing} onRefresh={() => {void Promise.all([refetchProfile(), refetchLoyalty()]);}} colors={[Color.main]} tintColor={Color.main}/>} 
        contentContainerStyle={{
          paddingBottom: 100,
          backgroundColor: Color.background,
          paddingHorizontal: 24,
        }}>
        <Box
          justifyContent={'space-between'}
          flexDirection={'row'}
          alignItems="center"
          mt={5}
          mb={5}>
          <Text
            color={Color.main}
            fontSize={11}
            fontWeight={800}
            letterSpacing={2}>
            VOTRE ESPACE
          </Text>
          <Pressable onPress={() => navigation.navigate('MySettings')}>
            <Box bg="white" borderRadius={16} p={3} shadow={1}>
              <SvgSettings />
            </Box>
          </Pressable>
        </Box>
        <Flex
          justifyContent={'center'}
          alignItems={'center'}
          bg={Color.main}
          borderRadius={24}
          py={6}
          shadow={3}>
          <View style={{position: 'relative'}}>
            <Avatar
              bg="lightBlue.400"
              source={{
                uri:
                  photoUri ||
                  currentUser?.userPhoto ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80',
              }}
              size="2xl"
            />
            {!editMode ? (
              <TouchableOpacity
                onPress={() => {
                  setEditMode(true);
                }}>
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'white',
                    borderRadius: 50,
                    padding: 10,
                  }}>
                  <SvgEdit />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setEditMode(true);
                  pickImage();
                }}>
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'white',
                    borderRadius: 50,
                  }}>
                  <SvgPhoto />
                </View>
              </TouchableOpacity>
            )}
          </View>
          <Text
            mt={3}
            color="white"
            fontSize={20}
            fontFamily={'Inter'}
            fontWeight={700}>
            {`${currentUser?.firstName ?? '-'} ${currentUser?.lastName ?? '-'}`}
          </Text>
          <Text
            fontSize={12}
            fontFamily={'Inter'}
            fontWeight={400}
            color={'#D9D2ED'}>
            {currentUser?.userMail}
          </Text>
        </Flex>
        <Box mt={5} bg={Color.main} borderRadius={22} p={5} overflow="hidden" shadow={2}>
          <Box position="absolute" width={32} height={32} borderRadius={80} bg="rgba(255,255,255,.08)" right={-8} top={-8} />
          <Flex direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box flex={1} pr={4}>
              <Text color="#FFCA79" fontSize={10} fontWeight={900} letterSpacing={1.4}>MES AVANTAGES</Text>
              <Text color="white" fontSize={22} fontWeight={900} mt={2}>Fidélité Barmej</Text>
              <Text color="#DDD4EE" fontSize={11} mt={1}>Vos visites terminées vous rapprochent de nouvelles récompenses.</Text>
            </Box>
            <Box width={12} height={12} borderRadius={18} bg="rgba(255,255,255,.14)" alignItems="center" justifyContent="center"><Text fontSize={21}>★</Text></Box>
          </Flex>
          {(loyaltyAccounts ?? []).length ? (loyaltyAccounts ?? []).slice(0, 3).map(account => (
            <Box key={account.placeId} mt={4} bg="rgba(255,255,255,.11)" borderRadius={16} p={3}>
              <Flex direction="row" justifyContent="space-between"><Text color="white" fontWeight={800}>{account.placeName}</Text><Text color="#FFCA79" fontWeight={900}>{account.balance} pts</Text></Flex>
              <Box height={2} bg="rgba(255,255,255,.18)" borderRadius={5} mt={3} overflow="hidden"><Box width={`${account.progress}%`} height="100%" bg="#FFCA79" /></Box>
              <Text color="#DDD4EE" fontSize={9} mt={2}>{account.nextReward ? `${account.nextReward.name} · ${account.nextReward.pointsCost} points` : `${account.rewards.length} récompense(s) disponible(s)`}</Text>
            </Box>
          )) : <Box mt={4} bg="rgba(255,255,255,.1)" borderRadius={16} p={4}><Text color="white" fontWeight={800}>Vos premiers points apparaîtront ici</Text><Text color="#DDD4EE" fontSize={10} mt={1}>Réservez puis validez votre présence chez un établissement partenaire.</Text></Box>}
        </Box>
        <Flex mt={5} bg="white" borderRadius={22} p={4} shadow={1}>
          <Flex
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={4}>
            <Box>
              <Text color={Color.text} fontSize={18} fontWeight={800}>
                Informations personnelles
              </Text>
              <Text color={Color.muted} fontSize={11} mt={1}>
                Vos coordonnées et préférences
              </Text>
            </Box>
            {!editMode && (
              <Pressable onPress={() => setEditMode(true)}>
                <Box bg={Color.mainLight} px={3} py={2} borderRadius={14}>
                  <Text color={Color.main} fontSize={11} fontWeight={800}>
                    MODIFIER
                  </Text>
                </Box>
              </Pressable>
            )}
          </Flex>
          {formList.map(
            (el, _) =>
              el.name !== 'confirmPassword' &&
              el.name !== 'userPwd' && (
                <Controller
                  key={el.name}
                  control={control}
                  render={({field: {onChange, onBlur, value}}) => (
                    <FormControl
                      isInvalid={!!errors?.[el.name as EnumInputs]?.message}>
                      <Text
                        color={Color.muted}
                        fontSize={12}
                        fontWeight={700}
                        mb={2}>
                        {el.placeholder}
                      </Text>

                      <Input
                        type={'text'}
                        height={50}
                        backgroundColor={editMode ? '#FFFFFF' : '#F8F7FB'}
                        borderColor={Color.border}
                        borderRadius={14}
                        _focus={{
                          borderColor: Color.main,
                          backgroundColor: 'rgba(241, 241, 254, 1)',
                        }}
                        onChangeText={onChange}
                        value={value?.toString()}
                        onBlur={onBlur}
                        isReadOnly={!editMode || el.name === 'userMail'}
                      />
                      <FormControl.ErrorMessage
                        leftIcon={<WarningOutlineIcon size="xs" />}>
                        {errors?.[el.name as EnumInputs]?.message}
                      </FormControl.ErrorMessage>
                    </FormControl>
                  )}
                  name={el.name as EnumInputs}
                />
              ),
          )}
          <Controller
            key={'dateOfBirth'}
            control={control}
            render={({field: {onChange, onBlur, value}}) => (
              <FormControl isInvalid={!!errors?.dateOfBirth?.message}>
                <Text color={Color.muted} fontSize={12} fontWeight={700} mb={2}>
                  Date de naissance
                </Text>
                <DatePickerForm
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  disable={!editMode}
                />
                <FormControl.ErrorMessage
                  leftIcon={<WarningOutlineIcon size="xs" />}>
                  {errors?.dateOfBirth?.message}
                </FormControl.ErrorMessage>
              </FormControl>
            )}
            name={'dateOfBirth' as EnumInputs}
          />

          <Controller
            control={control}
            render={({field: {onChange, value}}) => (
              <FormControl isInvalid={!!errors?.userGender?.message}>
                <Text color={Color.muted} fontSize={12} fontWeight={700} mb={2}>
                  Genre
                </Text>
                <Pressable
                  disabled={!editMode}
                  onPress={() => {
                    Keyboard.dismiss();
                    setGenderSelectorOpen(true);
                  }}>
                  <Flex
                    height={50}
                    mt={1}
                    px={4}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    backgroundColor={editMode ? '#FFFFFF' : '#F8F7FB'}
                    borderWidth={1}
                    borderColor={Color.border}
                    borderRadius={14}
                    opacity={editMode ? 1 : 0.65}>
                    <Text color={value ? Color.text : Color.muted}>
                      {value === 'W'
                        ? 'Femme'
                        : value === 'H'
                        ? 'Homme'
                        : value === 'O'
                        ? 'Autre'
                        : 'Non renseigné'}
                    </Text>
                    <ChevronDownIcon color={Color.main} size="sm" />
                  </Flex>
                </Pressable>
                <Actionsheet
                  isOpen={genderSelectorOpen}
                  onClose={() => setGenderSelectorOpen(false)}>
                  <Actionsheet.Content borderTopRadius={24}>
                    <Text
                      color={Color.text}
                      fontSize={17}
                      fontWeight={800}
                      py={3}>
                      Sélectionner le genre
                    </Text>
                    {[
                      {label: 'Femme', value: 'W'},
                      {label: 'Homme', value: 'H'},
                      {label: 'Autre', value: 'O'},
                    ].map(option => (
                      <Actionsheet.Item
                        key={option.value}
                        bg={
                          value === option.value
                            ? Color.mainLight
                            : 'transparent'
                        }
                        onPress={() => {
                          onChange(option.value);
                          setGenderSelectorOpen(false);
                        }}>
                        <Flex
                          direction="row"
                          width="100%"
                          justifyContent="space-between">
                          <Text
                            color={Color.text}
                            fontWeight={value === option.value ? 800 : 500}>
                            {option.label}
                          </Text>
                          {value === option.value && (
                            <Text color={Color.main}>✓</Text>
                          )}
                        </Flex>
                      </Actionsheet.Item>
                    ))}
                  </Actionsheet.Content>
                </Actionsheet>
                <FormControl.ErrorMessage
                  leftIcon={<WarningOutlineIcon size="xs" />}>
                  {errors?.userGender?.message}
                </FormControl.ErrorMessage>
              </FormControl>
            )}
            name={'userGender'}
          />
        </Flex>
        {!editMode && (
          <Box mt={6}>
            <Text color={Color.text} fontSize={19} fontWeight={800} mb={3}>
              Activité du compte
            </Text>
              <Pressable onPress={() => navigation.navigate('Notifications')}>
                <Flex direction="row" justifyContent="space-between" alignItems="center" bg="white" borderRadius={18} p={4} mb={3} shadow={1}>
                  <Box flex={1}>
                    <Text color={Color.text} fontWeight={800}>Notifications</Text>
                    <Text color={Color.muted} fontSize={12} mt={1}>Confirmations, changements et rappels</Text>
                  </Box>
                  <Text color={Color.main} fontSize={22}>›</Text>
                </Flex>
              </Pressable>
          </Box>
        )}
        {editMode && (
          <Flex direction="row" justifyContent="space-between" mt={5}>
            <Button
              width="34%"
              height={52}
              borderRadius={16}
              variant="outline"
              borderColor={Color.border}
              _text={{color: Color.text}}
              onPress={() => {
                reset(currentUser);
                setEditMode(false);
              }}>
              Annuler
            </Button>
            <Button
              width="62%"
              height={52}
              borderRadius={16}
              backgroundColor={Color.main}
              _text={{color: 'white', fontWeight: '700'}}
              onPress={() => void handleSubmit(onSubmit)()}>
              Enregistrer
            </Button>
          </Flex>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
