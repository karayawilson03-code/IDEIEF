import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../config/firebase';

export default function ProfileScreen({ navigation }) {
  const [county, setCounty] = useState('');
  const [subCounty, setSubCounty] = useState('');
  const [variety, setVariety] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const uid = auth.currentUser?.uid;
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCounty(data.county || '');
        setSubCounty(data.subCounty || '');
        setVariety(data.primaryVariety || '');
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const uid = auth.currentUser?.uid;
      await updateDoc(doc(db, 'users', uid), {
        county,
        subCounty,
        primaryVariety: variety,
      });
      setEditing(false);
      Alert.alert('✅ Saved', 'Your profile has been updated.');
    } catch (e) {
      Alert.alert('Error', 'Could not save profile.');
    }
    setSaving(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut(auth);
            navigation.replace('Auth');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🌿</Text>
        </View>
        <Text style={styles.userName}>
          {auth.currentUser?.phoneNumber || 'Farmer'}
        </Text>
        <Text style={styles.userRole}>Smallholder Potato Farmer</Text>
      </View>

      {/* Farm Details */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏡 Farm Details</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Text style={styles.editBtn}>{editing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>County</Text>
        <TextInput
          style={[styles.input, !editing && styles.inputDisabled]}
          value={county}
          onChangeText={setCounty}
          editable={editing}
          placeholder="e.g. Nyandarua"
        />

        <Text style={styles.label}>Sub-County</Text>
        <TextInput
          style={[styles.input, !editing && styles.inputDisabled]}
          value={subCounty}
          onChangeText={setSubCounty}
          editable={editing}
          placeholder="e.g. Ol Kalou"
        />

        <Text style={styles.label}>Potato Variety</Text>
        <TextInput
          style={[styles.input, !editing && styles.inputDisabled]}
          value={variety}
          onChangeText={setVariety}
          editable={editing}
          placeholder="e.g. Shangi, Unica"
        />

        {editing && (
          <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
            <Text style={styles.saveBtnText}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 App Info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>AI Engine</Text>
          <Text style={styles.infoValue}>Gemini Vision AI</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Target Diseases</Text>
          <Text style={styles.infoValue}>Late Blight, Early Blight, Bacterial Wilt</Text>
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>🚪 Sign Out</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8E9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarSection: { alignItems: 'center', backgroundColor: '#1B5E20', padding: 32 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#fff', justifyContent: 'center',
    alignItems: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 40 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  userRole: { fontSize: 13, color: '#A5D6A7' },
  section: {
    backgroundColor: '#fff', margin: 16,
    borderRadius: 12, padding: 16, elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1B5E20' },
  editBtn: { fontSize: 14, color: '#1565C0', fontWeight: '600' },
  label: { fontSize: 13, color: '#666', marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 12, marginBottom: 14, fontSize: 15, backgroundColor: '#fff',
  },
  inputDisabled: { backgroundColor: '#F5F5F5', color: '#888' },
  saveBtn: {
    backgroundColor: '#2E7D32', padding: 14,
    borderRadius: 10, alignItems: 'center', marginTop: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  infoLabel: { fontSize: 14, color: '#666' },
  infoValue: { fontSize: 14, color: '#333', fontWeight: '500', flex: 1, textAlign: 'right' },
  signOutBtn: {
    backgroundColor: '#FFEBEE', margin: 16, padding: 16,
    borderRadius: 12, alignItems: 'center', marginBottom: 40,
    borderWidth: 1, borderColor: '#FFCDD2',
  },
  signOutText: { color: '#C62828', fontSize: 16, fontWeight: 'bold' },
});