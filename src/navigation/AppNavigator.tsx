import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Image, TouchableOpacity, View } from 'react-native';

import { FormScreen } from '../screens/FormScreen';
import { PendingFormsScreen } from '../screens/PendingFormsScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { useAuth } from '../context/AuthContext';

export type RootStackParamList = {
  Login: undefined;
  Form: undefined;
  PendingForms: undefined;
  Account: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#020617', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#020617' },
          headerTintColor: '#E5E7EB',
          contentStyle: { backgroundColor: '#020617' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName="Form"
      screenOptions={{
        headerStyle: { backgroundColor: '#020617' },
        headerTintColor: '#E5E7EB',
        contentStyle: { backgroundColor: '#020617' },
      }}
    >
      <Stack.Screen
        name="Form"
        component={FormScreen}
        options={({ navigation }: NativeStackScreenProps<RootStackParamList, 'Form'>) => ({
          title: 'Novo formulario',
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('Account')} style={{ marginRight: 10 }}>
              <Image
                source={require('../../assets/avatar.png')}
                style={{ width: 32, height: 32, borderRadius: 16 }}
              />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="PendingForms"
        component={PendingFormsScreen}
        options={{ title: 'Pendentes offline' }}
      />
      <Stack.Screen name="Account" component={AccountScreen} options={{ title: 'Minha conta' }} />
    </Stack.Navigator>
  );
}
