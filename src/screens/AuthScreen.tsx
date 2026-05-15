import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function AuthScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!phone || phone.length < 9) {
      Alert.alert('Error', 'Enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      await signInAnonymously(auth);
      navigation.replace('FarmProfile');
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'Could not sign in. Try again.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>IDEIEF</Text>
      <Text style={styles.subtitle}>Potato Disease Detector</Text>
      <Text style={styles.label}>Enter your phone number:</Text>
      <TextInput
        style={styles.input}
        placeholder="0712 345 678"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>
          {loading ? 'Please wait...' : 'Continue'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.note}>
        OTP login will be enabled in the final build
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F1F8E9' },
  title: { fontSize: 36, fontWeight: 'bold', color: '#1B5E20', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#33691E', textAlign: 'center', marginBottom: 40 },
  label: { fontSize: 15, color: '#333', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16, backgroundColor: '#fff' },
  button: { backgroundColor: '#2E7D32', padding: 16, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  note: { textAlign: 'center', color: '#888', fontSize: 12, marginTop: 16 },
});