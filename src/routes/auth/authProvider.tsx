import React, {createContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext({});

const AuthProvider = ({children}: any) => {
  const [user, setUser] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDataFromStorage = async () => {
      try {
        const [token, userDetails] = await Promise.all([
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('userDetails'),
        ]);

        if (token) {
          setUser({token: JSON.parse(token)});
        }

        if (userDetails) {
          setUserInfo(JSON.parse(userDetails));
        }

        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };

    loadDataFromStorage();
  }, []);

  const saveToStorage = async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  const login = (userData: any) => {
    const {token, ...rest} = userData;

    setUser({token});
    setUserInfo(rest);

    saveToStorage('token', token);
    saveToStorage('userDetails', rest);
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'userDetails']);
      setUser(null);
      setUserInfo(null);
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    // Add a loading indicator or splash screen while checking the authentication state
    return null;
  }

  return (
    <AuthContext.Provider value={{userInfo, user, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
