import {
  Box,
  Button,
  Flex,
  FormControl,
  Input,
  Text,
  WarningOutlineIcon,
  ScrollView,
} from 'native-base';
import React, {useState} from 'react';
import {useForm, Controller} from 'react-hook-form';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import SvgComponentUser from '../../../assets/UserRounded';
import {Color} from '../../../helpers/constatn';
import {Keyboard, Pressable} from 'react-native';
import SvgComponentPassword from '../../../assets/Password';
import {useAuth} from '../../../routes/auth/authProvider';
import {useMutation} from '@tanstack/react-query';
import {signInAPI} from '../../../services/auth';
import LoadingSpinner from '../../../components/Loader';
const schema = yup
  .object({
    email: yup
      .string()
      .required('Champ obligatoire')
      .email("Format d'e-mail invalide"),
    password: yup.string().required('Champ obligatoire'),
  })
  .required();

export default function LoginScreen({navigation}: any) {
  const [showPassword, setShowPassword] = useState(false);
  const {login} = useAuth();
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {email: '', password: ''},
  });
  const {mutate: siginMutate, isLoading} = useMutation(
    (data: any) => signInAPI(data),
    {
      onSuccess: res => {
        login(res);
      },
      onError: err => {
        console.warn('data', err);
      },
    },
  );

  const onSubmit = (data: any) => {
    Keyboard.dismiss();
    siginMutate({
      userMail: data?.email?.toLowerCase()?.trim(),
      userPwd: data?.password,
      role: true,
    });
  };

  const navigateToSignUp = () => {
    navigation.navigate('SignUp');
  };
  return (
    <ScrollView
      flex={1}
      backgroundColor={Color.background}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: 36}}>
      <LoadingSpinner visible={isLoading} />
      <Box
        bg={Color.main}
        px={6}
        pt={12}
        pb={10}
        borderBottomLeftRadius={36}
        borderBottomRightRadius={36}>
        <Text
          color="#DCD5F2"
          fontWeight={800}
          fontSize={11}
          letterSpacing={2.5}>
          BARMEJ
        </Text>
        <Text
          color="white"
          fontWeight={800}
          fontSize={32}
          lineHeight={40}
          mt={5}>
          Bon retour parmi nous
        </Text>
        <Text fontSize={14} color="#DCD5F2" mt={2} lineHeight={21}>
          Retrouvez vos bonnes adresses et vos prochaines réservations.
        </Text>
      </Box>

      <Flex px={5} mt={-5}>
        <Box bg="white" p={5} borderRadius={24} shadow={2}>
          <Text color={Color.text} fontWeight={800} fontSize={20} mb={1}>
            Se connecter
          </Text>
          <Text color={Color.muted} fontSize={12} mb={5}>
            Utilisez l’adresse associée à votre compte
          </Text>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({field: {onChange, onBlur, value}}) => (
              <FormControl isInvalid={!!errors.email?.message}>
                <FormControl.Label>Adresse e-mail</FormControl.Label>
                <Input
                  placeholder="votre@email.com"
                  InputLeftElement={<SvgComponentUser />}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  height={52}
                  backgroundColor={Color.background}
                  borderColor={Color.border}
                  borderRadius={14}
                  _focus={{
                    borderColor: Color.main,
                    backgroundColor: 'rgba(241, 241, 254, 1)',
                  }}
                  onChangeText={onChange}
                  value={value}
                  onBlur={onBlur}
                />
                <FormControl.ErrorMessage
                  leftIcon={<WarningOutlineIcon size="xs" />}>
                  {errors?.email?.message}
                </FormControl.ErrorMessage>
              </FormControl>
            )}
            name="email"
          />

          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({field: {onChange, onBlur, value}}) => (
              <FormControl isInvalid={!!errors?.password?.message}>
                <FormControl.Label mt={3}>Mot de passe</FormControl.Label>
                <Input
                  placeholder="Votre mot de passe"
                  InputLeftElement={<SvgComponentPassword />}
                  InputRightElement={
                    <Pressable onPress={() => setShowPassword(value => !value)}>
                      <Text
                        color={Color.main}
                        fontSize={11}
                        fontWeight={700}
                        mr={4}>
                        {showPassword ? 'MASQUER' : 'AFFICHER'}
                      </Text>
                    </Pressable>
                  }
                  height={52}
                  backgroundColor={Color.background}
                  borderColor={Color.border}
                  type={showPassword ? 'text' : 'password'}
                  borderRadius={14}
                  _focus={{
                    borderColor: Color.main,
                    backgroundColor: 'rgba(241, 241, 254, 1)',
                  }}
                  onChangeText={onChange}
                  value={value}
                  onBlur={onBlur}
                />
                <FormControl.ErrorMessage
                  leftIcon={<WarningOutlineIcon size="xs" />}>
                  {errors?.password?.message}
                </FormControl.ErrorMessage>
              </FormControl>
            )}
            name="password"
          />
        </Box>
        <Box mt={5}>
          <Button
            height={52}
            borderRadius={16}
            backgroundColor={Color.main}
            isDisabled={isLoading}
            onPress={() => void handleSubmit(onSubmit)()}>
            Connexion
          </Button>
          <Box flexDirection={'row'} mt={4} justifyContent={'center'}>
            <Text
              fontFamily={'Inter'}
              fontWeight={400}
              fontSize={14}
              color={'#6D6D6D'}>
              Pas encore de compte ?
            </Text>
            <Pressable onPress={navigateToSignUp}>
              <Text
                ml={2}
                fontFamily={'Inter'}
                fontWeight={500}
                fontSize={14}
                color={Color.main}>
                Créer un compte
              </Text>
            </Pressable>
          </Box>
        </Box>

      </Flex>
    </ScrollView>
  );
}
