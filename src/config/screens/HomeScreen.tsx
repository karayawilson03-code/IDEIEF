import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export default function HomeScreen({ navigation }) {
  const [recentCount, setRecentCount] = useState(0);
  const [lastDisease, setLastDisease] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentReports();
  }, []);

  const fetchRecentReports = async () => {
    try {
      const q = query(
        collection(db, 'diseaseReports'),
        where('userId', '==', auth.currentUser?.uid),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      setRecentCount(snapshot.size);
      if (!snapshot.empty) {
        setLastDisease(snapshot.docs[0].data().predictedDisease);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.appName}>IDEIEF</Text>
        <Text style={styles.subtitle}>Potato Disease Detector</Text>
        <Text style={styles.tagline}>Powered by Gemini Vision AI</Text>
      </View>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('Scan')}>
        <Text style={styles.scanIcon}>🔍</Text>
        <Text style={styles.scanText}>Scan Crop</Text>
        <Text style={styles.scanSub}>Piga Picha ya Mmea</Text>
      </TouchableOpacity>

      <View style={styles.statsRow}>
        {loading ? (
          <ActivityIndicator color="#2E7D32" />
        ) : (
          <>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{recentCount}</Text>
              <Text style={styles.statLabel}>Recent Scans</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber} numberOfLines={2}>
                {lastDisease || 'None yet'}
              </Text>
              <Text style={styles.statLabel}>Last Result</Text>
            </View>
          </>
        )}
      </View>

      <TouchableOpacity
        style={styles.historyLink}
        onPress={() => navigation.navigate('History')}>
        <Text style={styles.historyText}>📋 View Scan History</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8E9', padding: 20 },
  banner: { alignItems: 'center', paddingVertical: 32 },
  appName: { fontSize: 36, fontWeight: '900', color: '#1B5E20', letterSpacing: 3 },
  subtitle: { fontSize: 16, color: '#33691E', marginTop: 4 },
  tagline: { fontSize: 12, color: '#689F38', marginTop: 6 },
  scanButton: {
    backgroundColor: '#2E7D32', borderRadius: 20,
    padding: 28, alignItems: 'center', marginVertical: 20, elevation: 6,
  },
  scanIcon: { fontSize: 40 },
  scanText: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  scanSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    padding: 16, alignItems: 'center', elevation: 2,
  },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32', textAlign: 'center' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4, textAlign: 'center' },
  historyLink: { marginTop: 20, alignItems: 'center', padding: 12 },
  historyText: { fontSize: 16, color: '#1565C0' },
});