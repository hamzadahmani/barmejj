import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {useToast} from 'native-base';
import Toast from '../components/toast';
import {API_URI} from '../config/api';
import {
  expireSession,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from './authToken';

const instance = axios.create({
  baseURL: API_URI + '/',
  timeout: 60000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});
let refreshPromise: Promise<string> | null = null;
const renewAccessToken = () => {
  if (refreshPromise) return refreshPromise;
  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken)
    return Promise.reject(
      Object.assign(new Error('Refresh token missing'), {
        response: {status: 401},
      }),
    );
  refreshPromise = axios
    .post(
      `${API_URI}/auth/refresh`,
      {refreshToken: currentRefreshToken},
      {timeout: 15000},
    )
    .then(async response => {
      const {token, refreshToken} = response.data;
      setAccessToken(token);
      setRefreshToken(refreshToken);
      await Promise.all([
        AsyncStorage.setItem('token', JSON.stringify(token)),
        AsyncStorage.setItem('refreshToken', JSON.stringify(refreshToken)),
      ]);
      return token as string;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
};

// `silentError: true` sur une requête : l'erreur est gérée par l'écran, pas de toast global.
declare module 'axios' {
  interface AxiosRequestConfig {
    silentError?: boolean;
  }
}

const AxiosInterceptor = ({children}: PropsWithChildren) => {
  const toast = useToast();
  const [ready, setReady] = useState(false);

  const errInterceptor = useCallback(
    async (error: any) => {
      const originalRequest = error?.config;
      const path = String(originalRequest?.url || '')
        .replace(/^\//, '')
        .split('?')[0];
      const isAuthentication =
        ['authenticate', 'signup', 'auth-external'].includes(path) ||
        path.startsWith('auth/');
      if (
        error?.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retried &&
        !isAuthentication
      ) {
        originalRequest._retried = true;
        try {
          const token = await renewAccessToken();
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest);
        } catch (refreshError: any) {
          if (refreshError?.response?.status === 401) {
            await AsyncStorage.removeMany([
              'token',
              'refreshToken',
              'userDetails',
            ]);
            expireSession();
          }
          error = refreshError;
        }
      }
      const message =
        (error?.response?.status === 401
          ? 'Votre session a expiré. Reconnectez-vous.'
          : error?.response?.data?.message) ||
        (error?.code === 'ECONNABORTED'
          ? 'Le serveur met trop de temps à répondre. Réessayez.'
          : error?.response
            ? 'Une erreur est survenue. Vérifiez vos informations.'
            : 'Connexion au serveur impossible. Vérifiez Internet.');
      if (originalRequest?.silentError) return Promise.reject(error);
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
    setReady(true);

    return () => {
      instance.interceptors.request.eject(requestInterceptor);
      instance.interceptors.response.eject(responseInterceptor);
    };
  }, [errInterceptor]);

  return ready ? <>{children}</> : null;
};

export default instance;
export {AxiosInterceptor, API_URI};
