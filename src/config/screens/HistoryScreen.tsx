import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

const DISEASE_COLORS: Record<string, string> = {
  'Late Blight': '#C62828',
  'Early Blight': '#E65100',
  'Bacterial Wilt': '#AD1457',
  'Healthy': '#2E7D32',
};

export default function HistoryScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const q = query(
        collection(db, 'diseaseReports'),
        where('userId', '==', auth.currentUser?.uid),
        orderBy('timestamp', 'desc')
      );
      const snap = await getDocs(q);
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan History</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={[styles.card, {
              borderLeftColor: DISEASE_COLORS[item.predictedDisease] || '#999'
            }]}>
              <Text style={styles.disease}>{item.predictedDisease}</Text>
              <Text style={styles.meta}>
                {item.timestamp?.toDate?.()?.toLocaleDateString() ?? 'Unknown date'} · {(item.confidenceScore * 100).toFixed(0)}% confidence
              </Text>
              <Text style={styles.gps}>
                📍 {item.gpsLatitude?.toFixed(4)}, {item.gpsLongitude?.toFixed(4)}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No scans yet. Tap Scan Crop to get started.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#1B5E20' },
  card: {
    backgroundColor: '#F9FBE7', borderRadius: 10,
    padding: 16, marginBottom: 12, borderLeftWidth: 5, elevation: 1,
  },
  disease: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  meta: { fontSize: 13, color: '#666', marginTop: 4 },
  gps: { fontSize: 12, color: '#999', marginTop: 4 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 48, fontSize: 15 },
});