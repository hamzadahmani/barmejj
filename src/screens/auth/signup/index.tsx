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
  HStack,
  Checkbox,
} from 'native-base';
import React, {useState} from 'react';
import {useForm, Controller} from 'react-hook-form';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import {Color, formList} from '../../../helpers/constatn';
import {Keyboard, Pressable, ScrollView} from 'react-native';

import {useMutation} from '@tanstack/react-query';
import {signUpAPI} from '../../../services/auth';
import LoadingSpinner from '../../../components/Loader';
import DatePickerForm from '../../../components/form/DatePicker';
import Toast from '../../../components/toast';

type EnumInputs =
  | 'firstName'
  | 'lastName'
  | 'userMobile'
  | 'userMail'
  | 'userGender'
  | 'userPhoto'
  | 'dateOfBirth'
  | 'userPwd'
  | 'confirmPassword';

const fieldLabels: Record<string, string> = {
  firstName: 'Prénom',
  lastName: 'Nom',
  userMail: 'Adresse e-mail',
  userMobile: 'Numéro de téléphone',
  userPwd: 'Mot de passe',
  confirmPassword: 'Confirmation du mot de passe',
};

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
      .oneOf([yup.ref('userPwd')], 'Les mots de passe doivent correspondre'),
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
  const [policyCheck, setPolicyCheck] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({
    userPwd: false,
    confirmPassword: false,
  });
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
      userPwd: '',
      confirmPassword: '',
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
    const rest = {...data};
    delete rest.confirmPassword;
    siginUpMutate({
      ...rest,
      userName: data.firstName,
      userRole: 'user',
    });
  };

  const handleCheckboxChange = () => {
    setPolicyCheck(!policyCheck);
  };

  return (
    <ScrollView
      style={{backgroundColor: Color.background}}
      contentContainerStyle={{paddingBottom: 24}}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {<LoadingSpinner visible={isLoading} />}
      <Box
        bg={Color.main}
        px={6}
        pt={10}
        pb={10}
        borderBottomLeftRadius={36}
        borderBottomRightRadius={36}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text color="#DCD5F2" fontSize={13} fontWeight={700}>
            ‹ Retour
          </Text>
        </Pressable>
        <Text color="white" fontWeight={800} fontSize={30} mt={5}>
          Créez votre compte
        </Text>
        <Text fontSize={14} color="#DCD5F2" mt={2} lineHeight={21}>
          Réservez vos meilleures adresses en quelques secondes.
        </Text>
      </Box>
      <Flex px={5} mt={-5}>
        <Flex bg="white" p={5} borderRadius={24} shadow={2}>
          <Text color={Color.text} fontSize={18} fontWeight={800} mb={1}>
            Vos informations
          </Text>
          <Text color={Color.muted} fontSize={12} mb={5}>
            Tous les champs sont nécessaires pour créer votre compte.
          </Text>
          {formList.map((el, _) => (
            <Controller
              key={el.name}
              control={control}
              render={({field: {onChange, onBlur, value}}) => (
                <FormControl
                  mb={3}
                  isInvalid={!!errors?.[el.name as EnumInputs]?.message}>
                  <FormControl.Label>
                    {fieldLabels[el.name] || el.placeholder}
                  </FormControl.Label>
                  <Input
                    type={
                      el.type === 'password' &&
                      !visiblePasswords[
                        el.name as 'userPwd' | 'confirmPassword'
                      ]
                        ? 'password'
                        : 'text'
                    }
                    height={50}
                    backgroundColor={Color.background}
                    borderColor={Color.border}
                    borderRadius={14}
                    _focus={{
                      borderColor: Color.main,
                      backgroundColor: 'rgba(241, 241, 254, 1)',
                    }}
                    placeholder={el.placeholder}
                    keyboardType={
                      el.name === 'userMail'
                        ? 'email-address'
                        : el.name === 'userMobile'
                        ? 'phone-pad'
                        : 'default'
                    }
                    autoCapitalize={
                      el.name === 'userMail' ? 'none' : 'sentences'
                    }
                    autoCorrect={false}
                    InputRightElement={
                      el.type === 'password' ? (
                        <Pressable
                          onPress={() =>
                            setVisiblePasswords(current => ({
                              ...current,
                              [el.name]:
                                !current[
                                  el.name as 'userPwd' | 'confirmPassword'
                                ],
                            }))
                          }>
                          <Text
                            color={Color.main}
                            fontSize={10}
                            fontWeight={700}
                            mr={4}>
                            {visiblePasswords[
                              el.name as 'userPwd' | 'confirmPassword'
                            ]
                              ? 'MASQUER'
                              : 'AFFICHER'}
                          </Text>
                        </Pressable>
                      ) : undefined
                    }
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
                <FormControl.Label>Date de naissance</FormControl.Label>
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
              <FormControl
                isInvalid={!!errors?.userGender?.message}
                isReadOnly
                mt={3}>
                <FormControl.Label>Genre</FormControl.Label>
                <Select
                  height={50}
                  backgroundColor={Color.background}
                  borderColor={Color.border}
                  borderRadius={14}
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
        <HStack space={3} mt={5} px={1} alignItems="flex-start">
          <Checkbox
            shadow={2}
            value={'policyCheck'}
            colorScheme="purple"
            accessibilityLabel="Accepter les conditions d’utilisation"
            isChecked={policyCheck}
            onChange={handleCheckboxChange}>
            <Text color={Color.muted} fontSize={12} lineHeight={18}>
              J’accepte les conditions d’utilisation et la politique de
              confidentialité.
            </Text>
          </Checkbox>
        </HStack>

        <Box mt={5}>
          <Button
            height={52}
            borderRadius={16}
            backgroundColor={Color.main}
            isDisabled={!policyCheck || isLoading}
            onPress={() => void handleSubmit(onSubmit)()}>
            Créer mon compte
          </Button>
          <Box flexDirection={'row'} mt={4} mb={5} justifyContent={'center'}>
            <Text
              fontFamily={'Inter'}
              fontWeight={400}
              fontSize={14}
              color={'#6D6D6D'}>
              Vous avez déjà un compte ?
            </Text>
            <Pressable onPress={() => navigation.goBack()}>
              <Text
                ml={2}
                fontFamily={'Inter'}
                fontWeight={500}
                fontSize={14}
                color={Color.main}>
                Se connecter
              </Text>
            </Pressable>
          </Box>
        </Box>
      </Flex>
    </ScrollView>
  );
}
