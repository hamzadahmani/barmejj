import {
  Box,
  Button,
  Flex,
  FormControl,
  Input,
  Text,
  WarningOutlineIcon,
  Divider,
  KeyboardAvoidingView,
} from 'native-base';
import React, {useContext} from 'react';
import {useForm, Controller} from 'react-hook-form';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import SvgComponentUser from '../../../assets/UserRounded';
import {Color} from '../../../helpers/constatn';
import {Keyboard, Pressable} from 'react-native';
import SvgComponentGoogle from '../../../assets/Google';
import SvgComponentPassword from '../../../assets/Password';
import {AuthContext} from '../../../routes/auth/authProvider';
import {useMutation} from '@tanstack/react-query';
import {signInAPI, signUpWithGoogleAPI} from '../../../services/auth';
import LoadingSpinner from '../../../components/Loader';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
GoogleSignin.configure({
  scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
  webClientId:
    '122310836320-l8iakdhme6ishokf2u7r6fifj01bqv4r.apps.googleusercontent.com',
  offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  hostedDomain: '', // specifies a hosted domain restriction
  forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
  accountName: '', // [Android] specifies an account name on the device that should be used
  iosClientId: '<FROM DEVELOPER CONSOLE>', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
  googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. GoogleService-Info-Staging
  openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
  profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
});
const schema = yup
  .object({
    email: yup.string().required('Champ obligatoire'),
    password: yup.string().required('Champ obligatoire'),
  })
  .required();

export default function LoginScreen({navigation}: any) {
  const {login} = useContext(AuthContext);
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

  const {mutate: signInGoogleMutate, isLoading: isLoadingWithGoogleSignIn} =
    useMutation((data: any) => signUpWithGoogleAPI(data), {
      onSuccess: res => {
        login(res);
      },
      onError: err => {
        console.warn('data', err);
      },
    });

  const onSubmit = (data: any) => {
    Keyboard.dismiss();
    siginMutate({
      userMail: data?.email?.toLowerCase()?.trim(),
      userPwd: data?.password,
      role: true,
    });
  };

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      signInGoogleMutate(userInfo);
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        console.log('error', error);
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
        console.log('error', error);
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        console.log('error', error);
      } else {
        // some other error happened
        console.log('error', error);
      }
    }
  };

  const navigateToSignUp = () => {
    navigation.navigate('SignUp');
  };
  return (
    <KeyboardAvoidingView>
      {<LoadingSpinner visible={isLoading || isLoadingWithGoogleSignIn} />}
      <Flex px={5} pt={6}>
        <Box>
          <Text fontFamily={'Inter'} fontWeight={700} fontSize={28}>
            Content de te revoir!
          </Text>
          <Text
            fontFamily={'Inter'}
            fontWeight={400}
            fontSize={16}
            color={'#7D808D'}>
            Connectez-vous à votre compte
          </Text>
        </Box>

        <Box mt={10}>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({field: {onChange, onBlur, value}}) => (
              <FormControl isInvalid={!!errors.email?.message}>
                <FormControl.Label>Nom d'utilisateur</FormControl.Label>
                <Input
                  placeholder="Insérez votre nom d'utilisateur ici"
                  InputLeftElement={<SvgComponentUser />}
                  backgroundColor={'#F9F9F9'}
                  borderColor={'#F9F9F9'}
                  borderRadius={'10px'}
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
                <FormControl.Label>Password</FormControl.Label>
                <Input
                  placeholder="Insérez votre mot de passe ici"
                  InputLeftElement={<SvgComponentPassword />}
                  backgroundColor={'#F9F9F9'}
                  borderColor={'#F9F9F9'}
                  type={'password'}
                  borderRadius={'10px'}
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
        <Box>
          <Text
            mt={2}
            fontFamily={'Inter'}
            fontWeight={400}
            fontSize={12}
            color={'#45377A'}
            textAlign={'right'}>
            Mot de passe oublié?
          </Text>
        </Box>
        <Box mt={5}>
          <Button
            borderRadius={'10px'}
            backgroundColor={Color.main}
            onPress={handleSubmit(onSubmit)}>
            Connexion
          </Button>
          <Box flexDirection={'row'} mt={4} justifyContent={'center'}>
            <Text
              fontFamily={'Inter'}
              fontWeight={400}
              fontSize={14}
              color={'#6D6D6D'}>
              Vous n'avez pas de compte ?
            </Text>
            <Pressable onPress={navigateToSignUp}>
              <Text
                ml={2}
                fontFamily={'Inter'}
                fontWeight={500}
                fontSize={14}
                color={'#000'}>
                S'inscrire
              </Text>
            </Pressable>
          </Box>
        </Box>

        <Flex
          flexDirection={'row'}
          justifyContent={'center'}
          alignItems={'center'}
          my={5}>
          <Divider backgroundColor={'#9E91DA'} />
          <Text
            style={{
              backgroundColor: '#F3F0FF',
            }}
            color={'#9E91DA'}
            fontFamily={'Inter'}
            fontWeight={400}
            fontSize={12}
            borderRadius={24}
            padding={2}>
            OU
          </Text>
          <Divider backgroundColor={'#9E91DA'} />
        </Flex>

        <Box gap={3}>
          <Pressable onPress={signIn}>
            <Box
              flexDirection={'row'}
              gap={2}
              bgColor={'#fff'}
              px={15}
              py={13}
              borderWidth={1}
              borderColor={'#E2E8F0'}
              borderRadius={12}>
              <SvgComponentGoogle />
              <Text
                fontFamily={'Inter'}
                fontWeight={500}
                fontSize={16}
                color={'#475569'}>
                Connectez-vous avec Google
              </Text>
            </Box>
          </Pressable>
        </Box>
      </Flex>
    </KeyboardAvoidingView>
  );
}
