import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedSplash from '../../components/animatedSplash';
import {
  expireSession,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  subscribeToSessionExpiration,
} from '../../services/authToken';
import request from '../../services/request';
import {useQueryClient} from '@tanstack/react-query';

export interface AuthContextType {
  userInfo: any;
  user: any;
  login: (userData: any) => void;
  updateUserInfo: (userData: any) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({children}: PropsWithChildren) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadingTimeout = setTimeout(() => {
      if (active) {
        setIsLoading(false);
      }
    }, 4000);

    const loadDataFromStorage = async () => {
      const startedAt = Date.now();
      try {
        const [token, storedRefreshToken, userDetails] = await Promise.all([
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('refreshToken'),
          AsyncStorage.getItem('userDetails'),
        ]);

        if (token) {
          const restoredToken = JSON.parse(token);
          setAccessToken(restoredToken);
          setUser({token: restoredToken});
        }
        if (storedRefreshToken) setRefreshToken(JSON.parse(storedRefreshToken));

        if (userDetails) {
          setUserInfo(JSON.parse(userDetails));
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (active) {
          const remaining = Math.max(0, 1650 - (Date.now() - startedAt));
          if (remaining) {
            await new Promise(resolve => setTimeout(resolve, remaining));
          }
          clearTimeout(loadingTimeout);
          setIsLoading(false);
        }
      }
    };

    loadDataFromStorage();

    return () => {
      active = false;
      clearTimeout(loadingTimeout);
    };
  }, []);
  useEffect(
    () =>
      subscribeToSessionExpiration(() => {
        queryClient.clear();
        AsyncStorage.removeMany(['token', 'refreshToken', 'userDetails']).catch(
          console.error,
        );
        setUser(null);
        setUserInfo(null);
      }),
    [queryClient],
  );

  const saveToStorage = async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  const login = (userData: any) => {
    const {token, refreshToken: newRefreshToken, ...rest} = userData;

    queryClient.clear();
    setAccessToken(token);
    setRefreshToken(newRefreshToken);
    setUser({token});
    setUserInfo(rest);

    saveToStorage('token', token);
    saveToStorage('refreshToken', newRefreshToken);
    saveToStorage('userDetails', rest);
  };

  const logout = async () => {
    try {
      const currentRefreshToken = getRefreshToken();
      if (currentRefreshToken)
        request
          .post('/auth/logout', {refreshToken: currentRefreshToken})
          .catch(() => undefined);
      await AsyncStorage.removeMany(['token', 'refreshToken', 'userDetails']);
      expireSession();
    } catch (error) {
      console.error(error);
    }
  };

  const updateUserInfo = (userData: any) => {
    setUserInfo(userData);
    saveToStorage('userDetails', userData);
  };

  if (isLoading) {
    return <AnimatedSplash />;
  }

  return (
    <AuthContext.Provider
      value={{userInfo, user, login, updateUserInfo, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
