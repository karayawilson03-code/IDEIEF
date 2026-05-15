import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

type FarmProfileScreenProps = {
  navigation: any;
};

export default function FarmProfileScreen({ navigation }: FarmProfileScreenProps) {
  const [county, setCounty] = useState('');
  const [subCounty, setSubCounty] = useState('');
  const [variety, setVariety] = useState('');

  const saveProfile = async () => {
    if (!county || !subCounty || !variety) {
      Alert.alert('Please fill in all fields');
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'No authenticated user found. Please sign in again.');
        return;
      }
      await setDoc(doc(db, 'users', user.uid), {
        phone: user.phoneNumber,
        county,
        subCounty,
        primaryVariety: variety,
        role: 'farmer',
        createdAt: new Date(),
      });
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', 'Could not save profile. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Farm Profile</Text>
      <Text style={styles.subtitle}>Tell us about your farm</Text>
      <Text style={styles.label}>County</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Nyandarua"
        value={county}
        onChangeText={setCounty}
      />
      <Text style={styles.label}>Sub-County</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Ol Kalou"
        value={subCounty}
        onChangeText={setSubCounty}
      />
      <Text style={styles.label}>Potato Variety</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Shangi, Unica, Dutch Robjin"
        value={variety}
        onChangeText={setVariety}
      />
      <TouchableOpacity style={styles.button} onPress={saveProfile}>
        <Text style={styles.buttonText}>Save and Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F1F8E9', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1B5E20', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#33691E', marginBottom: 32 },
  label: { fontSize: 14, color: '#333', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 15, backgroundColor: '#fff' },
  button: { backgroundColor: '#2E7D32', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});