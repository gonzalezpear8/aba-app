// AppNavigation.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './app/LoginScreen';
import Dashboard from './app/Dashboard';
import AdminDashboard from './app/AdminDashboard';
import TherapistDashboard from './app/TherapistDashboard';
import PatientDashboard from './app/PatientDashboard';


const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Re-check auth state every time the navigator is focused
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      const role = await AsyncStorage.getItem('userRole');
      setIsAuthenticated(!!token);
      setUserRole(role);
    };

    const interval = setInterval(checkAuth, 500); // Poll every 500ms

    return () => clearInterval(interval);
  }, []);

  const getInitialRoute = () => {
    if (!isAuthenticated) return 'Login';
    switch (userRole) {
      case 'admin':
        return 'AdminDashboard';
      case 'therapist':
        return 'TherapistDashboard';
      case 'patient':
        return 'PatientDashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={getInitialRoute()}
        screenOptions={{ headerShown: false }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="TherapistDashboard" component={TherapistDashboard} />
            <Stack.Screen name="PatientDashboard" component={PatientDashboard} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
