import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { TouchableOpacity, Text } from 'react-native';
import { auth } from '../config/firebase';

import AuthScreen from '../screens/AuthScreen';
import FarmProfileScreen from '../screens/FarmProfileScreen';
import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import ResultsScreen from '../screens/ResultsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OfficerLoginScreen from '../screens/OfficerLoginScreen';
import OfficerDashboardScreen from '../screens/OfficerDashboardScreen';

const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen
        name="OfficerLogin"
        component={OfficerLoginScreen}
        options={{
          headerShown: true,
          title: 'Officer Login',
          headerStyle: { backgroundColor: '#1B5E20' },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#1B5E20' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'IDEIEF',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={{ marginRight: 16 }}>
              <Text style={{ fontSize: 24 }}>👤</Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="FarmProfile"
        component={FarmProfileScreen}
        options={{ title: 'Farm Profile' }}
      />
      <Stack.Screen
        name="Scan"
        component={ScanScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ title: 'Diagnosis Result' }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'Scan History' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
      <Stack.Screen
        name="OfficerDashboard"
        component={OfficerDashboardScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (initializing) setInitializing(false);
    });
  }, []);

  if (initializing) return null;

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}