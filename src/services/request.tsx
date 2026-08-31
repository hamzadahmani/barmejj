import axios from 'axios';
import React, {PropsWithChildren, useCallback, useEffect} from 'react';
import {useToast} from 'native-base';
import Toast from '../components/toast';
import {API_URI} from '../config/api';
import {getAccessToken} from './authToken';

const instance = axios.create({
  baseURL: API_URI + '/',
  timeout: 60000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const AxiosInterceptor = ({children}: PropsWithChildren) => {
  const toast = useToast();

  const errInterceptor = useCallback(
    async (error: any) => {
      const message =
        error?.response?.data?.message ||
        (error?.code === 'ECONNABORTED'
          ? 'Le serveur met trop de temps à répondre. Réessayez.'
          : error?.response
          ? 'Une erreur est survenue. Vérifiez vos informations.'
          : 'Connexion au serveur impossible. Vérifiez Internet.');
      toast.show({
        placement: 'top',
        render: () => {
          return <Toast message={message} status={'#e74c3c'} />;
        },
      });
      return Promise.reject(error);
    },
    [toast],
  );

  useEffect(() => {
    const requestInterceptor = instance.interceptors.request.use(config => {
      const accessToken = getAccessToken();
      if (
        !config.headers.Authorization &&
        accessToken &&
        config.url !== 'authenticate'
      ) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });
    const responseInterceptor = instance.interceptors.response.use(
      response => response,
      errInterceptor,
    );

    return () => {
      instance.interceptors.request.eject(requestInterceptor);
      instance.interceptors.response.eject(responseInterceptor);
    };
  }, [errInterceptor]);

  return <>{children}</>;
};

export default instance;
export {AxiosInterceptor, API_URI};
