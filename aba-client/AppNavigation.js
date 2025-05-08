// AppNavigation.js
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './app/LoginScreen';
import Dashboard from './app/Dashboard';
import AdminDashboard from './app/AdminDashboard';
import TherapistDashboard from './app/TherapistDashboard';
import PatientDashboard from './app/PatientDashboard';
import { AuthProvider, AuthContext } from './app/AuthContext';

const Stack = createNativeStackNavigator();

function AppStack() {
  const { isAuthenticated, userRole } = useContext(AuthContext);
  console.log('Auth state:', { isAuthenticated, userRole }); // Debug log

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated && (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
        {isAuthenticated && userRole === 'admin' && (
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        )}
        {isAuthenticated && userRole === 'therapist' && (
          <Stack.Screen name="TherapistDashboard" component={TherapistDashboard} />
        )}
        {isAuthenticated && userRole === 'patient' && (
          <Stack.Screen name="PatientDashboard" component={PatientDashboard} />
        )}
        {/* Fallback */}
        {isAuthenticated && !['admin', 'therapist', 'patient'].includes(userRole) && (
          <Stack.Screen name="Dashboard" component={Dashboard} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function AppNavigation() {
  return (
    <AuthProvider>
      <AppStack />
    </AuthProvider>
  );
}
