import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export default function FarmProfileScreen({ navigation }) {
  const [county, setCounty] = useState('');
  const [subCounty, setSubCounty] = useState('');
  const [variety, setVariety] = useState('');

  const saveProfile = async () => {
    const user = auth.currentUser;
    await setDoc(doc(db, 'users', user.uid), {
      phone: user.phoneNumber,
      county,
      subCounty,
      primaryVariety: variety,
      role: 'farmer',
      createdAt: new Date(),
    });
    navigation.replace('Home');
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
        <Text style={styles.buttonText}>Save & Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F1F8E9', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1B5E20', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#33691E', marginBottom: 32 },
  label: { fontSize: 14, color: '#333',