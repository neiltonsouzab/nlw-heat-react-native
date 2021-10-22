import React from 'react';

import {
  Text,
  View,
  TouchableOpacity
} from 'react-native';

import { styles } from './styles';

import LogoImg from '../../assets/logo.svg';
import { UserPhoto } from '../UserPhoto';
import { useAuth } from '../../hooks/auth';

export function Header(){
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <LogoImg />

      <View style={styles.logoutButton}>
        { user && (
          <TouchableOpacity onPress={signOut}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        )}

        
        <UserPhoto imageUri={user?.avatar_url} />
      </View>
    </View>
  );
}