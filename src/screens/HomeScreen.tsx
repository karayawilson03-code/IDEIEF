import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

const DISEASE_COLORS: Record<string, string> = {
  'Late Blight': '#C62828',
  'Early Blight': '#E65100',
  'Bacterial Wilt': '#AD1457',
  'Healthy': '#2E7D32',
};

const DISEASE_ICONS: Record<string, string> = {
  'Late Blight': '🍂',
  'Early Blight': '🟠',
  'Bacterial Wilt': '🔴',
  'Healthy': '✅',
};

const TIPS = [
  '💡 Scan early morning for best lighting results.',
  '💡 Focus on one leaf at a time for accurate diagnosis.',
  '💡 Late blight spreads fast — scan every 3 days.',
  '💡 Keep records of scans to track disease spread.',
  '💡 Shangi variety is highly susceptible to late blight.',
];

export default function HomeScreen({ navigation }) {
  const [recentCount, setRecentCount] = useState(0);
  const [lastDisease, setLastDisease] = useState('');
  const [lastConfidence, setLastConfidence] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning 🌄');
    else if (hour < 17) setGreeting('Good afternoon ☀️');
    else setGreeting('Good evening 🌙');
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
        const last = snapshot.docs[0].data();
        setLastDisease(last.predictedDisease);
        setLastConfidence(last.confidenceScore);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const lastDiseaseColor = DISEASE_COLORS[lastDisease] || '#2E7D32';
  const lastDiseaseIcon = DISEASE_ICONS[lastDisease] || '🌿';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.appName}>IDEIEF</Text>
          <Text style={styles.subtitle}>Potato Disease Detector</Text>
        </View>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>🤖 AI</Text>
        </View>
      </View>

      {/* Risk Banner */}
      <View style={styles.riskBanner}>
        <Text style={styles.riskIcon}>🌦️</Text>
        <View>
          <Text style={styles.riskTitle}>Today's Disease Risk</Text>
          <Text style={styles.riskLevel}>🟡 Moderate — Cool & humid conditions</Text>
        </View>
      </View>

      {/* Main Scan Button */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('Scan')}
        activeOpacity={0.85}>
        <Text style={styles.scanIcon}>🔍</Text>
        <Text style={styles.scanText}>Scan Crop</Text>
        <Text style={styles.scanSub}>Piga Picha ya Mmea</Text>
        <View style={styles.scanArrow}>
          <Text style={styles.scanArrowText}>→</Text>
        </View>
      </TouchableOpacity>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {loading ? (
          <ActivityIndicator color="#2E7D32" style={{ flex: 1 }} />
        ) : (
          <>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{recentCount}</Text>
              <Text style={styles.statLabel}>Recent Scans</Text>
              <Text style={styles.statEmoji}>📊</Text>
            </View>
            <View style={[styles.statCard, { borderTopColor: lastDiseaseColor, borderTopWidth: 3 }]}>
              <Text style={styles.statEmoji}>{lastDiseaseIcon}</Text>
              <Text style={[styles.statNumber, { fontSize: 13, color: lastDiseaseColor }]} numberOfLines={2}>
                {lastDisease || 'None yet'}
              </Text>
              {lastDisease ? (
                <Text style={styles.statLabel}>
                  {(lastConfidence * 100).toFixed(0)}% confidence
                </Text>
              ) : (
                <Text style={styles.statLabel}>Last Result</Text>
              )}
            </View>
          </>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('History')}>
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>View History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Scan')}>
          <Text style={styles.actionIcon}>📸</Text>
          <Text style={styles.actionText}>Quick Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>📍</Text>
          <Text style={styles.actionText}>Disease Map</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Daily Tip</Text>
        <Text style={styles.tipText}>{tip}</Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Powered by Gemini Vision AI 
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8E9' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20, paddingTop: 50,
    backgroundColor: '#1B5E20',
  },
  greeting: { fontSize: 13, color: '#A5D6A7', marginBottom: 2 },
  appName: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: 3 },
  subtitle: { fontSize: 13, color: '#C8E6C9', marginTop: 2 },
  aiBadge: {
    backgroundColor: '#F9A825', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  aiBadgeText: { fontSize: 13, fontWeight: 'bold', color: '#1A1A1A' },
  riskBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFF8E1', margin: 16, borderRadius: 12,
    padding: 14, borderLeftWidth: 4, borderLeftColor: '#F9A825',
  },
  riskIcon: { fontSize: 28 },
  riskTitle: { fontSize: 12, color: '#888', marginBottom: 2 },
  riskLevel: { fontSize: 14, fontWeight: '600', color: '#333' },
  scanButton: {
    backgroundColor: '#2E7D32', borderRadius: 20,
    padding: 28, alignItems: 'center',
    marginHorizontal: 16, marginBottom: 16,
    elevation: 8,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  scanIcon: { fontSize: 48 },
  scanText: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginTop: 8 },
  scanSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4 },
  scanArrow: {
    position: 'absolute', right: 20, top: '50%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20, width: 36, height: 36,
    justifyContent: 'center', alignItems: 'center',
  },
  scanArrowText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  statsRow: {
    flexDirection: 'row', gap: 12,
    marginHorizontal: 16, marginBottom: 16,
  },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    padding: 16, alignItems: 'center', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32', textAlign: 'center' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 4, textAlign: 'center' },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  quickActions: {
    flexDirection: 'row', gap: 10,
    marginHorizontal: 16, marginBottom: 16,
  },
  actionCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    padding: 14, alignItems: 'center', elevation: 2,
  },
  actionIcon: { fontSize: 24, marginBottom: 6 },
  actionText: { fontSize: 11, color: '#444', fontWeight: '600', textAlign: 'center' },
  tipCard: {
    backgroundColor: '#E8F5E9', marginHorizontal: 16,
    marginBottom: 16, borderRadius: 12, padding: 16,
    borderLeftWidth: 4, borderLeftColor: '#2E7D32',
  },
  tipTitle: { fontSize: 13, fontWeight: 'bold', color: '#1B5E20', marginBottom: 6 },
  tipText: { fontSize: 13, color: '#4A4A4A', lineHeight: 20 },
  footer: {
    textAlign: 'center', fontSize: 11,
    color: '#aaa', padding: 16, marginBottom: 20,
  },
});