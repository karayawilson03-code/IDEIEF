import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

const DISEASE_COLORS: Record<string, string> = {
  'Late Blight': '#C62828',
  'Early Blight': '#E65100',
  'Bacterial Wilt': '#AD1457',
  'Common Scab': '#6A1B9A',
  'Black Scurf': '#212121',
  'Soft Rot': '#F57F17',
  'Healthy': '#2E7D32',
};

interface Report {
  id: string;
  predictedDisease: string;
  confidenceScore: number;
  timestamp: any;
  severity: string;
  gpsLatitude: number;
  gpsLongitude: number;
  inferenceSource: string;
  [key: string]: any;
}

export default function HistoryScreen() {
  const [reports, setReports] = useState<Report[]>([]);
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
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Report[]);
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
              <View style={styles.cardHeader}>
                <Text style={styles.disease}>{item.predictedDisease}</Text>
                <View style={[styles.badge, {
                  backgroundColor: DISEASE_COLORS[item.predictedDisease] || '#999'
                }]}>
                  <Text style={styles.badgeText}>
                    {(item.confidenceScore * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
              <Text style={styles.meta}>
                {item.timestamp?.toDate?.()?.toLocaleDateString() ?? 'Unknown date'} · {item.severity} severity
              </Text>
              <Text style={styles.gps}>
                📍 {item.gpsLatitude?.toFixed(4)}, {item.gpsLongitude?.toFixed(4)}
              </Text>
              <Text style={styles.source}>
                {item.inferenceSource === 'gemini' ? '🤖 Gemini Vision AI' : '📱 On-device AI'}
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  disease: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  badge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  meta: { fontSize: 13, color: '#666', marginTop: 4 },
  gps: { fontSize: 12, color: '#999', marginTop: 4 },
  source: { fontSize: 12, color: '#888', marginTop: 4 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 48, fontSize: 15 },
});