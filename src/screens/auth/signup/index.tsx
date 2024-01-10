import {
  Box,
  Button,
  Flex,
  FormControl,
  Input,
  Text,
  WarningOutlineIcon,
  Select,
  CheckIcon,
  useToast,
} from 'native-base';
import React from 'react';
import {useForm, Controller} from 'react-hook-form';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import {Color, formList} from '../../../helpers/constatn';
import {Keyboard, Pressable} from 'react-native';

import {useMutation} from '@tanstack/react-query';
import {signUpAPI} from '../../../services/auth';
import LoadingSpinner from '../../../components/Loader';
import DatePickerForm from '../../../components/form/DatePicker';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import Toast from '../../../components/toast';

type EnumInputs =
  | 'firstName'
  | 'lastName'
  | 'userMobile'
  | 'userMail'
  | 'userGender'
  | 'userPhoto'
  | 'dateOfBirth';

const schema = yup
  .object({
    firstName: yup.string().required('Champ obligatoire'),
    lastName: yup.string().required('Champ obligatoire'),
    userMail: yup
      .string()
      .required('Champ obligatoire')
      .email("Format d'email invalide"),
    userMobile: yup
      .string()
      .required('Champ obligatoire')
      .matches(
        /^\d{8}$/,
        'Le numéro de portable doit être composé de 8 chiffres',
      ),
    userGender: yup.string().required('Champ obligatoire'),
    userPwd: yup
      .string()
      .required('Champ obligatoire')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Le mot de passe doit contenir au moins une lettre minuscule, une lettre majuscule, un chiffre et un caractère spécial, et comporter au moins 8 caractères',
      ),
    confirmPassword: yup
      .string()
      .required('Champ obligatoire')
      .oneOf(
        [yup.ref('userPwd'), null],
        'Les mots de passe doivent correspondre',
      ),
    dateOfBirth: yup
      .string()
      .required('Champ obligatoire')
      .matches(
        /^\d{4}-\d{2}-\d{2}$/,
        'Format de date invalide. Utiliser le format AAAA-MM-JJ',
      ),

    userPhoto: yup.string(),
  })
  .required();

export default function SignupScreen({navigation}: any) {
  const toast = useToast();

  const {
    control,
    handleSubmit,
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
  const {mutate: siginUpMutate, isLoading} = useMutation(
    (data: any) => signUpAPI(data),
    {
      onSuccess: () => {
        toast.show({
          placement: 'top',
          render: () => {
            return (
              <Toast
                message={'Votre compte est enregistré avec succès'}
                status={'#008000'}
              />
            );
          },
        });
        navigation.goBack();
      },
      onError: err => {
        console.warn('data', err);
      },
    },
  );

  const onSubmit = (data: any) => {
    Keyboard.dismiss();
    const {confirmPassword, ...rest} = data;
    console.log('confirmPassword', confirmPassword);
    siginUpMutate({
      ...rest,
      userName: data.firstName,
      userRole: 'user',
    });
  };
  return (
    <KeyboardAwareScrollView>
      {<LoadingSpinner visible={isLoading} />}
      <Flex px={5} pt={6}>
        <Box>
          <Text fontFamily={'Inter'} fontWeight={700} fontSize={28}>
            S’inscrire
          </Text>
          <Text
            fontFamily={'Inter'}
            fontWeight={400}
            fontSize={16}
            color={'#7D808D'}>
            Créez votre compte
          </Text>
        </Box>

        <Flex gap={5} mt={2}>
          {formList.map((el, _) => (
            <Controller
              key={el.name}
              control={control}
              render={({field: {onChange, onBlur, value}}) => (
                <FormControl
                  isInvalid={!!errors?.[el.name as EnumInputs]?.message}>
                  <Input
                    type={(el?.type as 'text' | 'password') ?? 'text'}
                    backgroundColor={'#F9F9F9'}
                    borderColor={'#F9F9F9'}
                    borderRadius={'10px'}
                    _focus={{
                      borderColor: Color.main,
                      backgroundColor: 'rgba(241, 241, 254, 1)',
                    }}
                    placeholder={el.placeholder}
                    onChangeText={onChange}
                    value={value?.toString()}
                    onBlur={onBlur}
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
            key={'dateOfBirth'}
            control={control}
            render={({field: {onChange, onBlur, value}}) => (
              <FormControl isInvalid={!!errors?.dateOfBirth?.message}>
                <DatePickerForm
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
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
              <FormControl isInvalid={!!errors?.userGender?.message} isReadOnly>
                <Select
                  backgroundColor={'#F9F9F9'}
                  borderColor={'#F9F9F9'}
                  borderRadius={'10px'}
                  selectedValue={value}
                  minWidth="200"
                  accessibilityLabel="Genre"
                  placeholder="Genre"
                  _selectedItem={{
                    endIcon: <CheckIcon size="5" color={'#45377A'} />,
                  }}
                  mt={1}
                  onValueChange={itemValue => onChange(itemValue)}>
                  <Select.Item label="Femme" value="W" />
                  <Select.Item label="Homme" value="H" />
                  <Select.Item label="Autre" value="O" />
                </Select>

                <FormControl.ErrorMessage
                  leftIcon={<WarningOutlineIcon size="xs" />}>
                  {errors?.userGender?.message}
                </FormControl.ErrorMessage>
              </FormControl>
            )}
            name={'userGender'}
          />
        </Flex>

        <Box mt={5}>
          <Button
            borderRadius={'10px'}
            backgroundColor={Color.main}
            onPress={handleSubmit(onSubmit)}>
            S’inscrire
          </Button>
          <Box flexDirection={'row'} mt={4} mb={5} justifyContent={'center'}>
            <Text
              fontFamily={'Inter'}
              fontWeight={400}
              fontSize={14}
              color={'#6D6D6D'}>
              Vous avez deja un compte ?
            </Text>
            <Pressable onPress={() => navigation.goBack()}>
              <Text
                ml={2}
                fontFamily={'Inter'}
                fontWeight={500}
                fontSize={14}
                color={'#000'}>
                se connecter
              </Text>
            </Pressable>
          </Box>
        </Box>
      </Flex>
    </KeyboardAwareScrollView>
  );
}
