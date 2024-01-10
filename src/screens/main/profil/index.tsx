/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
import {
  Avatar,
  Box,
  Button,
  CheckIcon,
  ChevronRightIcon,
  Flex,
  FormControl,
  Input,
  KeyboardAvoidingView,
  ScrollView,
  Select,
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
import {Keyboard, Platform, Pressable} from 'react-native';
import SvgPhoto from '../../../assets/Photo';
import {useMutation, useQuery} from '@tanstack/react-query';
import {getProfilAPI, updateProfilAPI} from '../../../services/profil';
import LoadingSpinner from '../../../components/Loader';
import Toast from '../../../components/toast';
import {launchImageLibrary} from 'react-native-image-picker';
import {TouchableOpacity} from 'react-native-gesture-handler';
type EnumInputs =
  | 'firstName'
  | 'lastName'
  | 'userMobile'
  | 'userMail'
  | 'userGender'
  | 'userPhoto';
const schema = yup
  .object({
    firstName: yup.string().required('Champ obligatoire'),
    lastName: yup.string().required('Champ obligatoire'),
    userMail: yup.string().email('invalid format email'),
    userMobile: yup.string().required('Champ obligatoire'),
    userGender: yup.string().required('Champ obligatoire'),
    userPhoto: yup.string(),
  })
  .required();
export default function Profil({navigation}: any) {
  const [editMode, setEditMode] = useState(false);
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
    },
  });

  const photoUri = watch('userPhoto');

  const {isLoading: getLoading, data: currentUser} = useQuery(
    ['getUserData'],
    getProfilAPI,
    {
      onSuccess: response => {
        console.log('response', response);
        reset(response);
      },
    },
  );

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
  const _handleGender = (gender: string) => {
    switch (gender) {
      case 'H':
        return 'Homme';
      case 'W':
        return 'Femme';
      case 'O':
        return 'Autre';
      default:
        'Homme';
    }
  };

  const onSubmit = (data: any) => {
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
        contentContainerStyle={{
          paddingBottom: 100,
          backgroundColor: '#fff',
          paddingHorizontal: 24,
        }}>
        <Box
          justifyContent={'space-between'}
          flexDirection={'row'}
          mt={5}
          mb={5}>
          <Box />
          <Text fontSize={16} fontFamily={'Inter'} fontWeight={500}>
            Profile
          </Text>
          <SvgSettings />
        </Box>
        <Flex justifyContent={'center'} alignItems={'center'}>
          <View style={{position: 'relative'}}>
            <Avatar
              bg="lightBlue.400"
              source={{
                uri:
                  photoUri ??
                  'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
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
          <Text fontSize={15} fontFamily={'Inter'} fontWeight={400}>
            {`${currentUser?.firstName ?? '-'} ${currentUser?.lastName ?? '-'}`}
          </Text>
          <Text
            fontSize={12}
            fontFamily={'Inter'}
            fontWeight={400}
            color={'#868889'}>
            {currentUser?.userMail}
          </Text>
        </Flex>
        <Pressable onPress={() => navigation.navigate('MyReservation')}>
          <Box
            my={5}
            flexDirection={'row'}
            bgColor={'#fff'}
            justifyContent={'space-between'}
            px={15}
            py={13}
            borderWidth={1}
            borderColor={'#9E91DA'}
            borderRadius={8}>
            <Text
              fontSize={12}
              fontFamily={'Inter'}
              fontWeight={400}
              color={'#090A0A'}>
              Mes réservations
            </Text>
            <ChevronRightIcon />
          </Box>
        </Pressable>
        <Flex gap={5} mt={2}>
          {formList.map((el, _) => (
            <Controller
              key={el.name}
              control={control}
              render={({field: {onChange, onBlur, value}}) => (
                <FormControl
                  isInvalid={!!errors?.[el.name as EnumInputs]?.message}>
                  <Input
                    type={'text'}
                    backgroundColor={'#F9F9F9'}
                    borderColor={'#F9F9F9'}
                    borderRadius={'10px'}
                    _focus={{
                      borderColor: Color.main,
                      backgroundColor: 'rgba(241, 241, 254, 1)',
                    }}
                    onChangeText={onChange}
                    value={value?.toString()}
                    onBlur={onBlur}
                    isReadOnly={!editMode}
                  />
                  <FormControl.ErrorMessage
                    leftIcon={<WarningOutlineIcon size="xs" />}>
                    {errors?.[el.name as EnumInputs]?.message}
                  </FormControl.ErrorMessage>
                </FormControl>
              )}
              name={el.name as EnumInputs}
            />
          ))}

          <Controller
            control={control}
            render={({field: {onChange, value}}) => (
              <FormControl isInvalid={!!errors?.userGender?.message}>
                {editMode ? (
                  <Select
                    backgroundColor={'#F9F9F9'}
                    borderColor={'#F9F9F9'}
                    borderRadius={'10px'}
                    selectedValue={value}
                    minWidth="200"
                    accessibilityLabel="Choose Service"
                    placeholder="Choose Service"
                    _selectedItem={{
                      endIcon: <CheckIcon size="5" color={'#45377A'} />,
                    }}
                    mt={1}
                    onValueChange={itemValue => onChange(itemValue)}>
                    <Select.Item label="Femme" value="W" />
                    <Select.Item label="Homme" value="H" />
                    <Select.Item label="Autre" value="O" />
                  </Select>
                ) : (
                  <Input
                    type={'text'}
                    backgroundColor={'#F9F9F9'}
                    borderColor={'#F9F9F9'}
                    borderRadius={'10px'}
                    _focus={{
                      borderColor: Color.main,
                      backgroundColor: 'rgba(241, 241, 254, 1)',
                    }}
                    value={_handleGender(value)}
                    isReadOnly={true}
                  />
                )}
                <FormControl.ErrorMessage
                  leftIcon={<WarningOutlineIcon size="xs" />}>
                  {errors?.userGender?.message}
                </FormControl.ErrorMessage>
              </FormControl>
            )}
            name={'userGender'}
          />
        </Flex>
        {editMode && (
          <Button
            borderRadius={'5px'}
            mt={5}
            backgroundColor={'#F3F0FF'}
            _text={{color: Color.main}}
            onPress={handleSubmit(onSubmit)}>
            Confirmer
          </Button>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
