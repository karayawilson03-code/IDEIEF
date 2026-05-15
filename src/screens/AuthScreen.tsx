import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function AuthScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    setLoading(true);
    try {
      const provider = new PhoneAuthProvider(auth);
      const vid = await provider.verifyPhoneNumber(
        phone.startsWith('+') ? phone : `+254${phone}`,
      );
      setVerificationId(vid);
      setStep('otp');
    } catch (e) {
      console.error('OTP error:', e);
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await signInWithCredential(auth, credential);
      navigation.replace('FarmProfile');
    } catch (e) {
      console.error('Verify error:', e);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>IDEIEF</Text>
      <Text style={styles.subtitle}>Potato Disease Detector</Text>
      {step === 'phone' ? (
        <>
          <Text style={styles.label}>Enter your phone number:</Text>
          <TextInput
            style={styles.input}
            placeholder="0712 345 678"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <TouchableOpacity style={styles.button} onPress={sendOTP}>
            <Text style={styles.buttonText}>
              {loading ? 'Sending...' : 'Send OTP'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.label}>Enter the 6-digit OTP:</Text>
          <TextInput
            style={styles.input}
            placeholder="123456"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
          />
          <TouchableOpacity style={styles.button} onPress={verifyOTP}>
            <Text style={styles.buttonText}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Text>
          </TouchableOpacity>
        </>
      )}
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
});