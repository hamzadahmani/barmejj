import axios from 'axios';
import {AuthContext} from '../routes/auth/authProvider';
import {useContext} from 'react';
import {useToast} from 'native-base';
import Toast from '../components/toast';
const API_URI = 'http://217.182.211.117:8090';

const instance = axios.create({
  baseURL: API_URI + '/',
});

const AxiosInterceptor = ({children}: any) => {
  /* -------------------------------------------------------------------------- */
  /*                                    HOOKS                                   */
  /* -------------------------------------------------------------------------- */
  const {user} = useContext(AuthContext);
  const toast = useToast();

  /* -------------------------------------------------------------------------- */
  /*                                  CONSTATNT                                 */
  /* -------------------------------------------------------------------------- */
  const accessToken = user?.token;
  /* -------------------------------------------------------------------------- */
  /*                                   REQUEST                                  */
  /* -------------------------------------------------------------------------- */
  instance.interceptors.request.use(config => {
    config.timeout = 5000; // Wait for 5 seconds before timing out
    if (
      !config?.headers?.Authorization &&
      accessToken &&
      config.url !== '/authenticate'
    ) {
      // @ts-ignore
      config.headers.Authorization = 'Bearer ' + accessToken;
    }
    return config;
  });
  /* -------------------------------------------------------------------------- */
  /*                                  RESPONSE                                  */
  /* -------------------------------------------------------------------------- */
  const resInterceptor = (response: any) => {
    return response;
  };
  const errInterceptor = async (error: any) => {
    toast.show({
      placement: 'top',
      render: () => {
        return <Toast message={'Erreur serveur'} status={'#e74c3c'} />;
      },
    });
    return Promise.reject(error);
  };

  instance.interceptors.response.use(resInterceptor, errInterceptor);
  return children;
};

export default instance;
export {AxiosInterceptor};
