import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session'
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLIENT_ID = '8f3c67cc2348d500b646';
const SCOPE = 'read:user';
const USER_STORAGE = '@nlwheat:user';
const TOKEN_STORAGE = '@nlwheat:token';

type User = {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
}

type AuthContextData = {
   user: User | null;
   isSigning: boolean;
   signIn: () => Promise<void>;
   signOut: () => Promise<void>;
}

type AuthProviderProps = {
  children: ReactNode;
}

type AuthResponse = {
  token: string;
  user: User;
}

type AuthorizationResponse = {
  params: {
    code?: string;
    error?: string;
  },
  type?: string;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [isSigning, setIsSigning] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  
  async function signIn() {
    try {
      setIsSigning(true);
      
      const authUrl = 
        `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPE}`
      const authSessionResponse = await AuthSession.startAsync({ authUrl }) as AuthorizationResponse;
      
      if (authSessionResponse.type === 'success' && 
          authSessionResponse.params.error !== 'access_denied') {
        const authResponse = await api.post<AuthResponse>('/authenticate', {
          code: authSessionResponse.params.code
        });
  
        const { user, token } = authResponse.data;
  
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
        await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user));
        await AsyncStorage.setItem(TOKEN_STORAGE, token);
  
        setUser(user);
      }
  
    } catch (error) {
      console.log(error);
    } finally {      
      setIsSigning(false);
    }
  }

  async function signOut() {
    setUser(null);

    await AsyncStorage.removeItem(USER_STORAGE);
    await AsyncStorage.removeItem(USER_STORAGE);
  }

  useEffect(() => {
    async function loadUserStorageData() {
      const userStorage = await AsyncStorage.getItem(USER_STORAGE);
      const tokenStorage = await AsyncStorage.getItem(TOKEN_STORAGE);

      if (userStorage && tokenStorage) {
        api.defaults.headers.common['Authorization'] = `Bearer ${tokenStorage}`;
        setUser(JSON.parse(userStorage));
      }

      setIsSigning(false);
    }

    loadUserStorageData();
  }, []);

  return (
    <AuthContext.Provider value={{ isSigning, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext);

  return context;
}