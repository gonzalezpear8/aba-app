import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      const role = await AsyncStorage.getItem('userRole');
      const id = await AsyncStorage.getItem('userId');
      setIsAuthenticated(!!token);
      setUserRole(role);
      setUserId(id);
    };
    checkAuth();
  }, []);

  const login = async (token, role, id) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('userRole', role);
    await AsyncStorage.setItem('userId', id.toString());
    setIsAuthenticated(true);
    setUserRole(role);
    setUserId(id);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userRole');
    await AsyncStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 