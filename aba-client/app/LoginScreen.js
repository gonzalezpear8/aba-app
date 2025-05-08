import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
      });

      await AsyncStorage.setItem('token', res.data.token);

      Alert.alert('Login Successful!');
      navigation.navigate('Dashboard');
    } catch (err) {
      Alert.alert('Login Failed', 'Check your credentials');
    }
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        password,
      });

      Alert.alert('Registration Successful!', 'Please login with your new account');
      setIsRegistering(false);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Please try again');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isRegistering ? 'Create New Account' : 'ABA Therapist Login'}
      </Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      {isRegistering && (
        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          secureTextEntry
        />
      )}
      <View style={styles.buttonContainer}>
        <Button 
          title={isRegistering ? "Register" : "Login"} 
          onPress={isRegistering ? handleRegister : handleLogin} 
        />
        <Button 
          title={isRegistering ? "Back to Login" : "Create Account"} 
          onPress={() => {
            setIsRegistering(!isRegistering);
            setPassword('');
            setConfirmPassword('');
          }} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: {
    height: 40,
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    gap: 10,
  },
});
