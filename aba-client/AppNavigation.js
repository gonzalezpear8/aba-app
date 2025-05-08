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

export default function AppNavigation() {
  return (
    <AuthProvider>
      <AppStack />
    </AuthProvider>
  );
}
