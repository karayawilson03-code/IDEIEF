import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

const DISEASE_COLORS: Record<string, string> = {
  'Late Blight': '#C62828',
  'Early Blight': '#E65100',
  'Bacterial Wilt': '#AD1457',
  'Common Scab': '#6A1B9A',
  'Black Scurf': '#212121',
  'Soft Rot': '#F57F17',
  'Healthy': '#2E7D32',
};

export default function OfficerDashboardScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    lateBlight: 0,
    earlyBlight: 0,
    bacterialWilt: 0,
    commonScab: 0,
    blackScurf: 0,
    softRot: 0,
    healthy: 0,
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const q = query(
        collection(db, 'diseaseReports'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      setReports(data);

      setStats({
        total: data.length,
        lateBlight: data.filter(r => r.predictedDisease === 'Late Blight').length,
        earlyBlight: data.filter(r => r.predictedDisease === 'Early Blight').length,
        bacterialWilt: data.filter(r => r.predictedDisease === 'Bacterial Wilt').length,
        commonScab: data.filter(r => r.predictedDisease === 'Common Scab').length,
        blackScurf: data.filter(r => r.predictedDisease === 'Black Scurf').length,
        softRot: data.filter(r => r.predictedDisease === 'Soft Rot').length,
        healthy: data.filter(r => r.predictedDisease === 'Healthy').length,
      });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigation.replace('Auth');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Officer Dashboard</Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={styles.signOut}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderTopColor: '#C62828' }]}>
          <Text style={styles.statNumber}>{stats.lateBlight}</Text>
          <Text style={styles.statLabel}>Late Blight</Text>
        </View>
        <View style={[styles.statCard, { borderTopColor: '#E65100' }]}>
          <Text style={styles.statNumber}>{stats.earlyBlight}</Text>
          <Text style={styles.statLabel}>Early Blight</Text>
        </View>
        <View style={[styles.statCard, { borderTopColor: '#AD1457' }]}>
          <Text style={styles.statNumber}>{stats.bacterialWilt}</Text>
          <Text style={styles.statLabel}>Bacterial Wilt</Text>
        </View>
        <View style={[styles.statCard, { borderTopColor: '#6A1B9A' }]}>
          <Text style={styles.statNumber}>{stats.commonScab}</Text>
          <Text style={styles.statLabel}>Common Scab</Text>
        </View>
        <View style={[styles.statCard, { borderTopColor: '#212121' }]}>
          <Text style={styles.statNumber}>{stats.blackScurf}</Text>
          <Text style={styles.statLabel}>Black Scurf</Text>
        </View>
        <View style={[styles.statCard, { borderTopColor: '#F57F17' }]}>
          <Text style={styles.statNumber}>{stats.softRot}</Text>
          <Text style={styles.statLabel}>Soft Rot</Text>
        </View>
        <View style={[styles.statCard, { borderTopColor: '#2E7D32' }]}>
          <Text style={styles.statNumber}>{stats.healthy}</Text>
          <Text style={styles.statLabel}>Healthy</Text>
        </View>
        <View style={[styles.statCard, { borderTopColor: '#333' }]}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Reports</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Reports</Text>

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
                <Text style={[styles.severity, {
  color: (item as any).severity === 'High' ? '#C62828' :
    (item as any).severity === 'Medium' ? '#E65100' : '#2E7D32'
}]}>
  {(item as any).severity} severity
</Text>
              </View>
              <Text style={styles.meta}>
                {item.timestamp?.toDate?.()?.toLocaleDateString() ?? 'Unknown date'} · {(item.confidenceScore * 100).toFixed(0)}% confidence
              </Text>
              <Text style={styles.gps}>
                📍 {item.gpsLatitude?.toFixed(4)}, {item.gpsLongitude?.toFixed(4)}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No reports yet.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: {
    backgroundColor: '#1B5E20', padding: 20,
    paddingTop: 50, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center'
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  signOut: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    padding: 12, gap: 8
  },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: '#fff',
    borderRadius: 10, padding: 16, alignItems: 'center',
    borderTopWidth: 4, elevation: 2
  },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', padding: 16, paddingBottom: 8 },
  card: {
    backgroundColor: '#fff', borderRadius: 10,
    padding: 16, marginHorizontal: 16, marginBottom: 10,
    borderLeftWidth: 5, elevation: 1
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  disease: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  severity: { fontSize: 12, fontWeight: '600' },
  meta: { fontSize: 13, color: '#666', marginTop: 4 },
  gps: { fontSize: 12, color: '#999', marginTop: 4 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 48, fontSize: 15 },
});