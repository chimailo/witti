import axios, { AxiosError, AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { APIError, User } from '../types';
import { setAuthToken } from './axiosConfig';

type AuthContextProps = {
  authUser: Pick<User, 'id' | 'profile'> | null;
  isLoggedIn: boolean;
  error: AxiosError<APIError> | null;
};

const AuthContext = React.createContext<AuthContextProps>({
  authUser: null,
  isLoggedIn: false,
  error: null,
});

export { AuthContext };

const AuthProvider: React.FC = ({ children }) => {
  const [authUser, setAuthUser] = useState<Pick<User, 'id' | 'profile'> | null>(
    null
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState<AxiosError<APIError> | null>(null);

  const getAuthUser = async () => {
    const token = localStorage.get('token');

    if (token) setAuthToken(token);

    try {
      const {
        data,
      }: AxiosResponse<Pick<User, 'id' | 'profile'>> = await axios.get(
        '/users/register'
      );
      
      return data;
    } catch (error) {
      console.log(error);
      setError(error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      getAuthUser();
    }
  }, [isLoggedIn]);

  return (
    <AuthContext.Provider value={{ authUser, isLoggedIn, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
