import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export default function OfficerLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [county, setCounty] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.data()?.role === 'officer') {
        navigation.replace('OfficerDashboard');
      } else {
        Alert.alert('Access Denied', 'This account is not registered as an officer.');
      }
    } catch (e) {
      Alert.alert('Login Failed', 'Invalid email or password.');
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!name || !county || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        county,
        role: 'officer',
        createdAt: new Date(),
      });
      navigation.replace('OfficerDashboard');
    } catch (e) {
      Alert.alert('Registration Failed', 'Could not create account. Try a different email.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>IDEIEF</Text>
      <Text style={styles.subtitle}>Extension Officer Portal</Text>

      {isRegistering && (
        <>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. John Kamau"
            value={name}
            onChangeText={setName}
          />
          <Text style={styles.label}>County</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Nyandarua"
            value={county}
            onChangeText={setCounty}
          />
        </>
      )}

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="officer@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={isRegistering ? handleRegister : handleLogin}>
        <Text style={styles.buttonText}>
          {loading ? 'Please wait...' : isRegistering ? 'Register' : 'Login'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setIsRegistering(!isRegistering)}>
        <Text style={styles.switchText}>
          {isRegistering
            ? 'Already have an account? Login'
            : 'New officer? Register here'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#E8F5E9' },
  title: { fontSize: 36, fontWeight: 'bold', color: '#1B5E20', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#33691E', textAlign: 'center', marginBottom: 40 },
  label: { fontSize: 14, color: '#333', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 15, backgroundColor: '#fff' },
  button: { backgroundColor: '#1B5E20', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  switchButton: { marginTop: 20, alignItems: 'center' },
  switchText: { color: '#2E7D32', fontSize: 14 },
});