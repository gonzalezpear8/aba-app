import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('therapist');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  
  const navigation = useNavigation();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
      });
      console.log(res.data);

      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('userRole', res.data.role);
      await AsyncStorage.setItem('userId', res.data.id.toString());

      Alert.alert('Success', 'Login successful!');
      
      // Navigate based on role
      switch (res.data.role) {
        case 'admin':
          navigation.navigate('AdminDashboard');
          break;
        case 'therapist':
          navigation.navigate('TherapistDashboard');
          break;
        case 'patient':
          navigation.navigate('PatientDashboard');
          break;
        default:
          navigation.navigate('Dashboard');
      }
    } catch (err) {
      Alert.alert('Login Failed', 'Check your credentials');
    }
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (role === 'patient' && !dob) {
      Alert.alert('Error', 'Date of birth is required for patients');
      return;
    }

    if (!name) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        password,
        role,
        name,
        dob: role === 'patient' ? dob : null
      });

      Alert.alert('Success', 'Registration successful! Please login.');
      setIsRegistering(false);
      clearForm();
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Please try again');
    }
  };

  const clearForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setDob('');
    setRole('therapist');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isRegistering ? 'Create Account' : 'ABA Therapist Login'}
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {isRegistering && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Select Role:</Text>
            <Picker
              selectedValue={role}
              onValueChange={(itemValue) => setRole(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Therapist" value="therapist" />
              <Picker.Item label="Patient" value="patient" />
            </Picker>
          </View>

          {role === 'patient' && (
            <TextInput
              style={styles.input}
              placeholder="Date of Birth (YYYY-MM-DD)"
              value={dob}
              onChangeText={setDob}
            />
          )}
        </>
      )}

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={isRegistering ? handleRegister : handleLogin}
      >
        <Text style={styles.buttonText}>
          {isRegistering ? 'Register' : 'Login'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => {
          setIsRegistering(!isRegistering);
          clearForm();
        }}
      >
        <Text style={styles.secondaryButtonText}>
          {isRegistering ? 'Back to Login' : 'Create Account'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff'
  },
  pickerContainer: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  label: {
    paddingLeft: 10,
    paddingTop: 5,
    color: '#666'
  },
  picker: {
    height: 50
  },
  primaryButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  secondaryButtonText: {
    color: '#4a90e2',
    fontSize: 16
  }
});
